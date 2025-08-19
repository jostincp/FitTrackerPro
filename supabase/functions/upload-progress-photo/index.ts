import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { S3Client, PutObjectCommand } from 'https://esm.sh/@aws-sdk/client-s3@3';
import { getSignedUrl } from 'https://esm.sh/@aws-sdk/s3-request-presigner@3';

interface RequestBody {
  photo_type: 'front' | 'side' | 'back' | 'custom';
  notes?: string;
  photo_date: string;
}

interface UploadResponse {
  photo_id: string;
  upload_url: string;
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
    if (!body.photo_type || !body.photo_date) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: photo_type, photo_date' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Validate photo_type
    const validPhotoTypes = ['front', 'side', 'back', 'custom'];
    if (!validPhotoTypes.includes(body.photo_type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid photo_type. Must be one of: front, side, back, custom' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Generate unique key for R2
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const randomId = crypto.randomUUID();
    const r2Key = `progress-photos/${user.id}/${timestamp}-${randomId}`;

    // Configure S3 client for Cloudflare R2
    const r2Client = new S3Client({
      region: 'auto',
      endpoint: Deno.env.get('CLOUDFLARE_R2_ENDPOINT'),
      credentials: {
        accessKeyId: Deno.env.get('CLOUDFLARE_R2_ACCESS_KEY_ID')!,
        secretAccessKey: Deno.env.get('CLOUDFLARE_R2_SECRET_ACCESS_KEY')!,
      },
    });

    // Create presigned URL for upload (valid for 1 hour)
    const putObjectCommand = new PutObjectCommand({
      Bucket: Deno.env.get('CLOUDFLARE_R2_BUCKET_NAME'),
      Key: r2Key,
      ContentType: 'image/*',
    });

    const uploadUrl = await getSignedUrl(r2Client, putObjectCommand, {
      expiresIn: 3600, // 1 hour
    });

    const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();

    // Insert photo metadata into database
    const { data: photoData, error: insertError } = await supabase
      .from('progress_photos')
      .insert({
        user_id: user.id,
        cloudflare_r2_key: r2Key,
        photo_type: body.photo_type,
        photo_date: body.photo_date,
        notes: body.notes || null,
        metadata: {
          upload_expires_at: expiresAt,
        },
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create photo record' }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    const response: UploadResponse = {
      photo_id: photoData.id,
      upload_url: uploadUrl,
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
    console.error('Upload function error:', error);
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