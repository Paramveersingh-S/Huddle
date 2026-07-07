import { NextResponse } from 'next/server';
import { categorizeSpend } from '@/lib/coach/classifier';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { merchant, amount, description } = await req.json();

    if (!merchant || amount === undefined || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await categorizeSpend({
      userId: user.id,
      merchant,
      amount: Number(amount),
      description,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Coach API] Categorize error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
