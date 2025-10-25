import { NextRequest, NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'feedback.json');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(DATA_FILE))) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}

// Load data from file
function loadFeedbackData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading feedback data:', error);
  }
  return {};
}

// Save data to file
function saveFeedbackData(data: any) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving feedback data:', error);
  }
}

let feedbackCounts = loadFeedbackData();

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
      console.log(`Feedback saved to Sanity: ${type} for post ${postId}`);
    } catch (sanityError) {
      console.warn('Sanity feedback update failed, using fallback storage:', sanityError);
      // Fallback to file storage
      const current = feedbackCounts[postId] || { positive: 0, negative: 0 };
      if (type === 'positive') {
        current.positive++;
      } else {
        current.negative++;
      }
      feedbackCounts[postId] = current;
      saveFeedbackData(feedbackCounts);
    }

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
        console.log('Feedback loaded from Sanity:', result);
        return NextResponse.json({ 
          positive: result.positiveFeedback || 0,
          negative: result.negativeFeedback || 0
        });
      }
    } catch (sanityError) {
      console.warn('Sanity feedback read failed, using fallback storage:', sanityError);
    }

    // Fallback to file storage
    const fallback = feedbackCounts[postId] || { positive: 0, negative: 0 };
    console.log('Using fallback feedback:', fallback);
    return NextResponse.json(fallback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
  }
}
