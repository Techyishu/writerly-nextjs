import { NextRequest, NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity';

// In-memory storage for view counts (fallback when Sanity write operations fail)
const viewCounts = new Map<string, number>();

export async function POST(request: NextRequest) {
  try {
    const { postId } = await request.json();
    
    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    try {
      // Try to increment view count in Sanity
      await sanityClient
        .patch(postId)
        .inc({ viewCount: 1 })
        .commit();
    } catch (sanityError) {
      console.warn('Sanity write failed, using fallback storage:', sanityError);
      // Fallback to in-memory storage
      const currentCount = viewCounts.get(postId) || 0;
      viewCounts.set(postId, currentCount + 1);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking view:', error);
    return NextResponse.json({ error: 'Failed to track view' }, { status: 500 });
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
      // Try to get current view count from Sanity
      const query = `*[_type == "post" && _id == $postId][0] { viewCount }`;
      const result = await sanityClient.fetch(query, { postId });
      
      if (result && typeof result.viewCount === 'number') {
        return NextResponse.json({ viewCount: result.viewCount });
      }
    } catch (sanityError) {
      console.warn('Sanity read failed, using fallback storage:', sanityError);
    }

    // Fallback to in-memory storage
    const fallbackCount = viewCounts.get(postId) || 0;
    return NextResponse.json({ viewCount: fallbackCount });
  } catch (error) {
    console.error('Error fetching view count:', error);
    return NextResponse.json({ error: 'Failed to fetch view count' }, { status: 500 });
  }
}
