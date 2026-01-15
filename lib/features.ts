import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Cache for feature flags to reduce DB calls
let featureFlagsCache: Record<string, boolean> | null = null
let cacheExpiry = 0
const CACHE_DURATION = 60000 // 1 minute

export async function getFeatureFlags() {
  const now = Date.now()

  // Return cached flags if still valid
  if (featureFlagsCache && now < cacheExpiry) {
    return featureFlagsCache
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    },
  )

  const { data, error } = await supabase.from("master_config").select("feature_key, is_enabled")

  if (error) {
    console.error("Error fetching feature flags:", error)
    return {}
  }

  // Convert to object format
  const flags = (data || []).reduce(
    (acc, feature) => {
      acc[feature.feature_key] = feature.is_enabled
      return acc
    },
    {} as Record<string, boolean>,
  )

  featureFlagsCache = flags
  cacheExpiry = now + CACHE_DURATION

  return flags
}

export async function isFeatureEnabled(featureKey: string): Promise<boolean> {
  const flags = await getFeatureFlags()
  return flags[featureKey] ?? false
}

// Individual feature helpers for convenience
export async function isSquadBuysEnabled() {
  return isFeatureEnabled("squad_buys_enabled")
}

export async function isPartialCodEnabled() {
  return isFeatureEnabled("partial_cod_enabled")
}

export async function isAiSearchEnabled() {
  return isFeatureEnabled("ai_search_enabled")
}

export async function isInvoicePdfEnabled() {
  return isFeatureEnabled("invoice_pdf_enabled")
}

export async function isBlockchainVerifyEnabled() {
  return isFeatureEnabled("blockchain_verify_enabled")
}

export async function isEliteDropsEnabled() {
  return isFeatureEnabled("elite_drops_enabled")
}
