"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"

export function useWishlist() {
  const supabase = createBrowserClient()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchWishlist()
  }, [])

  async function fetchWishlist() {
    try {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data } = await supabase.from("wishlists").select("*").eq("user_id", user.id)

      setItems(data || [])
    } catch (error) {
      console.error("Error fetching wishlist:", error)
    } finally {
      setLoading(false)
    }
  }

  return { items, loading, refetch: fetchWishlist }
}
