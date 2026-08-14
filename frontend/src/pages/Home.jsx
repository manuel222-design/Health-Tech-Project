import { useEffect, useState } from "react"
import { getHomepage } from "../services/api"

export default function Home({ onSelectArticle, onSelectCategory }) {
console.log("HOME COMPONENT LOADED")
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    getHomepage()
      .then(res => setData(res.data))
      .catch(() => setError("Failed to load dashboard"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">
            Loading Taifa Care dashboard...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white border border-red-200 rounded-2xl p-8 text-center">
        <div className="text-red-500 text-3xl mb-3">!</div>
        <h2 className="font-semibold text-slate-800 mb-1">
          Unable to load dashboard
        </h2>
        <p className="text-sm text-slate-500">{error}</p>
      </div>
    )
  }

  const featuredArticles = data?.featured_articles || []
  const categories = data?.categories || []

  const totalArticles = categories.reduce(
    (total, category) => total + (category.article_count || 0),
    0
  )

  const totalViews = featuredArticles.reduce(
    (total, article) => total + (article.view_count || 0),
    0
  )

  return (
    <div className="space-y-7 pb-10">

      {/* Welcome */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-600 text-white shadow-md">
        <div className="absolute right-0 top-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3" />
        <div className="absolute right-24 bottom-0 w-32 h-32 rounded-full bg-white/5 translate-y-1/2" />

        <div className="relative px-6 py-7 sm:px-8 sm:py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

            <div>
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-teal-200" />
                <span className="text-xs uppercase tracking-wider text-teal-100 font-semibold">
                  Knowledge Centre
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                Welcome back, {localStorage.getItem("username") || "User"}
              </h2>

              <p className="text-sm sm:text-base text-teal-50 max-w-2xl">
                Access trusted Taifa Care guidance, healthcare workflows and
                practical resources from one place.
              </p>
            </div>

            <button
              onClick={() => document.querySelector("[data-quick-actions]")?.scrollIntoView({ behavior: "smooth" })}
              className="shrink-0 inline-flex items-center justify-center gap-2 bg-white text-teal-700 font-semibold px-5 py-3 rounded-xl shadow-sm hover:bg-teal-50 transition"
            >
              Explore Centre
              <span>→</span>
            </button>

          </div>
        </div>
      </section>


      {/* Statistics */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
              Published Guides
            </span>
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              ▤
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {totalArticles}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Available knowledge resources
          </p>
        </div>


        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
              Categories
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              ◈
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {categories.length}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Healthcare knowledge areas
          </p>
        </div>


        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
              Featured
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              ★
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {featuredArticles.length}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Recommended guides
          </p>
        </div>


        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
              Guide Views
            </span>
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              ◉
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {totalViews}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Views across featured guides
          </p>
        </div>

      </section>


      {/* Quick Actions */}
      <section data-quick-actions>

        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-800">
            Quick Actions
          </h2>
          <p className="text-sm text-slate-500">
            Common tasks and knowledge centre shortcuts
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">

          <button
            onClick={() => document.querySelector("[data-knowledge]")?.scrollIntoView({ behavior: "smooth" })}
            className="group bg-white border border-slate-200 rounded-xl p-5 text-left hover:border-teal-300 hover:shadow-md transition"
          >
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center text-lg mb-4 group-hover:bg-teal-600 group-hover:text-white transition">
              ⌕
            </div>
            <h3 className="font-semibold text-slate-800">
              Browse Knowledge
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Find guides and healthcare resources.
            </p>
          </button>


          <button
            onClick={() => featuredArticles[0] && onSelectArticle(featuredArticles[0].slug)}
            className="group bg-white border border-slate-200 rounded-xl p-5 text-left hover:border-teal-300 hover:shadow-md transition"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-lg mb-4 group-hover:bg-blue-600 group-hover:text-white transition">
              ★
            </div>
            <h3 className="font-semibold text-slate-800">
              Featured Guide
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Open a recommended knowledge resource.
            </p>
          </button>


          <button
            onClick={() => document.querySelector("[data-knowledge]")?.scrollIntoView({ behavior: "smooth" })}
            className="group bg-white border border-slate-200 rounded-xl p-5 text-left hover:border-teal-300 hover:shadow-md transition"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-lg mb-4 group-hover:bg-purple-600 group-hover:text-white transition">
              ◈
            </div>
            <h3 className="font-semibold text-slate-800">
              Browse Categories
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Explore healthcare workflow areas.
            </p>
          </button>

        </div>
      </section>


      {/* Knowledge Centre Updates */}
      <section>

        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Knowledge Centre Updates
            </h2>
            <p className="text-sm text-slate-500">
              Featured and frequently accessed guidance
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">

          {featuredArticles.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No featured guides available.
            </div>
          ) : (
            featuredArticles.slice(0, 5).map((article, index) => (
              <button
                key={article.id}
                onClick={() => onSelectArticle(article.slug)}
                className="w-full flex items-center gap-4 px-5 py-4 border-b last:border-b-0 border-slate-100 hover:bg-slate-50 text-left transition group"
              >

                <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center text-xs font-bold shrink-0">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-sm text-slate-800 truncate group-hover:text-teal-700 transition">
                    {article.title}
                  </h3>

                  <p className="text-xs text-slate-400 mt-1">
                    {article.content_type?.replaceAll("_", " ") || "Guide"}
                    {" · "}
                    {article.view_count || 0} views
                  </p>
                </div>

                <span className="text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition">
                  →
                </span>

              </button>
            ))
          )}

        </div>
      </section>


      {/* Knowledge Areas */}
      <section data-knowledge>

        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-800">
            Knowledge Areas
          </h2>
          <p className="text-sm text-slate-500">
            Browse healthcare guidance by operational area
          </p>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">

          {categories.map((category, index) => (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className="group bg-white border border-slate-200 rounded-xl p-5 text-left hover:border-teal-300 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >

              <div className="flex items-start justify-between gap-3">

                <div className="w-11 h-11 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold shrink-0 group-hover:bg-teal-600 group-hover:text-white transition">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <span className="bg-slate-50 border border-slate-200 text-slate-500 text-[11px] font-semibold px-2 py-1 rounded-full">
                  {category.article_count || 0} guides
                </span>

              </div>

              <h3 className="font-semibold text-slate-800 mt-4 group-hover:text-teal-700 transition">
                {category.name}
              </h3>

              <p className="text-xs text-slate-500 leading-relaxed mt-2 line-clamp-2">
                {category.description || "Healthcare knowledge and operational guidance."}
              </p>

              <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-100">
                <span className="text-[11px] text-slate-400">
                  Knowledge area
                </span>

                <span className="text-xs font-semibold text-teal-600">
                  Explore →
                </span>
              </div>

            </button>
          ))}

        </div>
      </section>


      {/* Footer CTA */}
      <section className="rounded-xl bg-slate-900 px-6 py-7 sm:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">

        <div>
          <h2 className="text-base font-bold text-white">
            Need help with Taifa Care?
          </h2>

          <p className="text-xs text-slate-400 mt-1">
            Use the Healthtech AI assistant for quick guidance while working.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 text-sm font-semibold text-teal-300">
          <span>AI Assistant</span>
          <span>→</span>
        </div>

      </section>

    </div>
  )
}

function userDisplayName() {
  const username = localStorage.getItem("username") || "User"

  return username
    .replaceAll("_", " ")
    .replace(/\b\w/g, letter => letter.toUpperCase())
}
