import { NextRequest, NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity';

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

    // Add comment to Sanity - ensure comments array exists first
    await sanityClient
      .patch(postId)
      .setIfMissing({ comments: [] })
      .append('comments', [{
        _type: 'object',
        name: newComment.name,
        comment: newComment.comment,
        createdAt: newComment.createdAt,
      }])
      .commit();
    
    console.log('Comment saved to Sanity successfully');
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

    // Get comments from Sanity - try a different approach
    const query = `*[_type == "post" && _id == $postId][0]`;
    const result = await sanityClient.fetch(query, { postId });
    
    console.log('Full post data from Sanity:', JSON.stringify(result, null, 2));
    
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
    
    console.log('No comments found in Sanity for post:', postId);
    return NextResponse.json({ comments: [] });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}