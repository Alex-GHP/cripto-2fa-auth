"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import VerificationForm from "@/components/verification-form"

export default function VerifyPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user has attempted login
    const loginAttempted = localStorage.getItem("loginAttempted")

    if (!loginAttempted) {
      router.push("/")
    }
  }, [router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <VerificationForm />
      </div>
    </div>
  )
}
