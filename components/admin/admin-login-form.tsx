"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Loader, LogIn, Eye, EyeOff } from "lucide-react"

export function AdminLoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const DEMO_EMAIL = "mizan@manafmart.com"
  const DEMO_PASSWORD = "123456"

  const handleDemoLogin = () => {
    setEmail(DEMO_EMAIL)
    setPassword(DEMO_PASSWORD)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
        // Store demo session in localStorage
        localStorage.setItem("adminDemoMode", "true")
        localStorage.setItem("adminEmail", email)
        router.push("/admin")
        return
      }

      const supabase = createBrowserClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else if (data.user) {
        router.push("/admin")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="relative">
        {/* Glow background */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-2xl opacity-75 blur-2xl" />

        <div className="relative border border-purple-500/50 backdrop-blur-xl bg-black rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-purple-500/20 rounded-xl mb-4">
              <LogIn className="w-6 h-6 text-purple-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Master Switchboard</h1>
            <p className="text-sm text-gray-400">Admin Access Only</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@manafmart.com"
                className="w-full px-4 py-2 bg-black border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 bg-black border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              {loading ? "Logging in..." : "Access Dashboard"}
            </button>
          </form>

          <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg space-y-3">
            <div>
              <p className="text-xs text-gray-400 mb-2">
                <strong>Demo Credentials:</strong>
              </p>
              <div className="space-y-1 text-xs text-gray-300 font-mono bg-black/50 p-2 rounded">
                <p>Email: {DEMO_EMAIL}</p>
                <p>Pass: {DEMO_PASSWORD}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-400 text-sm font-semibold rounded-lg transition-colors"
            >
              Fill Demo Credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
