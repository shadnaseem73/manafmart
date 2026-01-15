"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createBrowserClient } from "@/lib/supabase/client"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useToast } from "@/hooks/use-toast"
import { Loader, ChevronRight } from "lucide-react"

type Category = Record<string, any> & { id: string; name?: string; description?: string }

export default function CategoriesPage() {
  const supabase = createBrowserClient()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .order("display_order", { ascending: true })
          .limit(200)
        if (error) throw error
        setCategories(data || [])
      } catch (e: any) {
        toast({
          title: "Could not load categories",
          description: e?.message || "Unknown error",
          className: "bg-red-500/20 border-red-500/40 text-red-300",
        })
      } finally {
        setLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="glass-panel neon-border rounded-2xl p-6">
          <h1 className="text-3xl font-bold text-gray-100">Categories</h1>
          <p className="text-gray-400 mt-2">Browse categories and jump into the shop filtered by category.</p>
        </div>

        <div className="glass-panel neon-border rounded-2xl p-6">
          {loading ? (
            <div className="flex items-center gap-2 text-gray-400">
              <Loader className="w-4 h-4 animate-spin" /> Loading categories...
            </div>
          ) : categories.length === 0 ? (
            <div className="text-gray-400">No categories found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/shop?category_id=${encodeURIComponent(c.id)}`}
                  className="group rounded-2xl border border-cyan-500/20 bg-black/30 p-4 hover:border-cyan-500/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-gray-100">{c.name || "(unnamed)"}</div>
                      {c.description ? <div className="text-sm text-gray-400 mt-1 line-clamp-2">{c.description}</div> : null}
                    </div>
                    <ChevronRight className="w-5 h-5 text-cyan-300 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  )
}
