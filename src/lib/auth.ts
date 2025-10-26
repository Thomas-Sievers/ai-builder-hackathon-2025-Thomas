import { supabase } from './supabase'
import { User } from '@supabase/supabase-js'

export interface AuthUser extends User {
  user_metadata: {
    username?: string
    display_name?: string
    avatar_url?: string
  }
}

export async function signUp(email: string, password: string, username: string, displayName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        display_name: displayName,
      },
    },
  })

  if (error) throw error

  // Create user profile after successful signup
  if (data.user) {
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email: data.user.email!,
        username,
        display_name: displayName,
        avatar_url: data.user.user_metadata?.avatar_url || null,
      })

    if (profileError) {
      console.error('Error creating user profile:', profileError)
    }
  }

  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function signInWithOAuth(provider: 'google' | 'discord') {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) throw error
  return data
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

// Server-side version for Server Components
export async function getCurrentUserServer() {
  try {
    const { createServerClient } = await import('@supabase/ssr')
    const { cookies } = await import('next/headers')
    
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )
    
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      console.log('Auth error (non-critical):', error.message)
      return null
    }
    return user
  } catch (error) {
    console.log('Auth session error (non-critical):', error)
    return null
  }
}

export async function updateUserProfile(userId: string, updates: {
  username?: string
  display_name?: string
  bio?: string
  location?: string
  website?: string
  avatar_url?: string
}) {
  const { data, error } = await supabase
    .from('users')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      user_profiles (*),
      teams:team_members!team_members_user_id_fkey (
        teams (*)
      )
    `)
    .eq('id', userId)
    .single()

  if (error) {
    // If user doesn't exist in our users table, return null instead of throwing
    if (error.code === 'PGRST116') {
      console.log('User not found in users table, returning null')
      return null
    }
    throw error
  }
  return data
}
