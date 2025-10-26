export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string
          display_name: string
          avatar_url: string | null
          bio: string | null
          location: string | null
          website: string | null
          created_at: string
          updated_at: string
          is_verified: boolean
          is_premium: boolean
          premium_expires_at: string | null
        }
        Insert: {
          id: string
          email: string
          username: string
          display_name: string
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          website?: string | null
          created_at?: string
          updated_at?: string
          is_verified?: boolean
          is_premium?: boolean
          premium_expires_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          username?: string
          display_name?: string
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          website?: string | null
          created_at?: string
          updated_at?: string
          is_verified?: boolean
          is_premium?: boolean
          premium_expires_at?: string | null
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          game: 'cs2' | 'lol' | 'valorant' | 'dota2'
          rank: string | null
          division: string | null
          lp: number | null
          mmr: number | null
          faceit_level: number | null
          esea_rank: string | null
          act_rank: string | null
          main_role: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          game: 'cs2' | 'lol' | 'valorant' | 'dota2'
          rank?: string | null
          division?: string | null
          lp?: number | null
          mmr?: number | null
          faceit_level?: number | null
          esea_rank?: string | null
          act_rank?: string | null
          main_role?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          game?: 'cs2' | 'lol' | 'valorant' | 'dota2'
          rank?: string | null
          division?: string | null
          lp?: number | null
          mmr?: number | null
          faceit_level?: number | null
          esea_rank?: string | null
          act_rank?: string | null
          main_role?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string | null
          type: 'text' | 'video' | 'image'
          video_url: string | null
          image_url: string | null
          tags: string[]
          is_public: boolean
          created_at: string
          updated_at: string
          likes_count: number
          comments_count: number
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content?: string | null
          type: 'text' | 'video' | 'image'
          video_url?: string | null
          image_url?: string | null
          tags?: string[]
          is_public?: boolean
          created_at?: string
          updated_at?: string
          likes_count?: number
          comments_count?: number
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string | null
          type?: 'text' | 'video' | 'image'
          video_url?: string | null
          image_url?: string | null
          tags?: string[]
          is_public?: boolean
          created_at?: string
          updated_at?: string
          likes_count?: number
          comments_count?: number
        }
      }
      championships: {
        Row: {
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
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          game: 'cs2' | 'lol' | 'valorant' | 'dota2'
          region: string
          start_date: string
          end_date: string
          prize_pool?: number | null
          max_teams?: number | null
          registration_deadline?: string | null
          status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
          organizer: string
          website?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          game?: 'cs2' | 'lol' | 'valorant' | 'dota2'
          region?: string
          start_date?: string
          end_date?: string
          prize_pool?: number | null
          max_teams?: number | null
          registration_deadline?: string | null
          status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
          organizer?: string
          website?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          tag: string
          description: string | null
          logo_url: string | null
          website: string | null
          region: string
          game: 'cs2' | 'lol' | 'valorant' | 'dota2'
          is_premium: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          tag: string
          description?: string | null
          logo_url?: string | null
          website?: string | null
          region: string
          game: 'cs2' | 'lol' | 'valorant' | 'dota2'
          is_premium?: boolean
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          tag?: string
          description?: string | null
          logo_url?: string | null
          website?: string | null
          region?: string
          game?: 'cs2' | 'lol' | 'valorant' | 'dota2'
          is_premium?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          user_id: string
          role: 'owner' | 'captain' | 'player' | 'coach' | 'manager'
          joined_at: string
        }
        Insert: {
          id?: string
          team_id: string
          user_id: string
          role: 'owner' | 'captain' | 'player' | 'coach' | 'manager'
          joined_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string
          role?: 'owner' | 'captain' | 'player' | 'coach' | 'manager'
          joined_at?: string
        }
      }
      user_connections: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
      post_likes: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          created_at?: string
        }
      }
      post_comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      premium_subscriptions: {
        Row: {
          id: string
          user_id: string
          plan: 'team_premium' | 'scout_premium'
          status: 'active' | 'cancelled' | 'expired'
          stripe_subscription_id: string | null
          current_period_start: string
          current_period_end: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan: 'team_premium' | 'scout_premium'
          status?: 'active' | 'cancelled' | 'expired'
          stripe_subscription_id?: string | null
          current_period_start: string
          current_period_end: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan?: 'team_premium' | 'scout_premium'
          status?: 'active' | 'cancelled' | 'expired'
          stripe_subscription_id?: string | null
          current_period_start?: string
          current_period_end?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
