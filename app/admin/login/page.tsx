import { AdminLoginForm } from "@/components/admin/admin-login-form"
import { redirect } from "next/navigation"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export const metadata = {
  title: "Admin Login - Manaf Mart",
  description: "Master Switchboard authentication",
}

export default async function AdminLoginPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/admin")
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <AdminLoginForm />
    </main>
  )
}
