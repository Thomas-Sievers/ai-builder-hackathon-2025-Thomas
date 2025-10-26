import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    console.log('Testing Supabase client creation...')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    console.log('Supabase URL:', supabaseUrl)
    console.log('Supabase Key present:', !!supabaseKey)
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing environment variables',
        url: supabaseUrl,
        keyPresent: !!supabaseKey
      })
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    console.log('Supabase client created successfully')
    
    const { data, error } = await supabase.auth.getSession()
    console.log('Session query result:', error ? error.message : 'Success')
    
    return NextResponse.json({ 
      success: true, 
      session: data.session ? 'User logged in' : 'No user logged in',
      error: error?.message || null
    })
  } catch (error) {
    console.error('Supabase client test error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    })
  }
}
