"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [emailVerified, setEmailVerified] = useState<boolean>(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      setEmail(payload.email)
      setEmailVerified(payload.email_verified || false)
    } catch (error) {
      console.error('Error decoding token:', error)
      router.push('/login')
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  if (!email) {
    return null
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Bine ati venit!</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{email}</p>
            </div>
            <Button onClick={handleLogout} variant="outline">
              Deconectare
            </Button>
          </CardHeader>
          <CardContent>
            <p>Ati fost autentificat cu succes.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
