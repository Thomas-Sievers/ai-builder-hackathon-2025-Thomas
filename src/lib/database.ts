import { supabase } from './supabase'
import { Database } from '@/types/database'

type Tables = Database['public']['Tables']

// User operations
export async function createUser(userData: Tables['users']['Insert']) {
  const { data, error } = await supabase
    .from('users')
    .insert(userData)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getUserById(id: string) {
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      user_profiles (*),
      teams:team_members!team_members_user_id_fkey (
        teams (*)
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function updateUser(id: string, updates: Tables['users']['Update']) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// User profile operations
export async function createUserProfile(profileData: Tables['user_profiles']['Insert']) {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert(profileData)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateUserProfile(id: string, updates: Tables['user_profiles']['Update']) {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getUserProfilesByGame(game: 'cs2' | 'lol' | 'valorant' | 'dota2') {
  const { data, error } = await supabase
    .from('user_profiles')
    .select(`
      *,
      users (*)
    `)
    .eq('game', game)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data
}

// Post operations
export async function createPost(postData: Tables['posts']['Insert']) {
  const { data, error } = await supabase
    .from('posts')
    .insert(postData)
    .select(`
      *,
      users (*)
    `)
    .single()

  if (error) throw error
  return data
}

export async function getPosts(limit = 20, offset = 0) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      users (*)
    `)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return data
}

export async function getPostsByUser(userId: string, limit = 20, offset = 0) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      users (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return data
}

// Championship operations
export async function createChampionship(championshipData: Tables['championships']['Insert']) {
  const { data, error } = await supabase
    .from('championships')
    .insert(championshipData)
    .select(`
      *,
      users!championships_created_by_fkey (*)
    `)
    .single()

  if (error) throw error
  return data
}

export async function getChampionships(filters?: {
  game?: 'cs2' | 'lol' | 'valorant' | 'dota2'
  region?: string
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  limit?: number
  offset?: number
}) {
  let query = supabase
    .from('championships')
    .select(`
      *,
      users!championships_created_by_fkey (*)
    `)
    .order('start_date', { ascending: true })

  if (filters?.game) {
    query = query.eq('game', filters.game)
  }
  if (filters?.region) {
    query = query.eq('region', filters.region)
  }
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  const limit = filters?.limit || 20
  const offset = filters?.offset || 0
  query = query.range(offset, offset + limit - 1)

  const { data, error } = await query

  if (error) throw error
  return data
}

// Team operations
export async function createTeam(teamData: Tables['teams']['Insert']) {
  const { data, error } = await supabase
    .from('teams')
    .insert(teamData)
    .select(`
      *,
      users!teams_created_by_fkey (*)
    `)
    .single()

  if (error) throw error
  return data
}

export async function getTeams(filters?: {
  game?: 'cs2' | 'lol' | 'valorant' | 'dota2'
  region?: string
  limit?: number
  offset?: number
}) {
  let query = supabase
    .from('teams')
    .select(`
      *,
      users!teams_created_by_fkey (*),
      team_members (
        *,
        users (*)
      )
    `)
    .order('created_at', { ascending: false })

  if (filters?.game) {
    query = query.eq('game', filters.game)
  }
  if (filters?.region) {
    query = query.eq('region', filters.region)
  }

  const limit = filters?.limit || 20
  const offset = filters?.offset || 0
  query = query.range(offset, offset + limit - 1)

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function addTeamMember(teamId: string, userId: string, role: 'owner' | 'captain' | 'player' | 'coach' | 'manager') {
  const { data, error } = await supabase
    .from('team_members')
    .insert({
      team_id: teamId,
      user_id: userId,
      role,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Search operations
export async function searchUsers(query: string, filters?: {
  game?: 'cs2' | 'lol' | 'valorant' | 'dota2'
  rank?: string
  role?: string
  limit?: number
}) {
  let dbQuery = supabase
    .from('users')
    .select(`
      *,
      user_profiles (*)
    `)
    .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)

  if (filters?.game) {
    dbQuery = dbQuery.eq('user_profiles.game', filters.game)
  }

  if (filters?.rank) {
    dbQuery = dbQuery.eq('user_profiles.rank', filters.rank)
  }

  if (filters?.role) {
    dbQuery = dbQuery.eq('user_profiles.main_role', filters.role)
  }

  const limit = filters?.limit || 20
  dbQuery = dbQuery.limit(limit)

  const { data, error } = await dbQuery

  if (error) throw error
  return data
}

// Connection operations
export async function followUser(followerId: string, followingId: string) {
  const { data, error } = await supabase
    .from('user_connections')
    .insert({
      follower_id: followerId,
      following_id: followingId,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function unfollowUser(followerId: string, followingId: string) {
  const { error } = await supabase
    .from('user_connections')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId)

  if (error) throw error
}

export async function getUserConnections(userId: string, type: 'followers' | 'following') {
  const { data, error } = await supabase
    .from('user_connections')
    .select(`
      *,
      ${type === 'followers' ? 'follower:users!user_connections_follower_id_fkey(*)' : 'following:users!user_connections_following_id_fkey(*)'}
    `)
    .eq(type === 'followers' ? 'following_id' : 'follower_id', userId)

  if (error) throw error
  return data
}
