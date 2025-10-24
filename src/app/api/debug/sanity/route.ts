import { NextRequest, NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity';

export async function GET(request: NextRequest) {
  try {
    // Test basic Sanity connection
    const testQuery = `*[_type == "post"][0] { _id, title }`;
    const result = await sanityClient.fetch(testQuery);
    
    return NextResponse.json({
      success: true,
      message: 'Sanity connection successful',
      testResult: result,
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
      hasToken: !!process.env.SANITY_API_TOKEN
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
      hasToken: !!process.env.SANITY_API_TOKEN
    }, { status: 500 });
  }
}
