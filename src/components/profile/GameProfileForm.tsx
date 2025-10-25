'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Database } from '@/types/database'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']

interface GameProfileFormProps {
  game: string
  profile: UserProfile | undefined
  onUpdate: (gameProfile: UserProfile) => void
  onCancel: () => void
}

const GAME_CONFIGS = {
  cs2: {
    name: 'Counter-Strike 2',
    shortName: 'CS2',
    color: 'bg-orange-600',
    fields: {
      rank: {
        label: 'Rank',
        options: ['Silver I', 'Silver II', 'Silver III', 'Silver IV', 'Silver Elite', 'Silver Elite Master', 'Gold Nova I', 'Gold Nova II', 'Gold Nova III', 'Gold Nova Master', 'Master Guardian I', 'Master Guardian II', 'Master Guardian Elite', 'Distinguished Master Guardian', 'Legendary Eagle', 'Legendary Eagle Master', 'Supreme Master First Class', 'Global Elite']
      },
      faceit_level: {
        label: 'Faceit Level',
        type: 'number',
        min: 1,
        max: 10
      },
      esea_rank: {
        label: 'ESEA Rank',
        options: ['D-', 'D', 'D+', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+', 'G', 'G+']
      },
      main_role: {
        label: 'Main Role',
        options: ['Entry Fragger', 'Support', 'AWPer', 'IGL', 'Lurker', 'Rifler']
      }
    }
  },
  lol: {
    name: 'League of Legends',
    shortName: 'LoL',
    color: 'bg-blue-600',
    fields: {
      rank: {
        label: 'Rank',
        options: ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster', 'Challenger']
      },
      division: {
        label: 'Division',
        options: ['IV', 'III', 'II', 'I']
      },
      lp: {
        label: 'LP',
        type: 'number',
        min: 0,
        max: 100
      },
      main_role: {
        label: 'Main Role',
        options: ['Top', 'Jungle', 'Mid', 'ADC', 'Support']
      }
    }
  },
  valorant: {
    name: 'Valorant',
    shortName: 'Valorant',
    color: 'bg-red-600',
    fields: {
      rank: {
        label: 'Rank',
        options: ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ascendant', 'Immortal', 'Radiant']
      },
      act_rank: {
        label: 'Act Rank',
        options: ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ascendant', 'Immortal', 'Radiant']
      },
      main_role: {
        label: 'Main Role',
        options: ['Duelist', 'Initiator', 'Controller', 'Sentinel']
      }
    }
  },
  dota2: {
    name: 'Dota 2',
    shortName: 'Dota 2',
    color: 'bg-green-600',
    fields: {
      rank: {
        label: 'Medal',
        options: ['Herald', 'Guardian', 'Crusader', 'Archon', 'Legend', 'Ancient', 'Divine', 'Immortal']
      },
      mmr: {
        label: 'MMR',
        type: 'number',
        min: 0,
        max: 10000
      },
      main_role: {
        label: 'Main Role',
        options: ['Carry', 'Mid', 'Offlane', 'Soft Support', 'Hard Support']
      }
    }
  }
}

export function GameProfileForm({ game, profile, onUpdate, onCancel }: GameProfileFormProps) {
  const [formData, setFormData] = useState({
    rank: profile?.rank || '',
    division: profile?.division || '',
    lp: profile?.lp || 0,
    mmr: profile?.mmr || 0,
    faceit_level: profile?.faceit_level || 0,
    esea_rank: profile?.esea_rank || '',
    act_rank: profile?.act_rank || '',
    main_role: profile?.main_role || '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const gameConfig = GAME_CONFIGS[game as keyof typeof GAME_CONFIGS]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const gameProfile: UserProfile = {
        id: profile?.id || '',
        user_id: profile?.user_id || '',
        game: game as 'cs2' | 'lol' | 'valorant' | 'dota2',
        rank: formData.rank || null,
        division: formData.division || null,
        lp: formData.lp || null,
        mmr: formData.mmr || null,
        faceit_level: formData.faceit_level || null,
        esea_rank: formData.esea_rank || null,
        act_rank: formData.act_rank || null,
        main_role: formData.main_role || null,
        created_at: profile?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      await onUpdate(gameProfile)
    } catch (error) {
      console.error('Error updating game profile:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const renderField = (fieldKey: string, fieldConfig: any) => {
    if (fieldConfig.options) {
      return (
        <div className="space-y-2">
          <Label className="text-gray-300">{fieldConfig.label}</Label>
          <Select
            value={formData[fieldKey as keyof typeof formData]}
            onValueChange={(value) => handleChange(fieldKey, value)}
          >
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue placeholder={`Select ${fieldConfig.label}`} />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              {fieldConfig.options.map((option: string) => (
                <SelectItem key={option} value={option} className="text-white">
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )
    }

    if (fieldConfig.type === 'number') {
      return (
        <div className="space-y-2">
          <Label className="text-gray-300">{fieldConfig.label}</Label>
          <Input
            type="number"
            value={formData[fieldKey as keyof typeof formData]}
            onChange={(e) => handleChange(fieldKey, parseInt(e.target.value) || 0)}
            className="bg-gray-800 border-gray-600 text-white"
            min={fieldConfig.min}
            max={fieldConfig.max}
          />
        </div>
      )
    }

    return (
      <div className="space-y-2">
        <Label className="text-gray-300">{fieldConfig.label}</Label>
        <Input
          value={formData[fieldKey as keyof typeof formData]}
          onChange={(e) => handleChange(fieldKey, e.target.value)}
          className="bg-gray-800 border-gray-600 text-white"
        />
      </div>
    )
  }

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded ${gameConfig.color} flex items-center justify-center`}>
            <span className="text-white text-sm font-bold">{gameConfig.shortName}</span>
          </div>
          <CardTitle className="text-white">Edit {gameConfig.name} Profile</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(gameConfig.fields).map(([fieldKey, fieldConfig]) => (
              <div key={fieldKey}>
                {renderField(fieldKey, fieldConfig)}
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
