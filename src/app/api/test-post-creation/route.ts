import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    console.log('Testing post creation with detailed logging...')
    
    const testPostData = {
      user_id: 'aabdc5e7-e2bd-4394-9927-40786e4782bb', // Use the existing user ID
      title: 'API Test Post',
      content: 'This is a test post created via API',
      type: 'text' as const,
      tags: ['test', 'api'],
      is_public: true
    }
    
    console.log('Creating post with data:', testPostData)
    
    const { data, error } = await supabase
      .from('posts')
      .insert(testPostData)
      .select('*')
      .single()
    
    console.log('Insert result:', { data, error })
    
    if (error) {
      console.error('Post creation error:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        details: error,
        code: error.code
      })
    }
    
    console.log('Post created successfully, ID:', data?.id)
    
    // Immediately check if we can read the post back
    const { data: checkData, error: checkError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', data.id)
      .single()
    
    console.log('Post verification:', { checkData, checkError })
    
    return NextResponse.json({ 
      success: true, 
      createdPost: data,
      verification: checkData,
      verificationError: checkError
    })
  } catch (error) {
    console.error('Post creation test error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    })
  }
}
