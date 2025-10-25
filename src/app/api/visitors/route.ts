import { NextRequest, NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'visitors.json');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(DATA_FILE))) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}

// Load data from file
function loadVisitorsData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading visitors data:', error);
  }
  return {};
}

// Save data to file
function saveVisitorsData(data: any) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving visitors data:', error);
  }
}

let viewCounts = loadVisitorsData();

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
      console.log(`View count saved to Sanity for post ${postId}`);
    } catch (sanityError) {
      console.warn('Sanity write failed, using fallback storage:', sanityError);
      // Fallback to file storage
      const currentCount = viewCounts[postId] || 0;
      viewCounts[postId] = currentCount + 1;
      saveVisitorsData(viewCounts);
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
      
      if (result && typeof result.viewCount === 'number' && result.viewCount > 0) {
        console.log('View count loaded from Sanity:', result.viewCount);
        return NextResponse.json({ viewCount: result.viewCount });
      }
    } catch (sanityError) {
      console.warn('Sanity read failed, using fallback storage:', sanityError);
    }

    // Fallback to file storage
    const fallbackCount = viewCounts[postId] || 0;
    console.log('Using fallback view count:', fallbackCount);
    return NextResponse.json({ viewCount: fallbackCount });
  } catch (error) {
    console.error('Error fetching view count:', error);
    return NextResponse.json({ error: 'Failed to fetch view count' }, { status: 500 });
  }
}
