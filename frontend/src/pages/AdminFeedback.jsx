import { useEffect, useMemo, useState } from "react"
import { getAdminFeedback } from "../services/api"

function RatingStars({ rating }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          className={
            star <= rating
              ? "text-amber-500"
              : "text-slate-300"
          }
        >
          ★
        </span>
      ))}
    </div>
  )
}

function formatDate(value) {
  if (!value) return "Unknown date"

  try {
    return new Date(value).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  } catch {
    return "Unknown date"
  }
}

export default function AdminFeedback() {
  const [feedback, setFeedback] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [ratingFilter, setRatingFilter] = useState("")
  const [commentsOnly, setCommentsOnly] = useState(false)
  const [search, setSearch] = useState("")

  useEffect(() => {
    getAdminFeedback()
      .then(response => {
        setFeedback(response.data || [])
      })
      .catch(err => {
        console.error("ADMIN FEEDBACK LOAD ERROR:", err)
        setError("Unable to load feedback.")
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const filteredFeedback = useMemo(() => {
    const query = search.trim().toLowerCase()

    return feedback.filter(item => {
      const matchesRating =
        !ratingFilter ||
        String(item.rating) === ratingFilter

      const matchesComments =
        !commentsOnly ||
        Boolean(item.comment?.trim())

      const matchesSearch =
        !query ||
        item.article_title?.toLowerCase().includes(query) ||
        item.comment?.toLowerCase().includes(query)

      return (
        matchesRating &&
        matchesComments &&
        matchesSearch
      )
    })
  }, [feedback, ratingFilter, commentsOnly, search])

  const total = feedback.length

  const average =
    total > 0
      ? (
          feedback.reduce(
            (sum, item) => sum + Number(item.rating || 0),
            0
          ) / total
        ).toFixed(1)
      : "—"

  const lowRated = feedback.filter(
    item => Number(item.rating) <= 3
  ).length

  const withComments = feedback.filter(
    item => item.comment?.trim()
  ).length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm text-slate-400">
          Loading feedback...
        </div>
      </div>
    )
  }

  return (
    <section className="space-y-6 pb-20">

      <div>
        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <path d="M20 6H4v12h4l4 3 4-3h4V6Z" />
              <path d="M8 10h8" />
              <path d="M8 14h5" />
            </svg>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Feedback
            </h2>

            <p className="text-sm text-slate-500 mt-0.5">
              Review article ratings and comments to improve the knowledge base.
            </p>
          </div>

        </div>
      </div>


      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}


      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Responses
          </div>

          <div className="text-2xl font-bold text-slate-800 mt-2">
            {total}
          </div>
        </div>


        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Average rating
          </div>

          <div className="flex items-center gap-2 mt-2">
            <div className="text-2xl font-bold text-slate-800">
              {average}
            </div>

            {total > 0 && (
              <span className="text-amber-500 text-sm">
                ★
              </span>
            )}
          </div>
        </div>


        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            With comments
          </div>

          <div className="text-2xl font-bold text-slate-800 mt-2">
            {withComments}
          </div>
        </div>


        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Needs attention
          </div>

          <div className="text-2xl font-bold text-red-600 mt-2">
            {lowRated}
          </div>

          <div className="text-xs text-slate-400 mt-1">
            Ratings of 3 or below
          </div>
        </div>

      </div>


      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">

        <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-3">

          <input
            type="text"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search article or feedback..."
            className="border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
          />

          <select
            value={ratingFilter}
            onChange={event => setRatingFilter(event.target.value)}
            className="border border-slate-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
          >
            <option value="">All ratings</option>
            <option value="5">5 stars</option>
            <option value="4">4 stars</option>
            <option value="3">3 stars</option>
            <option value="2">2 stars</option>
            <option value="1">1 star</option>
          </select>

          <button
            type="button"
            onClick={() => setCommentsOnly(prev => !prev)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition border ${
              commentsOnly
                ? "bg-violet-50 text-violet-700 border-violet-200"
                : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
            }`}
          >
            {commentsOnly ? "Comments only" : "All feedback"}
          </button>

        </div>

      </div>


      <section className="space-y-3">

        {filteredFeedback.map(item => (

          <article
            key={item.id}
            className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5"
          >

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">

              <div className="min-w-0">

                <div className="font-semibold text-slate-800">
                  {item.article_title}
                </div>

                <div className="text-xs text-slate-400 mt-1">
                  Submitted {formatDate(item.submitted_at)}
                </div>

              </div>


              <div className="flex items-center gap-3 shrink-0">

                <RatingStars rating={Number(item.rating)} />

                <span className="text-xs font-semibold text-slate-500">
                  {item.rating}/5
                </span>

              </div>

            </div>


            <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 p-4">

              {item.comment?.trim() ? (
                <p className="text-sm text-slate-600 leading-6">
                  “{item.comment}”
                </p>
              ) : (
                <p className="text-sm text-slate-400 italic">
                  No written comment was provided.
                </p>
              )}

            </div>

          </article>

        ))}


        {filteredFeedback.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl py-16 px-6 text-center">

            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">

              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6"
              >
                <path d="M20 6H4v12h4l4 3 4-3h4V6Z" />
                <path d="M8 10h8" />
                <path d="M8 14h5" />
              </svg>

            </div>

            <h3 className="font-semibold text-slate-700">
              No feedback found
            </h3>

            <p className="text-sm text-slate-400 mt-1">
              Try changing the search or rating filter.
            </p>

          </div>
        )}

      </section>

    </section>
  )
}
