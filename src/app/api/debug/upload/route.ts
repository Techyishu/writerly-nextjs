import { NextRequest, NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity';

export async function POST(request: NextRequest) {
  try {
    const results: any = {
      timestamp: new Date().toISOString(),
      tests: []
    };

    // Test 1: Check if we can access the request
    results.tests.push({
      name: 'Request Access',
      status: 'PASS',
      details: { requestReceived: true }
    });

    // Test 2: Check environment variables
    const envCheck = {
      SANITY_API_TOKEN: !!process.env.SANITY_API_TOKEN,
      NEXT_PUBLIC_SANITY_PROJECT_ID: !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      NEXT_PUBLIC_SANITY_DATASET: !!process.env.NEXT_PUBLIC_SANITY_DATASET,
    };

    results.tests.push({
      name: 'Environment Variables',
      status: Object.values(envCheck).every(Boolean) ? 'PASS' : 'FAIL',
      details: envCheck
    });

    // Test 3: Check Sanity client configuration
    try {
      const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
      const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
      const token = process.env.SANITY_API_TOKEN;

      results.tests.push({
        name: 'Sanity Client Config',
        status: 'PASS',
        details: {
          projectId: projectId || 'MISSING',
          dataset: dataset || 'MISSING',
          hasToken: !!token,
          tokenLength: token ? token.length : 0
        }
      });
    } catch (error) {
      results.tests.push({
        name: 'Sanity Client Config',
        status: 'FAIL',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }

    // Test 4: Test basic Sanity connection
    try {
      const testQuery = `*[_type == "post"][0] { _id, title }`;
      const testResult = await sanityClient.fetch(testQuery);
      
      results.tests.push({
        name: 'Sanity Connection',
        status: 'PASS',
        details: {
          connectionSuccessful: true,
          testResult: testResult
        }
      });
    } catch (error) {
      results.tests.push({
        name: 'Sanity Connection',
        status: 'FAIL',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : 'No stack trace'
        }
      });
    }

    // Test 5: Test form data parsing
    try {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      
      results.tests.push({
        name: 'Form Data Parsing',
        status: file ? 'PASS' : 'FAIL',
        details: {
          hasFile: !!file,
          fileName: file?.name || 'No file',
          fileSize: file?.size || 0,
          fileType: file?.type || 'No type'
        }
      });

      // Test 6: Test actual upload (if file exists)
      if (file) {
        try {
          console.log('Attempting upload to Sanity...');
          const asset = await sanityClient.assets.upload('image', file);
          console.log('Upload successful:', asset);
          
          results.tests.push({
            name: 'Sanity Upload',
            status: 'PASS',
            details: {
              assetId: asset._id,
              url: asset.url,
              uploadSuccessful: true
            }
          });
        } catch (error) {
          results.tests.push({
            name: 'Sanity Upload',
            status: 'FAIL',
            details: {
              error: error instanceof Error ? error.message : 'Unknown error',
              stack: error instanceof Error ? error.stack : 'No stack trace'
            }
          });
        }
      }
    } catch (error) {
      results.tests.push({
        name: 'Form Data Parsing',
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
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    }, { status: 500 });
  }
}
