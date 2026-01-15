"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Activity, Users, ShoppingCart, Eye } from "lucide-react"

interface RealtimeMetric {
  label: string
  value: number
  change: number
  icon: React.ReactNode
  color: string
}

export function SpyDashboard() {
  const [metrics, setMetrics] = useState<RealtimeMetric[]>([
    { label: "Live Visitors", value: 1234, change: 12, icon: <Users className="w-5 h-5" />, color: "cyan" },
    { label: "Active Carts", value: 342, change: 8, icon: <ShoppingCart className="w-5 h-5" />, color: "purple" },
    { label: "Page Views/min", value: 2847, change: 15, icon: <Eye className="w-5 h-5" />, color: "green" },
    { label: "Conversions/hr", value: 156, change: 22, icon: <Activity className="w-5 h-5" />, color: "orange" },
  ])

  const [liveEvents, setLiveEvents] = useState<Array<{ id: string; user: string; action: string; time: string }>>([])

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setMetrics((prev) =>
        prev.map((m) => ({
          ...m,
          value: Math.max(0, m.value + Math.floor(Math.random() * 50 - 20)),
          change: Math.floor(Math.random() * 30 - 5),
        })),
      )

      // Add random event
      const actions = ["viewed product", "added to cart", "applied coupon", "completed purchase", "joined squad buy"]
      const newEvent = {
        id: Math.random().toString(),
        user: `User-${Math.floor(Math.random() * 10000)}`,
        action: actions[Math.floor(Math.random() * actions.length)],
        time: new Date().toLocaleTimeString(),
      }
      setLiveEvents((prev) => [newEvent, ...prev.slice(0, 9)])
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const colorClasses: Record<string, string> = {
    cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/30",
    green: "text-green-400 bg-green-500/10 border-green-500/30",
    orange: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  }

  return (
    <div className="space-y-8">
      {/* Real-time Metrics */}
      <div>
        <h3 className="text-2xl font-bold text-white mb-6">Real-Time Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`border rounded-lg p-6 backdrop-blur-sm ${colorClasses[metric.color]}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-black/50 rounded-lg">{metric.icon}</div>
                <span className={`text-sm font-bold ${metric.change > 0 ? "text-green-400" : "text-red-400"}`}>
                  {metric.change > 0 ? "+" : ""}
                  {metric.change}%
                </span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{metric.value.toLocaleString()}</div>
              <div className="text-xs text-gray-400">{metric.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Live Activity Stream */}
      <div>
        <h3 className="text-2xl font-bold text-white mb-6">Live Activity Stream</h3>
        <div className="border border-purple-500/30 rounded-lg backdrop-blur-sm bg-black/50 overflow-hidden max-h-96">
          <div className="space-y-1">
            {liveEvents.length === 0 ? (
              <div className="p-6 text-center text-gray-400">Waiting for activity...</div>
            ) : (
              liveEvents.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="px-6 py-3 border-b border-purple-500/20 flex items-center justify-between hover:bg-purple-500/10 transition-colors"
                >
                  <div>
                    <span className="font-mono text-sm text-cyan-400">{event.user}</span>
                    <span className="text-gray-500"> {event.action}</span>
                  </div>
                  <span className="text-xs text-gray-600">{event.time}</span>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Ghost Keystroke Monitor (Disabled in UI for privacy) */}
      <div className="border border-red-500/30 rounded-lg p-6 backdrop-blur-sm bg-black/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Advanced Monitoring</h3>
          <span className="text-xs px-3 py-1 bg-red-500/20 text-red-400 rounded-full">⚠️ Privacy Restricted</span>
        </div>
        <p className="text-sm text-gray-400">
          Ghost keystroke monitoring is disabled for privacy compliance. Only authorized personnel with explicit consent
          can access user behavior analytics.
        </p>
      </div>
    </div>
  )
}
