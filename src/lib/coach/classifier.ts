import * as ort from 'onnxruntime-node';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { SPENDING_CATEGORIES, CATEGORY_DESCRIPTIONS, SpendingCategory } from './categories';
import { db } from '../db/client';
import { coachClassifierLogs } from '../db/schema';
import path from 'path';
import fs from 'fs';

// Configuration
const CONFIDENCE_THRESHOLD = parseFloat(process.env.COACH_CLASSIFIER_CONFIDENCE_THRESHOLD || '0.6');
const MODEL_PATH = path.join(process.cwd(), 'models', 'spend-classifier', 'model.onnx');

let session: ort.InferenceSession | null = null;

async function loadModel() {
  if (session) return session;
  if (!fs.existsSync(MODEL_PATH)) {
    console.warn(`[Coach Classifier] ONNX model not found at ${MODEL_PATH}. Falling back to Gemini.`);
    return null;
  }
  try {
    session = await ort.InferenceSession.create(MODEL_PATH);
    return session;
  } catch (err) {
    console.error(`[Coach Classifier] Error loading ONNX model:`, err);
    return null;
  }
}

// Simple tokenization for the ONNX model (mock implementation for illustration,
// in a real scenario this matches the Python tokenizer exactly).
function tokenize(text: string): Float32Array {
  // Pad or truncate to some fixed length, e.g., 128
  const MAX_LEN = 128;
  const arr = new Float32Array(MAX_LEN);
  const words = text.toLowerCase().split(/\s+/);
  for (let i = 0; i < Math.min(words.length, MAX_LEN); i++) {
    // Basic hash to simulate token IDs if using a simple embedding layer
    arr[i] = words[i].charCodeAt(0) % 1000;
  }
  return arr;
}

export async function categorizeSpend(params: {
  userId: string;
  merchant: string;
  amount: number;
  description: string;
}) {
  const { userId, merchant, amount, description } = params;
  const inputText = `${merchant} ${amount} ${description}`.trim();
  
  let predictedCategory: SpendingCategory = 'other';
  let confidence = 0;
  let fallbackUsed = true;

  try {
    const onnxSession = await loadModel();

    if (onnxSession) {
      // ONNX Inference
      const inputTensor = new ort.Tensor('float32', tokenize(inputText), [1, 128]);
      const feeds = { input: inputTensor }; // Replace 'input' with actual input node name
      
      const results = await onnxSession.run(feeds);
      const output = results[onnxSession.outputNames[0]].data as Float32Array;
      
      // Softmax to get probabilities (assuming output is logits)
      const exps = Array.from(output).map(Math.exp);
      const sumExps = exps.reduce((a, b) => a + b, 0);
      const probs = exps.map(e => e / sumExps);
      
      const maxIndex = probs.indexOf(Math.max(...probs));
      confidence = probs[maxIndex];
      predictedCategory = SPENDING_CATEGORIES[maxIndex] || 'other';
      fallbackUsed = false;
    }
  } catch (err) {
    console.error('[Coach Classifier] ONNX inference failed:', err);
  }

  // LLM Fallback
  if (fallbackUsed || confidence < CONFIDENCE_THRESHOLD) {
    console.log(`[Coach Classifier] Low confidence or no model (${confidence}). Falling back to Gemini...`);
    fallbackUsed = true;
    
    try {
      const { object } = await generateObject({
        model: google('gemini-2.5-flash'), 
        schema: z.object({
          category: z.enum(SPENDING_CATEGORIES),
          confidence: z.number().min(0).max(1),
        }),
        prompt: `
Categorize the following transaction into exactly one of the provided categories.
Transaction details:
Merchant: ${merchant}
Amount: ${amount}
Description: ${description}

Categories available:
${CATEGORY_DESCRIPTIONS}

Return the best matching category and your confidence (0.0 to 1.0).
        `,
      });

      predictedCategory = object.category as SpendingCategory;
      confidence = object.confidence;
    } catch (llmErr) {
      console.error('[Coach Classifier] LLM Fallback failed:', llmErr);
      // Absolute fallback
      predictedCategory = 'other';
      confidence = 0;
    }
  }

  // Log to DB
  try {
    await db.insert(coachClassifierLogs).values({
      userId,
      inputText,
      predicted: predictedCategory,
      confidence: confidence.toString(),
      fallbackUsed,
    });
  } catch (dbErr) {
    console.error('[Coach Classifier] Failed to log classification to DB:', dbErr);
  }

  return {
    category: predictedCategory,
    confidence,
    fallbackUsed
  };
}
