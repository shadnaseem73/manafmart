"use client"

import { motion } from "framer-motion"

interface FeatureToggleCardProps {
  feature: {
    feature_key: string
    is_enabled: boolean
    metadata: Record<string, any>
  }
  onToggle: () => void
  readOnly?: boolean
}

const featureDescriptions: Record<string, { name: string; description: string; icon: string }> = {
  squad_buys: {
    name: "Squad Buying",
    description: "Allow users to participate in group buying and unlock bulk discounts",
    icon: "👥",
  },
  partial_cod: {
    name: "Partial COD",
    description: "Enable partial cash-on-delivery with booking fees for orders above ৳2000",
    icon: "💵",
  },
  ai_search: {
    name: "AI Search",
    description: "Typo-tolerant search, voice search, and image-to-product recognition",
    icon: "🤖",
  },
  invoicing: {
    name: "Invoice PDF",
    description: "Generate and deliver dark-themed PDF invoices with payment details",
    icon: "📄",
  },
  blockchain_verify: {
    name: "Blockchain Verify",
    description: "Public authenticity verification using blockchain hashes",
    icon: "⛓️",
  },
  spy_dashboard: {
    name: "Spy Dashboard",
    description: "Real-time traffic, cart, and keystroke monitoring for analytics",
    icon: "👁️",
  },
  elite_drops: {
    name: "Elite Drops",
    description: "Limited quantity exclusive product releases and early access",
    icon: "✨",
  },
  live_chat: {
    name: "Live Chat",
    description: "Real-time customer support and engagement",
    icon: "💬",
  },
}

export function FeatureToggleCard({ feature, onToggle, readOnly = false }: FeatureToggleCardProps) {
  const info = featureDescriptions[feature.feature_key] || {
    name: feature.feature_key.replace(/_/g, " ").toUpperCase(),
    description: "Feature control",
    icon: "⚙️",
  }

  return (
    <motion.div
      whileHover={{ scale: readOnly ? 1 : 1.02 }}
      className={`relative group border rounded-xl p-6 backdrop-blur-sm transition-all duration-300 ${
        feature.is_enabled ? "border-cyan-500/50 bg-cyan-500/10" : "border-gray-700/50 bg-gray-900/20"
      } ${readOnly ? "opacity-75" : ""}`}
    >
      {/* Glow effect */}
      <div
        className={`absolute -inset-0.5 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity ${
          feature.is_enabled ? "bg-gradient-to-r from-cyan-500 to-blue-600" : "bg-gray-600"
        }`}
      />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-3xl mb-2">{info.icon}</div>
            <h3 className="text-lg font-bold text-white">{info.name}</h3>
          </div>

          <button
            onClick={readOnly ? undefined : onToggle}
            disabled={readOnly}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              feature.is_enabled ? "bg-cyan-500" : "bg-gray-700"
            } ${readOnly ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
          >
            <motion.div
              className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full"
              animate={{ x: feature.is_enabled ? 24 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-400 mb-4">{info.description}</p>

        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full ${
              feature.is_enabled ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
            }`}
          >
            {feature.is_enabled ? "● Active" : "● Disabled"}
          </span>

          {/* Metadata info */}
          {Object.keys(feature.metadata).length > 0 && (
            <details className="text-xs text-gray-500 cursor-pointer hover:text-gray-300">
              <summary>View Config</summary>
              <div className="mt-2 bg-black/50 rounded p-2 max-h-32 overflow-auto">
                <code className="text-xs">{JSON.stringify(feature.metadata, null, 2)}</code>
              </div>
            </details>
          )}
        </div>
      </div>
    </motion.div>
  )
}
