import { NextResponse, type NextRequest } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { enforceAdmin, pick } from "@/app/api/admin/_utils"

export const runtime = "nodejs"

// GET /api/admin/categories
export async function GET(req: NextRequest) {
  const gate = await enforceAdmin()
  if (!gate.ok) return gate.response

  const { searchParams } = new URL(req.url)
  const q = (searchParams.get("q") || "").trim()
  const limit = Math.min(Number(searchParams.get("limit") || 200), 500)

  let query = supabaseAdmin.from("categories").select("*").order("created_at", { ascending: false }).limit(limit)
  if (q) query = query.ilike("name", `%${q}%`)
  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

// POST /api/admin/categories
export async function POST(req: NextRequest) {
  const gate = await enforceAdmin()
  if (!gate.ok) return gate.response

  const body = await req.json()
  const payload = pick(body, ["name", "description", "icon", "display_order", "is_hidden", "slug", "icon_url"])

  const { data, error } = await supabaseAdmin.from("categories").insert([payload]).select("*").single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data }, { status: 201 })
}
