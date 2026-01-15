"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      try {
        const supabase = createBrowserClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user || null)
      } catch (error) {
        console.log("[v0] Auth check failed, using guest mode")
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [])

  return { user, loading }
}
