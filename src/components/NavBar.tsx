'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search } from 'lucide-react'
import Link from 'next/link'

export function NavBar() {
  const { user } = useAuth()

  return (
    <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left Side - Logo and Name */}
          <div className="flex items-center space-x-2">
            {/* Logo */}
            <Link href="/home" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-cyan-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">E</span>
              </div>
              <span className="text-white text-xl font-bold">EsportsConnect</span>
            </Link>
          </div>

          {/* Right Side - Navigation Links, Search Icon, and Avatar */}
          {user && (
            <div className="flex items-center space-x-6">
              <Link href="/home" className="text-white hover:text-cyan-400 transition-colors">
                Home
              </Link>
              <Link href="/teams" className="text-white hover:text-cyan-400 transition-colors">
                Teams
              </Link>
              <Link href="/championships" className="text-white hover:text-cyan-400 transition-colors">
                Championships
              </Link>
              
              {/* Search Icon */}
              <Link href="/search" className="text-white hover:text-cyan-400 transition-colors">
                <Search className="w-5 h-5" />
              </Link>

              {/* User Avatar */}
              <Link href="/profile">
                <Avatar className="w-8 h-8 cursor-pointer hover:ring-2 hover:ring-cyan-400 transition-all">
                  <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.username} />
                  <AvatarFallback>{user.user_metadata?.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
