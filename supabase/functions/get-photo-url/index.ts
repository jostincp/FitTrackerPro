import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { S3Client, GetObjectCommand } from 'https://esm.sh/@aws-sdk/client-s3@3';
import { getSignedUrl } from 'https://esm.sh/@aws-sdk/s3-request-presigner@3';

interface RequestBody {
  photo_id: string;
}

interface PhotoUrlResponse {
  signed_url: string;
  expires_at: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    // Verify request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user authentication
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Parse request body
    const body: RequestBody = await req.json();
    
    // Validate required fields
    if (!body.photo_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: photo_id' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Get photo record from database
    const { data: photoData, error: fetchError } = await supabase
      .from('progress_photos')
      .select('id, user_id, cloudflare_r2_key')
      .eq('id', body.photo_id)
      .eq('user_id', user.id) // Ensure user can only access their own photos
      .single();

    if (fetchError || !photoData) {
      return new Response(
        JSON.stringify({ error: 'Photo not found or access denied' }),
        { 
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Configure S3 client for Cloudflare R2
    const r2Client = new S3Client({
      region: 'auto',
      endpoint: Deno.env.get('CLOUDFLARE_R2_ENDPOINT'),
      credentials: {
        accessKeyId: Deno.env.get('CLOUDFLARE_R2_ACCESS_KEY_ID')!,
        secretAccessKey: Deno.env.get('CLOUDFLARE_R2_SECRET_ACCESS_KEY')!,
      },
    });

    // Create presigned URL for viewing (valid for 24 hours)
    const getObjectCommand = new GetObjectCommand({
      Bucket: Deno.env.get('CLOUDFLARE_R2_BUCKET_NAME'),
      Key: photoData.cloudflare_r2_key,
    });

    const signedUrl = await getSignedUrl(r2Client, getObjectCommand, {
      expiresIn: 86400, // 24 hours
    });

    const expiresAt = new Date(Date.now() + 86400 * 1000).toISOString();

    // Update photo record with new signed URL and expiration
    const { error: updateError } = await supabase
      .from('progress_photos')
      .update({
        signed_url: signedUrl,
        url_expires_at: expiresAt,
      })
      .eq('id', body.photo_id)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Database update error:', updateError);
      // Continue anyway, as the signed URL is still valid
    }

    const response: PhotoUrlResponse = {
      signed_url: signedUrl,
      expires_at: expiresAt,
    };

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );

  } catch (error) {
    console.error('Get photo URL function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});