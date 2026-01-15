"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { X, Loader, LogIn, Eye, EyeOff, User, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button" // Assuming you have shadcn/ui button, or use standard HTML button
import { useToast } from "@/hooks/use-toast"

interface LoginModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const [activeTab, setActiveTab] = useState<"customer" | "admin">("customer")

  // Prevent scrolling when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-black border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 z-10 p-2 text-neutral-400 hover:text-white transition-colors rounded-full hover:bg-neutral-800"
        >
          <X size={20} />
        </button>

        {/* Tab Switcher */}
        <div className="flex border-b border-neutral-800">
          <button
            onClick={() => setActiveTab("customer")}
            className={`flex-1 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === "customer"
                ? "bg-neutral-900 text-cyan-400 border-b-2 border-cyan-500"
                : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900/50"
            }`}
          >
            <User size={16} /> Customer
          </button>
          <button
            onClick={() => setActiveTab("admin")}
            className={`flex-1 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === "admin"
                ? "bg-neutral-900 text-purple-400 border-b-2 border-purple-500"
                : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900/50"
            }`}
          >
            <ShieldCheck size={16} /> Admin
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 md:p-8">
          {activeTab === "customer" ? (
            <CustomerLoginForm onClose={() => onOpenChange(false)} />
          ) : (
            <AdminLoginForm onClose={() => onOpenChange(false)} />
          )}
        </div>
      </div>
    </div>
  )
}

// --- Internal Component: Admin Login Form ---
function AdminLoginForm({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

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
      // Hardcoded Demo Check
      if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
        localStorage.setItem("adminDemoMode", "true")
        localStorage.setItem("adminEmail", email)
        toast({ title: "Welcome back, Admin", className: "bg-purple-500/20 text-purple-300 border-purple-500/50" })
        router.push("/admin")
        onClose()
        return
      }

      // Supabase Auth Check
      const supabase = createBrowserClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else if (data.user) {
        toast({ title: "Admin authentication successful" })
        router.push("/admin")
        onClose()
      }
    } catch (err: any) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="text-center">
        <div className="inline-block p-3 bg-purple-500/10 rounded-xl mb-4 border border-purple-500/20">
          <ShieldCheck className="w-8 h-8 text-purple-400" />
        </div>
        <h2 className="text-xl font-bold text-white">Master Switchboard</h2>
        <p className="text-xs text-purple-400/60 mt-1 uppercase tracking-wider">Internal Access Only</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-neutral-400 mb-1.5 ml-1">ADMIN EMAIL</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-neutral-900/50 border border-neutral-800 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
            placeholder="admin@manafmart.com"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-400 mb-1.5 ml-1">ACCESS KEY</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-900/50 border border-neutral-800 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 text-center">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-900/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? <Loader className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
          Authenticate
        </button>
      </form>

      <div className="pt-4 border-t border-neutral-800">
        <button
          type="button"
          onClick={handleDemoLogin}
          className="w-full py-2 text-xs text-neutral-500 hover:text-purple-400 transition-colors flex items-center justify-center gap-1"
        >
          <span>Auto-fill Demo Credentials</span>
        </button>
      </div>
    </div>
  )
}

// --- Internal Component: Customer Login Form (Placeholder/Simple) ---
function CustomerLoginForm({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleCustomerLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate login for now
    setTimeout(() => {
        setLoading(false)
        toast({ title: "Logged in successfully", className: "bg-cyan-500/20 text-cyan-300 border-cyan-500/50" })
        router.push("/shop") // Redirect customers to shop
        onClose()
    }, 1000)
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
       <div className="text-center">
        <div className="inline-block p-3 bg-cyan-500/10 rounded-xl mb-4 border border-cyan-500/20">
          <User className="w-8 h-8 text-cyan-400" />
        </div>
        <h2 className="text-xl font-bold text-white">Welcome Back</h2>
        <p className="text-sm text-neutral-400 mt-1">Sign in to access your cart & orders</p>
      </div>

      <form onSubmit={handleCustomerLogin} className="space-y-4">
        <div>
           <label className="block text-xs font-semibold text-neutral-400 mb-1.5 ml-1">EMAIL</label>
           <input type="email" placeholder="you@example.com" className="w-full px-4 py-3 bg-neutral-900/50 border border-neutral-800 rounded-xl text-white focus:border-cyan-500 focus:outline-none transition-colors" />
        </div>
        <div>
           <label className="block text-xs font-semibold text-neutral-400 mb-1.5 ml-1">PASSWORD</label>
           <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-neutral-900/50 border border-neutral-800 rounded-xl text-white focus:border-cyan-500 focus:outline-none transition-colors" />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-black font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {loading ? <Loader className="w-4 h-4 animate-spin" /> : "Sign In"}
        </button>
      </form>
      
      <p className="text-center text-xs text-neutral-500 pt-4">
        Don't have an account? <span className="text-cyan-400 cursor-pointer hover:underline">Sign up</span>
      </p>
    </div>
  )
}
