'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getChampionshipById } from '@/lib/database'
import { Loader2, Trophy, Calendar, MapPin, DollarSign, Globe, ArrowLeft, Heart, Share2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

type Championship = {
  id: string
  title: string
  description: string
  game: 'cs2' | 'lol' | 'valorant' | 'dota2'
  region: string
  start_date: string
  end_date: string
  prize_pool: number | null
  max_teams: number | null
  registration_deadline: string | null
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  organizer: string
  website: string | null
  created_by: string
  created_at: string
  users?: {
    id: string
    username: string
    display_name: string
    avatar_url: string | null
  }
}

const gameNames: Record<string, string> = {
  cs2: 'Counter-Strike 2',
  lol: 'League of Legends',
  valorant: 'Valorant',
  dota2: 'Dota 2'
}

const statusColors: Record<string, string> = {
  upcoming: 'bg-blue-600',
  ongoing: 'bg-green-600',
  completed: 'bg-gray-600',
  cancelled: 'bg-red-600'
}

export default function ChampionshipDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [championship, setChampionship] = useState<Championship | null>(null)
  const [loading, setLoading] = useState(true)
  const [isInterested, setIsInterested] = useState(false)

  useEffect(() => {
    if (params.id) {
      loadChampionship()
    }
  }, [params.id])

  const loadChampionship = async () => {
    try {
      setLoading(true)
      const data = await getChampionshipById(params.id as string)
      setChampionship(data)
    } catch (error) {
      console.error('Error loading championship:', error)
      toast.error('Failed to load championship')
      router.push('/championships')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return ''
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      return `${day}/${month}/${year}`
    } catch (error) {
      return ''
    }
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'TBD'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const handleInterest = () => {
    if (!user) {
      toast.error('Please sign in to express interest')
      router.push('/auth/signin')
      return
    }
    setIsInterested(!isInterested)
    toast.success(isInterested ? 'Interest removed' : 'Interest registered!')
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: championship?.title,
        text: championship?.description,
        url: window.location.href
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
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

  if (!championship) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Championship not found</h2>
          <Button onClick={() => router.push('/championships')} className="bg-blue-600 hover:bg-blue-700">
            Back to Championships
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.push('/championships')}
            className="mb-6 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Championships
          </Button>

          {/* Header */}
          <Card className="bg-gray-800 border-gray-700 mb-6">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <CardTitle className="text-white text-3xl">{championship.title}</CardTitle>
                    <Badge className={`${statusColors[championship.status]} text-white`}>
                      {championship.status}
                    </Badge>
                  </div>
                  <CardDescription className="text-gray-400 text-lg">
                    {championship.organizer}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-6 whitespace-pre-wrap">{championship.description}</p>
              
              {/* Championship Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 text-gray-300">
                  <Trophy className="w-5 h-5 text-blue-400" />
                  <span><strong className="text-white">Game:</strong> {gameNames[championship.game]}</span>
                </div>
                
                <div className="flex items-center gap-3 text-gray-300">
                  <MapPin className="w-5 h-5 text-blue-400" />
                  <span><strong className="text-white">Region:</strong> {championship.region}</span>
                </div>
                
                <div className="flex items-center gap-3 text-gray-300">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <span><strong className="text-white">Start:</strong> {formatDate(championship.start_date)}</span>
                </div>
                
                <div className="flex items-center gap-3 text-gray-300">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <span><strong className="text-white">End:</strong> {formatDate(championship.end_date)}</span>
                </div>
                
                {championship.prize_pool && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <DollarSign className="w-5 h-5 text-blue-400" />
                    <span><strong className="text-white">Prize Pool:</strong> {formatCurrency(championship.prize_pool)}</span>
                  </div>
                )}
                
                {championship.max_teams && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <Users className="w-5 h-5 text-blue-400" />
                    <span><strong className="text-white">Max Teams:</strong> {championship.max_teams}</span>
                  </div>
                )}
                
                {championship.registration_deadline && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <span><strong className="text-white">Registration Deadline:</strong> {formatDate(championship.registration_deadline)}</span>
                  </div>
                )}
                
                {championship.website && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <Globe className="w-5 h-5 text-blue-400" />
                    <a href={championship.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                      Visit Official Website
                    </a>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 flex-wrap">
                {user && (
                  <Button
                    onClick={handleInterest}
                    variant={isInterested ? "default" : "outline"}
                    className={isInterested ? "bg-blue-600 hover:bg-blue-700" : "border-gray-600 text-gray-300 hover:bg-gray-700"}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isInterested ? 'fill-current' : ''}`} />
                    {isInterested ? 'Interested' : 'Show Interest'}
                  </Button>
                )}
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                {user && championship.created_by === user.id && (
                  <Link href={`/championships/${championship.id}/edit`}>
                    <Button
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Edit Championship
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Creator Info */}
          {championship.users && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Created by</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href={`/profile/${championship.users.username}`} className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
                  {championship.users.avatar_url ? (
                    <img src={championship.users.avatar_url} alt={championship.users.display_name} className="w-12 h-12 rounded-full" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-white font-semibold">
                      {championship.users.display_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold">{championship.users.display_name}</div>
                    <div className="text-sm text-gray-500">@{championship.users.username}</div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
