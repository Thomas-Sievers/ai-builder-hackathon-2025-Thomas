-- Enable Row Level Security (RLS) on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE championships ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to avoid conflicts, then recreate them
DROP POLICY IF EXISTS "Users can view all public profiles" ON users;
CREATE POLICY "Users can view all public profiles" ON users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON users;
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
CREATE POLICY "Users can insert their own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- User profiles policies
DROP POLICY IF EXISTS "User profiles are viewable by everyone" ON user_profiles;
CREATE POLICY "User profiles are viewable by everyone" ON user_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage their own profiles" ON user_profiles;
CREATE POLICY "Users can manage their own profiles" ON user_profiles FOR ALL USING (auth.uid() = user_id);

-- Posts policies
DROP POLICY IF EXISTS "Public posts are viewable by everyone" ON posts;
CREATE POLICY "Public posts are viewable by everyone" ON posts FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Users can view their own posts" ON posts;
CREATE POLICY "Users can view their own posts" ON posts FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own posts" ON posts;
CREATE POLICY "Users can create their own posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
CREATE POLICY "Users can update their own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;
CREATE POLICY "Users can delete their own posts" ON posts FOR DELETE USING (auth.uid() = user_id);

-- Championships policies
DROP POLICY IF EXISTS "Championships are viewable by everyone" ON championships;
CREATE POLICY "Championships are viewable by everyone" ON championships FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create championships" ON championships;
CREATE POLICY "Users can create championships" ON championships FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update their own championships" ON championships;
CREATE POLICY "Users can update their own championships" ON championships FOR UPDATE USING (auth.uid() = created_by);

-- Teams policies
DROP POLICY IF EXISTS "Teams are viewable by everyone" ON teams;
CREATE POLICY "Teams are viewable by everyone" ON teams FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create teams" ON teams;
CREATE POLICY "Users can create teams" ON teams FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Team owners can update their teams" ON teams;
CREATE POLICY "Team owners can update their teams" ON teams FOR UPDATE USING (auth.uid() = created_by);

-- Team members policies
DROP POLICY IF EXISTS "Team members are viewable by everyone" ON team_members;
CREATE POLICY "Team members are viewable by everyone" ON team_members FOR SELECT USING (true);

DROP POLICY IF EXISTS "Team owners can manage members" ON team_members;
CREATE POLICY "Team owners can manage members" ON team_members FOR ALL USING (
  EXISTS (
    SELECT 1 FROM teams 
    WHERE teams.id = team_members.team_id 
    AND teams.created_by = auth.uid()
  )
);

-- User connections policies
DROP POLICY IF EXISTS "Users can view all connections" ON user_connections;
CREATE POLICY "Users can view all connections" ON user_connections FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage their own connections" ON user_connections;
CREATE POLICY "Users can manage their own connections" ON user_connections FOR ALL USING (
  auth.uid() = follower_id OR auth.uid() = following_id
);

-- Post likes policies
DROP POLICY IF EXISTS "Post likes are viewable by everyone" ON post_likes;
CREATE POLICY "Post likes are viewable by everyone" ON post_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create their own likes" ON post_likes;
CREATE POLICY "Users can create their own likes" ON post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own likes" ON post_likes;
CREATE POLICY "Users can delete their own likes" ON post_likes FOR DELETE USING (auth.uid() = user_id);

-- Post comments policies
DROP POLICY IF EXISTS "Post comments are viewable by everyone" ON post_comments;
CREATE POLICY "Post comments are viewable by everyone" ON post_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create their own comments" ON post_comments;
CREATE POLICY "Users can create their own comments" ON post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own comments" ON post_comments;
CREATE POLICY "Users can update their own comments" ON post_comments FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own comments" ON post_comments;
CREATE POLICY "Users can delete their own comments" ON post_comments FOR DELETE USING (auth.uid() = user_id);

-- Premium subscriptions policies
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON premium_subscriptions;
CREATE POLICY "Users can view their own subscriptions" ON premium_subscriptions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own subscriptions" ON premium_subscriptions;
CREATE POLICY "Users can create their own subscriptions" ON premium_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own subscriptions" ON premium_subscriptions;
CREATE POLICY "Users can update their own subscriptions" ON premium_subscriptions FOR UPDATE USING (auth.uid() = user_id);
