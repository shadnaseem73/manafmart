"use client"

import { motion } from "framer-motion"
import { ChevronRight } from "lucide-react"

const categories = [
  {
    name: "Gadget Hub",
    description: "Premium audio & wearables",
    icon: "🎧",
    color: "from-cyan-500 to-blue-600",
    count: "500+",
  },
  {
    name: "Mobile Essentials",
    description: "Cables & chargers",
    icon: "📱",
    color: "from-purple-500 to-pink-600",
    count: "800+",
  },
  {
    name: "Comfort & Care",
    description: "Personal care & lighting",
    icon: "💆",
    color: "from-green-500 to-teal-600",
    count: "300+",
  },
  {
    name: "Smart Picks",
    description: "Content creation tools",
    icon: "📸",
    color: "from-orange-500 to-red-600",
    count: "400+",
  },
]

export function CategoriesSection() {
  return (
    <section className="relative px-4 py-20">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-3xl lg:text-5xl font-black text-white mb-4">
            Explore by{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Category</span>
          </h2>
          <p className="text-gray-400 text-lg">Discover premium products across our curated collections</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="group relative"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-r ${category.color} rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300`}
              />
              <div className="relative border border-cyan-500/30 backdrop-blur-sm bg-black/50 rounded-xl p-6 hover:border-cyan-500/60 transition-colors cursor-pointer">
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{category.name}</h3>
                <p className="text-sm text-gray-400 mb-4">{category.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-cyan-400">{category.count} products</span>
                  <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
