"use client"

import { Star } from "lucide-react"

export function RatingBadge({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-600"}`}
          />
        ))}
      </div>
      <span className="text-sm font-medium">
        {rating.toFixed(1)} <span className="text-gray-400">({count})</span>
      </span>
    </div>
  )
}
