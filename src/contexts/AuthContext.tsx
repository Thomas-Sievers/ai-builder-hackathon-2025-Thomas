'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { getUserProfile, signUp as authSignUp } from '@/lib/auth'

interface AuthContextType {
  user: User | null
  profile: any | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, username: string, displayName: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithOAuth: (provider: 'google' | 'discord') => Promise<void>
  updateProfile: (updates: any) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      
      if (session?.user) {
        try {
          let userProfile = await getUserProfile(session.user.id)
          
          // If user doesn't exist in our database yet (OAuth sign-in), create a basic profile
          if (!userProfile) {
            console.log('Creating user profile for OAuth user:', session.user.id)
            const { error: insertError } = await supabase
              .from('users')
              .insert({
                id: session.user.id,
                email: session.user.email!,
                username: session.user.user_metadata?.username || session.user.email!.split('@')[0],
                display_name: session.user.user_metadata?.display_name || session.user.user_metadata?.full_name || session.user.email!.split('@')[0],
                avatar_url: session.user.user_metadata?.avatar_url || null,
              })
            
            if (insertError) {
              console.error('Error creating user profile:', insertError)
              setProfile(null)
            } else {
              // Fetch the newly created profile
              userProfile = await getUserProfile(session.user.id)
              setProfile(userProfile)
            }
          } else {
            setProfile(userProfile)
          }
        } catch (error) {
          console.error('Error fetching user profile:', error)
          console.error('User ID:', session.user.id)
          console.error('Error details:', JSON.stringify(error, null, 2))
          setProfile(null)
        }
      }
      
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          try {
            let userProfile = await getUserProfile(session.user.id)
            
            // If user doesn't exist in our database yet (OAuth sign-in), create a basic profile
            if (!userProfile) {
              console.log('Creating user profile for OAuth user:', session.user.id)
              const { error: insertError } = await supabase
                .from('users')
                .insert({
                  id: session.user.id,
                  email: session.user.email!,
                  username: session.user.user_metadata?.username || session.user.email!.split('@')[0],
                  display_name: session.user.user_metadata?.display_name || session.user.user_metadata?.full_name || session.user.email!.split('@')[0],
                  avatar_url: session.user.user_metadata?.avatar_url || null,
                })
              
              if (insertError) {
                console.error('Error creating user profile:', insertError)
                setProfile(null)
              } else {
                // Fetch the newly created profile
                userProfile = await getUserProfile(session.user.id)
                setProfile(userProfile)
              }
            } else {
              setProfile(userProfile)
            }
          } catch (error) {
            console.error('Error fetching user profile:', error)
            console.error('User ID:', session.user.id)
            console.error('Error details:', JSON.stringify(error, null, 2))
            setProfile(null)
          }
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  const signUp = async (email: string, password: string, username: string, displayName: string) => {
    await authSignUp(email, password, username, displayName)
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const signInWithOAuth = async (provider: 'google' | 'discord') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) throw error
  }

  const updateProfile = async (updates: any) => {
    if (!user) throw new Error('No user logged in')
    
    const { error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) throw error

    // Refresh profile data
    try {
      const userProfile = await getUserProfile(user.id)
      setProfile(userProfile)
    } catch (error) {
      console.error('Error refreshing user profile:', error)
    }
  }

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithOAuth,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
