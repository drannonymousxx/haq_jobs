const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Automatically load environment variables from local .env files if not already set in process.env
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const envPath = path.join(__dirname, file);
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [key, ...valParts] = trimmed.split('=');
          const val = valParts.join('=').trim().replace(/^["']|["']$/g, '');
          if (key && !process.env[key.trim()]) {
            process.env[key.trim()] = val;
          }
        }
      });
    }
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const testEmail = process.env.TEST_EMAIL;
const testPassword = process.env.TEST_PASSWORD;

if (!supabaseUrl || !anonKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
  process.exit(1);
}

if (!testEmail || !testPassword) {
  console.error('❌ Missing TEST_EMAIL or TEST_PASSWORD environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, anonKey);

async function run() {
  try {
    const { data: recSession, error: recLoginErr } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    if (recLoginErr) {
      console.log('Recruiter login failed:', recLoginErr.message);
      return;
    }
    console.log('✅ Recruiter logged in successfully.');

    const recClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${recSession.session.access_token}` } }
    });

    const { data: profiles, error: profErr } = await recClient
      .from('profiles')
      .select('*');
      
    if (profErr) {
      console.log('Failed to fetch profiles:', profErr.message);
      return;
    }

    console.log(`Fetched ${profiles.length} profiles:`);
    console.log(JSON.stringify(profiles, null, 2));

  } catch (err) {
    console.error('Error:', err);
  }
}

run();
