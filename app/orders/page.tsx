"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader, Eye, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type Order = Record<string, any> & { id: string }

function money(v: any) {
  const n = Number(v)
  if (!Number.isFinite(n)) return "—"
  return `৳${n.toLocaleString()}`
}

function status(o: any) {
  return String(o?.order_status ?? o?.status ?? "pending")
}

export default function CustomerOrdersPage() {
  const router = useRouter()
  const supabase = createBrowserClient()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [detail, setDetail] = useState<Order | null>(null)
  const [open, setOpen] = useState(false)

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

      // Prefer related items if FK relation exists.
      let { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100)

      if (error) {
        ;({ data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(100))
      }

      if (error) throw error
      setOrders((data as any[]) || [])
    } catch (e: any) {
      toast({ title: "Could not load orders", description: e?.message || "Unknown error", className: "bg-red-500/20 border-red-500/40 text-red-300" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="glass-panel neon-border rounded-2xl p-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-100">My Orders</h1>
            <p className="text-gray-400 mt-2">Your recent purchases and their statuses.</p>
          </div>
          <Button variant="outline" onClick={() => load()} className="border-cyan-500/30 bg-black/30">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>

        <div className="glass-panel neon-border rounded-2xl p-6 overflow-x-auto">
          {loading ? (
            <div className="flex items-center gap-2 text-gray-400">
              <Loader className="w-4 h-4 animate-spin" /> Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="text-gray-400">No orders found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-cyan-500/20">
                  <th className="text-left py-3">Order</th>
                  <th className="text-left py-3">Date</th>
                  <th className="text-left py-3">Total</th>
                  <th className="text-left py-3">Status</th>
                  <th className="text-right py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-cyan-500/10 hover:bg-white/5">
                    <td className="py-3">
                      <div className="font-semibold text-gray-100">{String(o.id).slice(0, 8)}…</div>
                      <div className="text-xs text-gray-500">#{o.id}</div>
                    </td>
                    <td className="py-3 text-gray-300">{String((o as any).created_at || "").replace("T", " ").slice(0, 19) || "—"}</td>
                    <td className="py-3 text-gray-300">{money((o as any).total_amount ?? (o as any).total ?? 0)}</td>
                    <td className="py-3 text-gray-300">{status(o)}</td>
                    <td className="py-3">
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-cyan-500/30 bg-black/30"
                          onClick={() => {
                            setDetail(o)
                            setOpen(true)
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-black border border-cyan-500/30 text-gray-200 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {!detail ? (
            <div className="text-gray-400">No order selected.</div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm text-gray-300">
                <div>
                  <span className="text-gray-500">Order:</span> {detail.id}
                </div>
                <div>
                  <span className="text-gray-500">Status:</span> {status(detail)}
                </div>
                <div>
                  <span className="text-gray-500">Total:</span> {money((detail as any).total_amount ?? (detail as any).total ?? 0)}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-100 mb-2">Items</h3>
                {Array.isArray((detail as any).order_items) && (detail as any).order_items.length > 0 ? (
                  <div className="space-y-2">
                    {(detail as any).order_items.map((it: any) => (
                      <div key={it.id} className="flex justify-between p-3 rounded-lg bg-black/30 border border-cyan-500/10">
                        <div className="text-sm">
                          <div className="font-semibold text-gray-100">Product: {String(it.product_id).slice(0, 8)}…</div>
                          <div className="text-gray-400">Qty: {it.quantity ?? it.qty ?? 1}</div>
                        </div>
                        <div className="text-sm text-gray-300">{money(it.unit_price ?? it.price ?? 0)}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-400">No order items available.</div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  )
}
