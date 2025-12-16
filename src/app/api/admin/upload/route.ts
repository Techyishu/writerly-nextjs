import { NextRequest, NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity';
import { authenticateRequest } from '@/lib/auth-middleware';

export async function POST(request: NextRequest) {
  try {
    console.log('Upload request received');
    
    // Check authentication
    const authResult = await authenticateRequest(request);
    if (!authResult.user) {
      console.log('Authentication failed');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Authentication successful');

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.log('No file provided');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    console.log('File received:', { fileName: file.name, fileSize: file.size, fileType: file.type });

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

    console.log('Sanity configuration verified');
    console.log('Uploading file to Sanity:', { fileName: file.name, fileSize: file.size, fileType: file.type });
    
    // Convert File to Buffer for Sanity upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    try {
      const asset = await sanityClient.assets.upload('image', buffer, {
        filename: file.name,
        contentType: file.type,
      });
      console.log('Upload successful:', { assetId: asset._id, url: asset.url });
      
      return NextResponse.json({ assetId: asset._id, url: asset.url });
    } catch (uploadError: any) {
      console.error('Sanity upload error:', uploadError);
      
      // Provide more specific error messages
      if (uploadError.statusCode === 401 || uploadError.message?.includes('unauthorized')) {
        return NextResponse.json({ 
          error: 'Upload failed: Unauthorized',
          details: 'Your SANITY_API_TOKEN does not have permission to upload files. Please ensure your token has Editor or Admin role permissions in your Sanity project settings.'
        }, { status: 403 });
      }
      
      if (uploadError.statusCode === 413 || uploadError.message?.includes('too large')) {
        return NextResponse.json({ 
          error: 'Upload failed: File too large',
          details: 'The file exceeds Sanity\'s upload size limit.'
        }, { status: 413 });
      }
      
      throw uploadError; // Re-throw to be caught by outer catch
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = error instanceof Error && 'details' in error 
      ? (error as any).details 
      : errorMessage;
    
    return NextResponse.json({ 
      error: 'Failed to upload image',
      details: errorDetails,
      message: errorMessage
    }, { status: 500 });
  }
}
