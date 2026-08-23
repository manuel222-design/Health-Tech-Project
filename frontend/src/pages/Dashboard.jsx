import { useState, useEffect } from "react"
import { getArticles, getCategories } from "../services/api"

export default function Dashboard({ user, onSelectArticle, onGoToArticles }) {
  const [recentArticles, setRecentArticles] = useState([])
  const [categories, setCategories] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getArticles()
      .then(res => {
        setRecentArticles(res.data.results.slice(0, 5))
        setTotalCount(res.data.pagination?.total_count ?? res.data.results.length)
      })
      .finally(() => setLoading(false))
    getCategories().then(res => setCategories(res.data))
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-gray-400">Loading dashboard...</div>
    </div>
  )

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {greeting}, {user.username.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Everything you need to know about using Taifa Care HMIS.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-2xl font-bold text-violet-600">{totalCount}</p>
          <p className="text-sm text-gray-500">Articles available</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-2xl font-bold text-violet-600">{categories.length}</p>
          <p className="text-sm text-gray-500">Categories</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 col-span-2 sm:col-span-1">
          <p className="text-2xl font-bold text-violet-600">24/7</p>
          <p className="text-sm text-gray-500">AI assistant available</p>
        </div>
      </div>

      {/* Category browse */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
          Browse by Category
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categories.map(c => (
            <button
              key={c.id}
              onClick={onGoToArticles}
              className="bg-white border border-gray-200 hover:border-violet-400 rounded-xl p-4 text-left transition"
            >
              <p className="font-medium text-gray-800 text-sm">{c.name}</p>
              {c.description && (
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{c.description}</p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Recent articles */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Recently Added
          </h2>
          <button onClick={onGoToArticles} className="text-sm text-violet-600 hover:text-violet-700 font-medium">
            View all →
          </button>
        </div>
        <div className="grid gap-3">
          {recentArticles.map(a => (
            <div
              key={a.id}
              onClick={() => onSelectArticle(a.slug)}
              className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-violet-400 transition flex items-center justify-between"
            >
              <span className="text-sm text-gray-800 font-medium">{a.title}</span>
              <span className="text-xs text-violet-600 bg-violet-50 border border-violet-200 rounded-full px-2.5 py-0.5 shrink-0 ml-3">
                {a.content_type?.replace("_", " ")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
