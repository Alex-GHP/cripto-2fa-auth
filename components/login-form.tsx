"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  const [isTwoFactorStep, setIsTwoFactorStep] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [userId, setUserId] = useState<number | null>(null)
  const [userEmail, setUserEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          password,
          code: isTwoFactorStep ? verificationCode : undefined
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to login');
      }

      if (data.requiresTwoFactor) {
        setUserId(data.userId);
        setUserEmail(data.email);
        setIsTwoFactorStep(true);
        setIsLoading(false);
        return;
      }
      
      if (data.twoFactorVerified) {
        localStorage.setItem('token', data.token);
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  if (isTwoFactorStep) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cod de verificare</CardTitle>
          <CardDescription>
            Am trimis un cod de verificare la {userEmail}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="code">Cod de verificare de 6 cifre</Label>
              <Input
                id="code"
                type="text"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
                maxLength={6}
                pattern="\d{6}"
                className="text-center text-lg tracking-widest"
              />
              <p className="text-sm text-muted-foreground">
                Introduceti codul de verificare de 6 cifre trimis la {userEmail}
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Verificare..." : "Verificare"}
            </Button>
            <div className="text-center mt-4">
              <Button 
                variant="link" 
                className="text-sm" 
                onClick={() => setIsTwoFactorStep(false)}
              >
                Inapoi la autentificare
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Autentificare</CardTitle>
        <CardDescription>Introduceti datele pentru a accesa contul dumneavoastra</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Parola</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Autentificare..." : "Autentificare"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Nu aveti un cont?{" "}
          <Link href="/signup">
            <Button variant="link" className="p-0 h-auto">
              Inregistrare
            </Button>
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
