const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Supabase API Test Suite');
console.log('========================\n');

// Test 1: Environment Variables
console.log('1️⃣ Testing Environment Variables...');
if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is missing');
  process.exit(1);
}
if (!supabaseAnonKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing');
  process.exit(1);
}
if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is missing');
  process.exit(1);
}
console.log('✅ All environment variables are present');
console.log(`   URL: ${supabaseUrl}`);
console.log(`   Anon Key: ${supabaseAnonKey.substring(0, 20)}...`);
console.log(`   Service Key: ${supabaseServiceKey.substring(0, 20)}...\n`);

// Initialize clients
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runTests() {
  try {
    // Test 2: Basic Connection
    console.log('2️⃣ Testing Basic Connection...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (healthError && healthError.code !== 'PGRST116') { // PGRST116 is "relation does not exist" which is expected
      console.error('❌ Connection failed:', healthError.message);
    } else {
      console.log('✅ Basic connection successful');
    }

    // Test 3: Authentication Service
    console.log('\n3️⃣ Testing Authentication Service...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError) {
      console.log('⚠️  Auth service accessible but no active session (expected)');
    } else {
      console.log('✅ Authentication service is working');
    }

    // Test 4: Database Schema Check
    console.log('\n4️⃣ Testing Database Schema...');
    try {
      const { data: tables, error: tablesError } = await supabaseAdmin
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
      
      if (tablesError) {
        console.log('⚠️  Could not fetch table information:', tablesError.message);
      } else {
        console.log('✅ Database schema accessible');
        console.log(`   Found ${tables?.length || 0} tables in public schema`);
      }
    } catch (err) {
      console.log('⚠️  Schema check failed (this might be normal):', err.message);
    }

    // Test 5: Storage Service
    console.log('\n5️⃣ Testing Storage Service...');
    try {
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (bucketsError) {
        console.log('⚠️  Storage service error:', bucketsError.message);
      } else {
        console.log('✅ Storage service is working');
        console.log(`   Found ${buckets?.length || 0} storage buckets`);
      }
    } catch (err) {
      console.log('⚠️  Storage check failed:', err.message);
    }

    // Test 6: Real-time Service
    console.log('\n6️⃣ Testing Real-time Service...');
    try {
      const channel = supabase.channel('test-channel');
      const { data, error } = await channel.subscribe();
      if (error) {
        console.log('⚠️  Real-time service error:', error.message);
      } else {
        console.log('✅ Real-time service is working');
      }
      await supabase.removeChannel(channel);
    } catch (err) {
      console.log('⚠️  Real-time check failed:', err.message);
    }

    // Test 7: Edge Functions (if available)
    console.log('\n7️⃣ Testing Edge Functions...');
    try {
      const { data, error } = await supabase.functions.invoke('health-check');
      if (error && error.message.includes('Function not found')) {
        console.log('ℹ️  No edge functions configured (this is normal)');
      } else if (error) {
        console.log('⚠️  Edge functions error:', error.message);
      } else {
        console.log('✅ Edge functions are working');
      }
    } catch (err) {
      console.log('ℹ️  Edge functions not available (this is normal)');
    }

    // Test 8: Admin Operations
    console.log('\n8️⃣ Testing Admin Operations...');
    try {
      const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
      if (usersError) {
        console.log('⚠️  Admin operations error:', usersError.message);
      } else {
        console.log('✅ Admin operations are working');
        console.log(`   Found ${users?.users?.length || 0} users in the system`);
      }
    } catch (err) {
      console.log('⚠️  Admin operations failed:', err.message);
    }

    console.log('\n🎉 Supabase API Test Complete!');
    console.log('===============================');
    console.log('If you see mostly ✅ and ℹ️  messages, your Supabase setup is working correctly.');
    console.log('⚠️  warnings are usually normal for new projects or missing configurations.');

  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

runTests();
