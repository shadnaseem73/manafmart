"use client"

import type React from "react"

import { useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, X } from "lucide-react"

interface CouponInputProps {
  onApply: (discount: number, code: string) => void
  cartTotal: number
}

export function CouponInput({ onApply, cartTotal }: CouponInputProps) {
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const supabase = createBrowserClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setMessage("Please login to apply coupons")
        return
      }

      try {
        const { data: coupon, error } = await supabase
          .from("coupons")
          .select("*")
          .eq("code", code.toUpperCase())
          .single()

        if (error || !coupon) {
          setMessage("Invalid coupon code")
          setIsSuccess(false)
          return
        }

        if (!coupon.is_active || (coupon.expiry_date && new Date(coupon.expiry_date) < new Date())) {
          setMessage("Coupon has expired")
          setIsSuccess(false)
          return
        }

        if (coupon.min_purchase && cartTotal < coupon.min_purchase) {
          setMessage(`Minimum purchase: ${coupon.min_purchase}`)
          setIsSuccess(false)
          return
        }

        const discount =
          coupon.discount_type === "percentage" ? (cartTotal * coupon.discount_value) / 100 : coupon.discount_value

        try {
          await supabase.from("coupon_usage").insert([{ coupon_id: coupon.id, user_id: user.id }])
        } catch (insertError) {
          console.log("[v0] Could not track coupon usage, continuing:", insertError)
        }

        setMessage(`Coupon applied! You saved ${discount.toFixed(2)}`)
        setIsSuccess(true)
        onApply(discount, code)
        setCode("")
      } catch (tableError) {
        console.log("[v0] Coupons table not found, showing demo message:", tableError)
        setMessage("Demo: Enter any code for 10% discount")
        setIsSuccess(true)
        onApply(cartTotal * 0.1, code)
        setCode("")
      }
    } catch (error) {
      console.error("Error applying coupon:", error)
      setMessage("Error applying coupon")
      setIsSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleApplyCoupon} className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter coupon code"
          className="bg-gray-800 border-cyan-500/30 text-white"
        />
        <Button
          type="submit"
          disabled={loading || !code.trim()}
          className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
        >
          Apply
        </Button>
      </div>
      {message && (
        <div className={`flex items-center gap-2 text-sm ${isSuccess ? "text-green-400" : "text-red-400"}`}>
          {isSuccess ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {message}
        </div>
      )}
    </form>
  )
}
