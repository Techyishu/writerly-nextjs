import { NextRequest, NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity';

export async function POST(request: NextRequest) {
  try {
    const { postId } = await request.json();
    
    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    console.log(`Attempting to increment view count for post: ${postId}`);
    
    // First, ensure the viewCount field exists, then increment it
    const result = await sanityClient
      .patch(postId)
      .setIfMissing({ viewCount: 0 })
      .inc({ viewCount: 1 })
      .commit();
    
    console.log(`View count incremented in Sanity for post ${postId}:`, result);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking view:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', {
      message: errorMessage,
      error: error
    });
    return NextResponse.json({ error: 'Failed to track view', details: errorMessage }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    
    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    // Get view count from Sanity
    const query = `*[_type == "post" && _id == $postId][0] { viewCount }`;
    const result = await sanityClient.fetch(query, { postId });
    
    const viewCount = result?.viewCount || 0;
    console.log(`View count from Sanity for post ${postId}:`, viewCount);
    return NextResponse.json({ viewCount });
  } catch (error) {
    console.error('Error fetching view count:', error);
    return NextResponse.json({ error: 'Failed to fetch view count' }, { status: 500 });
  }
}