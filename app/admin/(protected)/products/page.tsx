"use client"

import { useEffect, useMemo, useState } from "react"
import { useAdminSession } from "@/components/admin/admin-session-context"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Loader, Plus, RefreshCw, Trash2, Pencil } from "lucide-react"

type Category = { id: string; name?: string; slug?: string }
type Subcategory = { id: string; name?: string; category_id?: string }

type Product = Record<string, any> & {
  id: string
  name?: string
  price?: number
  stock?: number
  image_url?: string | null
  category_id?: string | null
  subcategory_id?: string | null
  categories?: Category | null
  subcategories?: Subcategory | null
}

const demoProducts: Product[] = [
  {
    id: "demo-prod-1",
    name: "Elite Drop Headphones",
    price: 12999,
    stock: 42,
    category_id: "demo-cat-1",
    image_url: "https://images.unsplash.com/photo-1518441902117-f0a0d7d84d2a?w=800",
    is_elite_drop: true,
  },
  {
    id: "demo-prod-2",
    name: "Gaming Mouse Pro",
    price: 2499,
    stock: 120,
    category_id: "demo-cat-1",
    image_url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800",
  },
]


function money(v: any) {
  const n = Number(v)
  if (!Number.isFinite(n)) return "—"
  return `৳${n.toLocaleString()}`
}

