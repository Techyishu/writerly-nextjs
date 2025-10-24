import { NextRequest, NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity';

export async function POST(request: NextRequest) {
  try {
    console.log('Test upload request received');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log('File received:', { fileName: file.name, fileSize: file.size, fileType: file.type });

    // Check environment variables
    const envCheck = {
      SANITY_API_TOKEN: !!process.env.SANITY_API_TOKEN,
      NEXT_PUBLIC_SANITY_PROJECT_ID: !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      NEXT_PUBLIC_SANITY_DATASET: !!process.env.NEXT_PUBLIC_SANITY_DATASET,
    };

    if (!envCheck.SANITY_API_TOKEN) {
      return NextResponse.json({ 
        error: 'SANITY_API_TOKEN is not configured',
        envCheck
      }, { status: 500 });
    }

    if (!envCheck.NEXT_PUBLIC_SANITY_PROJECT_ID || !envCheck.NEXT_PUBLIC_SANITY_DATASET) {
      return NextResponse.json({ 
        error: 'Sanity project configuration is missing',
        envCheck
      }, { status: 500 });
    }

    console.log('Environment variables verified');
    console.log('Uploading file to Sanity...');
    
    // Convert File to Buffer for Sanity upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const asset = await sanityClient.assets.upload('image', buffer, {
      filename: file.name,
      contentType: file.type,
    });
    console.log('Upload successful:', { assetId: asset._id, url: asset.url });
    
    return NextResponse.json({ 
      success: true,
      assetId: asset._id, 
      url: asset.url,
      envCheck
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ 
      error: 'Failed to upload image',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    }, { status: 500 });
  }
}
