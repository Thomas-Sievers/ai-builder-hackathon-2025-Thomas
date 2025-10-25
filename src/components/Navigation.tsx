'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function Navigation() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <nav className="border-b border-gray-700 bg-black/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/" className="text-2xl font-bold text-blue-400 hover:text-blue-300">
              EsportsConnect
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/dashboard" className="text-gray-300 hover:text-white">
                    Dashboard
                  </Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/profile" className="text-gray-300 hover:text-white">
                    Profile
                  </Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/championships" className="text-gray-300 hover:text-white">
                    Championships
                  </Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/posts" className="text-gray-300 hover:text-white">
                    Posts
                  </Link>
                </Button>
                <Button variant="outline" onClick={handleSignOut} className="border-gray-600 text-gray-300 hover:bg-gray-800">
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/auth/signin" className="text-gray-300 hover:text-white">
                    Sign In
                  </Link>
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                  <Link href="/auth/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
