import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const { error } = await supabase
      .from('visitors')
      .insert(data);
    
    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking visitor:', error);
    return NextResponse.json({ error: 'Failed to track visitor' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { count, error } = await supabase
      .from('visitors')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    
    return NextResponse.json({ count: count || 0 });
  } catch (error) {
    console.error('Error getting visitor count:', error);
    return NextResponse.json({ error: 'Failed to get visitor count' }, { status: 500 });
  }
}
