"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminDashboard } from "./admin-dashboard"
import { Loader } from "lucide-react"

interface AdminAuthCheckProps {
  user: {
    id: string
  } | null
}

export function AdminAuthCheck({ user }: AdminAuthCheckProps) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [demoMode, setDemoMode] = useState(false)

  useEffect(() => {
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
      router.push("/admin/login")
    }
    setLoading(false)
  }, [user, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 animate-spin text-purple-400" />
          <p className="text-gray-400">Loading Admin Dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  const userId = demoMode ? "demo-admin-user" : user?.id || "unknown"

  return (
    <main className="min-h-screen bg-black text-white">
      {demoMode && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-900/30 border-b border-yellow-700/50 px-4 py-2">
          <p className="text-sm text-yellow-200">
            <strong>Demo Mode:</strong> Running in demo mode with sample data. Changes are not persisted.
          </p>
        </div>
      )}
      <AdminDashboard userId={userId} demoMode={demoMode} />
    </main>
  )
}
