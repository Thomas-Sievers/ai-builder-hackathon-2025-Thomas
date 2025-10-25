const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('🏗️  Database Schema Setup Test');
console.log('==============================\n');

async function testSchemaSetup() {
  try {
    // Test 1: Check current database state
    console.log('1️⃣ Checking Current Database State...');
    
    try {
      const { data: tables, error } = await supabaseAdmin
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
      
      if (error) {
        console.log('⚠️  Could not query information_schema:', error.message);
      } else {
        console.log(`📊 Found ${tables?.length || 0} tables in public schema`);
        if (tables && tables.length > 0) {
          console.log('   Tables:', tables.map(t => t.table_name).join(', '));
        }
      }
    } catch (err) {
      console.log('⚠️  Schema query failed:', err.message);
    }

    // Test 2: Try to create a simple test table
    console.log('\n2️⃣ Testing Table Creation...');
    
    try {
      // Create a simple test table
      const { data, error } = await supabaseAdmin.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS test_table (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });

      if (error) {
        console.log('❌ Test table creation failed:', error.message);
      } else {
        console.log('✅ Test table created successfully');
        
        // Test inserting data
        const { data: insertData, error: insertError } = await supabaseAdmin
          .from('test_table')
          .insert([{ name: 'Test Record' }])
          .select();

        if (insertError) {
          console.log('❌ Test data insertion failed:', insertError.message);
        } else {
          console.log('✅ Test data inserted successfully');
        }

        // Clean up test table
        const { error: dropError } = await supabaseAdmin.rpc('exec_sql', {
          sql: 'DROP TABLE IF EXISTS test_table;'
        });

        if (dropError) {
          console.log('⚠️  Test table cleanup failed:', dropError.message);
        } else {
          console.log('✅ Test table cleaned up');
        }
      }
    } catch (err) {
      console.log('❌ Table creation test failed:', err.message);
    }

    // Test 3: Check if we can execute SQL directly
    console.log('\n3️⃣ Testing SQL Execution...');
    
    try {
      const { data, error } = await supabaseAdmin.rpc('exec_sql', {
        sql: 'SELECT version();'
      });

      if (error) {
        console.log('❌ SQL execution failed:', error.message);
        console.log('   This means you need to set up the database schema manually');
      } else {
        console.log('✅ SQL execution works');
        console.log('   Database version:', data);
      }
    } catch (err) {
      console.log('❌ SQL execution test failed:', err.message);
    }

    console.log('\n📋 Next Steps:');
    console.log('==============');
    console.log('1. Go to your Supabase Dashboard (https://supabase.com/dashboard)');
    console.log('2. Navigate to your project');
    console.log('3. Go to SQL Editor');
    console.log('4. Copy and paste the contents of supabase-schema.sql');
    console.log('5. Execute the SQL to create all tables and schema');
    console.log('6. Run the tests again to verify everything works');

  } catch (error) {
    console.error('\n❌ Schema setup test failed:', error.message);
  }
}

testSchemaSetup();
