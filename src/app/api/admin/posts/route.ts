import { NextRequest, NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity';

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

export async function GET(request: NextRequest) {
  try {
    const query = `*[_type == "post"] | order(publishedAt desc) {
      _id,
      title,
      excerpt,
      content,
      slug,
      category,
      readTime,
      featured,
      published,
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
    
    const posts = await sanityClient.fetch(query);
    return NextResponse.json(posts.map(convertToBlogPost));
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const doc: any = {
      _type: 'post',
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      slug: { current: data.slug?.current || data.title?.toLowerCase().replace(/\s+/g, '-') },
      category: data.category,
      readTime: data.readTime,
      featured: data.featured || false,
      published: data.published || false,
      publishedAt: new Date().toISOString(),
    };

    // Handle cover image - if it's an asset ID, create proper reference
    if (data.coverImage) {
      if (typeof data.coverImage === 'string' && data.coverImage.startsWith('image-')) {
        // It's a Sanity asset ID, create proper reference
        doc.coverImage = {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: data.coverImage
          }
        };
      } else {
        // It's a URL or other format, store as string for now
        doc.coverImage = data.coverImage;
      }
    }

    const result = await sanityClient.create(doc);
    return NextResponse.json(convertToBlogPost(result));
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
