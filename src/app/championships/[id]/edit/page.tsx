'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getChampionshipById, updateChampionship } from '@/lib/database'
import { toast } from 'sonner'
import { Loader2, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function EditChampionshipPage() {
  const params = useParams()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    game: 'cs2' as 'cs2' | 'lol' | 'valorant' | 'dota2',
    region: 'North America',
    start_date: '',
    end_date: '',
    prize_pool: '',
    max_teams: '',
    registration_deadline: '',
    organizer: '',
    website: '',
    status: 'upcoming' as 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  })

  // Convert YYYY-MM-DD to dd/mm/yyyy for display
  const formatDateForDisplay = (dateString: string | null) => {
    if (!dateString) return ''
    try {
      const [year, month, day] = dateString.split('-')
      return `${day}/${month}/${year}`
    } catch {
      return ''
    }
  }

  // Convert dd/mm/yyyy to YYYY-MM-DD for database
  const formatDateForDB = (dateString: string) => {
    if (!dateString) return null
    const [day, month, year] = dateString.split('/')
    if (!day || !month || !year) return null
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }

  useEffect(() => {
    if (params.id) {
      loadChampionship()
    }
  }, [params.id])

  const loadChampionship = async () => {
    try {
      setLoading(true)
      const data = await getChampionshipById(params.id as string)
      
      setFormData({
        title: data.title,
        description: data.description,
        game: data.game,
        region: data.region,
        start_date: formatDateForDisplay(data.start_date),
        end_date: formatDateForDisplay(data.end_date),
        prize_pool: data.prize_pool?.toString() || '',
        max_teams: data.max_teams?.toString() || '',
        registration_deadline: formatDateForDisplay(data.registration_deadline),
        organizer: data.organizer,
        website: data.website || '',
        status: data.status,
      })
    } catch (error) {
      console.error('Error loading championship:', error)
      toast.error('Failed to load championship')
      router.push('/championships')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('You must be logged in to edit a championship')
      return
    }
    
    if (!formData.title.trim()) {
      toast.error('Please enter a title')
      return
    }

    if (!formData.description.trim()) {
      toast.error('Please enter a description')
      return
    }

    if (!formData.start_date || !formData.end_date) {
      toast.error('Please enter both start and end dates')
      return
    }

    if (!formData.organizer.trim()) {
      toast.error('Please enter an organizer name')
      return
    }

    setIsSubmitting(true)

    try {
      const startDate = formatDateForDB(formData.start_date)
      const endDate = formatDateForDB(formData.end_date)
      
      if (!startDate || !endDate) {
        toast.error('Please enter valid start and end dates in dd/mm/yyyy format')
        return
      }

      const championshipData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        game: formData.game,
        region: formData.region,
        start_date: startDate,
        end_date: endDate,
        prize_pool: formData.prize_pool ? parseInt(formData.prize_pool) : null,
        max_teams: formData.max_teams ? parseInt(formData.max_teams) : null,
        registration_deadline: formatDateForDB(formData.registration_deadline),
        status: formData.status,
        organizer: formData.organizer.trim(),
        website: formData.website.trim() || null,
      }

      console.log('ChampionshipEditForm: Starting update with data:', championshipData)
      console.log('ChampionshipEditForm: Championship ID:', params.id)
      
      const updatedChampionship = await updateChampionship(params.id as string, championshipData)
      
      console.log('ChampionshipEditForm: Update successful, result:', updatedChampionship)
      toast.success('Championship updated successfully!')
      router.push(`/championships/${params.id}`)
    } catch (error) {
      console.error('ChampionshipEditForm: Error updating championship:', error)
      console.error('ChampionshipEditForm: Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      })
      
      let errorMessage = 'Failed to update championship. Please try again.'
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (error && typeof error === 'object') {
        errorMessage = JSON.stringify(error)
      }
      
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
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

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Edit Championship</h1>
            <p className="text-gray-400">
              Update your championship information
            </p>
          </div>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Championship Details</CardTitle>
              <CardDescription className="text-gray-400">
                Update the information about your tournament
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-gray-300">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Summer Championship 2024"
                    className="bg-gray-800 border-gray-600 text-white"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-300">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the championship, format, rules, etc."
                    className="bg-gray-800 border-gray-600 text-white min-h-[120px]"
                    required
                  />
                </div>

                {/* Game and Region */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="game" className="text-gray-300">Game *</Label>
                    <Select value={formData.game} onValueChange={(value: any) => setFormData({ ...formData, game: value })}>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="cs2" className="text-white hover:bg-gray-700">Counter-Strike 2</SelectItem>
                        <SelectItem value="lol" className="text-white hover:bg-gray-700">League of Legends</SelectItem>
                        <SelectItem value="valorant" className="text-white hover:bg-gray-700">Valorant</SelectItem>
                        <SelectItem value="dota2" className="text-white hover:bg-gray-700">Dota 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="region" className="text-gray-300">Region *</Label>
                    <Select value={formData.region} onValueChange={(value) => setFormData({ ...formData, region: value })}>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
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
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date" className="text-gray-300">Start Date (dd/mm/yyyy) *</Label>
                    <Input
                      id="start_date"
                      type="text"
                      placeholder="dd/mm/yyyy"
                      value={formData.start_date}
                      onChange={(e) => {
                        let value = e.target.value.replace(/[^\d]/g, '')
                        let formatted = ''
                        
                        if (value.length > 0) {
                          formatted = value.substring(0, 2)
                          if (value.length > 2) {
                            formatted += '/' + value.substring(2, 4)
                            if (value.length > 4) {
                              formatted += '/' + value.substring(4, 8)
                            }
                          }
                        }
                        
                        if (formatted.length <= 10) {
                          setFormData({ ...formData, start_date: formatted })
                        }
                      }}
                      className="bg-gray-800 border-gray-600 text-white"
                      required
                      maxLength={10}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_date" className="text-gray-300">End Date (dd/mm/yyyy) *</Label>
                    <Input
                      id="end_date"
                      type="text"
                      placeholder="dd/mm/yyyy"
                      value={formData.end_date}
                      onChange={(e) => {
                        let value = e.target.value.replace(/[^\d]/g, '')
                        let formatted = ''
                        
                        if (value.length > 0) {
                          formatted = value.substring(0, 2)
                          if (value.length > 2) {
                            formatted += '/' + value.substring(2, 4)
                            if (value.length > 4) {
                              formatted += '/' + value.substring(4, 8)
                            }
                          }
                        }
                        
                        if (formatted.length <= 10) {
                          setFormData({ ...formData, end_date: formatted })
                        }
                      }}
                      className="bg-gray-800 border-gray-600 text-white"
                      required
                      maxLength={10}
                    />
                  </div>
                </div>

                {/* Registration Deadline */}
                <div className="space-y-2">
                  <Label htmlFor="registration_deadline" className="text-gray-300">Registration Deadline (dd/mm/yyyy)</Label>
                  <Input
                    id="registration_deadline"
                    type="text"
                    placeholder="dd/mm/yyyy"
                    value={formData.registration_deadline}
                    onChange={(e) => {
                      let value = e.target.value.replace(/[^\d]/g, '')
                      let formatted = ''
                      
                      if (value.length > 0) {
                        formatted = value.substring(0, 2)
                        if (value.length > 2) {
                          formatted += '/' + value.substring(2, 4)
                          if (value.length > 4) {
                            formatted += '/' + value.substring(4, 8)
                          }
                        }
                      }
                      
                      if (formatted.length <= 10) {
                        setFormData({ ...formData, registration_deadline: formatted })
                      }
                    }}
                    className="bg-gray-800 border-gray-600 text-white"
                    maxLength={10}
                  />
                </div>

                {/* Prize Pool and Max Teams */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prize_pool" className="text-gray-300">Prize Pool (USD)</Label>
                    <Input
                      id="prize_pool"
                      type="text"
                      value={formData.prize_pool}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d]/g, '')
                        setFormData({ ...formData, prize_pool: value })
                      }}
                      placeholder="e.g., 10000"
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max_teams" className="text-gray-300">Max Teams</Label>
                    <Input
                      id="max_teams"
                      type="text"
                      value={formData.max_teams}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d]/g, '')
                        setFormData({ ...formData, max_teams: value })
                      }}
                      placeholder="e.g., 16"
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                </div>

                {/* Organizer and Website */}
                <div className="space-y-2">
                  <Label htmlFor="organizer" className="text-gray-300">Organizer *</Label>
                  <Input
                    id="organizer"
                    value={formData.organizer}
                    onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                    placeholder="Organization or individual name"
                    className="bg-gray-800 border-gray-600 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website" className="text-gray-300">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://example.com"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-gray-300">Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="upcoming" className="text-white hover:bg-gray-700">Upcoming</SelectItem>
                      <SelectItem value="ongoing" className="text-white hover:bg-gray-700">Ongoing</SelectItem>
                      <SelectItem value="completed" className="text-white hover:bg-gray-700">Completed</SelectItem>
                      <SelectItem value="cancelled" className="text-white hover:bg-gray-700">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Championship'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
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
