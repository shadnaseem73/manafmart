import { NextResponse, type NextRequest } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { enforceAdmin } from "@/app/api/admin/_utils"

export const runtime = "nodejs"

// GET /api/admin/customers
export async function GET(req: NextRequest) {
  const gate = await enforceAdmin()
  if (!gate.ok) return gate.response

  const { searchParams } = new URL(req.url)
  const limit = Math.min(Number(searchParams.get("limit") || 200), 500)
  const q = (searchParams.get("q") || "").trim()
  const withCounts = searchParams.get("withOrderCounts") === "1"

  // Prefer profiles (Supabase Auth)
  try {
    // Some schemas don't have all columns; keep it defensive.
    let query = supabaseAdmin.from("profiles").select("*").order("created_at", { ascending: false }).limit(limit)

    if (q) {
      // Try a broad OR filter; if it errors due to missing column, we'll fallback to client-side filtering.
      const expr = [
        `id.ilike.%${q}%`,
        `full_name.ilike.%${q}%`,
        `name.ilike.%${q}%`,
        `email.ilike.%${q}%`,
        `phone.ilike.%${q}%`,
      ].join(",")
      query = query.or(expr)
    }

    let { data, error } = await query
    if (error && q) {
      // Fallback: fetch without filter then filter in-process.
      ;({ data, error } = await supabaseAdmin.from("profiles").select("*").order("created_at", { ascending: false }).limit(limit))
      if (!error && data) {
        const term = q.toLowerCase()
        data = (data as any[]).filter((row) => JSON.stringify(row).toLowerCase().includes(term))
      }
    }

    if (!error) {
      const enriched = withCounts ? await attachOrderCounts(data as any[]) : data
      return NextResponse.json({ data: enriched, source: "profiles" })
    }
  } catch {
    // ignore
  }

  // Fallback to a custom users table if present.
  try {
    let query = supabaseAdmin.from("users").select("*").order("created_at", { ascending: false }).limit(limit)
    if (q) query = query.or(`email.ilike.%${q}%,phone.ilike.%${q}%`)
    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    const enriched = withCounts ? await attachOrderCounts((data as any[]) || []) : data
    return NextResponse.json({ data: enriched, source: "users" })
  } catch {
    return NextResponse.json({ error: "No supported customers table found" }, { status: 400 })
  }
}

async function attachOrderCounts(rows: any[]) {
  try {
    const ids = rows.map((r) => r.id).filter(Boolean)
    if (ids.length === 0) return rows

    const { data, error } = await supabaseAdmin.from("orders").select("id,user_id").in("user_id", ids)
    if (error || !data) return rows
    const counts: Record<string, number> = {}
    for (const o of data as any[]) {
      const uid = String(o.user_id)
      counts[uid] = (counts[uid] || 0) + 1
    }
    return rows.map((r) => ({ ...r, order_count: counts[String(r.id)] || 0 }))
  } catch {
    return rows
  }
}
