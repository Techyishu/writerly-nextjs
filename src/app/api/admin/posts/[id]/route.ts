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
      console.log('Delete: Authentication failed');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    console.log('Delete request for post ID:', id);
    
    // Check if Sanity configuration is available
    if (!process.env.SANITY_API_TOKEN) {
      console.error('SANITY_API_TOKEN is not configured');
      return NextResponse.json({ 
        error: 'Sanity configuration missing',
        details: 'SANITY_API_TOKEN environment variable is not set. Please check your .env file and ensure you have a token with Editor or Admin permissions.'
      }, { status: 500 });
    }

    if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || !process.env.NEXT_PUBLIC_SANITY_DATASET) {
      console.error('Sanity project configuration is missing');
      return NextResponse.json({ 
        error: 'Sanity project configuration missing',
        details: 'NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET is not set'
      }, { status: 500 });
    }

    try {
      // Sanity requires deleting drafts separately from published documents
      const draftId = id.startsWith('drafts.') ? id : `drafts.${id}`;
      const publishedId = id.startsWith('drafts.') ? id.replace('drafts.', '') : id;
      
      console.log('Attempting to delete:', { publishedId, draftId });
      
      let deletedCount = 0;
      const errors: string[] = [];
      
      // Try to delete published version
      try {
        const publishedDoc = await sanityClient.getDocument(publishedId).catch(() => null);
        if (publishedDoc) {
          console.log('Deleting published document:', publishedId);
          await sanityClient.delete(publishedId);
          deletedCount++;
          console.log('Published document deleted successfully');
        } else {
          console.log('Published document not found:', publishedId);
        }
      } catch (err: any) {
        console.error('Error deleting published document:', err);
        const errorMsg = err?.message || 'Failed to delete published document';
        errors.push(errorMsg);
        // Don't fail completely if published doesn't exist
        if (err?.statusCode !== 404 && !err?.message?.includes('not found')) {
          throw err; // Re-throw if it's not a "not found" error
        }
      }
      
      // Try to delete draft version
      try {
        const draftDoc = await sanityClient.getDocument(draftId).catch(() => null);
        if (draftDoc) {
          console.log('Deleting draft document:', draftId);
          await sanityClient.delete(draftId);
          deletedCount++;
          console.log('Draft document deleted successfully');
        } else {
          console.log('Draft document not found:', draftId);
        }
      } catch (err: any) {
        console.error('Error deleting draft document:', err);
        const errorMsg = err?.message || 'Failed to delete draft document';
        errors.push(errorMsg);
        // Don't fail completely if draft doesn't exist
        if (err?.statusCode !== 404 && !err?.message?.includes('not found')) {
          throw err; // Re-throw if it's not a "not found" error
        }
      }
      
      if (deletedCount === 0) {
        console.log('No documents found to delete');
        return NextResponse.json({ 
          error: 'Post not found',
          details: 'The post you are trying to delete does not exist.'
        }, { status: 404 });
      }
      
      console.log(`Successfully deleted ${deletedCount} document(s)`);
      return NextResponse.json({ 
        success: true, 
        message: 'Post deleted successfully',
        deleted: deletedCount
      });
      
    } catch (deleteError: any) {
      console.error('Sanity delete error:', deleteError);
      console.error('Error details:', {
        message: deleteError.message,
        statusCode: deleteError.statusCode,
        responseBody: deleteError.responseBody,
        stack: deleteError.stack
      });
      
      // Provide more specific error messages
      if (deleteError.statusCode === 401 || deleteError.message?.includes('unauthorized') || deleteError.message?.includes('Invalid login')) {
        return NextResponse.json({ 
          error: 'Delete failed: Unauthorized',
          details: 'Your SANITY_API_TOKEN does not have permission to delete documents. Please ensure your token has Editor or Admin role permissions in your Sanity project settings.'
        }, { status: 403 });
      }
      
      if (deleteError.statusCode === 404 || deleteError.message?.includes('not found') || deleteError.message?.includes('Document not found')) {
        return NextResponse.json({ 
          error: 'Post not found',
          details: 'The post you are trying to delete does not exist.'
        }, { status: 404 });
      }
      
      if (deleteError.message?.includes('references') || deleteError.message?.includes('referenced')) {
        return NextResponse.json({ 
          error: 'Cannot delete post',
          details: 'This post cannot be deleted because it is referenced by other documents. Please remove all references first.'
        }, { status: 409 });
      }
      
      // Return the actual error message for debugging
      return NextResponse.json({ 
        error: 'Failed to delete post',
        details: deleteError.message || 'Unknown error occurred',
        statusCode: deleteError.statusCode
      }, { status: deleteError.statusCode || 500 });
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
