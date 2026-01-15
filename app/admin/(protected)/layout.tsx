import type React from "react"
import { createServerClient } from "@/lib/supabase/server"
import { AdminGate } from "@/components/admin/admin-gate"

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // IMPORTANT: do NOT redirect here.
  // We allow "demo mode" (localStorage) to unlock the dashboard client-side.
  return <AdminGate user={user}>{children}</AdminGate>
}
