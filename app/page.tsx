import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { CategoriesSection } from "@/components/categories-section"
import { EliteDrops } from "@/components/elite-drops"
import { SquadBuys } from "@/components/squad-buys"
import { FlashSaleBanner } from "@/components/flash-sale-banner"
import { Footer } from "@/components/footer"
import { RecentlyViewedSection } from "@/components/recently-viewed-section"
import { NewArrivalsSection } from "@/components/new-arrivals-section"
import { BestSellersSection } from "@/components/best-sellers-section"
import { FeaturedAd } from "@/components/featured-ad"

export const metadata = {
  title: "Manaf Mart - Elite Tech E-commerce for Bangladesh",
  description:
    "Premium gadgets, accessories, and smart tech with neon cyberpunk aesthetic. Squad buying, AI search, and authentic verification.",
}

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      {/* Neon glow background effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse" />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse" />
      </div>

      <div className="relative z-10">
        <FlashSaleBanner />
        <Header />
        <Hero />
        <CategoriesSection />
        <RecentlyViewedSection />
        <NewArrivalsSection />
        <FeaturedAd
          title="Elite Summer Drops"
          description="Exclusive Limited Edition Tech Gadgets - 50% Off Premium Collections"
          image="/premium-wireless-earbuds-neon-glow.jpg"
          cta={{
            text: "Shop Now",
            href: "/shop",
          }}
        />
        <BestSellersSection />
        <EliteDrops />
        <SquadBuys />
        <Footer />
      </div>
    </main>
  )
}
