"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"

export function useFeatureFlag(featureKey: string) {
  const [isEnabled, setIsEnabled] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkFeature = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      )

      const { data, error } = await supabase
        .from("master_config")
        .select("is_enabled")
        .eq("feature_key", featureKey)
        .single()

      if (!error && data) {
        setIsEnabled(data.is_enabled)
      }
      setLoading(false)
    }

    checkFeature()

    // Subscribe to real-time updates
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    )

    const channel = supabase
      .channel("feature_updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "master_config",
          filter: `feature_key=eq.${featureKey}`,
        },
        (payload: any) => {
          setIsEnabled(payload.new.is_enabled)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [featureKey])

  return { isEnabled, loading }
}

export function useMultipleFeatureFlags(featureKeys: string[]) {
  const [features, setFeatures] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkFeatures = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      )

      const { data, error } = await supabase
        .from("master_config")
        .select("feature_key, is_enabled")
        .in("feature_key", featureKeys)

      if (!error && data) {
        const featureMap = data.reduce(
          (acc, feature) => {
            acc[feature.feature_key] = feature.is_enabled
            return acc
          },
          {} as Record<string, boolean>,
        )
        setFeatures(featureMap)
      }
      setLoading(false)
    }

    checkFeatures()
  }, [featureKeys.join(",")])

  return { features, loading }
}
