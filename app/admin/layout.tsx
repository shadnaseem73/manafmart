import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Manaf Mart Admin",
  description: "Admin portal for Manaf Mart",
}

// Note: Root /app/layout.tsx already defines <html> and <body>.
// This segment layout should only wrap children.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
