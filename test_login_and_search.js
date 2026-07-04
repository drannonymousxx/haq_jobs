const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jhbmzltmwkjqmxipoayr.supabase.co';
const anonKey = 'sb_publishable_BCmns_AJ4AI-yigw6CsRkg_opMsFiiQ';

const supabase = createClient(supabaseUrl, anonKey);

async function run() {
  try {
    const { data: recSession, error: recLoginErr } = await supabase.auth.signInWithPassword({
      email: 'recruiter_1783165902934@gmail.com',
      password: 'Password123!'
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
