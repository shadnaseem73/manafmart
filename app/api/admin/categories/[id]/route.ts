import { NextResponse, type NextRequest } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { enforceAdmin, pick } from "@/app/api/admin/_utils"

export const runtime = "nodejs"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const gate = await enforceAdmin()
  if (!gate.ok) return gate.response

  const body = await req.json()
  const payload = pick(body, ["name", "description", "icon", "display_order", "is_hidden", "slug", "icon_url"])

  const { data, error } = await supabaseAdmin.from("categories").update(payload).eq("id", params.id).select("*").single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const gate = await enforceAdmin()
  if (!gate.ok) return gate.response

  const { error } = await supabaseAdmin.from("categories").delete().eq("id", params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
