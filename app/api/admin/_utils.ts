import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth/require-admin"

export async function enforceAdmin() {
  const res = await requireAdmin()
  if (!res.ok) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: res.message }, { status: res.status }),
    }
  }
  return { ok: true as const, user: res.user }
}

export function pick<T extends Record<string, any>>(obj: T, keys: string[]) {
  const out: Record<string, any> = {}
  for (const k of keys) {
    if (obj[k] !== undefined) out[k] = obj[k]
  }
  return out
}
