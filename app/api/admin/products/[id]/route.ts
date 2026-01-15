import { NextResponse, type NextRequest } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { enforceAdmin, pick } from "@/app/api/admin/_utils"

export const runtime = "nodejs"

function missingColumn(err: any, col: string) {
  const msg = String(err?.message || '').toLowerCase()
  const c = col.toLowerCase()
  return msg.includes(c) && (msg.includes('does not exist') || msg.includes('schema cache') || msg.includes('could not find') || msg.includes('unknown column'))
}


export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const gate = await enforceAdmin()
  if (!gate.ok) return gate.response

  const { data, error } = await supabaseAdmin.from("products").select("*").eq("id", params.id).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const gate = await enforceAdmin()
  if (!gate.ok) return gate.response

  const body = await req.json()
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
    "updated_at",
  ])

  // Prefer image_url schema, but gracefully fall back to image for older schemas
  if (imageUrl !== undefined) payload.image_url = imageUrl

  let { data, error } = await supabaseAdmin.from("products").update(payload).eq("id", params.id).select("*").single()

  if (error && missingColumn(error, "image_url")) {
    const payload2: any = { ...payload }
    delete payload2.image_url
    if (payload2.image === undefined && imageUrl !== undefined) payload2.image = imageUrl
    ;({ data, error } = await supabaseAdmin.from("products").update(payload2).eq("id", params.id).select("*").single())
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const gate = await enforceAdmin()
  if (!gate.ok) return gate.response

  const { error } = await supabaseAdmin.from("products").delete().eq("id", params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
