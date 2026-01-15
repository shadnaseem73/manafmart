"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Star, ThumbsUp, User } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

interface Review {
  id: string
  rating: number
  title: string
  content: string
  user_id: string
  verified_purchase: boolean
  helpful_count: number
  created_at: string
  user_name?: string
}

export function ProductReviews({ productId }: { productId: string }) {
  const supabase = createBrowserClient()
  const [reviews, setReviews] = useState<Review[]>([])
  const [newReview, setNewReview] = useState({ rating: 5, title: "", content: "" })
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [ratingDistribution, setRatingDistribution] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 })
  const [averageRating, setAverageRating] = useState(0)

  useEffect(() => {
    getUser()
    fetchReviews()
  }, [productId])

  async function getUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUser(user)
  }

  async function fetchReviews() {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setReviews(data)

      // Calculate rating distribution
      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      let total = 0

      data.forEach((review) => {
        distribution[review.rating as keyof typeof distribution]++
        total += review.rating
      })

      setRatingDistribution(distribution)
      setAverageRating(data.length > 0 ? Math.round((total / data.length) * 10) / 10 : 0)
    }
  }

  async function submitReview() {
    if (!user) {
      alert("Please login to leave a review")
      return
    }

    if (!newReview.title || !newReview.content) {
      alert("Please fill in all fields")
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.from("reviews").insert([
        {
          product_id: productId,
          user_id: user.id,
          rating: newReview.rating,
          title: newReview.title,
          content: newReview.content,
          verified_purchase: true,
        },
      ])

      if (!error) {
        setNewReview({ rating: 5, title: "", content: "" })
        await fetchReviews()
      }
    } catch (error) {
      console.error("Error submitting review:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Rating Overview */}
      <div className="bg-black/30 border border-cyan-500/20 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rating Summary */}
          <div>
            <div className="flex items-end gap-4 mb-6">
              <div className="text-4xl font-bold text-cyan-500">{averageRating}</div>
              <div>
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < Math.round(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-600"}`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-400">Based on {reviews.length} reviews</p>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-sm text-gray-400 w-8">{rating} ★</span>
                  <div className="flex-1 h-2 bg-gray-700 rounded">
                    <div
                      className="h-2 bg-yellow-400 rounded"
                      style={{
                        width: `${reviews.length > 0 ? (ratingDistribution[rating as keyof typeof ratingDistribution] / reviews.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-400 w-8">
                    {ratingDistribution[rating as keyof typeof ratingDistribution]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Write Review */}
          <div className="border-l border-cyan-500/20 pl-6">
            <h3 className="font-semibold mb-4">Write Your Review</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setNewReview({ ...newReview, rating })}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${newReview.rating >= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-600"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="text"
                placeholder="Review title"
                value={newReview.title}
                onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                className="w-full px-3 py-2 bg-black/50 border border-cyan-500/30 rounded text-white text-sm focus:border-cyan-500 outline-none"
              />

              <Textarea
                placeholder="Share your experience..."
                value={newReview.content}
                onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                className="w-full bg-black/50 border border-cyan-500/30 text-white text-sm resize-none focus:border-cyan-500"
              />

              <Button
                onClick={submitReview}
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-600"
              >
                Post Review
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-black/30 border border-cyan-500/20 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span className="font-semibold text-sm">{review.user_name || "Anonymous"}</span>
                  </div>
                  {review.verified_purchase && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Verified</span>
                  )}
                </div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-600"}`}
                    />
                  ))}
                </div>
              </div>
              <span className="text-xs text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
            </div>

            <h4 className="font-semibold mb-1">{review.title}</h4>
            <p className="text-sm text-gray-300 mb-3">{review.content}</p>

            <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-cyan-500">
              <ThumbsUp className="w-4 h-4" />
              Helpful ({review.helpful_count})
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
