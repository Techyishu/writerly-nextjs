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
    if (data.coverImage !== undefined) {
      if (data.coverImage === null || data.coverImage === '') {
        // Explicitly remove cover image
        updateData.coverImage = null;
      } else if (typeof data.coverImage === 'string') {
        // Check if it's a Sanity asset ID (starts with 'image-' or 'file-')
        if (data.coverImage.startsWith('image-') || data.coverImage.startsWith('file-')) {
          // It's a Sanity asset ID, create proper reference
          console.log('Updating image reference for asset ID:', data.coverImage);
          updateData.coverImage = {
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: data.coverImage
            }
          };
        } else if (data.coverImage.startsWith('http://') || data.coverImage.startsWith('https://')) {
          // It's a URL, store as string (fallback for external images)
          console.log('Updating cover image as URL:', data.coverImage);
          updateData.coverImage = data.coverImage;
        } else {
          // Assume it's an asset ID even if it doesn't start with 'image-'
          // Sometimes Sanity asset IDs might have different formats
          console.log('Treating as asset ID (no prefix):', data.coverImage);
          updateData.coverImage = {
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: data.coverImage
            }
          };
        }
      } else {
        // Already an object, use as is
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
    
    // Check if Sanity configuration is available
    if (!process.env.SANITY_API_TOKEN) {
      console.error('SANITY_API_TOKEN is not configured');
      return NextResponse.json({ 
        error: 'Sanity configuration missing',
        details: 'SANITY_API_TOKEN environment variable is not set. Please check your .env file and ensure you have a token with Editor or Admin permissions.'
      }, { status: 500 });
    }

    console.log('Attempting to delete post:', id);
    
    try {
      // First, check if the document exists and get its draft status
      const doc = await sanityClient.getDocument(id).catch(() => null);
      
      if (!doc) {
        // Try to delete draft version if published version doesn't exist
        const draftId = id.startsWith('drafts.') ? id : `drafts.${id}`;
        const draftDoc = await sanityClient.getDocument(draftId).catch(() => null);
        
        if (draftDoc) {
          console.log('Deleting draft document:', draftId);
          await sanityClient.delete(draftId);
          return NextResponse.json({ success: true, message: 'Draft deleted successfully' });
        }
        
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }

      // Delete the published document
      console.log('Deleting published document:', id);
      await sanityClient.delete(id);
      
      // Also try to delete the draft version if it exists
      const draftId = `drafts.${id}`;
      try {
        const draftDoc = await sanityClient.getDocument(draftId);
        if (draftDoc) {
          console.log('Deleting draft document:', draftId);
          await sanityClient.delete(draftId);
        }
      } catch (draftError) {
        // Draft doesn't exist, which is fine
        console.log('No draft version found, continuing...');
      }
      
      return NextResponse.json({ success: true, message: 'Post deleted successfully' });
    } catch (deleteError: any) {
      console.error('Sanity delete error:', deleteError);
      
      // Provide more specific error messages
      if (deleteError.statusCode === 401 || deleteError.message?.includes('unauthorized')) {
        return NextResponse.json({ 
          error: 'Delete failed: Unauthorized',
          details: 'Your SANITY_API_TOKEN does not have permission to delete documents. Please ensure your token has Editor or Admin role permissions in your Sanity project settings.'
        }, { status: 403 });
      }
      
      if (deleteError.statusCode === 404 || deleteError.message?.includes('not found')) {
        return NextResponse.json({ 
          error: 'Post not found',
          details: 'The post you are trying to delete does not exist.'
        }, { status: 404 });
      }
      
      throw deleteError; // Re-throw to be caught by outer catch
    }
  } catch (error) {
    console.error('Error deleting post:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = error instanceof Error && 'details' in error 
      ? (error as any).details 
      : errorMessage;
    
    return NextResponse.json({ 
      error: 'Failed to delete post',
      details: errorDetails,
      message: errorMessage
    }, { status: 500 });
  }
}
