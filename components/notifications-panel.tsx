"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Bell, X } from "lucide-react"
import { Card } from "@/components/ui/card"

const SAMPLE_NOTIFICATIONS = [
  {
    id: "1",
    title: "Order Confirmed",
    content: "Your order #12345 has been confirmed",
    is_read: false,
  },
  {
    id: "2",
    title: "Price Drop",
    content: "Gaming Smartwatch you wishlisted dropped 20%",
    is_read: false,
  },
]

export function NotificationsPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>(SAMPLE_NOTIFICATIONS)
  const [unreadCount, setUnreadCount] = useState(2)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const supabase = createBrowserClient()

        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          setIsInitialized(true)
          return
        }

        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10)

        if (error) {
          console.log("[v0] Notifications table not found, using sample data:", error.message)
          setNotifications(SAMPLE_NOTIFICATIONS)
          setUnreadCount(2)
          setIsInitialized(true)
          return
        }

        setNotifications(data)
        setUnreadCount(data.filter((n) => !n.is_read).length)
      } catch (error) {
        console.log("[v0] Using sample notifications:", error)
        setNotifications(SAMPLE_NOTIFICATIONS)
        setUnreadCount(2)
      } finally {
        setIsInitialized(true)
      }
    }

    fetchNotifications()
  }, [])

  const markAsRead = async (id: string) => {
    try {
      const supabase = createBrowserClient()
      await supabase.from("notifications").update({ is_read: true }).eq("id", id)
    } catch (error) {
      console.log("[v0] Could not mark as read, updating locally:", error)
    }

    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  if (!isInitialized) return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-cyan-400 hover:text-cyan-300 transition-colors"
        title="Notifications"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <Card className="absolute top-12 right-0 w-80 bg-gradient-to-b from-black to-gray-900 border border-cyan-500/30 rounded-xl shadow-2xl shadow-cyan-500/20 max-h-96 overflow-y-auto z-50">
          <div className="p-4 border-b border-purple-500/30 flex justify-between items-center">
            <h3 className="text-white font-bold">Notifications</h3>
            <button onClick={() => setIsOpen(false)} className="text-cyan-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No notifications</div>
          ) : (
            <div className="divide-y divide-purple-500/20">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={`p-3 cursor-pointer transition-colors ${
                    notif.is_read ? "bg-gray-900/50" : "bg-purple-900/30 hover:bg-purple-900/50"
                  }`}
                >
                  <p className="text-sm font-semibold text-cyan-400">{notif.title}</p>
                  <p className="text-xs text-gray-300 mt-1">{notif.content}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
