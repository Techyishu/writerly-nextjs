import { NextRequest, NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity';
import { authenticateRequest } from '@/lib/auth-middleware';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// Helper function to convert Sanity document to BlogPost
function convertToBlogPost(doc: any) {
  // Handle cover image properly
  let coverImageUrl = '';
  if (doc.coverImage) {
    if (doc.coverImage.asset && doc.coverImage.asset.url) {
      coverImageUrl = doc.coverImage.asset.url;
    } else if (typeof doc.coverImage === 'string') {
      coverImageUrl = doc.coverImage;
    }
  }

  return {
    _id: doc._id,
    title: doc.title || '',
    excerpt: doc.excerpt || '',
    content: doc.content || '',
    slug: { current: doc.slug?.current || '' },
    category: doc.category || '',
    readTime: doc.readTime || '',
    featured: doc.featured || false,
    published: doc.published || false,
    coverImage: coverImageUrl,
    publishedAt: doc.publishedAt || new Date().toISOString(),
    _createdAt: doc._createdAt || new Date().toISOString(),
    _updatedAt: doc._updatedAt || new Date().toISOString(),
  };
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const authResult = await authenticateRequest(request);
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();
    
    const updateData: any = {
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      category: data.category,
      readTime: data.readTime,
      featured: data.featured,
      published: data.published,
    };

    if (data.slug?.current) {
      updateData.slug = { current: data.slug.current };
    }

    // Handle cover image - if it's an asset ID, create proper reference
    if (data.coverImage) {
      if (typeof data.coverImage === 'string' && data.coverImage.startsWith('image-')) {
        // It's a Sanity asset ID, create proper reference
        updateData.coverImage = {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: data.coverImage
          }
        };
      } else {
        // It's a URL or other format, store as string for now
        updateData.coverImage = data.coverImage;
      }
    }

    const result = await sanityClient.patch(id).set(updateData).commit();
    return NextResponse.json(convertToBlogPost(result));
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const authResult = await authenticateRequest(request);
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await sanityClient.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
