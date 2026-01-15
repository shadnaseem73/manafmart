"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Card } from "@/components/ui/card"
import { Zap } from "lucide-react"

export function LoyaltyBadge() {
  const [points, setPoints] = useState(0)
  const [tier, setTier] = useState("Silver")
  const supabase = createBrowserClient()

  useEffect(() => {
    const fetchLoyalty = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase.from("profiles").select("loyalty_points").eq("id", user.id).single()

      if (data) {
        setPoints(data.loyalty_points || 0)
        if (data.loyalty_points >= 5000) setTier("Platinum")
        else if (data.loyalty_points >= 2000) setTier("Gold")
        else setTier("Silver")
      }
    }

    fetchLoyalty()
  }, [supabase])

  const getTierColor = () => {
    switch (tier) {
      case "Platinum":
        return "from-gray-400 to-blue-400"
      case "Gold":
        return "from-yellow-400 to-orange-400"
      default:
        return "from-gray-400 to-gray-500"
    }
  }

  return (
    <Card className={`bg-gradient-to-r ${getTierColor()} text-black p-4 rounded-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold">{tier} Member</p>
          <p className="text-sm opacity-75">{points} points earned</p>
        </div>
        <Zap className="w-6 h-6" />
      </div>
    </Card>
  )
}
