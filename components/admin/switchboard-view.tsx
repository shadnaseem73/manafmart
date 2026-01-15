"use client"

import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { useAdminSession } from "@/components/admin/admin-session-context"

export function SwitchboardView() {
  const { userId, demoMode } = useAdminSession()
  return <AdminDashboard userId={userId} demoMode={demoMode} showHeader={false} />
}
