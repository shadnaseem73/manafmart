"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <section className="relative px-4 py-20 lg:py-32 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-0 w-72 h-72 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-5 animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl opacity-5 animate-blob animation-delay-2000" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="inline-block mb-6">
            <span className="px-4 py-2 text-sm font-semibold text-cyan-400 border border-cyan-500/50 rounded-full backdrop-blur-sm bg-cyan-500/10">
              🚀 Welcome to the Future of Tech Shopping
            </span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-black text-white mb-6 leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400">
              Elite Tech Ecosystem
            </span>
            <br />
            <span className="text-3xl lg:text-5xl">for Bangladesh</span>
          </h1>

          <p className="text-lg lg:text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Discover premium gadgets, cutting-edge accessories, and verified tech products with our neon-powered
            shopping experience. Squad buying, AI search, and blockchain authenticity verification.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg flex items-center gap-2 hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
            >
              Shop Now
              <ArrowRight className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 border border-purple-500/50 text-purple-400 font-bold rounded-lg hover:bg-purple-500/10 transition-all"
            >
              Explore Categories
            </motion.button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400 mb-2">5K+</div>
              <div className="text-sm text-gray-400">Premium Products</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">50K+</div>
              <div className="text-sm text-gray-400">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400 mb-2">100%</div>
              <div className="text-sm text-gray-400">Verified Authentic</div>
            </div>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </section>
  )
}
