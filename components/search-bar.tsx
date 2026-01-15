"use client"

import { useState, useEffect } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"

interface SearchResult {
  id: string
  name: string
  price: number
  category: string
  image_url: string
}

export function SearchBar() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await response.json()
        setResults(data.results || [])
        setIsOpen(true)
      } catch (error) {
        console.error("Search error:", error)
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  return (
    <div className="relative w-full max-w-md">
      <div className="flex items-center gap-2 bg-black/50 border border-cyan-500/30 rounded-lg px-3 py-2 hover:border-cyan-500/60 transition-all">
        <Search className="w-4 h-4 text-cyan-500" />
        <Input
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          className="border-0 bg-transparent text-white placeholder:text-gray-500 focus-visible:ring-0"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("")
              setResults([])
            }}
            className="text-gray-500 hover:text-cyan-500"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 border border-cyan-500/30 rounded-lg overflow-hidden z-50 max-h-96 overflow-y-auto">
          {results.map((product) => (
            <a
              key={product.id}
              href={`/products/${product.id}`}
              className="flex items-center gap-3 p-3 hover:bg-cyan-500/10 transition-colors border-b border-cyan-500/10 last:border-0"
            >
              <img
                src={product.image_url || "/placeholder.svg"}
                alt={product.name}
                className="w-10 h-10 rounded object-cover"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{product.name}</p>
                <p className="text-xs text-cyan-500">৳{product.price.toLocaleString()}</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
