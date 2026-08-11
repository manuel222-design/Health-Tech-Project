import { useEffect, useState } from "react"
import { getHomepage } from "../services/api"

export default function Home({ onSelectArticle, onSelectCategory }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    getHomepage()
      .then(res => setData(res.data))
      .catch(() => setError("Failed to load homepage"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading Healthtech Knowledge Base...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white border border-red-200 rounded-2xl p-8 text-center">
        <div className="text-red-500 text-3xl mb-3">!</div>
        <h2 className="font-semibold text-gray-800 mb-1">
          Unable to load homepage
        </h2>
        <p className="text-sm text-gray-500">{error}</p>
      </div>
    )
  }

  const featuredArticles = data?.featured_articles || []
  const categories = data?.categories || []

  const totalArticles = categories.reduce(
    (total, category) => total + category.article_count,
    0
  )

  return (
    <div className="space-y-12 pb-10">

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-600 text-white shadow-lg">
        <div className="absolute -right-16 -top-20 w-64 h-64 rounded-full bg-white/10" />
        <div className="absolute -right-8 bottom-[-90px] w-72 h-72 rounded-full bg-white/5" />

        <div className="relative px-6 py-10 sm:px-10 sm:py-14 lg:px-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1.5 mb-5">
              <span className="w-2 h-2 rounded-full bg-teal-200" />
              <span className="text-xs font-semibold tracking-wide text-teal-50">
                TAIFA CARE HMIS KNOWLEDGE BASE
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-5">
              Everything you need to work smarter with Taifa Care.
            </h1>

            <p className="text-teal-50 text-base sm:text-lg leading-relaxed max-w-2xl mb-8">
              Find practical HMIS guides, clinical workflows and step-by-step
              resources designed to help healthcare teams get the most from
              Taifa Care.
            </p>

            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" })
                document
                  .querySelector("[data-knowledge-base]")
                  ?.scrollIntoView({ behavior: "smooth" })
              }}
              className="inline-flex items-center gap-2 bg-white text-teal-700 font-semibold px-5 py-3 rounded-xl shadow-sm hover:bg-teal-50 transition"
            >
              Explore the knowledge base
              <span>→</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-10 max-w-xl">
            <div className="bg-white/10 border border-white/10 rounded-xl px-4 py-3">
              <p className="text-2xl font-bold">{totalArticles}</p>
              <p className="text-xs text-teal-100 mt-1">Published guides</p>
            </div>

            <div className="bg-white/10 border border-white/10 rounded-xl px-4 py-3">
              <p className="text-2xl font-bold">{categories.length}</p>
              <p className="text-xs text-teal-100 mt-1">Categories</p>
            </div>

            <div className="bg-white/10 border border-white/10 rounded-xl px-4 py-3 col-span-2 sm:col-span-1">
              <p className="text-2xl font-bold">{featuredArticles.length}</p>
              <p className="text-xs text-teal-100 mt-1">Featured guides</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <section>
        <div className="flex items-end justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-6 bg-teal-600 rounded-full" />
              <h2 className="text-2xl font-bold text-gray-800">
                Featured Articles
              </h2>
            </div>

            <p className="text-gray-500 text-sm ml-3.5">
              Popular and important guides to get you started
            </p>
          </div>
        </div>

        {featuredArticles.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
            <p className="text-gray-500">No featured articles available.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredArticles.map((article, index) => (
              <button
                key={article.id}
                onClick={() => onSelectArticle(article.slug)}
                className="group text-left bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-teal-300 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-5">
                  <span className="inline-block text-xs font-semibold uppercase tracking-wide bg-teal-50 text-teal-700 px-3 py-1 rounded-full">
                    {article.content_type?.replaceAll("_", " ") || "Guide"}
                  </span>

                  <span className="text-xs text-gray-400">
                    #{String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <h3 className="font-bold text-gray-800 text-lg leading-snug mb-4 group-hover:text-teal-700 transition">
                  {article.title}
                </h3>

                <div className="flex items-center text-sm font-medium text-teal-600">
                  <span className="text-xs text-gray-400">
                    {article.view_count}
                    {article.view_count === 1 ? "view" : "views"}
                  </span>

                  <span className="ml-2 group-hover:translate-x-1 transition-transform">
                    Read guide →
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Categories */}
      <section data-knowledge-base>
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-6 bg-teal-600 rounded-full" />
            <h2 className="text-2xl font-bold text-gray-800">
              Browse by Category
            </h2>
          </div>

          <p className="text-gray-500 text-sm ml-3.5">
            Find guides organized around healthcare workflows
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-5">
          {categories.map((category, index) => (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className="group bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer text-left"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-lg group-hover:bg-teal-600 group-hover:text-white transition">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold text-gray-800 text-lg group-hover:text-teal-700 transition">
                      {category.name}
                    </h3>

                    <span className="shrink-0 bg-gray-50 border border-gray-200 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                      {category.article_count}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 leading-relaxed mt-2">
                    {category.description}
                  </p>

                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-400">
                      {category.article_count} guides
                    </span>

                    <span className="text-sm font-medium text-teal-600">
                      Browse guides →
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-gray-900 rounded-2xl px-6 py-8 sm:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div>
          <h2 className="text-lg font-bold text-white mb-1">
            Can't find what you're looking for?
          </h2>
          <p className="text-sm text-gray-400">
            Search the full knowledge base for specific Taifa Care guidance.
          </p>
        </div>

        <button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" })
          }}
          className="shrink-0 bg-teal-600 hover:bg-teal-500 text-white font-semibold px-5 py-2.5 rounded-xl transition"
        >
          Search the knowledge base
        </button>
      </section>

    </div>
  )
}
