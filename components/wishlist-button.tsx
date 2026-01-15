"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"

export function WishlistButton({ productId }: { productId: string }) {
  const supabase = createBrowserClient()
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    getUser()
  }, [])

  useEffect(() => {
    if (user) {
      checkWishlist()
    }
  }, [user, productId])

  async function getUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUser(user)
  }

  async function checkWishlist() {
    if (!user) return

    const { data } = await supabase
      .from("wishlists")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .single()

    setIsInWishlist(!!data)
  }

  async function toggleWishlist() {
    if (!user) {
      alert("Please login to add to wishlist")
      return
    }

    setLoading(true)

    try {
      if (isInWishlist) {
        // Remove from wishlist
        await supabase.from("wishlists").delete().eq("user_id", user.id).eq("product_id", productId)
      } else {
        // Add to wishlist
        const { data: product } = await supabase.from("products").select("price").eq("id", productId).single()

        await supabase.from("wishlists").insert([
          {
            user_id: user.id,
            product_id: productId,
            price_when_added: product?.price,
            notify_on_drop: true,
          },
        ])
      }

      setIsInWishlist(!isInWishlist)
    } catch (error) {
      console.error("Error toggling wishlist:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={toggleWishlist}
      disabled={loading}
      variant="outline"
      className={`border-0 bg-transparent hover:bg-transparent ${isInWishlist ? "text-red-500" : "text-gray-400 hover:text-red-500"}`}
    >
      <Heart className={`w-6 h-6 ${isInWishlist ? "fill-red-500" : ""}`} />
    </Button>
  )
}
