"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  FolderTree,
  HeadphonesIcon,
  FileText,
  UserCog,
  Sliders,
  Eye,
  LogOut,
  Store,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { createBrowserClient } from "@/lib/supabase/client"
import { useAdminSession } from "./admin-session-context"

const menuGroups = [
  {
    label: "Command",
    items: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { name: "Switchboard", href: "/admin/switchboard", icon: Sliders },
      { name: "Spy Mode", href: "/admin/spy", icon: Eye },
    ],
  },
  {
    label: "Commerce",
    items: [
      { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
      { name: "Customers", href: "/admin/customers", icon: Users },
    ],
  },
  {
    label: "Inventory",
    items: [
      { name: "Products", href: "/admin/products", icon: Package },
      { name: "Categories", href: "/admin/categories", icon: FolderTree },
    ],
  },
  {
    label: "System",
    items: [
      { name: "Support", href: "/admin/support", icon: HeadphonesIcon },
      { name: "Logs", href: "/admin/logs", icon: FileText },
      { name: "Team", href: "/admin/team", icon: UserCog },
    ],
  },
]

export function CommandDeckShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const { demoMode } = useAdminSession()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Initialize audio for a "ding" on new order events.
    audioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3")

    // In demo mode we skip realtime subscription.
    if (demoMode) return

    let supabase: ReturnType<typeof createBrowserClient> | null = null
    try {
      supabase = createBrowserClient()
    } catch {
      // If env vars are missing, don't crash the admin UI.
      // (This is common when running the UI as a static preview.)
      return
    }

    const channel = supabase
      .channel("orders-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, (payload) => {
        // Play ding sound
        audioRef.current?.play().catch(() => {
          // Audio play might fail until the user interacts with the page.
        })

        // Show toast
        const amount = (payload.new as any)?.total ?? 0
        toast({
          title: "New Order Received!",
          description: `৳${Number(amount).toLocaleString()} - Order has been placed`,
          className: "bg-cyan-500/20 border-cyan-500/40 text-cyan-400",
        })
      })
      .subscribe()

    return () => {
      if (supabase) supabase.removeChannel(channel)
    }
  }, [demoMode, toast])

  const handleLogout = async () => {
    if (demoMode) {
      localStorage.removeItem("adminDemoMode")
      localStorage.removeItem("adminEmail")
      router.push("/admin/login")
      return
    }

    const supabase = createBrowserClient()
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  return (
    <div className="min-h-screen bg-black flex">
      <Toaster />

      {/* Demo banner */}
      {demoMode && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-yellow-900/30 border-b border-yellow-700/50 px-4 py-2">
          <p className="text-sm text-yellow-200">
            <strong>Demo Mode:</strong> Running with sample data. Changes are not persisted.
          </p>
        </div>
      )}

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 glass-panel border-r border-cyan-500/20 flex flex-col z-50">
        <div className={cn("p-6 border-b border-cyan-500/20", demoMode && "pt-10")}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden border border-cyan-500/40 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
              <Image
                src="/logo.jpeg"
                alt="Manaf Mart Logo"
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="font-bold text-cyan-400 tracking-wider">MANAF MART</h1>
              <p className="text-xs text-gray-500 font-mono">COMMAND DECK</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {menuGroups.map((group) => (
            <div key={group.label}>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">{group.label}</h2>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                          isActive
                            ? "bg-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                            : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200",
                        )}
                      >
                        <item.icon
                          className={cn(
                            "w-5 h-5 transition-all",
                            isActive && "drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]",
                          )}
                        />
                        <span className="font-medium">{item.name}</span>
                        {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse-dot" />}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-cyan-500/20 space-y-3">
          <Link
            href="/"
            className="flex items-center gap-2 w-full px-3 py-2 bg-black/30 border border-cyan-500/20 text-gray-300 rounded-lg hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-colors"
          >
            <Store className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-semibold">Back to Store</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg hover:bg-red-500/20 hover:border-red-500/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-semibold">Logout</span>
          </button>

          <div className="glass-panel rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse-dot" />
              <span className="text-xs text-gray-400 font-mono">SYSTEM ACTIVE</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn("flex-1 ml-64 min-h-screen", demoMode && "pt-10")}>{children}</main>
    </div>
  )
}
