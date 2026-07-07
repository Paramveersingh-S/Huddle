'use client';

import React, { useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Share2, Leaf, Banknote, Utensils, ShoppingBag, Scale } from 'lucide-react';
import PixelCard from '@/components/ui/PixelCard';
import html2canvas from 'html2canvas';

interface ShareableRecapsCardProps {
  username: string;
  totalSpend: number;
  topCategory: string;
}

export function ShareableRecapsCard({ username, totalSpend, topCategory }: ShareableRecapsCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  let vibe = "Zen Master"
  let VibeIcon = Leaf
  let vibeDesc = "You barely spent a dime this week. Monk status achieved."
  let pixelColors = "#10b981,#34d399,#6ee7b7" // Greens

  if (totalSpend > 5000) {
    vibe = "Big Spender"
    VibeIcon = Banknote
    vibeDesc = "You were making it rain this week!"
    pixelColors = "#ef4444,#f87171,#fca5a5" // Reds
  } else if (topCategory === 'food') {
    vibe = "Foodie"
    VibeIcon = Utensils
    vibeDesc = "Your stomach dictates your wallet."
    pixelColors = "#f59e0b,#fbbf24,#fcd34d" // Yellows
  } else if (topCategory === 'shopping') {
    vibe = "Retail Therapist"
    VibeIcon = ShoppingBag
    vibeDesc = "Treat yo self was the motto this week."
    pixelColors = "#d946ef,#e879f9,#f0abfc" // Pinks/Purples
  } else if (totalSpend > 0) {
    vibe = "Balanced"
    VibeIcon = Scale
    vibeDesc = "Keeping things steady and smooth."
    pixelColors = "#3b82f6,#60a5fa,#93c5fd" // Blues
  }

  const handleShare = async () => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0B0B14',
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], 'huddle-vibe.png', { type: 'image/png' });

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: 'My Huddle Vibe',
              text: 'Check out my weekly money vibe on Huddle!',
              files: [file],
            });
            return;
          } catch (error: any) {
            if (error.name !== 'AbortError') {
              console.error('Error sharing:', error);
            }
          }
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'huddle-vibe.png';
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (error) {
      console.error('Failed to generate image:', error);
      alert('Failed to generate shareable image.');
    }
  };

  return (
    <>
      <div className="relative group w-full" ref={cardRef}>
        <PixelCard variant="huddle" gap={8} speed={40} colors={pixelColors}>
          <Card className={`w-full h-full overflow-hidden border-0 bg-transparent shadow-2xl shadow-primary/20 relative aspect-[9/16] flex flex-col justify-between text-white`}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
            <div className="absolute inset-0 p-8 flex flex-col justify-between">
              
              <div className="space-y-2 relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-bold tracking-wide uppercase shadow-sm border border-white/20">
                  <Sparkles className="w-4 h-4" /> Weekly Recap
                </div>
                <h2 className="text-white font-heading font-black text-4xl leading-none tracking-tight drop-shadow-md">
                  {username}'s<br/>Vibe Check
                </h2>
              </div>

              <div className="space-y-6 relative z-10">
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/40 transform -rotate-2 hover:rotate-0 transition-transform">
                  <div className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">The Verdict</div>
                  <div className="flex items-center gap-2 mb-2">
                    <VibeIcon className="w-8 h-8 text-gray-900" />
                    <div className="text-3xl font-black font-heading text-gray-900 leading-none">{vibe}</div>
                  </div>
                  <p className="text-gray-600 font-medium leading-snug">{vibeDesc}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30 text-white">
                    <div className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">Total Spent</div>
                    <div className="text-2xl font-black font-heading">₹{totalSpend.toFixed(0)}</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30 text-white">
                    <div className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">Top Category</div>
                    <div className="text-2xl font-black font-heading capitalize truncate">{topCategory}</div>
                  </div>
                </div>
              </div>

              <div className="relative z-10 text-center text-white/70 font-bold text-sm tracking-widest uppercase">
                HuddleApp.com
              </div>
            </div>
          </Card>
        </PixelCard>
      </div>

      <div className="flex gap-4 mt-8 w-full">
        <Button onClick={handleShare} className="w-full font-bold shadow-lg shadow-primary/20 active:scale-95 transition-transform" size="lg">
          <Share2 className="w-4 h-4 mr-2" /> Share to Instagram
        </Button>
      </div>
    </>
  );
}
