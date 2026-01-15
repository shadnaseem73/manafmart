"use client"

import { useEffect, useMemo, useState } from "react"
import { useAdminSession } from "@/components/admin/admin-session-context"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Loader, RefreshCw, Eye, Save } from "lucide-react"

type Order = Record<string, any> & { id: string }


const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"]

function orderTotal(o: any) {
  const v = o?.total_amount ?? o?.total ?? o?.amount ?? 0
  const n = Number(v)
  if (!Number.isFinite(n)) return "—"
  return `৳${n.toLocaleString()}`
}

function orderStatus(o: any) {
  return (o?.order_status ?? o?.status ?? "pending") as string
}

export default function OrdersPage() {
  const { demoMode } = useAdminSession()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({})
  const [bulkStatus, setBulkStatus] = useState<string>("")
  const [q, setQ] = useState("")

  const [detailOpen, setDetailOpen] = useState(false)
  const [detail, setDetail] = useState<Order | null>(null)
  const [saving, setSaving] = useState(false)

  const selectedList = useMemo(() => Object.keys(selectedIds).filter((id) => selectedIds[id]), [selectedIds])

  async function loadAll() {
    setLoading(true)
    try {
      if (demoMode) {
        const demo: Order[] = [
          {
            id: "demo-order-1",
            created_at: new Date().toISOString(),
            user_id: "demo-user-1",
            total: 15998,
            status: "pending",
            order_items: [
              { id: "oi-1", product_id: "demo-prod-1", quantity: 1, unit_price: 12999 },
              { id: "oi-2", product_id: "demo-prod-2", quantity: 1, unit_price: 2999 },
            ],
          },
        ]
        setOrders(demo)
        return
      }

      const res = await fetch(`/api/admin/orders?limit=200`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to load orders")
      setOrders(json.data || [])
    } catch (e: any) {
      toast({ title: "Load failed", description: e?.message || "Unknown error", className: "bg-red-500/20 border-red-500/40 text-red-300" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const visibleOrders = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return orders
    return orders.filter((o) => {
      const id = String(o.id || "").toLowerCase()
      const uid = String((o as any).user_id || "").toLowerCase()
      const st = orderStatus(o).toLowerCase()
      return id.includes(term) || uid.includes(term) || st.includes(term)
    })
  }, [orders, q])

  function toggleAll(v: boolean) {
    const next: Record<string, boolean> = {}
    visibleOrders.forEach((o) => (next[o.id] = v))
    setSelectedIds(next)
  }

  async function saveBulk() {
    if (selectedList.length === 0 || !bulkStatus) return
    setSaving(true)
    try {
      if (demoMode) {
        toast({ title: "Demo mode", description: "Changes aren’t persisted.", className: "bg-yellow-900/30 border-yellow-700/50 text-yellow-200" })
        return
      }

      const payload: any = { ids: selectedList }
      // Write both fields for schema variants.
      payload.status = bulkStatus
      payload.order_status = bulkStatus

      const res = await fetch("/api/admin/orders/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Bulk update failed")

      toast({ title: "Orders updated", className: "bg-cyan-500/20 border-cyan-500/40 text-cyan-300" })
      setSelectedIds({})
      setBulkStatus("")
      await loadAll()
    } catch (e: any) {
      toast({ title: "Bulk update failed", description: e?.message || "Unknown error", className: "bg-red-500/20 border-red-500/40 text-red-300" })
    } finally {
      setSaving(false)
    }
  }

  async function updateSingle(order: Order, newStatus: string) {
    setSaving(true)
    try {
      if (demoMode) return
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, order_status: newStatus }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Update failed")
      toast({ title: "Order updated", className: "bg-cyan-500/20 border-cyan-500/40 text-cyan-300" })
      await loadAll()
    } catch (e: any) {
      toast({ title: "Update failed", description: e?.message || "Unknown error", className: "bg-red-500/20 border-red-500/40 text-red-300" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="glass-panel neon-border rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-100">Orders</h1>
            <p className="text-gray-400 mt-2">Track orders, view items, and update fulfillment status.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => loadAll()} className="border-cyan-500/30 bg-black/30">
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by order id / user id / status..." className="bg-black/40 border-cyan-500/20 text-gray-200" />

          <div className="flex items-center gap-2">
            <Select value={bulkStatus} onValueChange={setBulkStatus}>
              <SelectTrigger className="w-[200px] bg-black/40 border-cyan-500/20">
                <SelectValue placeholder="Bulk status..." />
              </SelectTrigger>
              <SelectContent className="bg-black border border-cyan-500/30">
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={saveBulk} disabled={saving || selectedList.length === 0 || !bulkStatus} className="bg-cyan-500/20 border border-cyan-500/40 text-cyan-200">
              {saving ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Apply ({selectedList.length})
            </Button>
          </div>
        </div>
      </div>

      <div className="glass-panel neon-border rounded-2xl p-6 overflow-x-auto">
        {loading ? (
          <div className="flex items-center gap-2 text-gray-400">
            <Loader className="w-4 h-4 animate-spin" /> Loading orders...
          </div>
        ) : visibleOrders.length === 0 ? (
          <div className="text-gray-400">No orders found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-cyan-500/20">
                <th className="text-left py-3">
                  <div className="flex items-center gap-2">
                    <Checkbox checked={selectedList.length === visibleOrders.length} onCheckedChange={(v) => toggleAll(v === true)} />
                    <span>Order</span>
                  </div>
                </th>
                <th className="text-left py-3">User</th>
                <th className="text-left py-3">Total</th>
                <th className="text-left py-3">Status</th>
                <th className="text-right py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleOrders.map((o) => (
                <tr key={o.id} className="border-b border-cyan-500/10 hover:bg-white/5">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <Checkbox checked={!!selectedIds[o.id]} onCheckedChange={(v) => setSelectedIds((s) => ({ ...s, [o.id]: v === true }))} />
                      <div>
                        <div className="font-semibold text-gray-100">{o.id.slice(0, 8)}…</div>
                        <div className="text-xs text-gray-500">{String((o as any).created_at || "").replace("T", " ").slice(0, 19)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-gray-300">{String((o as any).user_id || "—").slice(0, 8)}…</td>
                  <td className="py-3 text-gray-300">{orderTotal(o)}</td>
                  <td className="py-3">
                    <Select value={orderStatus(o)} onValueChange={(v) => updateSingle(o, v)}>
                      <SelectTrigger className="w-[180px] bg-black/40 border-cyan-500/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black border border-cyan-500/30">
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-3">
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-cyan-500/30 bg-black/30"
                        onClick={() => {
                          setDetail(o)
                          setDetailOpen(true)
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

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="bg-black border border-cyan-500/30 text-gray-200">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {!detail ? (
            <div className="text-gray-400">No order selected.</div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-gray-300">
                <div>
                  <span className="text-gray-500">Order:</span> {detail.id}
                </div>
                <div>
                  <span className="text-gray-500">User:</span> {(detail as any).user_id}
                </div>
                <div>
                  <span className="text-gray-500">Status:</span> {orderStatus(detail)}
                </div>
                <div>
                  <span className="text-gray-500">Total:</span> {orderTotal(detail)}
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
                        <div className="text-sm text-gray-300">
                          {`৳${Number(it.unit_price ?? it.price ?? 0).toLocaleString()}`}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm">No order items attached (or relationship not loaded).</div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
