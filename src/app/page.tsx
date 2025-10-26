import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { Zap, Sword, Target, Shield } from "lucide-react";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Redirect authenticated users to home page
  if (user) {
    redirect('/home');
  }

  return (
    <div className="min-h-screen bg-gray-900">
      
      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="text-primary neon-blue">Connect</span> with the{" "}
            <span className="text-white">Esports</span> Community
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Build your esports career with our professional networking platform. 
            Connect with players, teams, and scouts in the gaming community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="neon-border bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
              <Link href="/auth/signup">Start Your Journey</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-accent hover:text-accent-foreground" asChild>
              <Link href="/championships">Explore Championships</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
            <CardHeader>
              <CardTitle className="text-cyan-400">Esports CV</CardTitle>
              <CardDescription className="text-gray-400">
                Showcase your gaming achievements, ranks, and highlight reels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">
                Build a professional profile that acts as your esports resume. 
                Display your ranks, achievements, and video highlights.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
            <CardHeader>
              <CardTitle className="text-cyan-400">Content Sharing</CardTitle>
              <CardDescription className="text-gray-400">
                Share gameplay clips and articles with the community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">
                Post your best plays, share insights, and engage with the 
                esports community through our content platform.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
            <CardHeader>
              <CardTitle className="text-cyan-400">Championships</CardTitle>
              <CardDescription className="text-gray-400">
                Discover and participate in tournaments and competitions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">
                Find upcoming tournaments, track your progress, and connect 
                with teams looking for players.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Game Support */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold mb-8 text-white">Supported Games</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { name: "Counter-Strike 2", color: "text-orange-400", icon: Zap },
              { name: "League of Legends", color: "text-blue-400", icon: Sword },
              { name: "Valorant", color: "text-red-400", icon: Target },
              { name: "Dota 2", color: "text-green-400", icon: Shield }
            ].map((game) => {
              const IconComponent = game.icon;
              return (
                <Card key={game.name} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
                  <CardContent className="p-6 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <IconComponent className={`w-12 h-12 ${game.color}`} />
                      <h3 className={`text-sm font-semibold ${game.color}`}>
                        {game.name}
                      </h3>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
