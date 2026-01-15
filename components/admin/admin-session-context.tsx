"use client"

import * as React from "react"

export type AdminSession = {
  userId: string
  demoMode: boolean
}

const AdminSessionContext = React.createContext<AdminSession | null>(null)

export function AdminSessionProvider({
  value,
  children,
}: {
  value: AdminSession
  children: React.ReactNode
}) {
  return <AdminSessionContext.Provider value={value}>{children}</AdminSessionContext.Provider>
}

export function useAdminSession() {
  const ctx = React.useContext(AdminSessionContext)
  if (!ctx) {
    throw new Error("useAdminSession must be used within AdminSessionProvider")
  }
  return ctx
}
