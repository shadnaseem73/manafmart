"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, ShoppingCart, Star } from "lucide-react"

interface ProductCardProps {
  product: any
  onAddToCart?: (product: any) => void
}

export function ProductCardWithTracking({ product, onAddToCart }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const supabase = createBrowserClient()

  // Track product view
  useEffect(() => {
    const trackView = async () => {
      try {
        const response = await fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "view",
            product_id: product.id,
            metadata: { name: product.name },
          }),
        })
        if (!response.ok) console.error("Failed to track view")
      } catch (error) {
        console.error("Tracking error:", error)
      }
    }

    trackView()
  }, [product.id, product.name])

  const handleAddToCart = () => {
    // Track add to cart
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "click",
        product_id: product.id,
        metadata: { action: "add_to_cart" },
      }),
    }).catch(console.error)

    onAddToCart?.(product)
  }

  return (
    <Card className="bg-gradient-to-b from-gray-900 to-black border border-purple-500/30 overflow-hidden group hover:border-cyan-500/50 transition-all">
      <div className="relative h-48 bg-gray-800 overflow-hidden">
        <img
          src={product.image_url || "/placeholder.svg?height=192&width=256&query=tech product"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-white truncate">{product.name}</h3>

        <div className="flex items-center gap-1 mt-2">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm text-gray-400">{product.rating || 4.5}</span>
        </div>

        <div className="flex items-baseline gap-2 mt-3">
          <span className="text-lg font-bold text-cyan-400">৳{product.price}</span>
          {product.original_price && (
            <span className="text-sm text-gray-500 line-through">৳{product.original_price}</span>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            onClick={handleAddToCart}
            size="sm"
            className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            Cart
          </Button>
          <Button
            onClick={() => setIsWishlisted(!isWishlisted)}
            size="sm"
            variant="outline"
            className={`${isWishlisted ? "bg-purple-500/30 border-purple-500" : "border-cyan-500/30"}`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? "fill-purple-400" : ""}`} />
          </Button>
        </div>
      </div>
    </Card>
  )
}
