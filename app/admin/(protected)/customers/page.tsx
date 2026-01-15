"use client"

import { useEffect, useMemo, useState } from "react"
import { useAdminSession } from "@/components/admin/admin-session-context"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Loader, RefreshCw, Eye } from "lucide-react"

type Customer = Record<string, any> & { id: string }


function pickName(c: any) {
  return c?.full_name || c?.name || c?.display_name || c?.username || "(unknown)"
}

function pickEmail(c: any) {
  return c?.email || c?.user_email || c?.contact_email || "—"
}

function pickPhone(c: any) {
  return c?.phone || c?.phone_number || c?.mobile || "—"
}

export default function CustomersPage() {
  const { demoMode } = useAdminSession()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState("")
  const [customers, setCustomers] = useState<Customer[]>([])
  const [detail, setDetail] = useState<Customer | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  async function loadAll() {
    setLoading(true)
    try {
      if (demoMode) {
        setCustomers([
          {
            id: "demo-user-1",
            full_name: "Demo Customer",
            email: "demo@manafmart.com",
            phone: "+8801XXXXXXXXX",
            order_count: 3,
            created_at: new Date().toISOString(),
          },
        ])
        return
      }

      const res = await fetch(`/api/admin/customers?limit=300&withOrderCounts=1&q=${encodeURIComponent(q)}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to load customers")
      setCustomers(json.data || [])
    } catch (e: any) {
      toast({
        title: "Load failed",
        description: e?.message || "Unknown error",
        className: "bg-red-500/20 border-red-500/40 text-red-300",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!demoMode) {
      const t = setTimeout(() => loadAll(), 350)
      return () => clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  const sorted = useMemo(() => {
    return [...customers].sort((a, b) => {
      const ca = Date.parse(String(a.created_at || "")) || 0
      const cb = Date.parse(String(b.created_at || "")) || 0
      return cb - ca
    })
  }, [customers])

  return (
    <div className="p-8 space-y-6">
      <div className="glass-panel neon-border rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-100">Customers</h1>
            <p className="text-gray-400 mt-2">Search customer profiles and view order counts.</p>
          </div>
          <Button variant="outline" onClick={() => loadAll()} className="border-cyan-500/30 bg-black/30">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>

        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name / email / phone / id..."
          className="bg-black/40 border-cyan-500/20 text-gray-200"
        />
      </div>

      <div className="glass-panel neon-border rounded-2xl p-6 overflow-x-auto">
        {loading ? (
          <div className="flex items-center gap-2 text-gray-400">
            <Loader className="w-4 h-4 animate-spin" /> Loading customers...
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-gray-400">No customers found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-cyan-500/20">
                <th className="text-left py-3">Customer</th>
                <th className="text-left py-3">Email</th>
                <th className="text-left py-3">Phone</th>
                <th className="text-left py-3">Orders</th>
                <th className="text-left py-3">Created</th>
                <th className="text-right py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((c) => (
                <tr key={c.id} className="border-b border-cyan-500/10 hover:bg-white/5">
                  <td className="py-3">
                    <div>
                      <div className="font-semibold text-gray-100">{pickName(c)}</div>
                      <div className="text-xs text-gray-500">ID: {String(c.id).slice(0, 8)}…</div>
                    </div>
                  </td>
                  <td className="py-3 text-gray-300">{pickEmail(c)}</td>
                  <td className="py-3 text-gray-300">{pickPhone(c)}</td>
                  <td className="py-3 text-gray-300">{Number((c as any).order_count ?? 0)}</td>
                  <td className="py-3 text-gray-300">{String((c as any).created_at || "—").replace("T", " ").slice(0, 19)}</td>
                  <td className="py-3">
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-cyan-500/30 bg-black/30"
                        onClick={() => {
                          setDetail(c)
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
        <DialogContent className="bg-black border border-cyan-500/30 text-gray-200 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {!detail ? (
            <div className="text-gray-400">No customer selected.</div>
          ) : (
            <pre className="text-xs bg-black/30 border border-cyan-500/10 rounded-lg p-4 overflow-auto max-h-[60vh]">
              {JSON.stringify(detail, null, 2)}
            </pre>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
