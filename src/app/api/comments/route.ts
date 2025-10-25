import { NextRequest, NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity';

// Global comments storage (persists during server session)
const comments = new Map<string, Array<{
  id: string;
  name: string;
  comment: string;
  createdAt: string;
}>>();

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
          _type: 'comment',
          name: newComment.name,
          comment: newComment.comment,
          createdAt: newComment.createdAt,
        }])
        .commit();
    } catch (sanityError) {
      console.warn('Sanity comment update failed, using fallback storage:', sanityError);
    }

    // Always use fallback storage for now
    const postComments = comments.get(postId) || [];
    postComments.push(newComment);
    comments.set(postId, postComments);

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
      
      if (result?.comments) {
        const formattedComments = result.comments.map((comment: any, index: number) => ({
          id: `${postId}_${index}`,
          name: comment.name,
          comment: comment.comment,
          createdAt: comment.createdAt,
        }));
        return NextResponse.json({ comments: formattedComments });
      }
    } catch (sanityError) {
      console.warn('Sanity comment read failed, using fallback storage:', sanityError);
    }

    const postComments = comments.get(postId) || [];
    return NextResponse.json({ comments: postComments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}
