"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { ProductRow } from "./product-row"

interface NewArrivalProduct {
  id: string
  name: string
  price: number
  rating: number
  reviews_count: number
  image?: string
  is_new: boolean
}

export function NewArrivalsSection() {
  const [products, setProducts] = useState<NewArrivalProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        setIsLoading(true)

        const supabase = createBrowserClient()

        const { data, error } = await supabase
          .from("products")
          .select("id, name, price, rating, reviews_count, image")
          .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order("created_at", { ascending: false })
          .limit(8)

        if (error) {
          console.log("[v0] New arrivals fetch error (showing sample data):", error.message)
          setProducts([
            {
              id: "1",
              name: "Ultra Wireless Speaker",
              price: 3499,
              rating: 4.7,
              reviews_count: 312,
              is_new: true,
              image: "/wireless-speaker-neon-tech.jpg",
            },
            {
              id: "2",
              name: "Pro Gimbal Stabilizer",
              price: 8999,
              rating: 4.9,
              reviews_count: 156,
              is_new: true,
              image: "/gimbal-stabilizer-professional.jpg",
            },
          ])
        } else {
          setProducts(
            (data || []).map((product: any) => ({
              ...product,
              is_new: true,
            })),
          )
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchNewArrivals()
  }, [])

  return (
    <ProductRow
      title="New Arrivals"
      subtitle="Fresh Drops from Elite Vendors"
      products={products}
      isLoading={isLoading}
    />
  )
}
