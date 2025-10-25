import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
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
              <Button variant="ghost">Sign In</Button>
              <Button className="neon-border">Get Started</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="neon-blue">Connect</span> with the{" "}
            <span className="text-foreground">Esports</span> Community
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Build your esports career with our professional networking platform. 
            Connect with players, teams, and scouts in the gaming community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="neon-border neon-glow">
              Start Your Journey
            </Button>
            <Button size="lg" variant="outline">
              Explore Championships
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="neon-border">
            <CardHeader>
              <CardTitle className="neon-blue">Esports CV</CardTitle>
              <CardDescription>
                Showcase your gaming achievements, ranks, and highlight reels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Build a professional profile that acts as your esports resume. 
                Display your ranks, achievements, and video highlights.
              </p>
            </CardContent>
          </Card>

          <Card className="neon-border">
            <CardHeader>
              <CardTitle className="neon-blue">Content Sharing</CardTitle>
              <CardDescription>
                Share gameplay clips and articles with the community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Post your best plays, share insights, and engage with the 
                esports community through our content platform.
              </p>
            </CardContent>
          </Card>

          <Card className="neon-border">
            <CardHeader>
              <CardTitle className="neon-blue">Championships</CardTitle>
              <CardDescription>
                Discover and participate in tournaments and competitions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Find upcoming tournaments, track your progress, and connect 
                with teams looking for players.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Game Support */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold mb-8">Supported Games</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { name: "Counter-Strike 2", color: "text-orange-400" },
              { name: "League of Legends", color: "text-blue-400" },
              { name: "Valorant", color: "text-red-400" },
              { name: "Dota 2", color: "text-green-400" }
            ].map((game) => (
              <Card key={game.name} className="neon-border">
                <CardContent className="p-6 text-center">
                  <h3 className={`text-lg font-semibold ${game.color}`}>
                    {game.name}
                  </h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
