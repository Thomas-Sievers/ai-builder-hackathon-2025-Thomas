import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Test Supabase connection
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        details: error 
      })
    }
    
    return NextResponse.json({ 
      success: true, 
      session: data.session ? 'User logged in' : 'No user logged in',
      user: data.session?.user?.id || null
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    })
  }
}
