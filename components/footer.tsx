"use client"

import Link from "next/link"
import { Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="relative border-t border-cyan-500/20 bg-black/80 backdrop-blur-sm">
      {/* Top glow line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent" />

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Manaf Mart</h3>
            <p className="text-sm text-gray-400 mb-4">Elite tech e-commerce ecosystem for Bangladesh</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4 text-cyan-400" />
                Dhaka, Bangladesh
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Phone className="w-4 h-4 text-cyan-400" />
                +880 1XXX XXXXXX
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="w-4 h-4 text-cyan-400" />
                hello@manafmart.com
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {["Shop", "Categories", "Squad Buys", "Elite Drops"].map((link) => (
                <li key={link}>
                  <Link
                    href={`/${link.toLowerCase()}`}
                    className="text-sm text-gray-400 hover:text-cyan-400 transition-colors"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Support</h4>
            <ul className="space-y-2">
              {["Help Center", "Track Order", "Returns", "Contact Us"].map((link) => (
                <li key={link}>
                  <Link href="#" className="text-sm text-gray-400 hover:text-cyan-400 transition-colors">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              {["Privacy Policy", "Terms & Conditions", "Shipping Policy", "Refund Policy"].map((link) => (
                <li key={link}>
                  <Link href="#" className="text-sm text-gray-400 hover:text-cyan-400 transition-colors">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-cyan-500/20 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-gray-500">© 2026 Manaf Mart. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            {["Facebook", "Twitter", "Instagram", "LinkedIn"].map((social) => (
              <Link key={social} href="#" className="text-sm text-gray-400 hover:text-cyan-400 transition-colors">
                {social}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
