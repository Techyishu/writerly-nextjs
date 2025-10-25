import { NextRequest, NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity';

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    
    const query = `*[_type == "post" && slug.current == $slug && published == true][0] {
      _id,
      title,
      excerpt,
      content,
      slug,
      category,
      readTime,
      featured,
      published,
      viewCount,
      positiveFeedback,
      negativeFeedback,
      coverImage{
        asset->{
          _id,
          url
        }
      },
      publishedAt,
      _createdAt,
      _updatedAt
    }`;
    
    const post = await sanityClient.fetch(query, { slug });
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    // Convert Sanity document to BlogPost format
    const convertedPost = {
      _id: post._id,
      title: post.title || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      slug: { current: post.slug?.current || '' },
      category: post.category || '',
      readTime: post.readTime || '',
      featured: post.featured || false,
      published: post.published || false,
      viewCount: post.viewCount || 0,
      positiveFeedback: post.positiveFeedback || 0,
      negativeFeedback: post.negativeFeedback || 0,
      coverImage: post.coverImage?.asset?.url || '',
      publishedAt: post.publishedAt || new Date().toISOString(),
      _createdAt: post._createdAt || new Date().toISOString(),
      _updatedAt: post._updatedAt || new Date().toISOString(),
    };
    
    return NextResponse.json(convertedPost);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}
