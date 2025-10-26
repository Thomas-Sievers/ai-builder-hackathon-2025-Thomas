'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Heart, MessageCircle, Share2, Play } from 'lucide-react'

interface PostProps {
  author: {
    name: string
    avatar: string
  }
  timeAgo: string
  content: string
  type: 'video' | 'article' | 'text'
  videoThumbnail?: string
  articlePreview?: {
    source: string
    title: string
    description: string
    url: string
  }
  likes: number
  comments: number
  shares: number
}

export function Post({
  author,
  timeAgo,
  content,
  type,
  videoThumbnail,
  articlePreview,
  likes,
  comments,
  shares
}: PostProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-4">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={author.avatar} alt={author.name} />
          <AvatarFallback>{author.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-white font-semibold">{author.name}</h3>
          <p className="text-gray-400 text-sm">{timeAgo}</p>
        </div>
      </div>

      {/* Content */}
      <div className="mb-3">
        <p className="text-white mb-3 whitespace-pre-wrap">{content}</p>

        {/* Video Thumbnail */}
        {type === 'video' && videoThumbnail && (
          <div className="relative w-full rounded-lg overflow-hidden bg-gray-700">
            <img 
              src={videoThumbnail} 
              alt="Video thumbnail" 
              className="w-full h-auto"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/50 rounded-full p-4">
                <Play className="w-12 h-12 text-white" fill="white" />
              </div>
            </div>
          </div>
        )}

        {/* Article Preview */}
        {type === 'article' && articlePreview && (
          <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
            <p className="text-gray-400 text-xs uppercase mb-2">{articlePreview.source}</p>
            <h4 className="text-white font-semibold mb-2">{articlePreview.title}</h4>
            <p className="text-gray-300 text-sm mb-2">{articlePreview.description}</p>
            <a 
              href={articlePreview.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 text-sm underline"
            >
              Read more
            </a>
          </div>
        )}
      </div>

      {/* Actions Bar */}
      <div className="flex items-center gap-6 pt-3 border-t border-gray-700">
        <button className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
          <Heart className="w-5 h-5" />
          <span className="text-white">{likes}</span>
        </button>
        <button className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
          <MessageCircle className="w-5 h-5" />
          <span className="text-white">{comments}</span>
        </button>
        <button className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
          <Share2 className="w-5 h-5" />
          <span className="text-white">{shares}</span>
        </button>
      </div>
    </div>
  )
}
