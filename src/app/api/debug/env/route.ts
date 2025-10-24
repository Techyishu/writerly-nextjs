import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Only allow this in development or for debugging
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Debug endpoint not available in production' }, { status: 403 });
  }

  const envCheck = {
    SANITY_API_TOKEN: process.env.SANITY_API_TOKEN ? 'SET' : 'MISSING',
    NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ? 'SET' : 'MISSING',
    NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET ? 'SET' : 'MISSING',
    ADMIN_EMAIL: process.env.ADMIN_EMAIL ? 'SET' : 'MISSING',
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ? 'SET' : 'MISSING',
    JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'MISSING',
  };

  return NextResponse.json({
    message: 'Environment variables check',
    environment: process.env.NODE_ENV,
    variables: envCheck,
    // Don't expose actual values for security
    hasRequiredVars: envCheck.SANITY_API_TOKEN === 'SET' && 
                     envCheck.NEXT_PUBLIC_SANITY_PROJECT_ID === 'SET' && 
                     envCheck.NEXT_PUBLIC_SANITY_DATASET === 'SET'
  });
}
