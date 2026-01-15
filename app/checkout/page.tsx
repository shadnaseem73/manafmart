"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader, ArrowRight } from "lucide-react"

type CartItem = { id: string; product_id: string; quantity: number; price_at_add: number }

function money(v: any) {
  const n = Number(v)
  if (!Number.isFinite(n)) return "—"
  return `৳${n.toLocaleString()}`
}

export default function CheckoutPage() {
  const router = useRouter()
  const supabase = createBrowserClient()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [items, setItems] = useState<CartItem[]>([])
  const [products, setProducts] = useState<Record<string, any>>({})

  const [paymentMethod, setPaymentMethod] = useState<string>("cod")
  const [address, setAddress] = useState<string>("")
  const [phone, setPhone] = useState<string>("")
  const [note, setNote] = useState<string>("")

  const total = useMemo(() => items.reduce((sum, it) => sum + Number(it.price_at_add ?? 0) * Number(it.quantity ?? 0), 0), [items])

  async function load() {
    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data: cartData, error: cartError } = await supabase.from("cart_items").select("*").eq("cart_id", user.id)
      if (cartError) throw cartError
      const list = (cartData || []) as any[]
      setItems(list)

      if (list.length > 0) {
        const productIds = list.map((i) => i.product_id)
        const { data: productData, error: prodErr } = await supabase.from("products").select("*").in("id", productIds)
        if (prodErr) throw prodErr
        const map: Record<string, any> = {}
        ;(productData || []).forEach((p: any) => {
          map[p.id] = p
        })
        setProducts(map)
      }
    } catch (e: any) {
      toast({ title: "Checkout failed to load", description: e?.message || "Unknown error", className: "bg-red-500/20 border-red-500/40 text-red-300" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function placeOrder() {
    if (!address.trim()) {
      toast({ title: "Address required", description: "Please enter a shipping address.", className: "bg-yellow-900/30 border-yellow-700/50 text-yellow-200" })
      return
    }
    setPlacing(true)
    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_method: paymentMethod,
          shipping_address: {
            address,
            phone: phone || null,
            note: note || null,
          },
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Order failed")

      toast({ title: "Order placed", description: `Order #${String(json.order?.id || "").slice(0, 8)} created.`, className: "bg-cyan-500/20 border-cyan-500/40 text-cyan-300" })
      router.push("/orders")
    } catch (e: any) {
      toast({ title: "Order failed", description: e?.message || "Unknown error", className: "bg-red-500/20 border-red-500/40 text-red-300" })
    } finally {
      setPlacing(false)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="glass-panel neon-border rounded-2xl p-6">
          <h1 className="text-3xl font-bold text-gray-100">Checkout</h1>
          <p className="text-gray-400 mt-2">Confirm your details and place the order.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-panel neon-border rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-100">Shipping</h2>
            <Textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full address" className="bg-black/40 border-cyan-500/20 text-gray-200 min-h-[110px]" />
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (optional)" className="bg-black/40 border-cyan-500/20 text-gray-200" />
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Delivery note (optional)" className="bg-black/40 border-cyan-500/20 text-gray-200" />

            <h2 className="text-xl font-bold text-gray-100 pt-2">Payment</h2>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="bg-black/40 border-cyan-500/20">
                <SelectValue placeholder="Select payment" />
              </SelectTrigger>
              <SelectContent className="bg-black border border-cyan-500/30">
                <SelectItem value="cod">Cash on delivery</SelectItem>
                <SelectItem value="bkash">bKash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="glass-panel neon-border rounded-2xl p-6 h-fit">
            <h2 className="text-xl font-bold text-gray-100 mb-4">Order Summary</h2>
            {loading ? (
              <div className="flex items-center gap-2 text-gray-400">
                <Loader className="w-4 h-4 animate-spin" /> Loading...
              </div>
            ) : items.length === 0 ? (
              <div className="text-gray-400">Your cart is empty.</div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  {items.map((it) => {
                    const p = products[it.product_id]
                    return (
                      <div key={it.id} className="flex justify-between gap-3 text-sm">
                        <div className="text-gray-300 line-clamp-1">{p?.name || String(it.product_id).slice(0, 8)}…</div>
                        <div className="text-gray-300">{it.quantity} × {money(it.price_at_add)}</div>
                      </div>
                    )
                  })}
                </div>

                <div className="border-t border-cyan-500/20 pt-3 flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-cyan-300">{money(total)}</span>
                </div>

                <Button onClick={placeOrder} disabled={placing || items.length === 0} className="w-full bg-gradient-to-r from-cyan-500 to-purple-600">
                  {placing ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <ArrowRight className="w-4 h-4 mr-2" />}
                  Place Order
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
