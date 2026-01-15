"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { LoginModal } from "@/components/login-modal"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://your-supabase-url.supabase.co"
const supabaseKey = "your-supabase-key"
const supabase = createClient(supabaseUrl, supabaseKey)

export default function LoginPage() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(true)

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      router.back()
    }
  }

  return (
    <main className="min-h-screen bg-black">
      <LoginModal open={isOpen} onOpenChange={handleOpenChange} />
    </main>
  )
}
