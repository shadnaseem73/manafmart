import { NextResponse, type NextRequest } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { enforceAdmin, pick } from "@/app/api/admin/_utils"

export const runtime = "nodejs"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const gate = await enforceAdmin()
  if (!gate.ok) return gate.response

  const body = await req.json()

  // Support schema variants: status/order_status, payment_status, tracking_id, ...
  const payload = pick(body, [
    "status",
    "order_status",
    "payment_status",
    "paid_amount",
    "due_amount",
    "tracking_id",
    "is_partial_cod",
    "risk_score",
    "updated_at",
  ])

  const { data, error } = await supabaseAdmin.from("orders").update(payload).eq("id", params.id).select("*").single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}