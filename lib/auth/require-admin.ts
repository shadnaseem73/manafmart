import { createServerClient } from "@/lib/supabase/server"

export type RequireAdminResult =
  | { ok: true; user: { id: string; email?: string | null } }
  | { ok: false; status: number; message: string }

/**
 * Basic admin guard for server route handlers.
 *
 * This project has shipped with multiple schema variants. This guard is intentionally
 * defensive and tries a few different strategies:
 *
 * 1) ADMIN_EMAILS allowlist (comma-separated)
 * 2) profiles.trust_score >= 90 (matches existing master_config policy)
 * 3) users.is_admin = true (if you use a custom users table)
 *
 * If none of these checks can be performed (table missing, etc.), access is denied.
 * Recommended: set ADMIN_EMAILS in your env to avoid schema dependency.
 */
export async function requireAdmin(): Promise<RequireAdminResult> {
  const supabase = await createServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) return { ok: false, status: 401, message: "Unauthorized" }
  if (!user) return { ok: false, status: 401, message: "Unauthorized" }

  // 1) Env allowlist (recommended)
  const allow = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)

  if (allow.length > 0) {
    const email = (user.email || "").toLowerCase()
    if (!allow.includes(email)) {
      return { ok: false, status: 403, message: "Forbidden" }
    }
    return { ok: true, user: { id: user.id, email: user.email } }
  }

  // 2) profiles.is_admin = true OR trust_score >= 90 (schema variants)
  try {
    const { data } = await supabase
      .from("profiles")
      .select("is_admin, trust_score, role")
      .eq("id", user.id)
      .maybeSingle()

    const isAdmin = (data as any)?.is_admin
    const role = String((data as any)?.role ?? "").toLowerCase()
    const trust = (data as any)?.trust_score

    if (isAdmin === true || role === "admin" || role === "owner") {
      return { ok: true, user: { id: user.id, email: user.email } }
    }

    if (typeof trust === "number" && trust >= 90) {
      return { ok: true, user: { id: user.id, email: user.email } }
    }
  } catch {
    // ignore
  }

  // 3) users.is_admin = true
  try {
    const { data } = await supabase.from("users").select("is_admin").eq("id", user.id).maybeSingle()
    const isAdmin = (data as any)?.is_admin
    if (isAdmin === true) {
      return { ok: true, user: { id: user.id, email: user.email } }
    }
  } catch {
    // ignore
  }

  return {
    ok: false,
    status: 403,
    message: "Forbidden (admin only). Set ADMIN_EMAILS or add profiles.is_admin/role.",
  }
}
