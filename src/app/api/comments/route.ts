import { NextRequest, NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'comments.json');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(DATA_FILE))) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}

// Load data from file
function loadCommentsData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading comments data:', error);
  }
  return {};
}

// Save data to file
function saveCommentsData(data: any) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving comments data:', error);
  }
}

let comments = loadCommentsData();

export async function POST(request: NextRequest) {
  try {
    const { postId, name, comment } = await request.json();
    
    if (!postId || !name || !comment) {
      return NextResponse.json({ error: 'Post ID, name, and comment are required' }, { status: 400 });
    }

    const commentId = Date.now().toString();
    const newComment = {
      id: commentId,
      name: name.trim(),
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      await sanityClient
        .patch(postId)
        .append('comments', [{
          _type: 'object',
          name: newComment.name,
          comment: newComment.comment,
          createdAt: newComment.createdAt,
        }])
        .commit();
      console.log('Comment saved to Sanity successfully');
    } catch (sanityError) {
      console.warn('Sanity comment update failed, using fallback storage:', sanityError);
      // Fallback to file storage
      const postComments = comments[postId] || [];
      postComments.push(newComment);
      comments[postId] = postComments;
      saveCommentsData(comments);
    }

    return NextResponse.json({ success: true, comment: newComment });
  } catch (error) {
    console.error('Error submitting comment:', error);
    return NextResponse.json({ error: 'Failed to submit comment' }, { status: 500 });
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
      const query = `*[_type == "post" && _id == $postId][0] { 
        "comments": comments[] {
          name,
          comment,
          createdAt
        }
      }`;
      const result = await sanityClient.fetch(query, { postId });
      
      if (result?.comments && result.comments.length > 0) {
        const formattedComments = result.comments.map((comment: any, index: number) => ({
          id: `${postId}_${index}`,
          name: comment.name,
          comment: comment.comment,
          createdAt: comment.createdAt,
        }));
        console.log('Comments loaded from Sanity:', formattedComments.length);
        return NextResponse.json({ comments: formattedComments });
      }
    } catch (sanityError) {
      console.warn('Sanity comment read failed, using fallback storage:', sanityError);
    }

    // Fallback to file storage
    const postComments = comments[postId] || [];
    console.log('Using fallback comments:', postComments.length);
    return NextResponse.json({ comments: postComments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}
