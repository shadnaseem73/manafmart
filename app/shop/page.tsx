"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader, ShoppingCart } from "lucide-react"

type Category = { id: string; name?: string; slug?: string }
type Product = Record<string, any> & { id: string; name?: string; price?: number }

function money(v: any) {
  const n = Number(v)
  if (!Number.isFinite(n)) return "—"
  return `৳${n.toLocaleString()}`
}

export default function ShopPage() {
  const router = useRouter()
  const params = useSearchParams()
  const supabase = createBrowserClient()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState<Record<string, boolean>>({})
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [q, setQ] = useState("")
  const [categoryId, setCategoryId] = useState<string>(params.get("category_id") || "all")

  useEffect(() => {
    // keep state in sync if user navigates with query params
    setCategoryId(params.get("category_id") || "all")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  async function load() {
    setLoading(true)
    try {
      const [catRes, prodRes] = await Promise.all([
        supabase.from("categories").select("id,name,slug").order("display_order", { ascending: true }),
        supabase.from("products").select("*").order("updated_at", { ascending: false }).limit(200),
      ])

      if (catRes.error) throw catRes.error
      if (prodRes.error) throw prodRes.error

      setCategories(catRes.data || [])
      setProducts(prodRes.data || [])
    } catch (e: any) {
      toast({
        title: "Could not load shop",
        description: e?.message || "Unknown error",
        className: "bg-red-500/20 border-red-500/40 text-red-300",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase()
    return products.filter((p) => {
      const matchesCat = categoryId === "all" ? true : String((p as any).category_id) === String(categoryId)
      if (!matchesCat) return false
      if (!term) return true
      return JSON.stringify(p).toLowerCase().includes(term)
    })
  }, [products, q, categoryId])

  async function addToCart(product: Product) {
    setAdding((s) => ({ ...s, [product.id]: true }))
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      const price = Number((product as any).price ?? 0)
      // if item exists -> increment
      const existing = await supabase
        .from("cart_items")
        .select("id,quantity")
        .eq("cart_id", user.id)
        .eq("product_id", product.id)
        .maybeSingle()

      if (existing.error) throw existing.error

      if (existing.data?.id) {
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: Number(existing.data.quantity ?? 0) + 1 })
          .eq("id", existing.data.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("cart_items").insert([
          {
            cart_id: user.id,
            product_id: product.id,
            quantity: 1,
            price_at_add: Number.isFinite(price) ? price : 0,
          },
        ])
        if (error) throw error
      }

      toast({ title: "Added to cart", className: "bg-cyan-500/20 border-cyan-500/40 text-cyan-300" })
    } catch (e: any) {
      toast({
        title: "Could not add to cart",
        description: e?.message || "Unknown error",
        className: "bg-red-500/20 border-red-500/40 text-red-300",
      })
    } finally {
      setAdding((s) => ({ ...s, [product.id]: false }))
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="glass-panel neon-border rounded-2xl p-6 flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-100">Shop</h1>
            <p className="text-gray-400 mt-2">Browse products and add them to your cart.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products..."
              className="bg-black/40 border-cyan-500/20 text-gray-200"
            />
            <Select
              value={categoryId}
              onValueChange={(v) => {
                setCategoryId(v)
                const url = v === "all" ? "/shop" : `/shop?category_id=${encodeURIComponent(v)}`
                router.push(url)
              }}
            >
              <SelectTrigger className="w-[240px] bg-black/40 border-cyan-500/20">
                <SelectValue placeholder="Filter category" />
              </SelectTrigger>
              <SelectContent className="bg-black border border-cyan-500/30">
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name || c.slug || c.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="glass-panel neon-border rounded-2xl p-6">
          {loading ? (
            <div className="flex items-center gap-2 text-gray-400">
              <Loader className="w-4 h-4 animate-spin" /> Loading products...
            </div>
          ) : visible.length === 0 ? (
            <div className="text-gray-400">No products found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visible.map((p) => {
                const img = (p as any).image_url || (p as any).image || "https://placehold.co/800x800?text=%20"
                return (
                  <div key={p.id} className="rounded-2xl overflow-hidden border border-cyan-500/20 bg-black/30">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={p.name || ""} className="w-full h-52 object-cover" />
                    <div className="p-4 space-y-2">
                      <div className="font-semibold text-gray-100 line-clamp-2">{p.name || "(unnamed)"}</div>
                      <div className="text-cyan-300 font-bold">{money((p as any).price)}</div>
                      <Button
                        className="w-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-200"
                        onClick={() => addToCart(p)}
                        disabled={!!adding[p.id]}
                      >
                        {adding[p.id] ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <ShoppingCart className="w-4 h-4 mr-2" />}
                        Add to cart
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  )
}
