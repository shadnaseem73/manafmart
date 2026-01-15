import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { action, product_id, metadata } = await request.json()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("user_activity_logs")
      .insert([
        {
          user_id: user.id,
          action,
          product_id,
          metadata,
        },
      ])
      .select()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json({ error: "Failed to track event" }, { status: 500 })
  }
}
