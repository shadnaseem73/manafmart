import { NextResponse, type NextRequest } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { enforceAdmin, pick } from "@/app/api/admin/_utils"

export const runtime = "nodejs"

// GET /api/admin/subcategories?category_id=...
export async function GET(req: NextRequest) {
  const gate = await enforceAdmin()
  if (!gate.ok) return gate.response

  const { searchParams } = new URL(req.url)
  const categoryId = searchParams.get("category_id")
  const limit = Math.min(Number(searchParams.get("limit") || 200), 500)

  let query = supabaseAdmin.from("subcategories").select("*").order("created_at", { ascending: false }).limit(limit)
  if (categoryId) query = query.eq("category_id", categoryId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

// POST /api/admin/subcategories
export async function POST(req: NextRequest) {
  const gate = await enforceAdmin()
  if (!gate.ok) return gate.response

  const body = await req.json()
  const payload = pick(body, ["category_id", "name", "description", "display_order", "slug"])

  const { data, error } = await supabaseAdmin.from("subcategories").insert([payload]).select("*").single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data }, { status: 201 })
}
