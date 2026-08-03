import { useState, useEffect } from "react"
import { getArticles, searchArticles, getCategories, getTags } from "../services/api"

export default function Articles({ onSelectArticle }) {
  const [articles, setArticles]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState("")
  const [searching, setSearching] = useState(false)
  const [categories, setCategories] = useState([])
  const [categoryFilter, setCategoryFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [allTags, setAllTags] = useState([])
  const [tagFilter, setTagFilter] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    getArticles()
      .then(res => setArticles(res.data))
      .finally(() => setLoading(false))
    getCategories().then(res => setCategories(res.data))
    getTags().then(res => setAllTags(res.data))
  }, [])

  async function runSearch(q, catFilter, typeF, tagF) {
    if (q.length < 2) {
      const res = await getArticles()
      setArticles(res.data)
      return
    }
    setSearching(true)
    try {
      const filters = {}
      if (catFilter) filters.category_id = catFilter
      if (typeF) filters.content_type = typeF
      if (tagF) filters.tag_id = tagF
      const res = await searchArticles(q, filters)
      setArticles(res.data.results)
    } finally {
      setSearching(false)
    }
  }

  function handleSearch(e) {
    const q = e.target.value
    setSearch(q)
    runSearch(q, categoryFilter, typeFilter, tagFilter)

    clearTimeout(window.__searchDebounce)
    if (q.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    window.__searchDebounce = setTimeout(async () => {
      try {
        const res = await searchArticles(q, {})
        setSuggestions(res.data.results.slice(0, 5))
        setShowSuggestions(true)
      } catch (err) {
        setSuggestions([])
      }
    }, 300)
  }

  function handleSuggestionClick(slug) {
    setShowSuggestions(false)
    onSelectArticle(slug)
  }

  function handleCategoryFilterChange(e) {
    const val = e.target.value
    setCategoryFilter(val)
    runSearch(search, val, typeFilter, tagFilter)
  }

  function handleTypeFilterChange(e) {
    const val = e.target.value
    setTypeFilter(val)
    runSearch(search, categoryFilter, val, tagFilter)
  }

  function handleTagFilterChange(e) {
    const val = e.target.value
    setTagFilter(val)
    runSearch(search, categoryFilter, typeFilter, val)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-gray-400">Loading articles...</div>
    </div>
  )

  return (
    <div>
      <div className="mb-3 relative">
        <input
          type="text"
          value={search}
          onChange={handleSearch}
          onFocus={() => search.length >= 2 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder="Search articles... e.g. vitals, registration, TB"
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
            {suggestions.map(s => (
              <button
                key={s.id}
                onMouseDown={() => handleSuggestionClick(s.slug)}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-teal-50 transition border-b border-gray-100 last:border-0"
              >
                {s.title}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <select
          value={categoryFilter}
          onChange={handleCategoryFilterChange}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">All categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          value={typeFilter}
          onChange={handleTypeFilterChange}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">All content types</option>
          <option value="how_to">How-To Guide</option>
          <option value="sop">SOP</option>
          <option value="faq">FAQ</option>
          <option value="feature_reference">Feature Reference</option>
          <option value="troubleshooting">Troubleshooting</option>
          <option value="release_notes">Release Notes</option>
        </select>

        <select
          value={tagFilter}
          onChange={handleTagFilterChange}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">All tags</option>
          {allTags.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        {searching ? "Searching..." : `${articles.length} article${articles.length !== 1 ? "s" : ""} found`}
      </p>

      <div className="grid gap-4 pb-20">
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