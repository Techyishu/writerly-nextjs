# Fixes Applied for Image Upload and Post Deletion Issues

## Issues Identified

### 1. Image Upload Issues
- **Problem**: Image uploads were failing silently or with generic error messages
- **Root Causes**:
  - Missing or insufficient error handling for specific Sanity API errors
  - No validation for file type and size before upload
  - Generic error messages that didn't help diagnose permission issues
  - Token permission issues not clearly communicated

### 2. Post Deletion Issues
- **Problem**: Blog posts couldn't be deleted
- **Root Causes**:
  - Sanity uses a draft system where documents can exist in both published and draft states
  - The delete operation only attempted to delete the published document, not drafts
  - Missing error handling for permission issues
  - No clear error messages when deletion failed

## Fixes Applied

### 1. Enhanced Image Upload Route (`src/app/api/admin/upload/route.ts`)
- ✅ Added file type validation (only images allowed)
- ✅ Added file size validation (10MB limit)
- ✅ Improved error handling with specific messages for:
  - Unauthorized errors (token permission issues)
  - File too large errors
  - Missing configuration errors
- ✅ Better error details returned to frontend

### 2. Enhanced Delete Route (`src/app/api/admin/posts/[id]/route.ts`)
- ✅ Added logic to delete both published and draft versions of documents
- ✅ Improved error handling with specific messages for:
  - Unauthorized errors (token permission issues)
  - Document not found errors
  - Missing configuration errors
- ✅ Better error details returned to frontend

### 3. Improved Frontend Error Handling
- ✅ Updated `blogService.uploadImage()` to pass through detailed error messages
- ✅ Updated `blogService.deletePost()` to throw errors with details instead of silently failing
- ✅ Enhanced `AdminPostForm.tsx` to show specific upload error messages
- ✅ Enhanced `Admin.tsx` to show toast notifications for delete success/failure

## Common Issues to Check

### If Image Upload Still Fails:
1. **Check SANITY_API_TOKEN**: Ensure it's set in your `.env` file
2. **Check Token Permissions**: The token must have **Editor** or **Admin** role permissions
   - Go to your Sanity project settings
   - Navigate to API → Tokens
   - Ensure your token has write permissions (not just read)
3. **Check File Size**: Maximum file size is 10MB
4. **Check File Type**: Only image files are allowed

### If Post Deletion Still Fails:
1. **Check SANITY_API_TOKEN**: Ensure it's set in your `.env` file
2. **Check Token Permissions**: The token must have **Editor** or **Admin** role permissions
3. **Check Document ID**: Ensure the post ID is correct
4. **Check Network**: Ensure you're authenticated (check browser console for 401 errors)

## How to Verify Token Permissions

1. Go to https://www.sanity.io/manage
2. Select your project "Writerly Blog"
3. Go to **API** → **Tokens**
4. Find or create a token with:
   - **Editor** or **Admin** permissions (not Viewer)
   - Access to the **production** dataset
5. Copy the token and add it to your `.env` file as `SANITY_API_TOKEN`

## Testing the Fixes

1. **Test Image Upload**:
   - Go to `/admin/posts/new` or edit an existing post
   - Try uploading an image
   - Check browser console for detailed error messages if it fails

2. **Test Post Deletion**:
   - Go to `/admin`
   - Click delete on a post
   - You should see a success toast if it works, or a detailed error message if it fails

## Next Steps

If issues persist after these fixes:
1. Check the browser console for detailed error messages
2. Check your server logs for Sanity API errors
3. Verify your `.env` file has all required variables:
   - `SANITY_API_TOKEN` (with Editor/Admin permissions)
   - `NEXT_PUBLIC_SANITY_PROJECT_ID`
   - `NEXT_PUBLIC_SANITY_DATASET`
4. Test the debug endpoints:
   - `/api/debug/env` - Check environment variables
   - `/api/debug/sanity` - Test Sanity connection

