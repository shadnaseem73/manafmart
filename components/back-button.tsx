"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { motion } from "framer-motion"

export function BackButton() {
  const router = useRouter()

  return (
    <motion.button
      onClick={() => router.back()}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed top-6 left-6 z-40 w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-600/20 backdrop-blur-lg border border-cyan-400/30 hover:border-cyan-400/60 flex items-center justify-center group transition-all duration-300"
      aria-label="Go back"
    >
      <ChevronLeft className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
      <div className="absolute inset-0 rounded-full bg-cyan-400/5 group-hover:bg-cyan-400/10 transition-colors" />
    </motion.button>
  )
}
