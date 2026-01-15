"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react"

interface CartItem {
  id: string
  product_id: string
  quantity: number
  price_at_add: number
}

export default function CartPage() {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<any>({})

  useEffect(() => {
    fetchCart()
  }, [])

  async function fetchCart() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      // Fetch cart items
      const { data: cartData, error: cartError } = await supabase.from("cart_items").select("*").eq("cart_id", user.id)

      if (cartError) throw cartError
      setItems(cartData || [])

      // Fetch product details
      if (cartData && cartData.length > 0) {
        const productIds = cartData.map((item) => item.product_id)
        const { data: productData } = await supabase.from("products").select("*").in("id", productIds)

        const productMap: any = {}
        productData?.forEach((p) => {
          productMap[p.id] = p
        })
        setProducts(productMap)
      }
    } catch (error) {
      console.error("Error fetching cart:", error)
    } finally {
      setLoading(false)
    }
  }

  async function updateQuantity(itemId: string, newQuantity: number) {
    if (newQuantity <= 0) {
      await removeItem(itemId)
      return
    }

    const { error } = await supabase.from("cart_items").update({ quantity: newQuantity }).eq("id", itemId)

    if (!error) {
      setItems(items.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item)))
    }
  }

  async function removeItem(itemId: string) {
    const { error } = await supabase.from("cart_items").delete().eq("id", itemId)

    if (!error) {
      setItems(items.filter((item) => item.id !== itemId))
    }
  }

  const total = items.reduce((sum, item) => sum + item.price_at_add * item.quantity, 0)

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div>Loading...</div>
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-black text-white p-6">
        <div className="max-w-2xl mx-auto text-center py-20">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-cyan-500/50" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-gray-400 mb-6">Add some premium tech products to get started</p>
          <Button className="bg-gradient-to-r from-cyan-500 to-purple-600" onClick={() => router.push("/shop")}
          >
            Continue Shopping
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item) => {
                const product = products[item.product_id]
                return (
                  <div key={item.id} className="flex gap-4 p-4 bg-black/30 border border-cyan-500/20 rounded-lg">
                    <img
                      src={product?.image_url || product?.image || "/placeholder.svg"}
                      alt={product?.name}
                      className="w-24 h-24 rounded object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{product?.name}</h3>
                      <p className="text-cyan-500 font-semibold">৳{item.price_at_add.toLocaleString()}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2 bg-black/50 border border-cyan-500/20 rounded">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-cyan-500/20"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-3">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-cyan-500/20"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-400">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-black/30 border border-cyan-500/20 rounded-lg p-6 h-fit">
            <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4 pb-4 border-b border-cyan-500/20">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>৳{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Shipping</span>
                <span>৳0</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Tax</span>
                <span>৳0</span>
              </div>
            </div>
            <div className="flex justify-between font-semibold text-lg mb-6">
              <span>Total</span>
              <span className="text-cyan-500">৳{total.toLocaleString()}</span>
            </div>
            <Button className="w-full bg-gradient-to-r from-cyan-500 to-purple-600" onClick={() => router.push("/checkout")}>
              <ArrowRight className="w-4 h-4 mr-2" />
              Proceed to Checkout
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
