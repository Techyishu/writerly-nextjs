import { NextRequest, NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity';

const feedbackCounts = new Map<string, { positive: number; negative: number }>();

export async function POST(request: NextRequest) {
  try {
    const { postId, type } = await request.json();
    
    if (!postId || !type) {
      return NextResponse.json({ error: 'Post ID and feedback type are required' }, { status: 400 });
    }

    if (!['positive', 'negative'].includes(type)) {
      return NextResponse.json({ error: 'Invalid feedback type' }, { status: 400 });
    }

    try {
      const fieldName = type === 'positive' ? 'positiveFeedback' : 'negativeFeedback';
      await sanityClient
        .patch(postId)
        .inc({ [fieldName]: 1 })
        .commit();
    } catch (sanityError) {
      console.warn('Sanity feedback update failed, using fallback storage:', sanityError);
    }

    // Always use fallback storage for now (like comments)
    const current = feedbackCounts.get(postId) || { positive: 0, negative: 0 };
    if (type === 'positive') {
      current.positive++;
    } else {
      current.negative++;
    }
    feedbackCounts.set(postId, current);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    
    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    try {
      const query = `*[_type == "post" && _id == $postId][0] { positiveFeedback, negativeFeedback }`;
      const result = await sanityClient.fetch(query, { postId });
      
      if (result && (result.positiveFeedback > 0 || result.negativeFeedback > 0)) {
        return NextResponse.json({ 
          positive: result.positiveFeedback || 0,
          negative: result.negativeFeedback || 0
        });
      }
    } catch (sanityError) {
      console.warn('Sanity feedback read failed, using fallback storage:', sanityError);
    }

    // Always use fallback storage for now (like comments)
    const fallback = feedbackCounts.get(postId) || { positive: 0, negative: 0 };
    return NextResponse.json(fallback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
  }
}
