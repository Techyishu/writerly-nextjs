import { NextRequest, NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity';
import { authenticateRequest } from '@/lib/auth-middleware';

// Helper function to convert Sanity document to BlogPost
function convertToBlogPost(doc: any) {
  // Handle cover image properly
  let coverImageUrl = '';
  if (doc.coverImage) {
    // Check if it's a Sanity image reference with asset
    if (doc.coverImage.asset) {
      // Asset might be a reference object or already resolved
      if (doc.coverImage.asset.url) {
        // Already resolved (from GROQ query with asset->)
        coverImageUrl = doc.coverImage.asset.url;
      } else if (doc.coverImage.asset._ref) {
        // It's a reference, we need to extract the asset ID
        // For editing, we'll return the asset ID so it can be used to update
        coverImageUrl = doc.coverImage.asset._ref;
      } else if (typeof doc.coverImage.asset === 'string') {
        // Asset is just a string (asset ID)
        coverImageUrl = doc.coverImage.asset;
      }
    } else if (typeof doc.coverImage === 'string') {
      // It's a URL string
      coverImageUrl = doc.coverImage;
    } else if (doc.coverImage._ref) {
      // Direct reference
      coverImageUrl = doc.coverImage._ref;
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
    // Check authentication
    const authResult = await authenticateRequest(request);
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
    // Check authentication
    const authResult = await authenticateRequest(request);
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
      if (typeof data.coverImage === 'string') {
        // Check if it's a Sanity asset ID (starts with 'image-' or 'file-')
        if (data.coverImage.startsWith('image-') || data.coverImage.startsWith('file-')) {
          // It's a Sanity asset ID, create proper reference
          console.log('Creating image reference for asset ID:', data.coverImage);
          doc.coverImage = {
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: data.coverImage
            }
          };
        } else if (data.coverImage.startsWith('http://') || data.coverImage.startsWith('https://')) {
          // It's a URL, store as string (fallback for external images)
          console.log('Storing cover image as URL:', data.coverImage);
          doc.coverImage = data.coverImage;
        } else {
          // Assume it's an asset ID even if it doesn't start with 'image-'
          // Sometimes Sanity asset IDs might have different formats
          console.log('Treating as asset ID (no prefix):', data.coverImage);
          doc.coverImage = {
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: data.coverImage
            }
          };
        }
      } else {
        // Already an object, use as is
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
