"use client"

import { useRouter } from "next/navigation"
import { LogOut, Shield } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"

interface AdminHeaderProps {
  demoMode?: boolean
}

export function AdminHeader({ demoMode = false }: AdminHeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    if (demoMode) {
      localStorage.removeItem("adminDemoMode")
      localStorage.removeItem("adminEmail")
      router.push("/admin/login")
      return
    }

    const supabase = createBrowserClient()
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  return (
    <header className="sticky top-0 z-50 border-b border-purple-500/30 backdrop-blur-xl bg-black/80">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent" />

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 bg-purple-500 rounded-lg blur opacity-60" />
              <div className="relative bg-black rounded-lg p-2 flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-black text-white">Master Switchboard</h1>
              <p className="text-xs text-purple-400">Admin Control Panel {demoMode && "(Demo Mode)"}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-semibold">Logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}
