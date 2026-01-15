"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader } from "lucide-react"
import { AdminSessionProvider } from "./admin-session-context"
import { CommandDeckShell } from "./command-deck-shell"

interface AdminGateProps {
  user: { id: string } | null
  children: React.ReactNode
}

export function AdminGate({ user, children }: AdminGateProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [demoMode, setDemoMode] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    // Demo mode is stored client-side.
    const adminDemoMode = localStorage.getItem("adminDemoMode")
    const adminEmail = localStorage.getItem("adminEmail")

    if (adminDemoMode === "true" && adminEmail === "mizan@manafmart.com") {
      setDemoMode(true)
      setIsAuthorized(true)
      setLoading(false)
      return
    }

    if (user) {
      setIsAuthorized(true)
    } else {
      // No session and not in demo mode
      router.push("/admin/login")
    }

    setLoading(false)
  }, [user, router])

  const userId = useMemo(() => {
    if (demoMode) return "demo-admin-user"
    return user?.id || "unknown"
  }, [demoMode, user])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 animate-spin text-cyan-400" />
          <p className="text-gray-400">Loading Admin Command Deck...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return (
    <AdminSessionProvider value={{ userId, demoMode }}>
      <CommandDeckShell>{children}</CommandDeckShell>
    </AdminSessionProvider>
  )
}
