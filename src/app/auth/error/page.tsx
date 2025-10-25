import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AuthError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md neon-border">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl neon-blue">Authentication Error</CardTitle>
          <CardDescription>
            Something went wrong during the authentication process.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            We encountered an issue while trying to authenticate you. This could be due to:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Network connectivity issues</li>
            <li>• Invalid authentication credentials</li>
            <li>• OAuth provider configuration issues</li>
          </ul>
          <div className="flex flex-col space-y-2">
            <Button asChild className="w-full">
              <Link href="/auth/signin">
                Try Again
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
