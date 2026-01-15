import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { EliteDrops } from "@/components/elite-drops"

export const metadata = {
  title: "Elite Drops - Manaf Mart",
  description: "Limited edition elite tech drops",
}

export default function EliteDropsPage() {
  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      <div className="relative z-10">
        <Header />
        <EliteDrops />
        <Footer />
      </div>
    </main>
  )
}
