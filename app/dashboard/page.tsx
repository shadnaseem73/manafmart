"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, Heart, ShoppingBag, Settings } from "lucide-react"

export default function Dashboard() {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [orderCount, setOrderCount] = useState(0)

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      setUser(user)

      // Load lightweight order count (best-effort)
      try {
        const { count } = await supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
        setOrderCount(Number(count || 0))
      } catch {
        setOrderCount(0)
      }
      setLoading(false)
    }

    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-purple-600 bg-clip-text text-transparent">
              Welcome, {user?.user_metadata?.full_name || "User"}
            </h1>
            <p className="text-gray-400 mt-2">{user?.email}</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-cyan-500/30 hover:bg-cyan-500/10 bg-transparent"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className="p-6 bg-black/30 border border-cyan-500/20 rounded-lg hover:border-cyan-500/50 transition-all cursor-pointer"
            onClick={() => router.push("/orders")}
          >
            <ShoppingBag className="w-8 h-8 text-cyan-500 mb-3" />
            <h3 className="font-semibold mb-1">My Orders</h3>
            <p className="text-2xl font-bold text-cyan-500">{orderCount}</p>
          </div>

          <div className="p-6 bg-black/30 border border-cyan-500/20 rounded-lg hover:border-cyan-500/50 transition-all cursor-pointer">
            <Heart className="w-8 h-8 text-purple-500 mb-3" />
            <h3 className="font-semibold mb-1">Wishlist Items</h3>
            <p className="text-2xl font-bold text-purple-500">0</p>
          </div>

          <div className="p-6 bg-black/30 border border-cyan-500/20 rounded-lg hover:border-cyan-500/50 transition-all cursor-pointer">
            <Settings className="w-8 h-8 text-orange-500 mb-3" />
            <h3 className="font-semibold mb-1">Loyalty Points</h3>
            <p className="text-2xl font-bold text-orange-500">0</p>
          </div>
        </div>
      </div>
    </main>
  )
}
