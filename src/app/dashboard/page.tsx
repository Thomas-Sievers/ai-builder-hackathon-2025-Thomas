'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function Dashboard() {
  const { user, profile, loading, signOut } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md neon-border">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl neon-blue">Access Denied</CardTitle>
            <CardDescription>
              You need to be signed in to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Button asChild className="w-full">
                <Link href="/auth/signin">
                  Sign In
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/">
                  Go Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold neon-blue">EsportsConnect</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {profile?.display_name || user.email}
              </span>
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              Welcome to your <span className="neon-blue">Dashboard</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Build your esports career, connect with players, and showcase your skills.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="neon-border">
              <CardHeader>
                <CardTitle className="neon-blue">Complete Your Profile</CardTitle>
                <CardDescription>
                  Add your gaming achievements and ranks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Link href="/profile">
                    Edit Profile
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="neon-border">
              <CardHeader>
                <CardTitle className="neon-blue">Share Content</CardTitle>
                <CardDescription>
                  Post gameplay clips and articles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Link href="/posts/create">
                    Create Post
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="neon-border">
              <CardHeader>
                <CardTitle className="neon-blue">Find Championships</CardTitle>
                <CardDescription>
                  Discover tournaments and competitions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Link href="/championships">
                    Browse Championships
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Profile Status */}
          {profile && (
            <Card className="neon-border">
              <CardHeader>
                <CardTitle className="neon-blue">Your Profile</CardTitle>
                <CardDescription>
                  Current profile information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Username</p>
                    <p className="text-lg">{profile.username}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Display Name</p>
                    <p className="text-lg">{profile.display_name}</p>
                  </div>
                </div>
                {profile.bio && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Bio</p>
                    <p className="text-sm">{profile.bio}</p>
                  </div>
                )}
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    profile.is_premium 
                      ? 'bg-primary/20 text-primary' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {profile.is_premium ? 'Premium' : 'Free'}
                  </span>
                  {profile.is_verified && (
                    <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-500">
                      Verified
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
