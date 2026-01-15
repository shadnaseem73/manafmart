"use client"

import { useState, useEffect } from "react"
import { FeatureToggleCard } from "./feature-toggle-card"
import { createBrowserClient } from "@/lib/supabase/client"
import { Loader } from "lucide-react"

interface Feature {
  feature_key: string
  is_enabled: boolean
  metadata: Record<string, any>
}

interface FeatureToggleGridProps {
  userId: string
  demoMode?: boolean
}

export function FeatureToggleGrid({ userId, demoMode = false }: FeatureToggleGridProps) {
  const [features, setFeatures] = useState<Feature[]>([])
  const [loading, setLoading] = useState(true)

  const DEMO_FEATURES: Feature[] = [
    { feature_key: "squad_buys", is_enabled: true, metadata: { description: "Group buying with discounts" } },
    { feature_key: "partial_cod", is_enabled: true, metadata: { description: "50% prepay, 50% on delivery" } },
    { feature_key: "ai_search", is_enabled: false, metadata: { description: "AI-powered product search" } },
    { feature_key: "invoicing", is_enabled: true, metadata: { description: "PDF invoice generation" } },
    { feature_key: "blockchain_verify", is_enabled: false, metadata: { description: "Blockchain authenticity" } },
    { feature_key: "spy_dashboard", is_enabled: true, metadata: { description: "Real-time analytics" } },
    { feature_key: "elite_drops", is_enabled: true, metadata: { description: "Premium product drops" } },
    { feature_key: "live_chat", is_enabled: true, metadata: { description: "Customer support chat" } },
  ]

  useEffect(() => {
    fetchFeatures()
  }, [])

  const fetchFeatures = async () => {
    setLoading(true)

    if (demoMode) {
      setFeatures(DEMO_FEATURES)
      setLoading(false)
      return
    }

    let data: any[] | null = null
    let error: any = null

    try {
      const supabase = createBrowserClient()
      const res = await supabase.from("master_config").select("*")
      data = res.data
      error = res.error
    } catch (e) {
      error = e
    }

    if (error) {
      console.log("[v0] Error fetching features:", error)
      setFeatures(DEMO_FEATURES)
    } else {
      setFeatures(data || DEMO_FEATURES)
    }
    setLoading(false)
  }

  const handleToggle = async (featureKey: string, currentState: boolean) => {
    const updatedFeatures = features.map((f) =>
      f.feature_key === featureKey ? { ...f, is_enabled: !currentState } : f,
    )
    setFeatures(updatedFeatures)

    if (demoMode) {
      console.log(`[v0] Demo mode: toggled ${featureKey} to ${!currentState}`)
      return
    }

    let error: any = null

    try {
      const supabase = createBrowserClient()
      const res = await supabase
        .from("master_config")
        .update({ is_enabled: !currentState, updated_by: userId })
        .eq("feature_key", featureKey)
      error = res.error
    } catch (e) {
      error = e
    }

    if (error) {
      console.log("[v0] Error updating feature:", error)
      fetchFeatures()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-6 h-6 animate-spin text-purple-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Feature Toggles</h2>
        <p className="text-gray-400">Control which features are available to users across the platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((feature) => (
          <FeatureToggleCard
            key={feature.feature_key}
            feature={feature}
            onToggle={() => handleToggle(feature.feature_key, feature.is_enabled)}
            readOnly={demoMode}
          />
        ))}
      </div>

      {demoMode && (
        <div className="mt-6 p-4 bg-yellow-900/30 border border-yellow-700/50 rounded-lg">
          <p className="text-sm text-yellow-200">
            In demo mode, feature toggles show sample data and changes are not persisted to the database.
          </p>
        </div>
      )}
    </div>
  )
}
