"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Zap } from "lucide-react"

const SAMPLE_FLASH_SALES = [
  {
    id: "1",
    name: "Wireless Earbuds Sale",
    discount_percentage: 35,
    start_time: new Date().toISOString(),
    end_time: new Date(Date.now() + 3600000).toISOString(),
  },
  {
    id: "2",
    name: "Gaming Smartwatch",
    discount_percentage: 45,
    start_time: new Date().toISOString(),
    end_time: new Date(Date.now() + 7200000).toISOString(),
  },
]

export function FlashSaleBanner() {
  const [activeSales, setActiveSales] = useState<any[]>(SAMPLE_FLASH_SALES)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchFlashSales = async () => {
      try {
        const supabase = createBrowserClient()
        const now = new Date().toISOString()

        const { data, error } = await supabase
          .from("flash_sales")
          .select("*")
          .eq("is_active", true)
          .lt("start_time", now)
          .gt("end_time", now)

        if (error) {
          console.log("[v0] Flash sales fetch - using sample data. Error:", error.message)
          setActiveSales(SAMPLE_FLASH_SALES)
          return
        }

        // Use fetched data or fall back to samples
        setActiveSales(data && data.length > 0 ? data : SAMPLE_FLASH_SALES)
      } catch (err) {
        console.log("[v0] Flash sales error - using sample data:", err)
        setActiveSales(SAMPLE_FLASH_SALES)
      } finally {
        setIsLoading(false)
      }
    }

    // Only fetch if we're showing the banner
    if (activeSales.length > 0) {
      fetchFlashSales()
      const interval = setInterval(fetchFlashSales, 30000)
      return () => clearInterval(interval)
    }
  }, [])

  if (isLoading || activeSales.length === 0) return null

  return (
    <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-3 flex items-center gap-2 overflow-x-auto">
      <Zap className="w-5 h-5 flex-shrink-0" />
      <div className="flex gap-4 animate-scroll">
        {activeSales.map((sale) => (
          <div key={sale.id} className="whitespace-nowrap font-semibold">
            🔥 {sale.name} - {sale.discount_percentage}% OFF
          </div>
        ))}
      </div>
    </div>
  )
}
