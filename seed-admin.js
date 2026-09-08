const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { fetch: fetch }
});

async function signUpAdmin() {
  const email = 'admin@photo.com';
  const password = '22822922';

  console.log(`Attempting to sign up ${email}...`);
  
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
  });

  if (error) {
    console.error('Error signing up user:', error);
  } else {
    console.log('Signup successful! Data:', data);
  }
}

signUpAdmin();
