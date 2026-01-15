"use client"

import { motion } from "framer-motion"
import Image from "next/image"

interface FeaturedAdProps {
  title: string
  description: string
  image: string
  videoUrl?: string
  cta?: {
    text: string
    href: string
  }
}

export function FeaturedAd({ title, description, image, videoUrl, cta }: FeaturedAdProps) {
  return (
    <section className="relative px-4 py-16 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-4"
        >
          {/* Main Featured Section */}
          <motion.div
            className="lg:col-span-2 relative rounded-2xl overflow-hidden group cursor-pointer"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative h-80 lg:h-96 bg-black">
              {videoUrl ? (
                <video
                  autoPlay
                  muted
                  loop
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                >
                  <source src={videoUrl} type="video/mp4" />
                </video>
              ) : (
                <Image
                  src={image || "/placeholder.svg"}
                  alt={title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

              {/* Neon glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-purple-600/0 group-hover:opacity-100 opacity-50 transition-opacity duration-500 animate-pulse" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="text-3xl lg:text-4xl font-black text-white mb-2">{title}</h3>
                  <p className="text-gray-300 mb-4">{description}</p>

                  {cta && (
                    <motion.button
                      whileHover={{ x: 5 }}
                      className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full text-white font-bold text-sm hover:shadow-lg hover:shadow-cyan-500/50 transition-shadow"
                    >
                      {cta.text} →
                    </motion.button>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Side Content - Bento boxes */}
          <div className="flex flex-col gap-4">
            {/* Stat Box 1 */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-6 rounded-xl bg-gradient-to-br from-cyan-500/10 to-purple-600/10 border border-cyan-400/30 hover:border-cyan-400/60 transition-colors cursor-pointer"
            >
              <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-2">
                50%
              </div>
              <p className="text-sm text-gray-300">Off Premium Items</p>
            </motion.div>

            {/* Stat Box 2 */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-6 rounded-xl bg-gradient-to-br from-purple-600/10 to-pink-500/10 border border-purple-400/30 hover:border-purple-400/60 transition-colors cursor-pointer"
            >
              <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-2">
                24H
              </div>
              <p className="text-sm text-gray-300">Express Delivery</p>
            </motion.div>

            {/* Stat Box 3 */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-6 rounded-xl bg-gradient-to-br from-pink-500/10 to-cyan-500/10 border border-pink-400/30 hover:border-pink-400/60 transition-colors cursor-pointer flex-1 flex items-center justify-center"
            >
              <p className="text-sm text-gray-300 text-center">🎁 Limited Time Offer</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
