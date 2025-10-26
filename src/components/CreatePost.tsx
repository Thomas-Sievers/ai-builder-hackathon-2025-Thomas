'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Image, Video, Link as LinkIcon } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export function CreatePost() {
  const { user } = useAuth()
  const [postContent, setPostContent] = useState('')

  const handlePost = () => {
    if (!postContent.trim()) return
    // TODO: Implement post creation
    console.log('Posting:', postContent)
    setPostContent('')
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-4">
      {/* Top Section */}
      <div className="flex items-center gap-3 mb-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.username} />
          <AvatarFallback>{user?.user_metadata?.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
        </Avatar>
        <Input
          type="text"
          placeholder="Share an update, clip, or article"
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400 rounded-full"
        />
        <Button 
          onClick={handlePost}
          className="bg-cyan-400 hover:bg-cyan-500 text-white rounded-full px-6"
        >
          Post
        </Button>
      </div>

      {/* Bottom Section - Icons */}
      <div className="flex items-center gap-6 pl-2">
        <button className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
          <Image className="w-5 h-5" />
          <span className="text-sm">Image</span>
        </button>
        <button className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
          <Video className="w-5 h-5" />
          <span className="text-sm">Clip</span>
        </button>
        <button className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
          <LinkIcon className="w-5 h-5" />
          <span className="text-sm">Link</span>
        </button>
      </div>
    </div>
  )
}
