'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createPost } from '@/lib/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestAuthPage() {
  const { user, signIn, signOut } = useAuth()
  const [email, setEmail] = useState('thomas@qpix.com.br')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [testResult, setTestResult] = useState('')

  const handleSignIn = async () => {
    setLoading(true)
    try {
      await signIn(email, password)
      setTestResult('✅ Signed in successfully!')
    } catch (error: any) {
      setTestResult(`❌ Sign in failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleTestPostCreation = async () => {
    if (!user) {
      setTestResult('❌ Please sign in first')
      return
    }

    setLoading(true)
    try {
      const testPost = {
        title: 'Test Post from Auth Test',
        content: 'This is a test post to verify authentication works',
        type: 'text' as const,
        tags: ['test'],
        is_public: true
      }

      console.log('Creating post with user:', user.id)
      console.log('Post data:', testPost)
      
      const result = await createPost(testPost, user.id)
      
      console.log('Post creation result:', result)
      setTestResult(`✅ Post created successfully! ID: ${result.id}`)
      
      // Immediately check if the post exists in the database
      setTimeout(async () => {
        try {
          const response = await fetch('/api/test-posts-check')
          const data = await response.json()
          setTestResult(prev => prev + `\n\nDatabase check: Found ${data.postCount} posts in DB`)
        } catch (error) {
          setTestResult(prev => prev + `\n\nDatabase check failed: ${error}`)
        }
      }, 1000)
      
    } catch (error: any) {
      console.error('Post creation error:', error)
      setTestResult(`❌ Post creation failed: ${error.message}\n\nError details: ${JSON.stringify(error, null, 2)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Authentication Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-gray-300 mb-2">Current Status:</p>
              <p className={`font-mono text-sm ${user ? 'text-green-400' : 'text-red-400'}`}>
                {user ? `✅ Logged in as: ${user.email}` : '❌ Not logged in'}
              </p>
            </div>

            {!user ? (
              <div className="space-y-4">
                <div>
                  <label className="text-gray-300 block mb-2">Email:</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-300 block mb-2">Password:</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <Button 
                  onClick={handleSignIn} 
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Button 
                  onClick={handleTestPostCreation} 
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {loading ? 'Testing...' : 'Test Post Creation'}
                </Button>
                <Button 
                  onClick={signOut} 
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Sign Out
                </Button>
              </div>
            )}

            {testResult && (
              <div className={`p-4 rounded-md ${testResult.includes('✅') ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
                <pre className="whitespace-pre-wrap">{testResult}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
