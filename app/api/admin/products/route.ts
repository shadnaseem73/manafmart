import { NextResponse, type NextRequest } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { enforceAdmin, pick } from "@/app/api/admin/_utils"

export const runtime = "nodejs"

function missingColumn(err: any, col: string) {
  const msg = String(err?.message || '').toLowerCase()
  const c = col.toLowerCase()
  return msg.includes(c) && (msg.includes('does not exist') || msg.includes('schema cache') || msg.includes('could not find') || msg.includes('unknown column'))
}


// GET /api/admin/products
export async function GET(req: NextRequest) {
  const gate = await enforceAdmin()
  if (!gate.ok) return gate.response

  const { searchParams } = new URL(req.url)
  const q = (searchParams.get("q") || "").trim()
  const limit = Math.min(Number(searchParams.get("limit") || 100), 200)

  const base = supabaseAdmin.from("products").order("updated_at", { ascending: false }).limit(limit)

  // Prefer related category/subcategory expansion if relationships exist.
  const preferred = (q ? base.select("*, categories(*), subcategories(*)").ilike("name", `%${q}%`) : base.select("*, categories(*), subcategories(*)"))

  let { data, error } = await preferred
  if (error) {
    // Fallback for schema variants without FK relationship names.
    const fallback = q ? base.select("*").ilike("name", `%${q}%`) : base.select("*")
    ;({ data, error } = await fallback)
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

// POST /api/admin/products
export async function POST(req: NextRequest) {
  const gate = await enforceAdmin()
  if (!gate.ok) return gate.response

  const body = await req.json()

  // Keep this permissive (schema variants exist). Only pass common/safe columns.
  const imageUrl = body?.image_url ?? body?.image

  const payload = pick(body, [
    "vendor_id",
    "category_id",
    "subcategory_id",
    "name",
    "description",
    "price",
    "stock",
    "image_url",
    "image",
    "video_url",
    "assets_360",
    "authenticity_hash",
    "is_elite_drop",
    "rating",
    "reviews_count",
  ])

  // Default vendor_id to the current user if it exists in schema
  if (payload.vendor_id === undefined) payload.vendor_id = gate.user.id

  // Prefer image_url schema, but gracefully fall back to image for older schemas
  if (imageUrl !== undefined) payload.image_url = imageUrl

  let { data, error } = await supabaseAdmin.from("products").insert([payload]).select("*").single()

  if (error && missingColumn(error, 'image_url')) {
    const payload2: any = { ...payload }
    delete payload2.image_url
    if (payload2.image === undefined && imageUrl !== undefined) payload2.image = imageUrl
    ;({ data, error } = await supabaseAdmin.from("products").insert([payload2]).select("*").single())
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data }, { status: 201 })
}
