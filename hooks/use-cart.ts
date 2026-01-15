"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"

export interface CartItem {
  id: string
  product_id: string
  quantity: number
  price_at_add: number
  product_name?: string
  product_image?: string
}

export function useCart() {
  const supabase = createBrowserClient()
  const [items, setItems] = useState<CartItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  // Fetch cart items
  useEffect(() => {
    fetchCart()
  }, [])

  // Calculate total whenever items change
  useEffect(() => {
    const newTotal = items.reduce((sum, item) => sum + item.price_at_add * item.quantity, 0)
    setTotal(newTotal)
  }, [items])

  async function fetchCart() {
    try {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data, error } = await supabase.from("cart_items").select("*").eq("cart_id", user.id)

      if (error) throw error
      setItems(data || [])
    } catch (error) {
      console.error("Error fetching cart:", error)
    } finally {
      setLoading(false)
    }
  }

  async function addToCart(productId: string, quantity = 1) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { error } = await supabase.from("cart_items").insert([
        {
          product_id: productId,
          quantity,
          price_at_add: 0, // Will be fetched from product
        },
      ])

      if (error) throw error
      await fetchCart()
    } catch (error) {
      console.error("Error adding to cart:", error)
    }
  }

  async function updateQuantity(cartItemId: string, quantity: number) {
    try {
      if (quantity <= 0) {
        await removeFromCart(cartItemId)
        return
      }

      const { error } = await supabase.from("cart_items").update({ quantity }).eq("id", cartItemId)

      if (error) throw error
      await fetchCart()
    } catch (error) {
      console.error("Error updating quantity:", error)
    }
  }

  async function removeFromCart(cartItemId: string) {
    try {
      const { error } = await supabase.from("cart_items").delete().eq("id", cartItemId)

      if (error) throw error
      await fetchCart()
    } catch (error) {
      console.error("Error removing from cart:", error)
    }
  }

  async function clearCart() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { error } = await supabase.from("cart_items").delete()

      if (error) throw error
      setItems([])
      setTotal(0)
    } catch (error) {
      console.error("Error clearing cart:", error)
    }
  }

  return {
    items,
    total,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    itemCount: items.length,
  }
}
