import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SquadBuys } from "@/components/squad-buys"

export const metadata = {
  title: "Squad Buys - Manaf Mart",
  description: "Group buying discounts",
}

export default function SquadBuysPage() {
  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      <div className="relative z-10">
        <Header />
        <SquadBuys />
        <Footer />
      </div>
    </main>
  )
}
