import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <Navigation />

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="text-blue-400">Connect</span> with the{" "}
            <span className="text-white">Esports</span> Community
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Build your esports career with our professional networking platform. 
            Connect with players, teams, and scouts in the gaming community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700" asChild>
              <Link href="/auth/signup">Start Your Journey</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800" asChild>
              <Link href="/championships">Explore Championships</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-blue-400">Esports CV</CardTitle>
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

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-blue-400">Content Sharing</CardTitle>
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

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-blue-400">Championships</CardTitle>
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
              { name: "Counter-Strike 2", color: "text-orange-400" },
              { name: "League of Legends", color: "text-blue-400" },
              { name: "Valorant", color: "text-red-400" },
              { name: "Dota 2", color: "text-green-400" }
            ].map((game) => (
              <Card key={game.name} className="bg-gray-900 border-gray-700">
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
