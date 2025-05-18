"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function VerificationForm() {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState<string | null>(null)
  const [timer, setTimer] = useState(30)

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail")
    setEmail(userEmail)

    const interval = setInterval(() => {
      setTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 0))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!code) {
      setError("Va rog introduce codul de verificare")
      setIsLoading(false)
      return
    }

    if (code.length !== 6) {
      setError("Codul de verificare trebuie sa fie de 6 cifre")
      setIsLoading(false)
      return
    }

    setTimeout(() => {
      localStorage.setItem("isAuthenticated", "true")
      localStorage.removeItem("loginAttempted")

      setIsLoading(false)
      router.push("/dashboard")
    }, 1000)
  }

  const handleResendCode = () => {
    setTimer(30)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>Introduceti codul de verificare trimis la {email || "your email"}</CardDescription>
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
            <Label htmlFor="code">Cod de verificare</Label>
            <Input
              id="code"
              type="text"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
              className="text-center text-lg tracking-widest"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Verifying..." : "Verify"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <p className="text-sm text-muted-foreground text-center">Didn't receive a code?</p>
        <Button variant="outline" className="w-full" onClick={handleResendCode} disabled={timer > 0}>
          {timer > 0 ? `Resend code (${timer}s)` : "Resend code"}
        </Button>
      </CardFooter>
    </Card>
  )
}
