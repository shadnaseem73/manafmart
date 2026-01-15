"use client"

import Link from "next/link"
import { DollarSign, ShoppingBag, Ticket, Users, Activity, Package, Clock, Sliders } from "lucide-react"

const stats = [
  {
    title: "Products",
    value: "1,284",
    change: "+24",
    icon: Package,
    color: "cyan",
  },
  {
    title: "Orders",
    value: "3,847",
    change: "+156",
    icon: ShoppingBag,
    color: "purple",
  },
  {
    title: "Customers",
    value: "12,847",
    change: "+892",
    icon: Users,
    color: "cyan",
  },
  {
    title: "Revenue",
    value: "৳8,24,592",
    change: "+৳45,230",
    icon: DollarSign,
    color: "purple",
  },
  {
    title: "Pending Orders",
    value: "47",
    change: "+12",
    icon: Clock,
    color: "orange",
  },
  {
    title: "Unresolved Tickets",
    value: "23",
    change: "+5",
    icon: Ticket,
    color: "red",
  },
]

const activityFeed = [
  { id: 1, event: "New order #2847 received", time: "2 min ago", type: "order" },
  { id: 2, event: "User john@email.com registered", time: "5 min ago", type: "user" },
  { id: 3, event: "Support ticket #156 resolved", time: "12 min ago", type: "support" },
  { id: 4, event: "Inventory alert: Low stock on SKU-4892", time: "18 min ago", type: "inventory" },
  { id: 5, event: "Payment processed for order #2846", time: "25 min ago", type: "payment" },
  { id: 6, event: "New review submitted for Product #892", time: "32 min ago", type: "review" },
  { id: 7, event: "Order #2845 marked as shipped", time: "38 min ago", type: "order" },
  { id: 8, event: "New support ticket #157 opened", time: "42 min ago", type: "support" },
]

const getColorClasses = (color: string) => {
  switch (color) {
    case "cyan":
      return {
        bg: "bg-cyan-500/20 border-cyan-500/40",
        icon: "text-cyan-400",
        glow: "group-hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]",
      }
    case "purple":
      return {
        bg: "bg-purple-500/20 border-purple-500/40",
        icon: "text-purple-400",
        glow: "group-hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]",
      }
    case "orange":
      return {
        bg: "bg-orange-500/20 border-orange-500/40",
        icon: "text-orange-400",
        glow: "group-hover:shadow-[0_0_30px_rgba(249,115,22,0.2)]",
      }
    case "red":
      return {
        bg: "bg-red-500/20 border-red-500/40",
        icon: "text-red-400",
        glow: "group-hover:shadow-[0_0_30px_rgba(239,68,68,0.2)]",
      }
    default:
      return {
        bg: "bg-cyan-500/20 border-cyan-500/40",
        icon: "text-cyan-400",
        glow: "group-hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]",
      }
  }
}

export function CommandDeckDashboard() {
  return (
    <div className="p-8 space-y-8">
      {/* Hero Section */}
      <div className="glass-panel rounded-2xl p-8 neon-border relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5" />
        <div className="relative">
          <div className="flex items-center justify-between gap-6 flex-wrap">
            <div>
              <h1 className="text-4xl font-bold text-gray-100 mb-2">
                Welcome to <span className="text-cyan-400">Command Deck</span>
              </h1>
              <p className="text-gray-400 text-lg">Manaf Mart Enterprise Control Center</p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/admin/switchboard"
                className="flex items-center gap-2 glass-panel px-5 py-3 rounded-full neon-border hover:bg-cyan-500/10 transition-colors"
              >
                <Sliders className="w-5 h-5 text-cyan-400" />
                <span className="text-cyan-300 font-semibold">Open Master Switchboard</span>
              </Link>

              <div className="flex items-center gap-3 glass-panel px-6 py-3 rounded-full">
                <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse-glow" />
                <span className="text-green-400 font-semibold tracking-wider">SYSTEM ONLINE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Stats Left, Activity Right */}
      <div className="flex gap-8 flex-col xl:flex-row">
        {/* Stat Cards Grid - 2x3 */}
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats.map((stat) => {
              const colors = getColorClasses(stat.color)
              return (
                <div
                  key={stat.title}
                  className={`glass-panel rounded-xl p-6 neon-border group transition-all duration-300 ${colors.glow}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${colors.bg}`}>
                      <stat.icon className={`w-6 h-6 ${colors.icon}`} />
                    </div>
                    <span className="text-sm font-mono text-green-400">{stat.change}</span>
                  </div>
                  <h3 className="text-gray-400 text-sm mb-1">{stat.title}</h3>
                  <p className="text-3xl font-bold text-gray-100">{stat.value}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Live Activity Feed - Right Side */}
        <div className="w-full xl:w-[420px] glass-panel rounded-2xl p-6 neon-border h-fit">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-gray-100">Real-Time Activity Stream</h2>
            <div className="ml-auto flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse-dot" />
              <span className="text-xs text-gray-500 font-mono">LIVE</span>
            </div>
          </div>
          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-2">
            {activityFeed.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-3 rounded-lg bg-gray-900/30 border border-gray-800/50 hover:border-cyan-500/30 transition-all"
              >
                <div className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                <span className="text-gray-300 text-sm flex-1">{item.event}</span>
                <span className="text-gray-500 text-xs font-mono shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <Link href="/admin/orders" className="glass-panel neon-border rounded-2xl p-6 hover:bg-cyan-500/5 transition-colors">
          <h3 className="text-lg font-bold text-gray-100">Manage Orders</h3>
          <p className="text-gray-400 mt-2 text-sm">Process new orders, update delivery & payment status.</p>
        </Link>

        <Link href="/admin/support" className="glass-panel neon-border rounded-2xl p-6 hover:bg-cyan-500/5 transition-colors">
          <h3 className="text-lg font-bold text-gray-100">Support Inbox</h3>
          <p className="text-gray-400 mt-2 text-sm">Track and resolve customer tickets with RLS-protected access.</p>
        </Link>

        <Link href="/" className="glass-panel neon-border rounded-2xl p-6 hover:bg-cyan-500/5 transition-colors">
          <h3 className="text-lg font-bold text-gray-100">Open Storefront</h3>
          <p className="text-gray-400 mt-2 text-sm">Jump back to the e-commerce site.</p>
        </Link>
      </div>
    </div>
  )
}
