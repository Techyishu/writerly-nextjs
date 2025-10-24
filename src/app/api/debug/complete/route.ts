import { NextRequest, NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity';

export async function GET(request: NextRequest) {
  try {
    const results: any = {
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      tests: []
    };

    // Test 1: Environment Variables
    const envVars = {
      SANITY_API_TOKEN: !!process.env.SANITY_API_TOKEN,
      NEXT_PUBLIC_SANITY_PROJECT_ID: !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      NEXT_PUBLIC_SANITY_DATASET: !!process.env.NEXT_PUBLIC_SANITY_DATASET,
      ADMIN_EMAIL: !!process.env.ADMIN_EMAIL,
      ADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD,
      JWT_SECRET: !!process.env.JWT_SECRET,
    };

    results.tests.push({
      name: 'Environment Variables',
      status: Object.values(envVars).every(Boolean) ? 'PASS' : 'FAIL',
      details: envVars
    });

    // Test 2: Sanity Connection
    try {
      const sanityTest = await sanityClient.fetch(`*[_type == "post"][0...5] {
        _id,
        title,
        published,
        publishedAt,
        coverImage
      }`);
      
      results.tests.push({
        name: 'Sanity Connection',
        status: 'PASS',
        details: {
          postsFound: sanityTest?.length || 0,
          samplePost: sanityTest?.[0] || null
        }
      });
    } catch (error) {
      results.tests.push({
        name: 'Sanity Connection',
        status: 'FAIL',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }

    // Test 3: Published Posts Query
    try {
      const publishedPosts = await sanityClient.fetch(`*[_type == "post" && published == true] {
        _id,
        title,
        published,
        publishedAt,
        coverImage
      }`);
      
      results.tests.push({
        name: 'Published Posts Query',
        status: 'PASS',
        details: {
          publishedCount: publishedPosts?.length || 0,
          posts: publishedPosts || []
        }
      });
    } catch (error) {
      results.tests.push({
        name: 'Published Posts Query',
        status: 'FAIL',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }

    // Test 4: All Posts Query (for admin)
    try {
      const allPosts = await sanityClient.fetch(`*[_type == "post"] {
        _id,
        title,
        published,
        publishedAt,
        coverImage
      }`);
      
      results.tests.push({
        name: 'All Posts Query',
        status: 'PASS',
        details: {
          totalCount: allPosts?.length || 0,
          publishedCount: allPosts?.filter((p: any) => p.published).length || 0,
          unpublishedCount: allPosts?.filter((p: any) => !p.published).length || 0
        }
      });
    } catch (error) {
      results.tests.push({
        name: 'All Posts Query',
        status: 'FAIL',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }

    // Test 5: Image Upload Test (without actually uploading)
    try {
      // Test if we can access the assets endpoint
      const assetsTest = await sanityClient.fetch(`*[_type == "sanity.imageAsset"][0...3] {
        _id,
        url,
        originalFilename
      }`);
      
      results.tests.push({
        name: 'Assets Access Test',
        status: 'PASS',
        details: {
          assetsFound: assetsTest?.length || 0,
          sampleAsset: assetsTest?.[0] || null
        }
      });
    } catch (error) {
      results.tests.push({
        name: 'Assets Access Test',
        status: 'FAIL',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({
      error: 'Debug test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
