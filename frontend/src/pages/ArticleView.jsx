import { useState, useEffect } from "react"
import { getArticle, submitFeedback, getFeedbackSummary } from "../services/api"
import ReactMarkdown from "react-markdown"

export default function ArticleView({ slug, onBack }) {
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState("")
  const [rating, setRating]   = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    getArticle(slug)
      .then(res => setArticle(res.data))
      .catch(() => setError("Article not found"))
      .finally(() => setLoading(false))
    getFeedbackSummary(slug).then(res => setSummary(res.data))
  }, [slug])

  async function handleSubmitFeedback() {
    if (rating === 0) return
    try {
      await submitFeedback(slug, rating, comment)
      setSubmitted(true)
      const res = await getFeedbackSummary(slug)
      setSummary(res.data)
    } catch (err) {
      alert("Failed to submit feedback")
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-gray-400">Loading article...</div>
    </div>
  )

  if (error) return (
    <div className="text-center py-12 text-red-400">{error}</div>
  )

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-6 text-sm font-medium"
      >
        ← Back to articles
      </button>

      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h1 className="text-2xl font-bold text-gray-800">
            {article.title}
          </h1>
          <a
            href={`http://127.0.0.1:8000/api/v1/articles/${slug}/pdf`}
            download
            className="shrink-0 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition whitespace-nowrap"
          >
            📄 Download PDF
          </a>
        </div>
        <p className="text-xs text-gray-400 mb-6">
          Last updated: {new Date(article.created_at).toLocaleDateString()}
        </p>
        <hr className="mb-6" />

        <div className="prose prose-teal max-w-none">
          <ReactMarkdown>{article.body_markdown}</ReactMarkdown>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          {summary && summary.total_ratings > 0 && (
            <p className="text-sm text-gray-500 mb-4">
              ⭐ {summary.average_rating} average — {summary.total_ratings} rating{summary.total_ratings !== 1 ? "s" : ""}
            </p>
          )}

          {submitted ? (
            <p className="text-sm text-teal-700 bg-teal-50 border border-teal-200 rounded-lg px-4 py-3">
              Thanks for your feedback!
            </p>
          ) : (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Was this article helpful?</p>
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="text-2xl transition"
                  >
                    {(hoverRating || rating) >= star ? "⭐" : "☆"}
                  </button>
                ))}
              </div>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Optional comment..."
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                onClick={handleSubmitFeedback}
                disabled={rating === 0}
                className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-50"
              >
                Submit Feedback
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}