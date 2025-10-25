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

console.log('🗄️  Database Operations Test Suite');
console.log('==================================\n');

async function testDatabaseOperations() {
  try {
    // Test 1: Check if tables exist
    console.log('1️⃣ Testing Table Existence...');
    const tables = ['users', 'user_profiles', 'posts', 'championships', 'teams', 'team_members', 'user_connections', 'premium_subscriptions'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabaseAdmin
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ Table '${table}' - Error: ${error.message}`);
        } else {
          console.log(`✅ Table '${table}' exists and is accessible`);
        }
      } catch (err) {
        console.log(`❌ Table '${table}' - Exception: ${err.message}`);
      }
    }

    // Test 2: Test User Creation (CRUD)
    console.log('\n2️⃣ Testing User CRUD Operations...');
    
    // Create a test user
    const testUser = {
      email: `test-${Date.now()}@example.com`,
      username: `testuser${Date.now()}`,
      display_name: 'Test User',
      bio: 'This is a test user for API testing'
    };

    try {
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .insert([testUser])
        .select()
        .single();

      if (userError) {
        console.log('❌ User creation failed:', userError.message);
      } else {
        console.log('✅ User created successfully:', userData.id);
        
        // Test Read
        const { data: readUser, error: readError } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('id', userData.id)
          .single();

        if (readError) {
          console.log('❌ User read failed:', readError.message);
        } else {
          console.log('✅ User read successfully');
        }

        // Test Update
        const { data: updateData, error: updateError } = await supabaseAdmin
          .from('users')
          .update({ bio: 'Updated bio for testing' })
          .eq('id', userData.id)
          .select()
          .single();

        if (updateError) {
          console.log('❌ User update failed:', updateError.message);
        } else {
          console.log('✅ User update successful');
        }

        // Test Delete
        const { error: deleteError } = await supabaseAdmin
          .from('users')
          .delete()
          .eq('id', userData.id);

        if (deleteError) {
          console.log('❌ User delete failed:', deleteError.message);
        } else {
          console.log('✅ User delete successful');
        }
      }
    } catch (err) {
      console.log('❌ User CRUD test failed:', err.message);
    }

    // Test 3: Test Posts Operations
    console.log('\n3️⃣ Testing Posts Operations...');
    
    // First create a user for posts
    const postUser = {
      email: `postuser-${Date.now()}@example.com`,
      username: `postuser${Date.now()}`,
      display_name: 'Post Test User'
    };

    try {
      const { data: postUserData, error: postUserError } = await supabaseAdmin
        .from('users')
        .insert([postUser])
        .select()
        .single();

      if (postUserError) {
        console.log('❌ Post user creation failed:', postUserError.message);
      } else {
        console.log('✅ Post user created successfully');

        // Create a test post
        const testPost = {
          user_id: postUserData.id,
          title: 'Test Post',
          content: 'This is a test post for API testing',
          type: 'text',
          tags: ['test', 'api']
        };

        const { data: postData, error: postError } = await supabaseAdmin
          .from('posts')
          .insert([testPost])
          .select()
          .single();

        if (postError) {
          console.log('❌ Post creation failed:', postError.message);
        } else {
          console.log('✅ Post created successfully:', postData.id);
        }

        // Clean up
        await supabaseAdmin.from('users').delete().eq('id', postUserData.id);
        console.log('✅ Test data cleaned up');
      }
    } catch (err) {
      console.log('❌ Posts test failed:', err.message);
    }

    // Test 4: Test Championships Operations
    console.log('\n4️⃣ Testing Championships Operations...');
    
    try {
      const testChampionship = {
        title: 'Test Championship',
        description: 'This is a test championship',
        game: 'cs2',
        region: 'Global',
        start_date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        end_date: new Date(Date.now() + 86400000 * 7).toISOString(), // Next week
        prize_pool: 10000,
        max_teams: 16,
        organizer: 'Test Organizer'
      };

      const { data: champData, error: champError } = await supabaseAdmin
        .from('championships')
        .insert([testChampionship])
        .select()
        .single();

      if (champError) {
        console.log('❌ Championship creation failed:', champError.message);
      } else {
        console.log('✅ Championship created successfully:', champData.id);
        
        // Clean up
        await supabaseAdmin.from('championships').delete().eq('id', champData.id);
        console.log('✅ Championship test data cleaned up');
      }
    } catch (err) {
      console.log('❌ Championships test failed:', err.message);
    }

    // Test 5: Test Teams Operations
    console.log('\n5️⃣ Testing Teams Operations...');
    
    try {
      const testTeam = {
        name: 'Test Team',
        tag: 'TEST',
        description: 'This is a test team',
        region: 'Global',
        game: 'cs2'
      };

      const { data: teamData, error: teamError } = await supabaseAdmin
        .from('teams')
        .insert([testTeam])
        .select()
        .single();

      if (teamError) {
        console.log('❌ Team creation failed:', teamError.message);
      } else {
        console.log('✅ Team created successfully:', teamData.id);
        
        // Clean up
        await supabaseAdmin.from('teams').delete().eq('id', teamData.id);
        console.log('✅ Team test data cleaned up');
      }
    } catch (err) {
      console.log('❌ Teams test failed:', err.message);
    }

    console.log('\n🎉 Database Operations Test Complete!');
    console.log('=====================================');

  } catch (error) {
    console.error('\n❌ Database test suite failed:', error.message);
  }
}

testDatabaseOperations();