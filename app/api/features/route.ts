import { getFeatureFlags } from "@/lib/features"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const flags = await getFeatureFlags()
    return NextResponse.json(flags)
  } catch (error) {
    console.error("Error fetching feature flags:", error)
    return NextResponse.json({ error: "Failed to fetch feature flags" }, { status: 500 })
  }
}