export default function ProductsPage() {
  const { demoMode } = useAdminSession()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [q, setQ] = useState("")

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState<Record<string, any>>({
    name: "",
    description: "",
    price: "",
    stock: "",
    image_url: "",
    category_id: "",
    subcategory_id: "",
    is_elite_drop: false,
  })

  const filteredSubcats = useMemo(() => {
    const catId = form.category_id
    if (!catId) return subcategories
    return subcategories.filter((s) => (s as any).category_id === catId)
  }, [subcategories, form.category_id])

  async function loadAll() {
    setLoading(true)
    try {
      if (demoMode) {
        setProducts(demoProducts)
        setCategories([{ id: "demo-cat-1", name: "Electronics" }])
        setSubcategories([{ id: "demo-sub-1", name: "Audio", category_id: "demo-cat-1" }])
        return
      }

      const [pRes, cRes, sRes] = await Promise.all([
        fetch(`/api/admin/products?q=${encodeURIComponent(q)}`),
        fetch(`/api/admin/categories?limit=500`),
        fetch(`/api/admin/subcategories?limit=1000`),
      ])

      const pJson = await pRes.json()
      const cJson = await cRes.json()
      const sJson = await sRes.json()

      if (!pRes.ok) throw new Error(pJson.error || "Failed to load products")
      if (!cRes.ok) throw new Error(cJson.error || "Failed to load categories")
      if (!sRes.ok) throw new Error(sJson.error || "Failed to load subcategories")

      setProducts(pJson.data || [])
      setCategories(cJson.data || [])
      setSubcategories(sJson.data || [])
    } catch (e: any) {
      toast({
        title: "Could not load products",
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

  function resetForm() {
    setForm({
      name: "",
      description: "",
      price: "",
      stock: "",
      image_url: "",
      category_id: "",
      subcategory_id: "",
      is_elite_drop: false,
    })
    setEditing(null)
  }

  function startCreate() {
    resetForm()
    setOpen(true)
  }

  function startEdit(p: Product) {
    setEditing(p)
    setForm({
      name: p.name || "",
      description: (p as any).description || "",
      price: String((p as any).price ?? ""),
      stock: String((p as any).stock ?? ""),
      image_url: String((p as any).image_url ?? (p as any).image ?? ""),
      category_id: String((p as any).category_id ?? ""),
      subcategory_id: String((p as any).subcategory_id ?? ""),
      is_elite_drop: Boolean((p as any).is_elite_drop ?? false),
    })
    setOpen(true)
  }

  async function save() {
    setSaving(true)
    try {
      if (demoMode) {
        toast({
          title: "Demo mode",
          description: "Changes aren’t persisted in demo mode.",
          className: "bg-yellow-900/30 border-yellow-700/50 text-yellow-200",
        })
        setOpen(false)
        return
      }

      const payload: any = {
        name: form.name,
        description: form.description || null,
        image_url: form.image_url || null,
        category_id: form.category_id || null,
        subcategory_id: form.subcategory_id || null,
        is_elite_drop: !!form.is_elite_drop,
      }
      if (form.price !== "") payload.price = Number(form.price)
      if (form.stock !== "") payload.stock = Number(form.stock)

      const res = await fetch(editing ? `/api/admin/products/${editing.id}` : "/api/admin/products", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Save failed")

      toast({
        title: editing ? "Product updated" : "Product created",
        className: "bg-cyan-500/20 border-cyan-500/40 text-cyan-300",
      })
      setOpen(false)
      resetForm()
      await loadAll()
    } catch (e: any) {
      toast({
        title: "Save failed",
        description: e?.message || "Unknown error",
        className: "bg-red-500/20 border-red-500/40 text-red-300",
      })
    } finally {
      setSaving(false)
    }
  }

  async function remove(p: Product) {
    if (!confirm(`Delete product: ${p.name || p.id}?`)) return
    try {
      if (demoMode) return
      const res = await fetch(`/api/admin/products/${p.id}`, { method: "DELETE" })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Delete failed")
      toast({ title: "Deleted", className: "bg-cyan-500/20 border-cyan-500/40 text-cyan-300" })
      await loadAll()
    } catch (e: any) {
      toast({
        title: "Delete failed",
        description: e?.message || "Unknown error",
        className: "bg-red-500/20 border-red-500/40 text-red-300",
      })
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="glass-panel neon-border rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-100">Products</h1>
            <p className="text-gray-400 mt-2">Create, edit, and organize your product catalog.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => loadAll()} className="border-cyan-500/30 bg-black/30">
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
            <Button onClick={startCreate} className="bg-cyan-500/20 border border-cyan-500/40 text-cyan-200">
              <Plus className="w-4 h-4 mr-2" /> Add Product
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products by name..."
            className="bg-black/40 border-cyan-500/20 text-gray-200"
          />
        </div>
      </div>

      <div className="glass-panel neon-border rounded-2xl p-6 overflow-x-auto">
        {loading ? (
          <div className="flex items-center gap-2 text-gray-400">
            <Loader className="w-4 h-4 animate-spin" /> Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="text-gray-400">No products found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-cyan-500/20">
                <th className="text-left py-3">Product</th>
                <th className="text-left py-3">Category</th>
                <th className="text-left py-3">Price</th>
                <th className="text-left py-3">Stock</th>
                <th className="text-right py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-cyan-500/10 hover:bg-white/5">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-cyan-500/20 bg-black/40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={(p as any).image_url || (p as any).image || "https://placehold.co/80x80?text=%20"}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-100">{p.name || "(unnamed)"}</div>
                        {(p as any).is_elite_drop ? (
                          <div className="text-xs text-purple-300">Elite Drop</div>
                        ) : (
                          <div className="text-xs text-gray-500">ID: {p.id.slice(0, 8)}…</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-gray-300">
                    {(p as any).categories?.name || categories.find((c) => c.id === (p as any).category_id)?.name || "—"}
                  </td>
                  <td className="py-3 text-gray-300">{money((p as any).price)}</td>
                  <td className="py-3 text-gray-300">{Number((p as any).stock ?? 0)}</td>
                  <td className="py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(p)}
                        className="border-cyan-500/30 bg-black/30"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => remove(p)}
                        className="border-red-500/30 bg-black/30 text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : (setOpen(false), resetForm()))}>
        <DialogContent className="bg-black border border-cyan-500/30 text-gray-200">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Product" : "Create Product"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                className="bg-black/40 border-cyan-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price</Label>
                <Input
                  value={form.price}
                  onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))}
                  type="number"
                  className="bg-black/40 border-cyan-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label>Stock</Label>
                <Input
                  value={form.stock}
                  onChange={(e) => setForm((s) => ({ ...s, stock: e.target.value }))}
                  type="number"
                  className="bg-black/40 border-cyan-500/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                value={form.image_url}
                onChange={(e) => setForm((s) => ({ ...s, image_url: e.target.value }))}
                className="bg-black/40 border-cyan-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category_id} onValueChange={(v) => setForm((s) => ({ ...s, category_id: v, subcategory_id: "" }))}>
                  <SelectTrigger className="bg-black/40 border-cyan-500/20">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border border-cyan-500/30">
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name || c.slug || c.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subcategory</Label>
                <Select value={form.subcategory_id} onValueChange={(v) => setForm((s) => ({ ...s, subcategory_id: v }))}>
                  <SelectTrigger className="bg-black/40 border-cyan-500/20">
                    <SelectValue placeholder="(optional)" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border border-cyan-500/30">
                    <SelectItem value="">None</SelectItem>
                    {filteredSubcats.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name || s.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                checked={!!form.is_elite_drop}
                onCheckedChange={(v) => setForm((s) => ({ ...s, is_elite_drop: v === true }))}
              />
              <span className="text-sm text-gray-300">Elite Drop</span>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                className="bg-black/40 border-cyan-500/20 min-h-[100px]"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" className="border-cyan-500/30 bg-black/30" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={save} disabled={saving || !form.name} className="bg-cyan-500/20 border border-cyan-500/40 text-cyan-200">
                {saving ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
