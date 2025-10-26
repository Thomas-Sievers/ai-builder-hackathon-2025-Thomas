import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('Testing getUserProfile query...')
    
    // Test the exact query from getUserProfile
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        user_profiles (*),
        teams:team_members!team_members_user_id_fkey (
          teams (*)
        )
      `)
      .eq('id', 'aabdc5e7-e2bd-4394-9927-40786e4782bb')
      .single()
    
    if (error) {
      console.error('Profile query error:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        code: error.code,
        details: error 
      })
    }
    
    console.log('Profile query successful')
    
    return NextResponse.json({ 
      success: true, 
      profile: data
    })
  } catch (error) {
    console.error('Profile test error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    })
  }
}
