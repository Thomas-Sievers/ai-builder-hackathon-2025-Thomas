import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('Testing database connection...')
    
    // Test simple query
    const { data, error } = await supabase
      .from('users')
      .select('id, email, username')
      .limit(1)
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        details: error 
      })
    }
    
    console.log('Database query successful, found', data?.length || 0, 'users')
    
    return NextResponse.json({ 
      success: true, 
      userCount: data?.length || 0,
      sampleUser: data?.[0] || null
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    })
  }
}
