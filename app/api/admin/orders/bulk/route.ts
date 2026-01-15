import { NextResponse, type NextRequest } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { enforceAdmin } from "@/app/api/admin/_utils"

export const runtime = "nodejs"

// PATCH /api/admin/orders/bulk
// Body: { ids: string[], status?: string, order_status?: string, payment_status?: string }
export async function PATCH(req: NextRequest) {
  const gate = await enforceAdmin()
  if (!gate.ok) return gate.response

  const body = await req.json()
  const ids: string[] = Array.isArray(body.ids) ? body.ids : []
  if (ids.length === 0) {
    return NextResponse.json({ error: "ids[] required" }, { status: 400 })
  }

  const updates: Record<string, any> = {}
  if (body.status !== undefined) updates.status = body.status
  if (body.order_status !== undefined) updates.order_status = body.order_status
  if (body.payment_status !== undefined) updates.payment_status = body.payment_status
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No update fields provided" }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin.from("orders").update(updates).in("id", ids).select("*")
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}
