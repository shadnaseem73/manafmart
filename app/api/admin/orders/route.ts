import { NextResponse, type NextRequest } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { enforceAdmin } from "@/app/api/admin/_utils"

export const runtime = "nodejs"

// GET /api/admin/orders
export async function GET(req: NextRequest) {
  const gate = await enforceAdmin()
  if (!gate.ok) return gate.response

  const { searchParams } = new URL(req.url)
  const limit = Math.min(Number(searchParams.get("limit") || 100), 200)

  // Prefer pulling items inline when FK relation exists.
  const base = supabaseAdmin
    .from("orders")
    .order("created_at", { ascending: false })
    .limit(limit)

  let { data, error } = await base.select("*, order_items(*)")
  if (error) {
    ;({ data, error } = await base.select("*"))
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}
