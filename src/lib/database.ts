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
export async function createPost(postData: {
  title: string
  content?: string | null
  type: 'text' | 'video' | 'image'
  video_url?: string | null
  image_url?: string | null
  tags?: string[]
  is_public?: boolean
}, userId: string) {
  console.log('Creating post with data:', postData)
  console.log('User ID:', userId)
  
  if (!userId) {
    throw new Error('User ID is required')
  }
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: userId,
      title: postData.title,
      content: postData.content,
      type: postData.type,
      video_url: postData.video_url,
      image_url: postData.image_url,
      tags: postData.tags || [],
      is_public: postData.is_public ?? true,
    })
    .select(`
      *,
      users (*)
    `)
    .single()

  console.log('Create post result:', { data, error })
  
  if (error) {
    console.error('Supabase error:', error)
    throw error
  }
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

export async function getPostsWithFilters(filters?: {
  type?: 'text' | 'video' | 'image'
  tags?: string[]
  search?: string
  limit?: number
  offset?: number
}) {
  let query = supabase
    .from('posts')
    .select(`
      *,
      users (*)
    `)
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  if (filters?.type) {
    query = query.eq('type', filters.type)
  }

  if (filters?.tags && filters.tags.length > 0) {
    query = query.overlaps('tags', filters.tags)
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`)
  }

  const limit = filters?.limit || 20
  const offset = filters?.offset || 0
  query = query.range(offset, offset + limit - 1)

  const { data, error } = await query

  if (error) {
    console.error('Error in getPostsWithFilters:', error)
    throw error
  }
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
  console.log('createChampionship called with:', championshipData)
  
  const { data, error } = await supabase
    .from('championships')
    .insert(championshipData)
    .select(`
      *,
      users!championships_created_by_fkey (*)
    `)
    .single()

  console.log('Supabase response:', { data, error })

  if (error) {
    console.error('Supabase error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    })
    throw new Error(error.message || 'Failed to create championship')
  }
  
  return data
}

export async function getChampionships(filters?: {
  game?: 'cs2' | 'lol' | 'valorant' | 'dota2'
  region?: string
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  search?: string
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
  
  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,organizer.ilike.%${filters.search}%`)
  }

  const limit = filters?.limit || 20
  const offset = filters?.offset || 0
  query = query.range(offset, offset + limit - 1)

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function getChampionshipById(id: string) {
  const { data, error } = await supabase
    .from('championships')
    .select(`
      *,
      users!championships_created_by_fkey (*)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function updateChampionship(id: string, championshipData: Tables['championships']['Update']) {
  const { data, error } = await supabase
    .from('championships')
    .update(championshipData)
    .eq('id', id)
    .select(`
      *,
      users!championships_created_by_fkey (*)
    `)
    .single()

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

export async function getTeamById(id: string) {
  const { data, error } = await supabase
    .from('teams')
    .select(`
      *,
      users!teams_created_by_fkey (*),
      team_members (
        *,
        users (*)
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function updateTeam(id: string, teamData: Tables['teams']['Update']) {
  const { data, error } = await supabase
    .from('teams')
    .update(teamData)
    .eq('id', id)
    .select(`
      *,
      users!teams_created_by_fkey (*),
      team_members (
        *,
        users (*)
      )
    `)
    .single()

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
    .select(`
      *,
      users (*)
    `)
    .single()

  if (error) throw error
  return data
}

export async function removeTeamMember(teamId: string, userId: string) {
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('team_id', teamId)
    .eq('user_id', userId)

  if (error) throw error
}

export async function searchTeams(searchQuery: string, filters?: {
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

  // Apply text search
  if (searchQuery) {
    query = query.or(`name.ilike.%${searchQuery}%,tag.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
  }

  // Apply filters
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

// Search operations
export async function searchUsers(searchQuery: string, filters?: {
  game?: 'cs2' | 'lol' | 'valorant' | 'dota2'
  rank?: string
  role?: string
  region?: string
  limit?: number
  offset?: number
}) {
  let dbQuery = supabase
    .from('user_profiles')
    .select(`
      *,
      users (*)
    `)

  // Apply text search on username and display_name
  if (searchQuery) {
    dbQuery = dbQuery.or(`users.username.ilike.%${searchQuery}%,users.display_name.ilike.%${searchQuery}%`)
  }

  // Apply filters
  if (filters?.game) {
    dbQuery = dbQuery.eq('game', filters.game)
  }

  if (filters?.rank) {
    dbQuery = dbQuery.eq('rank', filters.rank)
  }

  if (filters?.role) {
    dbQuery = dbQuery.eq('main_role', filters.role)
  }

  if (filters?.region) {
    dbQuery = dbQuery.eq('users.location', filters.region)
  }

  const limit = filters?.limit || 20
  const offset = filters?.offset || 0
  dbQuery = dbQuery.range(offset, offset + limit - 1)

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

export async function isFollowing(followerId: string, followingId: string) {
  const { data, error } = await supabase
    .from('user_connections')
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116 is "no rows returned"
  return !!data
}

export async function getConnectionCounts(userId: string) {
  const [followers, following] = await Promise.all([
    supabase.from('user_connections').select('id', { count: 'exact' }).eq('following_id', userId),
    supabase.from('user_connections').select('id', { count: 'exact' }).eq('follower_id', userId)
  ])

  return {
    followers: followers.count || 0,
    following: following.count || 0
  }
}

// Post interaction operations
export async function likePost(postId: string, userId: string) {
  // First, check if already liked to prevent duplicates
  const alreadyLiked = await isPostLiked(postId, userId)
  if (alreadyLiked) {
    return null
  }

  const { data, error } = await supabase
    .from('post_likes')
    .insert({
      post_id: postId,
      user_id: userId,
    })
    .select()
    .single()

  if (error) throw error
  
  // Update likes count
  const { data: postData } = await supabase
    .from('posts')
    .select('likes_count')
    .eq('id', postId)
    .single()

  if (postData) {
    await supabase
      .from('posts')
      .update({ likes_count: (postData.likes_count || 0) + 1 })
      .eq('id', postId)
  }
  
  return data
}

export async function unlikePost(postId: string, userId: string) {
  const { error } = await supabase
    .from('post_likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', userId)

  if (error) throw error
  
  // Update likes count
  const { data: postData } = await supabase
    .from('posts')
    .select('likes_count')
    .eq('id', postId)
    .single()

  if (postData) {
    await supabase
      .from('posts')
      .update({ likes_count: Math.max((postData.likes_count || 0) - 1, 0) })
      .eq('id', postId)
  }
}

export async function getPostLikes(postId: string) {
  const { data, error } = await supabase
    .from('post_likes')
    .select(`
      *,
      users (*)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function isPostLiked(postId: string, userId: string) {
  const { data, error } = await supabase
    .from('post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return !!data
}

export async function createComment(postId: string, userId: string, content: string) {
  const { data, error } = await supabase
    .from('post_comments')
    .insert({
      post_id: postId,
      user_id: userId,
      content,
    })
    .select(`
      *,
      users (*)
    `)
    .single()

  if (error) throw error
  
  // Update comments count
  const { data: postData } = await supabase
    .from('posts')
    .select('comments_count')
    .eq('id', postId)
    .single()

  if (postData) {
    await supabase
      .from('posts')
      .update({ comments_count: (postData.comments_count || 0) + 1 })
      .eq('id', postId)
  }
  
  return data
}

export async function getPostComments(postId: string, limit = 20, offset = 0) {
  console.log('Getting comments for post:', postId)
  
  try {
    const { data, error } = await supabase
      .from('post_comments')
      .select(`
        *,
        users (*)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    console.log('Comments query result:', { data, error })
    
    if (error) {
      console.error('Supabase error in getPostComments:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      
      // If the table doesn't exist or there's a permissions issue, return empty array
      if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist') || error.message?.includes('permission denied')) {
        console.log('Comments table might not exist or no permission, returning empty array')
        return []
      }
      throw error
    }
    return data || []
  } catch (error) {
    console.error('Error loading comments:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    // Return empty array on any error to prevent the app from crashing
    return []
  }
}

export async function updateComment(commentId: string, content: string) {
  const { data, error } = await supabase
    .from('post_comments')
    .update({ content })
    .eq('id', commentId)
    .select(`
      *,
      users (*)
    `)
    .single()

  if (error) throw error
  return data
}

export async function deleteComment(commentId: string) {
  // First get the comment to know which post to update
  const { data: comment } = await supabase
    .from('post_comments')
    .select('post_id')
    .eq('id', commentId)
    .single()

  // Delete the comment
  const { error } = await supabase
    .from('post_comments')
    .delete()
    .eq('id', commentId)

  if (error) throw error

  // Update comments count
  if (comment) {
    const { data: postData } = await supabase
      .from('posts')
      .select('comments_count')
      .eq('id', comment.post_id)
      .single()

    if (postData) {
      await supabase
        .from('posts')
        .update({ comments_count: Math.max((postData.comments_count || 0) - 1, 0) })
        .eq('id', comment.post_id)
    }
  }
}

export async function updatePost(postId: string, updates: {
  title?: string
  content?: string | null
  video_url?: string | null
  image_url?: string | null
  tags?: string[]
  is_public?: boolean
}) {
  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', postId)
    .select(`
      *,
      users (*)
    `)
    .single()

  if (error) throw error
  return data
}

export async function deletePost(postId: string) {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)

  if (error) throw error
}

