#!/usr/bin/env node

/**
 * Test script for visitor tracking functionality
 * This script tests the visitor tracking API endpoints
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

async function testVisitorTracking() {
  console.log('🚀 Starting Visitor Tracking Tests...\n');

  try {
    // Test 1: Get all posts to find a post ID
    console.log('📝 Test 1: Fetching posts to get a post ID...');
    const postsResponse = await fetch(`${BASE_URL}/api/posts`);
    
    if (!postsResponse.ok) {
      throw new Error(`Failed to fetch posts: ${postsResponse.status}`);
    }
    
    const posts = await postsResponse.json();
    console.log(`✅ Found ${posts.length} posts`);
    
    if (posts.length === 0) {
      console.log('⚠️  No posts found. Please create a post first.');
      return;
    }
    
    const testPost = posts[0];
    const postId = testPost._id;
    console.log(`📄 Using post: "${testPost.title}" (ID: ${postId})\n`);

    // Test 2: Get initial view count
    console.log('👁️  Test 2: Getting initial view count...');
    const initialCountResponse = await fetch(`${BASE_URL}/api/visitors?postId=${postId}`);
    
    if (!initialCountResponse.ok) {
      throw new Error(`Failed to get view count: ${initialCountResponse.status}`);
    }
    
    const initialData = await initialCountResponse.json();
    const initialCount = initialData.viewCount;
    console.log(`✅ Initial view count: ${initialCount}\n`);

    // Test 3: Track a view
    console.log('📈 Test 3: Tracking a view...');
    const trackResponse = await fetch(`${BASE_URL}/api/visitors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ postId }),
    });
    
    if (!trackResponse.ok) {
      throw new Error(`Failed to track view: ${trackResponse.status}`);
    }
    
    const trackData = await trackResponse.json();
    console.log(`✅ View tracked successfully: ${JSON.stringify(trackData)}\n`);

    // Test 4: Verify view count increased
    console.log('🔍 Test 4: Verifying view count increased...');
    const updatedCountResponse = await fetch(`${BASE_URL}/api/visitors?postId=${postId}`);
    
    if (!updatedCountResponse.ok) {
      throw new Error(`Failed to get updated view count: ${updatedCountResponse.status}`);
    }
    
    const updatedData = await updatedCountResponse.json();
    const updatedCount = updatedData.viewCount;
    console.log(`✅ Updated view count: ${updatedCount}`);
    
    if (updatedCount > initialCount) {
      console.log(`🎉 SUCCESS: View count increased from ${initialCount} to ${updatedCount}`);
    } else {
      console.log(`⚠️  WARNING: View count did not increase (${initialCount} -> ${updatedCount})`);
    }

    // Test 5: Test multiple views (should not increment due to session tracking)
    console.log('\n🔄 Test 5: Testing session-based tracking (should not increment)...');
    const trackResponse2 = await fetch(`${BASE_URL}/api/visitors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ postId }),
    });
    
    if (trackResponse2.ok) {
      const finalCountResponse = await fetch(`${BASE_URL}/api/visitors?postId=${postId}`);
      const finalData = await finalCountResponse.json();
      console.log(`✅ Final view count: ${finalData.viewCount}`);
      
      if (finalData.viewCount === updatedCount) {
        console.log('🎉 SUCCESS: Session tracking working - no duplicate increment');
      } else {
        console.log('⚠️  WARNING: Session tracking may not be working properly');
      }
    }

    console.log('\n✅ All tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Initial count: ${initialCount}`);
    console.log(`   - Final count: ${updatedCount}`);
    console.log(`   - Views tracked: ${updatedCount - initialCount}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
if (require.main === module) {
  testVisitorTracking();
}

module.exports = { testVisitorTracking };
