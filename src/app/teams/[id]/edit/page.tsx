'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getTeamById, updateTeam } from '@/lib/database'
import { Loader2, ArrowLeft, Upload } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

const gameNames: Record<string, string> = {
  cs2: 'Counter-Strike 2',
  lol: 'League of Legends',
  valorant: 'Valorant',
  dota2: 'Dota 2'
}

export default function EditTeamPage() {
  const router = useRouter()
  const params = useParams()
  const { user, loading: authLoading } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    tag: '',
    description: '',
    game: '' as 'cs2' | 'lol' | 'valorant' | 'dota2' | '',
    region: '',
    website: ''
  })

  useEffect(() => {
    if (params.id) {
      loadTeam()
    }
  }, [params.id])

  const loadTeam = async () => {
    try {
      setLoading(true)
      const team = await getTeamById(params.id as string)
      setFormData({
        name: team.name,
        tag: team.tag,
        description: team.description || '',
        game: team.game,
        region: team.region,
        website: team.website || ''
      })
    } catch (error) {
      console.error('Error loading team:', error)
      toast.error('Failed to load team')
      router.push('/teams')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center gap-2 text-white">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push('/auth/signin')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.tag || !formData.game || !formData.region) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setIsSubmitting(true)
      
      const teamData = {
        name: formData.name,
        tag: formData.tag,
        description: formData.description || null,
        game: formData.game,
        region: formData.region,
        website: formData.website || null,
      }

      await updateTeam(params.id as string, teamData)
      
      toast.success('Team updated successfully!')
      router.push(`/teams/${params.id}`)
    } catch (error) {
      console.error('Error updating team:', error)
      let errorMessage = 'Failed to update team. Please try again.'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <Link href="/teams">
            <Button variant="ghost" className="text-gray-400 hover:text-white mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Teams
            </Button>
          </Link>

          {/* Form Card */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Edit Team</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Team Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-300">
                    Team Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="e.g., Team Liquid"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                    required
                  />
                </div>

                {/* Team Tag */}
                <div className="space-y-2">
                  <Label htmlFor="tag" className="text-gray-300">
                    Team Tag <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="tag"
                    type="text"
                    placeholder="e.g., TL"
                    value={formData.tag}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                    required
                    maxLength={10}
                  />
                  <p className="text-xs text-gray-500">Short abbreviation for your team</p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-300">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Tell us about your team..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 min-h-[120px]"
                    rows={4}
                  />
                </div>

                {/* Game */}
                <div className="space-y-2">
                  <Label htmlFor="game" className="text-gray-300">
                    Game <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.game} onValueChange={(value) => setFormData({ ...formData, game: value as any })}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Select a game" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {Object.entries(gameNames).map(([key, name]) => (
                        <SelectItem key={key} value={key} className="text-white hover:bg-gray-700">
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Region */}
                <div className="space-y-2">
                  <Label htmlFor="region" className="text-gray-300">
                    Region <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.region} onValueChange={(value) => setFormData({ ...formData, region: value })}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Select a region" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="North America" className="text-white hover:bg-gray-700">North America</SelectItem>
                      <SelectItem value="Europe" className="text-white hover:bg-gray-700">Europe</SelectItem>
                      <SelectItem value="Asia" className="text-white hover:bg-gray-700">Asia</SelectItem>
                      <SelectItem value="South America" className="text-white hover:bg-gray-700">South America</SelectItem>
                      <SelectItem value="Oceania" className="text-white hover:bg-gray-700">Oceania</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-gray-300">
                    Website
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://example.com"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Team'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/teams')}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
