"use client"

import { useEffect, useMemo, useState } from "react"
import { useAdminSession } from "@/components/admin/admin-session-context"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Loader, Plus, RefreshCw, Trash2, Pencil, ArrowRight } from "lucide-react"

type Category = Record<string, any> & { id: string; name?: string; is_hidden?: boolean }
type Subcategory = Record<string, any> & { id: string; category_id?: string; name?: string }


export default function CategoriesPage() {
  const { demoMode } = useAdminSession()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)

  const [catModalOpen, setCatModalOpen] = useState(false)
  const [catSaving, setCatSaving] = useState(false)
  const [catEditing, setCatEditing] = useState<Category | null>(null)
  const [catForm, setCatForm] = useState({ name: "", description: "", icon: "", display_order: "", is_hidden: false })

  const [subModalOpen, setSubModalOpen] = useState(false)
  const [subSaving, setSubSaving] = useState(false)
  const [subEditing, setSubEditing] = useState<Subcategory | null>(null)
  const [subForm, setSubForm] = useState({ name: "", description: "", display_order: "" })

  const selected = useMemo(() => categories.find((c) => c.id === selectedCategoryId) || null, [categories, selectedCategoryId])
  const selectedSubs = useMemo(
    () => subcategories.filter((s) => String((s as any).category_id) === String(selectedCategoryId)),
    [subcategories, selectedCategoryId],
  )

  async function loadAll() {
    setLoading(true)
    try {
      if (demoMode) {
        const demoCats = [
          { id: "demo-cat-1", name: "Electronics", description: "Gadgets and devices", is_hidden: false },
          { id: "demo-cat-2", name: "Fashion", description: "Clothing & accessories", is_hidden: true },
        ]
        const demoSubs = [
          { id: "demo-sub-1", category_id: "demo-cat-1", name: "Audio" },
          { id: "demo-sub-2", category_id: "demo-cat-1", name: "Gaming" },
        ]
        setCategories(demoCats as any)
        setSubcategories(demoSubs as any)
        setSelectedCategoryId((prev) => prev || demoCats[0].id)
        return
      }

      const [cRes, sRes] = await Promise.all([
        fetch(`/api/admin/categories?limit=500&q=${encodeURIComponent(q)}`),
        fetch(`/api/admin/subcategories?limit=2000`),
      ])
      const cJson = await cRes.json()
      const sJson = await sRes.json()
      if (!cRes.ok) throw new Error(cJson.error || "Failed to load categories")
      if (!sRes.ok) throw new Error(sJson.error || "Failed to load subcategories")
      setCategories(cJson.data || [])
      setSubcategories(sJson.data || [])
      setSelectedCategoryId((prev) => prev || (cJson.data?.[0]?.id ?? null))
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

  function openCreateCategory() {
    setCatEditing(null)
    setCatForm({ name: "", description: "", icon: "", display_order: "", is_hidden: false })
    setCatModalOpen(true)
  }

  function openEditCategory(c: Category) {
    setCatEditing(c)
    setCatForm({
      name: c.name || "",
      description: (c as any).description || "",
      icon: String((c as any).icon ?? (c as any).icon_url ?? ""),
      display_order: String((c as any).display_order ?? ""),
      is_hidden: Boolean((c as any).is_hidden ?? false),
    })
    setCatModalOpen(true)
  }

  async function saveCategory() {
    setCatSaving(true)
    try {
      if (demoMode) {
        toast({ title: "Demo mode", description: "Changes aren’t persisted.", className: "bg-yellow-900/30 border-yellow-700/50 text-yellow-200" })
        setCatModalOpen(false)
        return
      }
      const payload: any = {
        name: catForm.name,
        description: catForm.description || null,
        icon: catForm.icon || null,
        is_hidden: !!catForm.is_hidden,
      }
      if (catForm.display_order !== "") payload.display_order = Number(catForm.display_order)

      const res = await fetch(catEditing ? `/api/admin/categories/${catEditing.id}` : "/api/admin/categories", {
        method: catEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Save failed")
      toast({ title: catEditing ? "Category updated" : "Category created", className: "bg-cyan-500/20 border-cyan-500/40 text-cyan-300" })
      setCatModalOpen(false)
      await loadAll()
    } catch (e: any) {
      toast({ title: "Save failed", description: e?.message || "Unknown error", className: "bg-red-500/20 border-red-500/40 text-red-300" })
    } finally {
      setCatSaving(false)
    }
  }

  async function deleteCategory(c: Category) {
    if (!confirm(`Delete category: ${c.name || c.id}?\n\nThis may also delete linked subcategories/products depending on your DB constraints.`)) return
    try {
      if (demoMode) return
      const res = await fetch(`/api/admin/categories/${c.id}`, { method: "DELETE" })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Delete failed")
      toast({ title: "Deleted", className: "bg-cyan-500/20 border-cyan-500/40 text-cyan-300" })
      if (selectedCategoryId === c.id) setSelectedCategoryId(null)
      await loadAll()
    } catch (e: any) {
      toast({ title: "Delete failed", description: e?.message || "Unknown error", className: "bg-red-500/20 border-red-500/40 text-red-300" })
    }
  }

  function openCreateSubcategory() {
    if (!selectedCategoryId) {
      toast({ title: "Select a category first", className: "bg-yellow-900/30 border-yellow-700/50 text-yellow-200" })
      return
    }
    setSubEditing(null)
    setSubForm({ name: "", description: "", display_order: "" })
    setSubModalOpen(true)
  }

  function openEditSubcategory(s: Subcategory) {
    setSubEditing(s)
    setSubForm({
      name: s.name || "",
      description: (s as any).description || "",
      display_order: String((s as any).display_order ?? ""),
    })
    setSubModalOpen(true)
  }

  async function saveSubcategory() {
    if (!selectedCategoryId) return
    setSubSaving(true)
    try {
      if (demoMode) {
        toast({ title: "Demo mode", description: "Changes aren’t persisted.", className: "bg-yellow-900/30 border-yellow-700/50 text-yellow-200" })
        setSubModalOpen(false)
        return
      }
      const payload: any = {
        category_id: selectedCategoryId,
        name: subForm.name,
        description: subForm.description || null,
      }
      if (subForm.display_order !== "") payload.display_order = Number(subForm.display_order)

      const res = await fetch(subEditing ? `/api/admin/subcategories/${subEditing.id}` : "/api/admin/subcategories", {
        method: subEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Save failed")
      toast({ title: subEditing ? "Subcategory updated" : "Subcategory created", className: "bg-cyan-500/20 border-cyan-500/40 text-cyan-300" })
      setSubModalOpen(false)
      await loadAll()
    } catch (e: any) {
      toast({ title: "Save failed", description: e?.message || "Unknown error", className: "bg-red-500/20 border-red-500/40 text-red-300" })
    } finally {
      setSubSaving(false)
    }
  }

  async function deleteSubcategory(s: Subcategory) {
    if (!confirm(`Delete subcategory: ${s.name || s.id}?`)) return
    try {
      if (demoMode) return
      const res = await fetch(`/api/admin/subcategories/${s.id}`, { method: "DELETE" })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Delete failed")
      toast({ title: "Deleted", className: "bg-cyan-500/20 border-cyan-500/40 text-cyan-300" })
      await loadAll()
    } catch (e: any) {
      toast({ title: "Delete failed", description: e?.message || "Unknown error", className: "bg-red-500/20 border-red-500/40 text-red-300" })
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="glass-panel neon-border rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-100">Categories</h1>
            <p className="text-gray-400 mt-2">Manage categories and subcategories used by your products.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => loadAll()} className="border-cyan-500/30 bg-black/30">
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
            <Button onClick={openCreateCategory} className="bg-cyan-500/20 border border-cyan-500/40 text-cyan-200">
              <Plus className="w-4 h-4 mr-2" /> Add Category
            </Button>
          </div>
        </div>

        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search categories..."
          className="bg-black/40 border-cyan-500/20 text-gray-200"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel neon-border rounded-2xl p-6 overflow-x-auto">
          {loading ? (
            <div className="flex items-center gap-2 text-gray-400">
              <Loader className="w-4 h-4 animate-spin" /> Loading categories...
            </div>
          ) : categories.length === 0 ? (
            <div className="text-gray-400">No categories found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-cyan-500/20">
                  <th className="text-left py-3">Category</th>
                  <th className="text-left py-3">Hidden</th>
                  <th className="text-right py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => {
                  const active = c.id === selectedCategoryId
                  return (
                    <tr
                      key={c.id}
                      className={`border-b border-cyan-500/10 hover:bg-white/5 cursor-pointer ${active ? "bg-cyan-500/10" : ""}`}
                      onClick={() => setSelectedCategoryId(c.id)}
                    >
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-100">{c.name || "(unnamed)"}</span>
                          {active ? <ArrowRight className="w-4 h-4 text-cyan-300" /> : null}
                        </div>
                        {(c as any).description ? <div className="text-xs text-gray-500 mt-1">{(c as any).description}</div> : null}
                      </td>
                      <td className="py-3 text-gray-300">{Boolean((c as any).is_hidden) ? "Yes" : "No"}</td>
                      <td className="py-3">
                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button size="sm" variant="outline" onClick={() => openEditCategory(c)} className="border-cyan-500/30 bg-black/30">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => deleteCategory(c)} className="border-red-500/30 bg-black/30 text-red-300">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="glass-panel neon-border rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-100">Subcategories</h2>
              <p className="text-gray-400 text-sm mt-1">{selected ? `For: ${selected.name || selected.id}` : "Select a category"}</p>
            </div>
            <Button onClick={openCreateSubcategory} className="bg-cyan-500/20 border border-cyan-500/40 text-cyan-200" disabled={!selectedCategoryId}>
              <Plus className="w-4 h-4 mr-2" /> Add
            </Button>
          </div>

          <div className="mt-4">
            {!selectedCategoryId ? (
              <div className="text-gray-400">Pick a category to manage its subcategories.</div>
            ) : selectedSubs.length === 0 ? (
              <div className="text-gray-400">No subcategories yet.</div>
            ) : (
              <div className="space-y-2">
                {selectedSubs.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-cyan-500/10">
                    <div>
                      <div className="font-semibold text-gray-100">{s.name || "(unnamed)"}</div>
                      {(s as any).description ? <div className="text-xs text-gray-500 mt-1">{(s as any).description}</div> : null}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEditSubcategory(s)} className="border-cyan-500/30 bg-black/30">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => deleteSubcategory(s)} className="border-red-500/30 bg-black/30 text-red-300">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category modal */}
      <Dialog open={catModalOpen} onOpenChange={(v) => setCatModalOpen(v)}>
        <DialogContent className="bg-black border border-cyan-500/30 text-gray-200">
          <DialogHeader>
            <DialogTitle>{catEditing ? "Edit Category" : "Create Category"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={catForm.name} onChange={(e) => setCatForm((s) => ({ ...s, name: e.target.value }))} className="bg-black/40 border-cyan-500/20" />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={catForm.description} onChange={(e) => setCatForm((s) => ({ ...s, description: e.target.value }))} className="bg-black/40 border-cyan-500/20 min-h-[100px]" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Icon (optional)</Label>
                <Input value={catForm.icon} onChange={(e) => setCatForm((s) => ({ ...s, icon: e.target.value }))} className="bg-black/40 border-cyan-500/20" />
              </div>
              <div className="space-y-2">
                <Label>Display order</Label>
                <Input value={catForm.display_order} onChange={(e) => setCatForm((s) => ({ ...s, display_order: e.target.value }))} type="number" className="bg-black/40 border-cyan-500/20" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox checked={!!catForm.is_hidden} onCheckedChange={(v) => setCatForm((s) => ({ ...s, is_hidden: v === true }))} />
              <span className="text-sm text-gray-300">Hidden (don’t show on storefront)</span>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" className="border-cyan-500/30 bg-black/30" onClick={() => setCatModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveCategory} disabled={catSaving || !catForm.name} className="bg-cyan-500/20 border border-cyan-500/40 text-cyan-200">
                {catSaving ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Subcategory modal */}
      <Dialog open={subModalOpen} onOpenChange={(v) => setSubModalOpen(v)}>
        <DialogContent className="bg-black border border-cyan-500/30 text-gray-200">
          <DialogHeader>
            <DialogTitle>{subEditing ? "Edit Subcategory" : "Create Subcategory"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={subForm.name} onChange={(e) => setSubForm((s) => ({ ...s, name: e.target.value }))} className="bg-black/40 border-cyan-500/20" />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={subForm.description} onChange={(e) => setSubForm((s) => ({ ...s, description: e.target.value }))} className="bg-black/40 border-cyan-500/20 min-h-[100px]" />
            </div>

            <div className="space-y-2">
              <Label>Display order</Label>
              <Input value={subForm.display_order} onChange={(e) => setSubForm((s) => ({ ...s, display_order: e.target.value }))} type="number" className="bg-black/40 border-cyan-500/20" />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" className="border-cyan-500/30 bg-black/30" onClick={() => setSubModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveSubcategory} disabled={subSaving || !subForm.name} className="bg-cyan-500/20 border border-cyan-500/40 text-cyan-200">
                {subSaving ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
