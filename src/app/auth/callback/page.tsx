'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          router.push('/auth/error')
          return
        }

        if (data.session) {
          // Create user profile if it doesn't exist
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('id', data.session.user.id)
            .single()

          if (!existingUser) {
            const { error: profileError } = await supabase
              .from('users')
              .insert({
                id: data.session.user.id,
                email: data.session.user.email!,
                username: data.session.user.user_metadata?.username || data.session.user.email!.split('@')[0],
                display_name: data.session.user.user_metadata?.display_name || data.session.user.user_metadata?.full_name || data.session.user.email!.split('@')[0],
                avatar_url: data.session.user.user_metadata?.avatar_url || null,
              })

            if (profileError) {
              console.error('Error creating user profile:', profileError)
            }
          }
        }

        router.push('/dashboard')
      } catch (error) {
        console.error('Auth callback error:', error)
        router.push('/auth/error')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  )
}
