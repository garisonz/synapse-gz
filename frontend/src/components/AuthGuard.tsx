"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getAccessToken } from "@/lib/auth"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!getAccessToken()) {
      router.replace("/login")
    }
  }, [router])

  if (!mounted || !getAccessToken()) return null

  return <>{children}</>
}
