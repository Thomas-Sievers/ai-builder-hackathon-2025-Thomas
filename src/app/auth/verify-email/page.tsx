import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function VerifyEmail() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-blue-400">Check Your Email</CardTitle>
              <CardDescription className="text-gray-400">
                We've sent you a verification link to complete your account setup
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-400">
                  Please check your email and click the verification link to activate your account.
                </p>
                <p className="text-sm text-gray-400">
                  If you don't see the email, check your spam folder.
                </p>
              </div>
              
              <div className="space-y-2">
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                  <Link href="/auth/signin">
                    Back to Sign In
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full border-gray-600 text-gray-300 hover:bg-gray-800">
                  <Link href="/">
                    Go Home
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
