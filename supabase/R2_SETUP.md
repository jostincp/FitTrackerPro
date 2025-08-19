# Cloudflare R2 Integration Setup

This document explains how to set up Cloudflare R2 for progress photo storage in the FitTracker Pro application.

## Prerequisites

1. A Cloudflare account
2. R2 storage enabled in your Cloudflare dashboard
3. Supabase project with Edge Functions enabled

## Step 1: Create R2 Bucket

1. Log in to your Cloudflare dashboard
2. Navigate to **R2 Object Storage**
3. Click **Create bucket**
4. Choose a bucket name (e.g., `fitness-tracker-photos`)
5. Select your preferred location
6. Click **Create bucket**

## Step 2: Generate R2 API Tokens

1. In your Cloudflare dashboard, go to **R2 Object Storage**
2. Click **Manage R2 API tokens**
3. Click **Create API token**
4. Configure the token:
   - **Token name**: `fitness-tracker-r2-access`
   - **Permissions**: `Object Read and Write`
   - **Specify bucket**: Select your created bucket
5. Click **Create API token**
6. Copy the **Access Key ID** and **Secret Access Key**

## Step 3: Configure Environment Variables

Add the following environment variables to your Supabase Edge Functions:

```bash
# In your Supabase project settings > Edge Functions > Environment variables
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_access_key
CLOUDFLARE_R2_BUCKET_NAME=your_bucket_name
CLOUDFLARE_R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
CLOUDFLARE_R2_PUBLIC_URL=https://your-custom-domain.com
```

### Finding your R2 Endpoint

1. In your Cloudflare dashboard, go to **R2 Object Storage**
2. Click on your bucket
3. Go to **Settings** tab
4. Copy the **S3 API** endpoint URL

## Step 4: Deploy Edge Functions

Deploy the Edge Functions to your Supabase project:

```bash
# Install Supabase CLI if you haven't already
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy the functions
supabase functions deploy upload-progress-photo
supabase functions deploy get-photo-url
```

## Step 5: Run Database Migration

Apply the database migration to create the `progress_photos` table:

```bash
# Run the migration
supabase db push
```

Or manually run the SQL from `supabase/migrations/create_progress_photos_table.sql` in your Supabase SQL editor.

## Step 6: Configure CORS (Optional)

If you plan to access R2 directly from the frontend, configure CORS in your R2 bucket:

1. Go to your R2 bucket in Cloudflare dashboard
2. Click **Settings** tab
3. Scroll to **CORS policy**
4. Add the following policy:

```json
[
  {
    "AllowedOrigins": ["https://your-app-domain.com", "http://localhost:3000"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

## Step 7: Test the Integration

1. Start your Next.js development server
2. Navigate to `/dashboard/progress`
3. Try uploading a progress photo
4. Verify the photo appears in your R2 bucket
5. Test viewing the photo

## Troubleshooting

### Common Issues

1. **"Access Denied" errors**
   - Verify your R2 API tokens have the correct permissions
   - Check that the bucket name matches exactly

2. **"Function not found" errors**
   - Ensure Edge Functions are deployed correctly
   - Check function names match exactly: `upload-progress-photo` and `get-photo-url`

3. **CORS errors**
   - Verify CORS policy is configured correctly
   - Check that your domain is included in AllowedOrigins

4. **Database errors**
   - Ensure the migration has been applied
   - Check that RLS policies are enabled
   - Verify user authentication is working

### Debugging

Check Edge Function logs in your Supabase dashboard:

1. Go to **Edge Functions** in your Supabase project
2. Click on the function name
3. View the **Logs** tab for error details

## Security Considerations

1. **Never expose R2 credentials in frontend code**
2. **Use signed URLs with appropriate expiration times**
3. **Implement proper user authentication and authorization**
4. **Regularly rotate API tokens**
5. **Monitor R2 usage and costs**

## Cost Optimization

1. **Set appropriate signed URL expiration times**
2. **Implement image compression before upload**
3. **Use R2's lifecycle policies for old photos**
4. **Monitor storage usage regularly**

## Support

For issues specific to:
- **Cloudflare R2**: Check Cloudflare documentation and community
- **Supabase Edge Functions**: Check Supabase documentation
- **Application integration**: Check the project's GitHub issues