# Cover Image Display Fix

## Issue
Cover images uploaded to blog posts are not displaying on the frontend, even though they appear in Sanity Studio. The console shows `coverImage: ""` (empty string).

## Root Cause
The cover image asset reference was not being properly saved when creating/updating posts. The code was checking if the asset ID starts with `'image-'`, but if this check failed, it would store the asset ID as a plain string instead of creating a proper Sanity image reference.

## Fixes Applied

### 1. Improved Asset Reference Creation
- Updated `/src/app/api/admin/posts/route.ts` (POST) to better handle asset IDs
- Updated `/src/app/api/admin/posts/[id]/route.ts` (PUT) to better handle asset IDs
- Now handles asset IDs that:
  - Start with `'image-'` or `'file-'` (standard Sanity format)
  - Are URLs (starts with `'http://'` or `'https://'`)
  - Don't have a prefix (assumes they're asset IDs anyway)
- Added better logging to track what's happening

### 2. Improved Image Reference Extraction
- Updated `convertToBlogPost` functions in both routes to better extract image URLs from Sanity references
- Now handles multiple reference formats:
  - Resolved references (with `asset.url`)
  - Unresolved references (with `asset._ref`)
  - Direct asset IDs
  - URL strings

## How to Fix Existing Posts

If you have existing posts with missing cover images, you have two options:

### Option 1: Re-upload the Image (Recommended)
1. Go to `/admin/posts/[id]/edit`
2. Upload the cover image again
3. Save the post
4. The image should now display correctly

### Option 2: Update via Sanity Studio
1. Go to `/studio` in your app
2. Find the post
3. Make sure the cover image field has a proper image reference (not just a string)
4. Save the post

## Testing

1. **Create a new post with image:**
   - Go to `/admin/posts/new`
   - Fill in the form
   - Upload a cover image
   - Save the post
   - Check that the image displays on the blog post page

2. **Update an existing post:**
   - Go to `/admin/posts/[id]/edit`
   - Upload a new cover image
   - Save the post
   - Check that the image displays correctly

3. **Check the console:**
   - When viewing a post, check the browser console
   - The `coverImage` field should now have a URL, not an empty string

## Debugging

If images still don't display:

1. **Check the browser console:**
   - Look for the post data in the console
   - Check if `coverImage` has a value

2. **Check server logs:**
   - Look for log messages like "Creating image reference for asset ID: ..."
   - This confirms the asset reference is being created

3. **Check Sanity Studio:**
   - Verify the image is actually saved in Sanity
   - Check if the coverImage field has a proper image reference (not null)

4. **Test the upload:**
   - Try uploading a new image
   - Check the console for the asset ID format
   - Verify it starts with `'image-'`

## Technical Details

### Asset ID Format
Sanity asset IDs for images typically start with `'image-'` followed by a hash. The code now handles:
- Standard format: `image-abc123...`
- Alternative formats: Any string that looks like an asset ID
- URLs: External image URLs

### Image Reference Structure
When saved correctly, the coverImage should be:
```json
{
  "_type": "image",
  "asset": {
    "_type": "reference",
    "_ref": "image-abc123..."
  }
}
```

### Query Format
The GROQ query uses:
```groq
coverImage{
  asset->{
    _id,
    url
  }
}
```
This resolves the asset reference and gets the URL.

