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
    const query = `*[_type == "post" && published == true] | order(publishedAt desc) {
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
