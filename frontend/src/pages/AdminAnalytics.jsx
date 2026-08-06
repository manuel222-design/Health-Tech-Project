import { useState, useEffect } from "react"
import { getAnalytics, getUnansweredQuestions } from "../services/api"

export default function AdminAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [unanswered, setUnanswered] = useState([])

  useEffect(() => {
    getAnalytics()
      .then(res => setData(res.data))
      .finally(() => setLoading(false))
    getUnansweredQuestions().then(res => setUnanswered(res.data)).catch(() => {})
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-gray-400">Loading analytics...</div>
    </div>
  )

  if (!data) return null

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Analytics</h2>
        <p className="text-gray-500 text-sm">Article performance and search insights</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-3xl font-bold text-teal-600">{data.totals.published_articles}</p>
          <p className="text-sm text-gray-500">Published Articles</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-3xl font-bold text-teal-600">{data.totals.users}</p>
          <p className="text-sm text-gray-500">Total Users</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-3xl font-bold text-teal-600">{data.totals.searches}</p>
          <p className="text-sm text-gray-500">Total Searches</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold text-gray-800 mb-3">Top Viewed Articles</h3>
          {data.top_viewed.length === 0 ? (
            <p className="text-sm text-gray-400">No views yet</p>
          ) : (
            <div className="space-y-2">
              {data.top_viewed.map((a, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-700 truncate pr-2">{a.title}</span>
                  <span className="text-teal-600 font-medium shrink-0">{a.views} views</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold text-gray-800 mb-3">Low Rated Articles (≤3★)</h3>
          {data.low_rated.length === 0 ? (
            <p className="text-sm text-gray-400">No low-rated articles — great job!</p>
          ) : (
            <div className="space-y-2">
              {data.low_rated.map((a, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-700 truncate pr-2">{a.title}</span>
                  <span className="text-amber-600 font-medium shrink-0">⭐ {a.avg_rating} ({a.rating_count})</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold text-gray-800 mb-3">Top Search Queries</h3>
          {data.top_searches.length === 0 ? (
            <p className="text-sm text-gray-400">No searches yet</p>
          ) : (
            <div className="space-y-2">
              {data.top_searches.map((s, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-700">"{s.query}"</span>
                  <span className="text-gray-500 shrink-0">{s.count}x</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold text-gray-800 mb-3">Zero-Result Searches (Content Gaps)</h3>
          {data.zero_result_searches.length === 0 ? (
            <p className="text-sm text-gray-400">No unanswered searches — great coverage!</p>
          ) : (
            <div className="space-y-2">
              {data.zero_result_searches.map((s, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-700">"{s.query}"</span>
                  <span className="text-red-500 shrink-0">{s.count}x</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold text-gray-800 mb-3">Flagged for Review (180+ days old)</h3>
          {data.stale_articles.length === 0 ? (
            <p className="text-sm text-gray-400">Nothing flagged — all content is recent!</p>
          ) : (
            <div className="space-y-2">
              {data.stale_articles.map((a, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-700 truncate pr-2">{a.title}</span>
                  <span className="text-amber-600 shrink-0">
                    {new Date(a.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold text-gray-800 mb-3">Unanswered Chatbot Questions</h3>
          {unanswered.length === 0 ? (
            <p className="text-sm text-gray-400">No unanswered questions — the chatbot is finding answers!</p>
          ) : (
            <div className="space-y-2">
              {unanswered.map((u, i) => (
                <div key={i} className="text-sm">
                  <p className="text-gray-700">"{u.question}"</p>
                  <p className="text-xs text-gray-400">{new Date(u.asked_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}