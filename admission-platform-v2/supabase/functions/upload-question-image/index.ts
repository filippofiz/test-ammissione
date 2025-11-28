import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Create Supabase client with SERVICE ROLE for storage operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Extract JWT token from header
    const jwt = authHeader.replace('Bearer ', '');

    // Verify JWT using admin client
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(jwt);

    if (userError || !user) {
      console.error('JWT verification failed:', userError);
      throw new Error('Unauthorized');
    }

    // Use admin client to fetch profile (bypasses RLS)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('2V_profiles')
      .select('roles')
      .eq('auth_uid', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      throw new Error('Profile not found');
    }

    // Handle roles - might be JSONB array or JSON string
    let roles: string[] = [];

    if (profile?.roles) {
      if (typeof profile.roles === 'string') {
        try {
          roles = JSON.parse(profile.roles);
        } catch (e) {
          console.error('Failed to parse roles string:', e);
          roles = [];
        }
      } else if (Array.isArray(profile.roles)) {
        roles = profile.roles;
      }
    }

    const hasAdmin = roles.includes('ADMIN');
    const hasTutor = roles.includes('TUTOR');

    if (!hasAdmin && !hasTutor) {
      throw new Error('Only admin or tutor users can upload question images');
    }

    console.log('✓ Auth check passed for user:', user.email);

    // Parse request body
    const { filePath, imageBase64 } = await req.json();

    if (!filePath || !imageBase64) {
      throw new Error('Missing filePath or imageBase64');
    }

    // Convert base64 to blob
    const imageData = Uint8Array.from(atob(imageBase64), (c) => c.charCodeAt(0));

    // Determine content type based on file extension
    const getContentType = (path: string): string => {
      const lowerPath = path.toLowerCase();
      if (lowerPath.endsWith('.pdf')) return 'application/pdf';
      if (lowerPath.endsWith('.jpg') || lowerPath.endsWith('.jpeg')) return 'image/jpeg';
      if (lowerPath.endsWith('.png')) return 'image/png';
      if (lowerPath.endsWith('.gif')) return 'image/gif';
      if (lowerPath.endsWith('.svg')) return 'image/svg+xml';
      return 'application/octet-stream';
    };

    const contentType = getContentType(filePath);

    // Upload to storage using SERVICE ROLE (bypasses RLS)
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('question-images')
      .upload(filePath, imageData, {
        contentType: contentType,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    // Generate signed URL (valid for 1 year) for private bucket
    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
      .from('question-images')
      .createSignedUrl(filePath, 31536000); // 1 year in seconds

    if (signedUrlError) {
      console.error('Signed URL error:', signedUrlError);
      throw signedUrlError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        publicUrl: signedUrlData.signedUrl,
        filePath,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
