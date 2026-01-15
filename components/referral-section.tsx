"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Copy, Gift } from "lucide-react"

export function ReferralSection() {
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [referralPoints, setReferralPoints] = useState(500)
  const [copied, setCopied] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const fetchReferralCode = async () => {
      try {
        const supabase = createBrowserClient()

        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          setReferralCode(Math.random().toString(36).substring(2, 8).toUpperCase())
          setIsInitialized(true)
          return
        }

        try {
          const { data, error } = await supabase
            .from("referral_links")
            .select("*")
            .eq("referrer_id", user.id)
            .maybeSingle()

          if (data) {
            setReferralCode(data.unique_code)
            setReferralPoints(data.reward_points * (data.referred_user_id ? 1 : 0))
          } else if (!error) {
            const code = Math.random().toString(36).substring(2, 8).toUpperCase()
            setReferralCode(code)

            try {
              await supabase.from("referral_links").insert([{ referrer_id: user.id, unique_code: code }])
            } catch (insertError) {
              console.log("[v0] Could not save referral code, using local:", insertError)
            }
          } else {
            throw error
          }
        } catch (tableError) {
          console.log("[v0] Referral table not found, using generated code:", tableError)
          setReferralCode(Math.random().toString(36).substring(2, 8).toUpperCase())
        }
      } catch (error) {
        console.log("[v0] Error fetching referral, using demo code:", error)
        setReferralCode(Math.random().toString(36).substring(2, 8).toUpperCase())
      } finally {
        setIsInitialized(true)
      }
    }

    fetchReferralCode()
  }, [])

  const copyToClipboard = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!isInitialized) return null

  return (
    <Card className="bg-gradient-to-br from-purple-900/50 to-black border border-purple-500/30 p-6">
      <div className="flex items-center gap-3 mb-4">
        <Gift className="w-6 h-6 text-purple-400" />
        <h3 className="text-white font-bold text-lg">Referral Program</h3>
      </div>
      <p className="text-gray-300 text-sm mb-4">Share your code and earn 500 points for each friend who joins!</p>
      <div className="flex gap-2">
        <input
          readOnly
          value={referralCode || ""}
          className="flex-1 bg-gray-800 border border-purple-500/30 text-white px-3 py-2 rounded-lg font-mono text-sm"
        />
        <Button onClick={copyToClipboard} className="bg-purple-600 hover:bg-purple-700" size="sm">
          <Copy className="w-4 h-4" />
        </Button>
      </div>
      {copied && <p className="text-green-400 text-sm mt-2">Copied!</p>}
    </Card>
  )
}
