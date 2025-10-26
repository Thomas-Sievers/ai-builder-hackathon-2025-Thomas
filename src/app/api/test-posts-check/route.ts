import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('Checking posts in database...')
    
    // Get all posts
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Posts query error:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        details: error
      })
    }
    
    console.log('Found posts:', data?.length || 0)
    console.log('Posts data:', data)
    
    return NextResponse.json({ 
      success: true, 
      postCount: data?.length || 0,
      posts: data || []
    })
  } catch (error) {
    console.error('Posts check error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    })
  }
}
