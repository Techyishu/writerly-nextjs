import { NextRequest, NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity';

export async function POST(request: NextRequest) {
  try {
    const { postId, type } = await request.json();

    if (!postId || !type) {
      return NextResponse.json({ error: 'Post ID and feedback type are required' }, { status: 400 });
    }

    if (!['positive', 'negative'].includes(type)) {
      return NextResponse.json({ error: 'Invalid feedback type' }, { status: 400 });
    }

    // Update feedback count in Sanity
    const fieldName = type === 'positive' ? 'positiveFeedback' : 'negativeFeedback';
    await sanityClient
      .patch(postId)
      .setIfMissing({ [fieldName]: 0 })
      .inc({ [fieldName]: 1 })
      .commit();
    
    console.log(`Feedback saved to Sanity: ${type} for post ${postId}`);
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

    // Get feedback counts from Sanity
    const query = `*[_type == "post" && _id == $postId][0] { positiveFeedback, negativeFeedback }`;
    const result = await sanityClient.fetch(query, { postId });
    
    const positive = result?.positiveFeedback || 0;
    const negative = result?.negativeFeedback || 0;
    
    console.log(`Feedback from Sanity for post ${postId}:`, { positive, negative });
    return NextResponse.json({ positive, negative });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
  }
}