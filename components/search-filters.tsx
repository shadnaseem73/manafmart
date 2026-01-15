"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

export function SearchFilters() {
  const [priceRange, setPriceRange] = useState([0, 100000])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("relevance")

  const categories = [
    { id: "phones", label: "Phones" },
    { id: "laptops", label: "Laptops" },
    { id: "accessories", label: "Accessories" },
    { id: "wearables", label: "Wearables" },
  ]

  const sortOptions = [
    { value: "relevance", label: "Most Relevant" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "rating", label: "Highest Rated" },
  ]

  return (
    <div className="space-y-6 p-4 bg-black/30 border border-cyan-500/20 rounded-lg">
      {/* Price Filter */}
      <div>
        <h3 className="text-sm font-semibold text-cyan-500 mb-4">Price Range</h3>
        <Slider value={priceRange} onValueChange={setPriceRange} min={0} max={100000} step={1000} className="mb-2" />
        <div className="flex justify-between text-xs text-gray-400">
          <span>৳{priceRange[0].toLocaleString()}</span>
          <span>৳{priceRange[1].toLocaleString()}</span>
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <h3 className="text-sm font-semibold text-cyan-500 mb-3">Category</h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={selectedCategories.includes(cat.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedCategories([...selectedCategories, cat.id])
                  } else {
                    setSelectedCategories(selectedCategories.filter((c) => c !== cat.id))
                  }
                }}
              />
              <span className="text-sm text-gray-300">{cat.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <h3 className="text-sm font-semibold text-cyan-500 mb-3">Sort By</h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full bg-black/50 border border-cyan-500/30 rounded px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <Button className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white">
        Apply Filters
      </Button>
    </div>
  )
}
