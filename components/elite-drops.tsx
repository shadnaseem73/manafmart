"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { useFeatureFlag } from "@/hooks/use-feature-flag"

const eliteProducts = [
  {
    id: 1,
    name: "Quantum Pro X Earbuds",
    price: "৳4,999",
    rating: 4.8,
    reviews: 234,
    image: "/premium-wireless-earbuds-neon-glow.jpg",
    badge: "ELITE DROP",
  },
  {
    id: 2,
    name: "Neon Gaming Smartwatch",
    price: "৳7,999",
    rating: 4.9,
    reviews: 187,
    image: "/gaming-smartwatch-cyberpunk.jpg",
    badge: "LIMITED",
  },
  {
    id: 3,
    name: "Ultra Wireless Speaker",
    price: "৳3,499",
    rating: 4.7,
    reviews: 312,
    image: "/wireless-speaker-neon-tech.jpg",
    badge: "HOT",
  },
  {
    id: 4,
    name: "Pro Gimbal Stabilizer",
    price: "৳8,999",
    rating: 4.9,
    reviews: 156,
    image: "/gimbal-stabilizer-professional.jpg",
    badge: "TRENDING",
  },
]

export function EliteDrops() {
  const { isEnabled: eliteDropsEnabled, loading } = useFeatureFlag("elite_drops_enabled")

  // Hide section if feature is disabled
  if (!loading && !eliteDropsEnabled) {
    return null
  }

  return (
    <section className="relative px-4 py-20 border-t border-cyan-500/20">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-3xl lg:text-5xl font-black text-white mb-4">
            ✨ Elite Drops &{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Trending</span>
          </h2>
          <p className="text-gray-400 text-lg">Limited quantity, verified authentic, handpicked by our tech experts</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {eliteProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="group relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300" />
              <div className="relative border border-cyan-500/30 backdrop-blur-sm bg-black/50 rounded-xl overflow-hidden">
                <div className="relative h-64 bg-gradient-to-br from-gray-900 to-black overflow-hidden">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-3 py-1 text-xs font-bold rounded-full backdrop-blur-sm ${
                        product.badge === "ELITE DROP"
                          ? "bg-cyan-500/80 text-black"
                          : product.badge === "LIMITED"
                            ? "bg-purple-500/80 text-white"
                            : product.badge === "HOT"
                              ? "bg-red-500/80 text-white"
                              : "bg-orange-500/80 text-black"
                      }`}
                    >
                      {product.badge}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-sm font-bold text-white mb-2 line-clamp-2">{product.name}</h3>

                  <div className="flex items-center gap-1 mb-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-600"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">({product.reviews})</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                      {product.price}
                    </span>
                    <button className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all">
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
