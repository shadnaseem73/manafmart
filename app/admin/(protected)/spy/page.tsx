import { SpyDashboard } from "@/components/admin/spy-dashboard"

export const metadata = {
  title: "Spy Mode - Manaf Mart Admin",
  description: "Live surveillance dashboard (demo)",
}

export default function SpyPage() {
  return (
    <div className="p-8">
      <SpyDashboard />
    </div>
  )
}
