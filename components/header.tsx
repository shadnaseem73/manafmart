"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Search, ShoppingCart, User } from "lucide-react"
import { useFeatureFlag } from "@/hooks/use-feature-flag"
import { NotificationsPanel } from "@/components/notifications-panel"
import { LoginModal } from "@/components/login-modal"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const { isEnabled: aiSearchEnabled } = useFeatureFlag("ai_search_enabled")

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-cyan-500/30 backdrop-blur-xl bg-black/80">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />

        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 bg-cyan-500 rounded-lg blur opacity-50 group-hover:opacity-100 transition-opacity" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/manaf-mart-logo.jpg"
                  alt="Manaf Mart Logo"
                  className="relative w-full h-full rounded-lg object-cover"
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-black text-white">Manaf Mart</h1>
                <p className="text-xs text-cyan-400">Elite Tech Ecosystem</p>
              </div>
            </Link>

            {aiSearchEnabled && (
              <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="Search gadgets..."
                    className="w-full bg-black border border-cyan-500/30 rounded-lg pl-4 pr-10 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500" />
                </div>
              </div>
            )}

            {/* Desktop Navigation - Admin Removed */}
            <nav className="hidden lg:flex items-center gap-6">
              <Link href="/categories" className="text-sm font-medium hover:text-cyan-400 transition-colors">
                Categories
              </Link>
              <Link href="/squad-buys" className="text-sm font-medium hover:text-cyan-400 transition-colors">
                Squad Buys
              </Link>
              <Link href="/elite-drops" className="text-sm font-medium hover:text-cyan-400 transition-colors">
                Elite Drops
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <NotificationsPanel />

              {aiSearchEnabled && (
                <button className="relative p-2 text-white hover:text-cyan-400 transition-colors hidden sm:block">
                  <Search className="w-5 h-5" />
                </button>
              )}
              <Link href="/cart" className="relative p-2 text-white hover:text-cyan-400 transition-colors">
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full" />
              </Link>
              
              {/* Login Button */}
              <button
                onClick={() => setIsLoginOpen(true)}
                className="p-2 text-white hover:text-cyan-400 transition-colors hidden sm:block"
              >
                <User className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-white hover:text-cyan-400 transition-colors"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation - Admin Removed */}
          {isMenuOpen && (
            <div className="lg:hidden border-t border-cyan-500/30 py-4 space-y-4">
              <Link href="/categories" className="block text-sm font-medium hover:text-cyan-400 transition-colors">
                Categories
              </Link>
              <Link href="/squad-buys" className="block text-sm font-medium hover:text-cyan-400 transition-colors">
                Squad Buys
              </Link>
              <Link href="/elite-drops" className="block text-sm font-medium hover:text-cyan-400 transition-colors">
                Elite Drops
              </Link>
            </div>
          )}
        </div>
      </header>

      <LoginModal open={isLoginOpen} onOpenChange={setIsLoginOpen} />
    </>
  )
}
