import { useState, useEffect } from "react"
import { getArticles, searchArticles } from "../services/api"

export default function Articles({ onSelectArticle }) {
  const [articles, setArticles]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState("")
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    getArticles()
      .then(res => setArticles(res.data))
      .finally(() => setLoading(false))
  }, [])

  async function handleSearch(e) {
    const q = e.target.value
    setSearch(q)
    if (q.length < 2) {
      const res = await getArticles()
      setArticles(res.data)
      return
    }
    setSearching(true)
    try {
      const res = await searchArticles(q)
      setArticles(res.data.results)
    } finally {
      setSearching(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-gray-400">Loading articles...</div>
    </div>
  )

  return (
    <div>
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder="Search articles... e.g. vitals, registration, TB"
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      <p className="text-sm text-gray-500 mb-4">
        {searching ? "Searching..." : `${articles.length} article${articles.length !== 1 ? "s" : ""} found`}
      </p>

      <div className="grid gap-4">
        {articles.map(article => (
          <div
            key={article.id}
            onClick={() => onSelectArticle(article.slug)}
            className="bg-white border border-gray-200 rounded-xl p-5 cursor-pointer hover:border-teal-400 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">
                  {article.title}
                </h3>
                <p className="text-xs text-gray-400">
                  {article.slug}
                </p>
              </div>
              <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 rounded-full px-3 py-1 whitespace-nowrap">
                {article.status}
              </span>
            </div>
          </div>
        ))}

        {articles.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No articles found for "{search}"
          </div>
        )}
      </div>
    </div>
  )
}