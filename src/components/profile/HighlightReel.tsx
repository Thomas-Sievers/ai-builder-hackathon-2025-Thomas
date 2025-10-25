'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'

type Post = Database['public']['Tables']['posts']['Row']

interface HighlightReelProps {
  userId: string
  isEditing: boolean
}

export function HighlightReel({ userId, isEditing }: HighlightReelProps) {
  const [highlights, setHighlights] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [newHighlight, setNewHighlight] = useState({
    title: '',
    description: '',
    video_url: '',
    tags: [] as string[],
  })
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    fetchHighlights()
  }, [userId])

  const fetchHighlights = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .eq('type', 'video')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching highlights:', error)
        return
      }

      setHighlights(data || [])
    } catch (error) {
      console.error('Error fetching highlights:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddHighlight = async () => {
    if (!newHighlight.title || !newHighlight.video_url) return

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: userId,
          title: newHighlight.title,
          content: newHighlight.description,
          type: 'video',
          video_url: newHighlight.video_url,
          tags: newHighlight.tags,
          is_public: true,
        })
        .select()
        .single()

      if (error) {
        console.error('Error adding highlight:', error)
        return
      }

      setHighlights(prev => [data, ...prev])
      setNewHighlight({
        title: '',
        description: '',
        video_url: '',
        tags: [],
      })
      setIsAdding(false)
    } catch (error) {
      console.error('Error adding highlight:', error)
    }
  }

  const handleDeleteHighlight = async (highlightId: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', highlightId)

      if (error) {
        console.error('Error deleting highlight:', error)
        return
      }

      setHighlights(prev => prev.filter(h => h.id !== highlightId))
    } catch (error) {
      console.error('Error deleting highlight:', error)
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !newHighlight.tags.includes(tagInput.trim())) {
      setNewHighlight(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setNewHighlight(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const getVideoId = (url: string) => {
    // Extract video ID from YouTube/Twitch URLs
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    const twitchMatch = url.match(/twitch\.tv\/videos\/(\d+)/)
    
    if (youtubeMatch) {
      return { type: 'youtube', id: youtubeMatch[1] }
    }
    if (twitchMatch) {
      return { type: 'twitch', id: twitchMatch[1] }
    }
    return null
  }

  const renderVideoEmbed = (url: string) => {
    const videoInfo = getVideoId(url)
    
    if (!videoInfo) {
      return (
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <p className="text-gray-400">Invalid video URL</p>
        </div>
      )
    }

    if (videoInfo.type === 'youtube') {
      return (
        <iframe
          width="100%"
          height="200"
          src={`https://www.youtube.com/embed/${videoInfo.id}`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="rounded-lg"
        />
      )
    }

    if (videoInfo.type === 'twitch') {
      return (
        <iframe
          src={`https://player.twitch.tv/?video=${videoInfo.id}&parent=localhost`}
          height="200"
          width="100%"
          frameBorder="0"
          allowFullScreen
          className="rounded-lg"
        />
      )
    }

    return null
  }

  if (loading) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="p-6">
          <div className="text-center text-gray-400">Loading highlights...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-blue-400">Highlight Reel</CardTitle>
          {isEditing && (
            <Button
              onClick={() => setIsAdding(!isAdding)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isAdding ? 'Cancel' : 'Add Highlight'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Highlight Form */}
        {isAdding && (
          <Card className="bg-gray-800 border-gray-600">
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Title</Label>
                <Input
                  value={newHighlight.title}
                  onChange={(e) => setNewHighlight(prev => ({ ...prev, title: e.target.value }))}
                  className="bg-gray-700 border-gray-500 text-white"
                  placeholder="Amazing clutch play"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-gray-300">Description</Label>
                <Textarea
                  value={newHighlight.description}
                  onChange={(e) => setNewHighlight(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-gray-700 border-gray-500 text-white"
                  rows={3}
                  placeholder="Describe what makes this highlight special..."
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Video URL</Label>
                <Input
                  value={newHighlight.video_url}
                  onChange={(e) => setNewHighlight(prev => ({ ...prev, video_url: e.target.value }))}
                  className="bg-gray-700 border-gray-500 text-white"
                  placeholder="https://youtube.com/watch?v=... or https://twitch.tv/videos/..."
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Tags</Label>
                <div className="flex space-x-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    className="bg-gray-700 border-gray-500 text-white"
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button
                    type="button"
                    onClick={addTag}
                    variant="outline"
                    className="border-gray-500 text-gray-300 hover:bg-gray-600"
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {newHighlight.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      className="bg-blue-600 text-white cursor-pointer"
                      onClick={() => removeTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAdding(false)}
                  className="border-gray-500 text-gray-300 hover:bg-gray-600"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddHighlight}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Add Highlight
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Highlights List */}
        {highlights.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No highlights yet</p>
            {isEditing && (
              <Button
                onClick={() => setIsAdding(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Add Your First Highlight
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {highlights.map((highlight) => (
              <Card key={highlight.id} className="bg-gray-800 border-gray-600">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{highlight.title}</h3>
                      {highlight.content && (
                        <p className="text-gray-300 text-sm mt-1">{highlight.content}</p>
                      )}
                    </div>
                    {isEditing && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteHighlight(highlight.id)}
                        className="border-red-600 text-red-400 hover:bg-red-900/20"
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                  
                  {highlight.video_url && renderVideoEmbed(highlight.video_url)}
                  
                  {highlight.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {highlight.tags.map((tag, index) => (
                        <Badge key={index} className="bg-gray-600 text-gray-300">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
