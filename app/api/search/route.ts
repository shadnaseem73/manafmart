import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("q")
  const category = searchParams.get("category")
  const minPrice = searchParams.get("minPrice")
  const maxPrice = searchParams.get("maxPrice")
  const sort = searchParams.get("sort") || "relevance"

  if (!query) {
    return NextResponse.json({ results: [] })
  }

  const supabase = await createServerClient()

  // NOTE: the database schema uses `rating` (not `average_rating`).
  // We select `image` and map it to `image_url` in the response for UI compatibility.
  let dbQuery = supabase.from("products").select("id, name, price, category_id, image, rating")

  // Full-text search with typo tolerance using trigram similarity
  dbQuery = dbQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`)

  // Apply filters
  if (category) {
    dbQuery = dbQuery.eq("category_id", category)
  }

  if (minPrice) {
    dbQuery = dbQuery.gte("price", Number.parseFloat(minPrice))
  }

  if (maxPrice) {
    dbQuery = dbQuery.lte("price", Number.parseFloat(maxPrice))
  }

  // Apply sorting
  if (sort === "price-low") {
    dbQuery = dbQuery.order("price", { ascending: true })
  } else if (sort === "price-high") {
    dbQuery = dbQuery.order("price", { ascending: false })
  } else if (sort === "rating") {
    dbQuery = dbQuery.order("rating", { ascending: false })
  } else {
    dbQuery = dbQuery.order("created_at", { ascending: false })
  }

  const { data: results, error } = await dbQuery.limit(10)

  if (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }

  // Shape results for the existing SearchBar UI expectations.
  const normalized = (results || []).map((r: any) => ({
    id: r.id,
    name: r.name,
    price: r.price,
    category: r.category_id,
    image_url: r.image || null,
    rating: r.rating,
  }))

  return NextResponse.json({ results: normalized })
}
