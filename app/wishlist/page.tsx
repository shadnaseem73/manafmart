"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Heart, Trash2, Bell, ShoppingBag } from "lucide-react"

interface WishlistItem {
  id: string
  product_id: string
  price_when_added: number
  notify_on_drop: boolean
  product?: any
}

export default function WishlistPage() {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [products, setProducts] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWishlist()
  }, [])

  async function fetchWishlist() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data: wishlistData, error } = await supabase
        .from("wishlists")
        .select("*")
        .eq("user_id", user.id)
        .order("added_at", { ascending: false })

      if (error) throw error

      setWishlist(wishlistData || [])

      // Fetch product details
      if (wishlistData && wishlistData.length > 0) {
        const productIds = wishlistData.map((item) => item.product_id)
        const { data: productData } = await supabase.from("products").select("*").in("id", productIds)

        const productMap: any = {}
        productData?.forEach((p) => {
          productMap[p.id] = p
        })
        setProducts(productMap)
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error)
    } finally {
      setLoading(false)
    }
  }

  async function removeFromWishlist(wishlistId: string) {
    const { error } = await supabase.from("wishlists").delete().eq("id", wishlistId)

    if (!error) {
      setWishlist(wishlist.filter((item) => item.id !== wishlistId))
    }
  }

  async function togglePriceAlert(wishlistId: string, currentStatus: boolean) {
    const { error } = await supabase.from("wishlists").update({ notify_on_drop: !currentStatus }).eq("id", wishlistId)

    if (!error) {
      setWishlist(wishlist.map((item) => (item.id === wishlistId ? { ...item, notify_on_drop: !currentStatus } : item)))
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div>Loading...</div>
      </main>
    )
  }

  if (wishlist.length === 0) {
    return (
      <main className="min-h-screen bg-black text-white p-6">
        <div className="max-w-2xl mx-auto text-center py-20">
          <Heart className="w-16 h-16 mx-auto mb-4 text-purple-500/50" />
          <h1 className="text-2xl font-bold mb-2">Your wishlist is empty</h1>
          <p className="text-gray-400 mb-6">Save your favorite products to keep track of them</p>
          <Button className="bg-gradient-to-r from-cyan-500 to-purple-600">Browse Products</Button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlist.map((item) => {
            const product = products[item.product_id]
            const priceDrop = product?.price < item.price_when_added

            return (
              <div
                key={item.id}
                className="bg-black/30 border border-cyan-500/20 rounded-lg overflow-hidden hover:border-cyan-500/50 transition-all"
              >
                <div className="relative">
                  <img
                    src={product?.image_url || "/placeholder.svg"}
                    alt={product?.name}
                    className="w-full h-48 object-cover"
                  />
                  {priceDrop && (
                    <div className="absolute top-2 right-2 bg-green-500/80 text-white px-3 py-1 rounded text-sm font-semibold">
                      Price Drop!
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2">{product?.name}</h3>

                  <div className="mb-3">
                    <p className="text-gray-400 text-sm mb-1">Original Price</p>
                    <p className="text-sm text-gray-500 line-through">৳{item.price_when_added.toLocaleString()}</p>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-400 text-sm mb-1">Current Price</p>
                    <p className={`text-lg font-semibold ${priceDrop ? "text-green-400" : "text-cyan-500"}`}>
                      ৳{product?.price?.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => togglePriceAlert(item.id, item.notify_on_drop)}
                      variant="outline"
                      className={`flex-1 border-0 ${item.notify_on_drop ? "bg-orange-500/20 text-orange-400" : "bg-black/50 text-gray-400"}`}
                    >
                      <Bell className="w-4 h-4 mr-1" />
                      Alert
                    </Button>
                    <Button className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600">
                      <ShoppingBag className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                    <Button
                      onClick={() => removeFromWishlist(item.id)}
                      variant="outline"
                      className="border-0 bg-red-500/20 text-red-400 hover:bg-red-500/30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
