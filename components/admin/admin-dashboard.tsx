"use client"

import { useState } from "react"
import { FeatureToggleGrid } from "./feature-toggle-grid"
import { SpyDashboard } from "./spy-dashboard"
import { AdminHeader } from "./admin-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, Zap, Eye } from "lucide-react"

interface AdminDashboardProps {
  userId: string
  demoMode?: boolean
  showHeader?: boolean
}

export function AdminDashboard({ userId, demoMode = false, showHeader = true }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("toggles")

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Animated background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-5" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl opacity-5" />
      </div>

      <div className="relative z-10" style={{ paddingTop: showHeader && demoMode ? "48px" : "0" }}>
        {showHeader && <AdminHeader demoMode={demoMode} />}

        <div className="max-w-7xl mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3 bg-black/50 border border-cyan-500/30">
              <TabsTrigger value="toggles" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">Features</span>
              </TabsTrigger>
              <TabsTrigger value="spy" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Spy Mode</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="toggles" className="mt-8">
              <FeatureToggleGrid userId={userId} demoMode={demoMode} />
            </TabsContent>

            <TabsContent value="spy" className="mt-8">
              <SpyDashboard />
            </TabsContent>

            <TabsContent value="analytics" className="mt-8">
              <div className="p-8 border border-cyan-500/30 rounded-xl bg-black/50 text-gray-400">
                Analytics data coming soon...
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
