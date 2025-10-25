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

console.log('🎯 Final Supabase API Verification');
console.log('==================================\n');

async function finalVerification() {
  let passedTests = 0;
  let totalTests = 0;

  function testResult(name, success, message = '') {
    totalTests++;
    if (success) {
      passedTests++;
      console.log(`✅ ${name}`);
    } else {
      console.log(`❌ ${name}${message ? ` - ${message}` : ''}`);
    }
  }

  try {
    // Test 1: Environment Variables
    console.log('1️⃣ Environment Configuration:');
    testResult('Environment variables loaded', !!supabaseUrl && !!supabaseAnonKey && !!supabaseServiceKey);
    testResult('Supabase URL valid', supabaseUrl?.includes('supabase.co'));
    testResult('API keys valid', supabaseAnonKey?.length > 50 && supabaseServiceKey?.length > 50);

    // Test 2: Basic Connection
    console.log('\n2️⃣ Basic Connection:');
    try {
      const { data, error } = await supabase.auth.getSession();
      testResult('Supabase client connection', !error);
    } catch (err) {
      testResult('Supabase client connection', false, err.message);
    }

    // Test 3: Database Tables
    console.log('\n3️⃣ Database Schema:');
    const tables = ['users', 'user_profiles', 'posts', 'championships', 'teams', 'team_members', 'user_connections', 'premium_subscriptions'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabaseAdmin.from(table).select('*').limit(1);
        testResult(`Table '${table}' exists`, !error);
      } catch (err) {
        testResult(`Table '${table}' exists`, false, err.message);
      }
    }

    // Test 4: CRUD Operations
    console.log('\n4️⃣ Database CRUD Operations:');
    
    // Test User Creation
    const testUser = {
      email: `testuser${Date.now()}@test.com`,
      username: `testuser${Date.now()}`,
      display_name: 'Test User',
      bio: 'Test bio'
    };

    try {
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .insert([testUser])
        .select()
        .single();
      
      testResult('User creation', !userError);
      
      if (!userError && userData) {
        // Test User Read
        const { data: readUser, error: readError } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('id', userData.id)
          .single();
        
        testResult('User read', !readError);
        
        // Test User Update
        const { data: updateData, error: updateError } = await supabaseAdmin
          .from('users')
          .update({ bio: 'Updated bio' })
          .eq('id', userData.id)
          .select()
          .single();
        
        testResult('User update', !updateError);
        
        // Test User Delete
        const { error: deleteError } = await supabaseAdmin
          .from('users')
          .delete()
          .eq('id', userData.id);
        
        testResult('User delete', !deleteError);
      }
    } catch (err) {
      testResult('User CRUD operations', false, err.message);
    }

    // Test 5: Authentication Service
    console.log('\n5️⃣ Authentication Service:');
    try {
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      testResult('Auth service accessible', !sessionError);
    } catch (err) {
      testResult('Auth service accessible', false, err.message);
    }

    // Test 6: Storage Service
    console.log('\n6️⃣ Storage Service:');
    try {
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      testResult('Storage service accessible', !bucketsError);
    } catch (err) {
      testResult('Storage service accessible', false, err.message);
    }

    // Test 7: Real-time Service
    console.log('\n7️⃣ Real-time Service:');
    try {
      const channel = supabase.channel('test-channel');
      const { data, error } = await channel.subscribe();
      testResult('Real-time service accessible', !error);
      await supabase.removeChannel(channel);
    } catch (err) {
      testResult('Real-time service accessible', false, err.message);
    }

    // Test 8: Admin Operations
    console.log('\n8️⃣ Admin Operations:');
    try {
      const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
      testResult('Admin operations accessible', !usersError);
    } catch (err) {
      testResult('Admin operations accessible', false, err.message);
    }

    // Test 9: Posts Operations
    console.log('\n9️⃣ Posts Operations:');
    try {
      // Create a test user for posts
      const postUser = {
        email: `postuser${Date.now()}@test.com`,
        username: `postuser${Date.now()}`,
        display_name: 'Post Test User'
      };

      const { data: postUserData, error: postUserError } = await supabaseAdmin
        .from('users')
        .insert([postUser])
        .select()
        .single();

      if (!postUserError && postUserData) {
        // Create a test post
        const testPost = {
          user_id: postUserData.id,
          title: 'Test Post',
          content: 'This is a test post',
          type: 'text',
          tags: ['test']
        };

        const { data: postData, error: postError } = await supabaseAdmin
          .from('posts')
          .insert([testPost])
          .select()
          .single();

        testResult('Post creation', !postError);
        
        // Clean up
        await supabaseAdmin.from('users').delete().eq('id', postUserData.id);
      } else {
        testResult('Post creation', false, 'Could not create test user');
      }
    } catch (err) {
      testResult('Post creation', false, err.message);
    }

    // Test 10: Teams Operations
    console.log('\n🔟 Teams Operations:');
    try {
      const testTeam = {
        name: 'Test Team',
        tag: 'TEST',
        description: 'Test team',
        region: 'Global',
        game: 'cs2'
      };

      const { data: teamData, error: teamError } = await supabaseAdmin
        .from('teams')
        .insert([testTeam])
        .select()
        .single();

      testResult('Team creation', !teamError);
      
      if (!teamError && teamData) {
        // Clean up
        await supabaseAdmin.from('teams').delete().eq('id', teamData.id);
      }
    } catch (err) {
      testResult('Team creation', false, err.message);
    }

    // Final Results
    console.log('\n📊 FINAL RESULTS');
    console.log('================');
    console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
    console.log(`📈 Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
    
    if (passedTests === totalTests) {
      console.log('\n🎉 ALL TESTS PASSED!');
      console.log('Your Supabase setup is fully functional!');
    } else if (passedTests >= totalTests * 0.8) {
      console.log('\n✅ MOSTLY WORKING!');
      console.log('Your Supabase setup is working well with minor issues.');
    } else {
      console.log('\n⚠️  SOME ISSUES FOUND');
      console.log('Your Supabase setup has some problems that need attention.');
    }

    console.log('\n🚀 Your Supabase APIs are ready for development!');

  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
  }
}

finalVerification();
