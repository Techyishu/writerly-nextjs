import { NextRequest, NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity';
import { authenticateRequest } from '@/lib/auth-middleware';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await authenticateRequest(request);
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check if Sanity configuration is available
    if (!process.env.SANITY_API_TOKEN) {
      console.error('SANITY_API_TOKEN is not configured');
      return NextResponse.json({ 
        error: 'Sanity configuration missing',
        details: 'SANITY_API_TOKEN environment variable is not set'
      }, { status: 500 });
    }

    if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || !process.env.NEXT_PUBLIC_SANITY_DATASET) {
      console.error('Sanity project configuration is missing');
      return NextResponse.json({ 
        error: 'Sanity project configuration missing',
        details: 'NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET is not set'
      }, { status: 500 });
    }

    console.log('Uploading file to Sanity:', { fileName: file.name, fileSize: file.size, fileType: file.type });
    
    const asset = await sanityClient.assets.upload('image', file);
    console.log('Upload successful:', { assetId: asset._id, url: asset.url });
    
    return NextResponse.json({ assetId: asset._id, url: asset.url });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ 
      error: 'Failed to upload image',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
