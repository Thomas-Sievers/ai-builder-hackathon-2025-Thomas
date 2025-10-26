'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { PostFeed } from '@/components/posts/PostFeed'
import { Filter, Search, X, Plus } from 'lucide-react'
import Link from 'next/link'

interface PostFilters {
  type?: 'text' | 'video' | 'image'
  tags?: string[]
  search?: string
}

interface PostFeedWithFiltersProps {
  currentUserId?: string
  showCreateButton: boolean
}

export function PostFeedWithFilters({ currentUserId, showCreateButton }: PostFeedWithFiltersProps) {
  const [filters, setFilters] = useState<PostFilters>({})
  const [searchQuery, setSearchQuery] = useState('')

  const handleFilterChange = (key: keyof PostFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearFilters = () => {
    setFilters({})
    setSearchQuery('')
  }

  const hasActiveFilters = Object.keys(filters).length > 0 || searchQuery.trim() !== ''

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts..."
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 pl-10"
              />
            </div>
          </div>

          {/* Post Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Post Type</label>
            <Select 
              value={filters.type || 'all'} 
              onValueChange={(value) => handleFilterChange('type', value === 'all' ? undefined : value)}
            >
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="all" className="text-white hover:bg-gray-700">All Types</SelectItem>
                <SelectItem value="text" className="text-white hover:bg-gray-700">Text Posts</SelectItem>
                <SelectItem value="video" className="text-white hover:bg-gray-700">Video Posts</SelectItem>
                <SelectItem value="image" className="text-white hover:bg-gray-700">Image Posts</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Popular Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Popular Tags</label>
            <div className="flex flex-wrap gap-2">
              {['cs2', 'lol', 'valorant', 'dota2', 'esports', 'gaming', 'strategy', 'highlights'].map((tag) => (
                <Badge
                  key={tag}
                  variant={filters.tags?.includes(tag) ? "default" : "secondary"}
                  className={`cursor-pointer ${
                    filters.tags?.includes(tag) 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  onClick={() => {
                    const currentTags = filters.tags || []
                    const newTags = currentTags.includes(tag)
                      ? currentTags.filter(t => t !== tag)
                      : [...currentTags, tag]
                    handleFilterChange('tags', newTags.length > 0 ? newTags : undefined)
                  }}
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-400">Active filters:</span>
            {filters.type && (
              <Badge variant="secondary" className="bg-blue-600/20 text-blue-300">
                Type: {filters.type}
                <button
                  onClick={() => handleFilterChange('type', undefined)}
                  className="ml-2 hover:text-red-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {filters.tags && filters.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-blue-600/20 text-blue-300">
                #{tag}
                <button
                  onClick={() => {
                    const newTags = filters.tags?.filter(t => t !== tag)
                    handleFilterChange('tags', newTags && newTags.length > 0 ? newTags : undefined)
                  }}
                  className="ml-2 hover:text-red-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            {searchQuery && (
              <Badge variant="secondary" className="bg-blue-600/20 text-blue-300">
                Search: "{searchQuery}"
                <button
                  onClick={() => setSearchQuery('')}
                  className="ml-2 hover:text-red-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Clear All
            </Button>
          </div>
        )}
      </div>

      {/* Create Post Button */}
      {showCreateButton && (
        <div className="flex justify-center">
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/posts/create">
              <Plus className="w-4 h-4 mr-2" />
              Create Post
            </Link>
          </Button>
        </div>
      )}

      {/* Post Feed */}
      <PostFeed 
        currentUserId={currentUserId}
        showCreateButton={false}
        filters={filters}
        searchQuery={searchQuery}
      />
    </div>
  )
}
