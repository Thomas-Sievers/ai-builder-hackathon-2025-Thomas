const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase clients
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('🔐 Authentication Operations Test Suite');
console.log('======================================\n');

async function testAuthOperations() {
  try {
    // Test 1: Check Authentication Service
    console.log('1️⃣ Testing Authentication Service...');
    
    try {
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.log('⚠️  Session check error:', sessionError.message);
      } else {
        console.log('✅ Authentication service is accessible');
        console.log(`   Current session: ${session?.session ? 'Active' : 'None'}`);
      }
    } catch (err) {
      console.log('❌ Authentication service test failed:', err.message);
    }

    // Test 2: Test User Signup (with email/password)
    console.log('\n2️⃣ Testing User Signup...');
    
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    try {
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            username: `testuser${Date.now()}`,
            display_name: 'Test User'
          }
        }
      });

      if (signupError) {
        console.log('❌ User signup failed:', signupError.message);
      } else {
        console.log('✅ User signup successful');
        console.log(`   User ID: ${signupData.user?.id}`);
        console.log(`   Email: ${signupData.user?.email}`);
        console.log(`   Confirmation required: ${signupData.user?.email_confirmed_at ? 'No' : 'Yes'}`);
      }
    } catch (err) {
      console.log('❌ Signup test failed:', err.message);
    }

    // Test 3: Test User Signin
    console.log('\n3️⃣ Testing User Signin...');
    
    try {
      const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      });

      if (signinError) {
        console.log('❌ User signin failed:', signinError.message);
      } else {
        console.log('✅ User signin successful');
        console.log(`   Session active: ${signinData.session ? 'Yes' : 'No'}`);
        console.log(`   User ID: ${signinData.user?.id}`);
      }
    } catch (err) {
      console.log('❌ Signin test failed:', err.message);
    }

    // Test 4: Test User Profile Creation
    console.log('\n4️⃣ Testing User Profile Creation...');
    
    try {
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', testEmail)
        .single();

      if (profileError) {
        console.log('❌ Profile retrieval failed:', profileError.message);
      } else {
        console.log('✅ User profile found in database');
        console.log(`   Profile ID: ${profileData.id}`);
        console.log(`   Username: ${profileData.username}`);
        console.log(`   Display Name: ${profileData.display_name}`);
      }
    } catch (err) {
      console.log('❌ Profile test failed:', err.message);
    }

    // Test 5: Test User Signout
    console.log('\n5️⃣ Testing User Signout...');
    
    try {
      const { error: signoutError } = await supabase.auth.signOut();
      if (signoutError) {
        console.log('❌ User signout failed:', signoutError.message);
      } else {
        console.log('✅ User signout successful');
      }
    } catch (err) {
      console.log('❌ Signout test failed:', err.message);
    }

    // Test 6: Test Admin User Management
    console.log('\n6️⃣ Testing Admin User Management...');
    
    try {
      const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
      if (usersError) {
        console.log('❌ Admin user list failed:', usersError.message);
      } else {
        console.log('✅ Admin user management working');
        console.log(`   Total users: ${users?.users?.length || 0}`);
        
        // Find our test user
        const testUser = users?.users?.find(user => user.email === testEmail);
        if (testUser) {
          console.log(`   Test user found: ${testUser.id}`);
        }
      }
    } catch (err) {
      console.log('❌ Admin user management test failed:', err.message);
    }

    // Test 7: Test OAuth Providers (if configured)
    console.log('\n7️⃣ Testing OAuth Providers...');
    
    try {
      const { data: providers, error: providersError } = await supabase.auth.getOAuthProviders();
      if (providersError) {
        console.log('⚠️  OAuth providers check failed:', providersError.message);
      } else {
        console.log('✅ OAuth providers accessible');
        console.log(`   Available providers: ${providers?.length || 0}`);
        if (providers && providers.length > 0) {
          console.log(`   Providers: ${providers.join(', ')}`);
        }
      }
    } catch (err) {
      console.log('ℹ️  OAuth providers not configured (this is normal)');
    }

    // Clean up test user
    console.log('\n8️⃣ Cleaning up test data...');
    
    try {
      const { data: userToDelete, error: findError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', testEmail)
        .single();

      if (findError) {
        console.log('⚠️  Could not find test user for cleanup');
      } else {
        // Delete from auth
        const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userToDelete.id);
        if (authDeleteError) {
          console.log('⚠️  Auth user cleanup failed:', authDeleteError.message);
        } else {
          console.log('✅ Test user cleaned up from auth');
        }
      }
    } catch (err) {
      console.log('⚠️  Cleanup failed:', err.message);
    }

    console.log('\n🎉 Authentication Operations Test Complete!');
    console.log('==========================================');

  } catch (error) {
    console.error('\n❌ Authentication test suite failed:', error.message);
  }
}

testAuthOperations();
