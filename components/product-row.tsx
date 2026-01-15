"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, Star, Flame } from "lucide-react"
import Image from "next/image"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

interface Product {
  id: string
  name: string
  price: number | string
  rating?: number
  reviews_count?: number
  image?: string
  badge?: string
  is_new?: boolean
  rank?: number
  sales_count?: number
}

interface ProductRowProps {
  title: string
  subtitle?: string
  products: Product[]
  variant?: "default" | "ranked" | "recently-viewed"
  isLoading?: boolean
}

export function ProductRow({ title, subtitle, products, variant = "default", isLoading = false }: ProductRowProps) {
  const [scrollPosition, setScrollPosition] = useState(0)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollPosition(e.currentTarget.scrollLeft)
  }

  const getRankColor = (rank?: number) => {
    switch (rank) {
      case 1:
        return "border-yellow-400/50 shadow-lg shadow-yellow-400/20"
      case 2:
        return "border-gray-400/50 shadow-lg shadow-gray-400/20"
      case 3:
        return "border-orange-400/50 shadow-lg shadow-orange-400/20"
      default:
        return "border-cyan-400/30"
    }
  }

  const getRankLabel = (rank?: number) => {
    const labels = { 1: "🥇 Gold", 2: "🥈 Silver", 3: "🥉 Bronze" }
    return labels[rank as keyof typeof labels] || ""
  }

  if (isLoading) {
    return (
      <section className="px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="h-8 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 rounded-lg w-48 animate-pulse mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-64 bg-gradient-to-r from-cyan-500/10 to-purple-600/10 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-3xl lg:text-4xl font-black text-white mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">{title}</span>
          </h2>
          {subtitle && <p className="text-gray-300 text-sm">{subtitle}</p>}
        </motion.div>

        <div className="relative group">
          <ScrollArea className="w-full">
            <div className="flex gap-4 pb-4" onScroll={handleScroll}>
              {products.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  className="flex-none w-64"
                >
                  <div
                    className={`group/card relative rounded-lg overflow-hidden bg-gradient-to-br from-cyan-900/20 to-purple-900/20 border ${getRankColor(
                      product.rank,
                    )} hover:border-cyan-400/60 transition-all duration-300 cursor-pointer h-full flex flex-col`}
                  >
                    {/* Product Image */}
                    <div className="relative h-48 bg-black overflow-hidden">
                      {product.image ? (
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover group-hover/card:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-cyan-500/10 to-purple-600/10 flex items-center justify-center">
                          <span className="text-gray-500">No Image</span>
                        </div>
                      )}

                      <div className="absolute top-2 right-2 flex gap-2">
                        {product.is_new && (
                          <div className="px-2 py-1 bg-cyan-500/90 backdrop-blur-sm rounded-full text-xs font-bold text-black">
                            NEW
                          </div>
                        )}
                        {product.rank && product.rank <= 3 && (
                          <div className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 backdrop-blur-sm rounded-full text-xs font-bold text-black flex items-center gap-1">
                            <Flame className="w-3 h-3" />
                            Hot
                          </div>
                        )}
                      </div>

                      {/* Rank label overlay for best sellers */}
                      {product.rank && product.rank <= 3 && (
                        <div className="absolute top-2 left-2 px-3 py-1 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-full text-xs font-bold text-white">
                          {getRankLabel(product.rank)}
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-sm text-white line-clamp-2 mb-2">{product.name}</h3>

                        {/* Rating */}
                        {product.rating && (
                          <div className="flex items-center gap-1 mb-3">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < Math.floor(product.rating!)
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-600"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-300">
                              {product.rating} ({product.reviews_count || 0})
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-cyan-400">
                          {typeof product.price === "string" ? product.price : `৳${product.price?.toLocaleString()}`}
                        </span>
                        {product.sales_count && (
                          <span className="text-xs text-gray-400">{product.sales_count} sold</span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="bg-cyan-400/20" />
          </ScrollArea>

          {/* Scroll Indicators */}
          {scrollPosition > 0 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 p-2 rounded-full bg-cyan-500/20 border border-cyan-400/30 hover:bg-cyan-500/40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-cyan-400" />
            </motion.button>
          )}
        </div>
      </div>
    </section>
  )
}
