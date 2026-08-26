import { useEffect, useState } from "react"
import { getHomepage } from "../services/api"

export default function Home({
  onSelectArticle,
  onSelectCategory,
}) {
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
          <div className="w-10 h-10 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin mx-auto mb-4" />

          <p className="text-sm text-slate-500">
            Loading Featured Knowledge...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white border border-red-200 rounded-2xl p-8 text-center">
        <div className="w-11 h-11 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3 text-xl font-bold">
          !
        </div>

        <h2 className="font-semibold text-slate-800 mb-1">
          Unable to load dashboard
        </h2>

        <p className="text-sm text-slate-500">
          {error}
        </p>
      </div>
    )
  }

  const featuredArticles =
    data?.featured_articles || []

  const categories =
    data?.categories || []

  const totalArticles = categories.reduce(
    (total, category) =>
      total + (category.article_count || 0),
    0
  )

  const rawUsername =
    localStorage.getItem("username") || "User"

  const username =
    rawUsername
      .replace(/\s+Admin$/i, "")
      .replace(
        /^(Dr\.?|Prof\.?|Mr\.?|Mrs\.?|Ms\.?|Miss)\s+/i,
        ""
      )
      .trim()
      .split(/\s+/)[0] || "User"

  const coveredCategories = categories.filter(
    category => (category.article_count || 0) > 0
  ).length

  const emptyCategories = categories.filter(
    category => (category.article_count || 0) === 0
  ).length

  return (
    <div className="space-y-8 pb-12">

      {

}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-800 via-violet-800 to-slate-900 text-white shadow-lg">

        <div className="absolute -right-28 -top-24 w-96 h-96 rounded-full bg-violet-400/15 blur-3xl" />
        <div className="absolute right-20 -bottom-24 w-64 h-64 rounded-full bg-slate-900/15 blur-3xl" />
        <div className="absolute -left-20 -bottom-24 w-64 h-64 rounded-full bg-violet-300/8 blur-3xl" />
        <div className="absolute left-1/2 -top-20 w-48 h-48 rounded-full bg-white/5 blur-3xl" />

        <div className="relative px-6 py-8 sm:px-9 sm:py-9">

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-7">

            <div className="max-w-3xl">

              <div className="inline-flex items-center gap-2 mb-3">

                <span className="w-1.5 h-1.5 rounded-full bg-violet-200" />

                <span className="text-[10px] uppercase tracking-[0.16em] text-violet-100 font-semibold">
                  Taifa Care
                </span>

              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight tracking-tight">
                Welcome, {username}
              </h1>

              <p className="text-sm sm:text-base text-violet-50 mt-3 max-w-2xl leading-relaxed">
                Knowledge, activity and system overview.
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-6">

                <button
                  type="button"
                  onClick={() =>
                    document
                      .querySelector("[data-knowledge-centre]")
                      ?.scrollIntoView({
                        behavior: "smooth",
                      })
                  }
                  className="inline-flex items-center justify-center gap-2 bg-white text-violet-800 font-semibold px-5 py-3 rounded-xl shadow-sm hover:bg-violet-50 transition"
                >
                  Explore Knowledge Base
                  <span>→</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (window.openTaifaCareAssistant) {
                      window.openTaifaCareAssistant()
                    }
                  }}
                  className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-5 py-3 rounded-xl hover:bg-white/15 transition"
                >
                  Ask AI Assistant
                  <span>→</span>
                </button>

              </div>

            </div>


            <div className="flex items-center gap-3 shrink-0">

              <div className="px-4 py-3 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm min-w-[110px]">

                <div className="text-xl font-bold text-white">
                  {totalArticles}
                </div>

                <div className="text-[10px] uppercase tracking-wide text-violet-100 mt-0.5">
                  Guides
                </div>

              </div>


              <div className="w-px h-10 bg-white/15" />


              <div className="px-4 py-3 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm min-w-[110px]">

                <div className="text-xl font-bold text-white">
                  {categories.length}
                </div>

                <div className="text-[10px] uppercase tracking-wide text-violet-100 mt-0.5">
                  Areas
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {

}
      <section className="grid grid-cols-1 lg:grid-cols-4 gap-4">

        {}
        <div className="lg:col-span-2">

          <div className="relative overflow-hidden h-full min-h-[190px] rounded-2xl bg-gradient-to-br from-violet-700 via-violet-600 to-indigo-600 text-white p-6 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition duration-200">

            <div className="absolute -right-10 -top-10 w-36 h-36 rounded-full bg-white/10 blur-2xl" />

            <div className="relative h-full flex flex-col justify-between">

              <div>

                <div className="flex items-center gap-2">

                  <span className="w-2 h-2 rounded-full bg-violet-200" />

                  <span className="text-[11px] uppercase tracking-[0.14em] font-bold text-violet-50">
                    Published
                  </span>

                </div>

                <div className="text-5xl font-bold mt-6 tracking-tight">
                  {totalArticles}
                </div>

                <p className="text-sm text-violet-50 mt-1">
                  Available
                </p>

              </div>


              <button
                type="button"
                onClick={() =>
                  document
                    .querySelector("[data-knowledge-centre]")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    })
                }
                className="self-start mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-violet-100 transition"
              >
                Explore guides
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </button>

            </div>

          </div>

        </div>


        {}
        <div>

          <div className="relative overflow-hidden h-full min-h-[190px] rounded-2xl bg-gradient-to-br from-slate-50 via-white to-white border border-slate-200 border-t-2 border-t-slate-500 p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition duration-200">

            <div className="flex items-center gap-2">

              <span className="w-2 h-2 rounded-full bg-slate-500" />

              <span className="text-[11px] uppercase tracking-[0.12em] text-slate-500 font-bold">
                Browse by Area
              </span>

            </div>

            <div className="text-3xl font-bold text-slate-700 mt-7">
              {categories.length}
            </div>

            <p className="text-xs text-slate-500 mt-1.5">
              Topic areas
            </p>

            <div className="absolute bottom-5 right-5 text-slate-300 text-lg">
              →
            </div>

          </div>

        </div>


        {}
        <div>

          <div className="relative overflow-hidden h-full min-h-[190px] rounded-2xl bg-white border border-slate-200 border-t-2 border-t-emerald-500 p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition duration-200">

            <div className="flex items-center gap-2">

              <span className="w-2 h-2 rounded-full bg-emerald-500" />

              <span className="text-[11px] uppercase tracking-[0.12em] text-slate-500 font-bold">
                Covered Areas
              </span>

            </div>

            <div className="flex items-end gap-1.5 mt-7">

              <span className="text-3xl font-bold text-emerald-700">
                {coveredCategories}
              </span>

              <span className="text-sm text-slate-400 mb-1">
                / {categories.length}
              </span>

            </div>

            <p className="text-xs text-slate-500 mt-1.5">
              Areas with content
            </p>

            <div className="absolute bottom-5 right-5 text-slate-300 text-lg">
              →
            </div>

          </div>

        </div>


      </section>


      {

}
      <section>

        <div className="flex items-end justify-between mb-4">

          <div>

            <div className="inline-flex items-center gap-2 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />

              <span className="text-[10px] uppercase tracking-wider text-violet-700 font-semibold">
                Activity
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-semibold text-slate-800">
              Today
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              System activity today.
            </p>

          </div>

          <span className="text-[11px] text-slate-400 hidden sm:block">
            Today
          </span>

        </div>


        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          <ActivityCard
            label="Searches"
            value={
              data?.today_activity?.searches || 0
            }
            description="Knowledge searches"
            iconClass="bg-blue-50 text-blue-600"
            icon={
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <circle cx="11" cy="11" r="6.5" />
                <path d="m16 16 4 4" />
              </svg>
            }
          />

          <ActivityCard
            label="Published Guides"
            value={
              data?.today_activity?.published_guides || 0
            }
            description="Guides published today"
            iconClass="bg-violet-50 text-violet-700"
            icon={
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <path d="M5 4h14v16H5z" />
                <path d="M8 8h8" />
                <path d="M8 12h8" />
                <path d="m8 16 2 2 5-5" />
              </svg>
            }
          />

          <ActivityCard
            label="System Actions"
            value={
              data?.today_activity?.system_actions || 0
            }
            description="Recorded system actions"
            iconClass="bg-slate-100 text-slate-600"
            icon={
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <path d="M12 3v4" />
                <path d="M12 17v4" />
                <path d="M3 12h4" />
                <path d="M17 12h4" />
                <circle cx="12" cy="12" r="4" />
              </svg>
            }
          />

        </div>

      </section>


      {

}
      <section data-knowledge-centre>

        <div className="flex items-end justify-between mb-4">

          <div>

            <div className="inline-flex items-center gap-2 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />

              <span className="text-[10px] uppercase tracking-wider text-violet-700 font-semibold">
                Knowledge
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-semibold text-slate-800">
              Featured Knowledge
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Recently featured guidance.
            </p>

          </div>

          {featuredArticles.length > 0 && (
            <span className="text-xs text-slate-400 hidden sm:block">
              {featuredArticles.length} featured
            </span>
          )}

        </div>


        {featuredArticles.length === 0 ? (

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-10 text-center">

            <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">

              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="M5 5h14v14H5z" />
                <path d="M8 9h8" />
                <path d="M8 13h5" />
              </svg>

            </div>

            <p className="text-sm text-slate-500">
              No featured guides are available yet.
            </p>

          </div>

        ) : (

          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

            <button
              type="button"
              onClick={() =>
                onSelectArticle(
                  featuredArticles[0].slug
                )
              }
              className="group text-left p-6 sm:p-7 bg-gradient-to-br from-violet-50 via-white to-white hover:from-violet-100/70 transition border-b lg:border-b-0 lg:border-r border-slate-200"
            >

              <div className="flex items-center justify-between gap-3">

                <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-wider font-semibold text-violet-700 bg-white/80 border border-violet-100 px-2.5 py-1 rounded-full">

                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />

                  Featured Guide

                </span>

                <span className="text-slate-300 group-hover:text-violet-600 transition">
                  →
                </span>

              </div>

              <div className="mt-8">

                <div className="w-11 h-11 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center mb-4 group-hover:bg-violet-600 group-hover:text-white transition">

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5"
                  >
                    <path d="M5 4h14v16H5z" />
                    <path d="M8 8h8" />
                    <path d="M8 12h8" />
                    <path d="M8 16h5" />
                  </svg>

                </div>

                <h3 className="text-lg sm:text-xl font-semibold text-slate-800 leading-tight group-hover:text-violet-700 transition">
                  {featuredArticles[0].title}
                </h3>

                <p className="text-sm text-slate-500 mt-3 max-w-xl">
                  {featuredArticles[0].content_type
                    ?.replaceAll("_", " ")
                    || "Knowledge guide"}
                </p>

                <div className="flex flex-wrap items-center gap-3 mt-6">

                  {featuredArticles[0].category_name && (
                    <>
                      <span className="text-xs bg-violet-50 text-violet-700 px-2.5 py-1 rounded-full border border-violet-100">
                        {featuredArticles[0].category_name}
                      </span>

                      <span className="text-slate-300">
                        •
                      </span>
                    </>
                  )}

                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">

                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-3.5 h-3.5"
                    >
                      <path d="M3.5 12s3.2-6 8.5-6 8.5 6 8.5 6-3.2 6-8.5 6-8.5-6-8.5-6Z" />
                      <circle cx="12" cy="12" r="2.5" />
                    </svg>

                    {featuredArticles[0].view_count || 0} views

                  </span>

                  <span className="text-slate-300">
                    •
                  </span>

                  <span className="text-xs font-semibold text-violet-700">
                    Read guide →
                  </span>

                </div>

              </div>

            </button>

            <div className="flex flex-col">

              <div className="px-5 py-4 border-b border-slate-100">

                <div className="flex items-center justify-between">

                  <h3 className="text-sm font-semibold text-slate-800">
                    Recent knowledge
                  </h3>

                  <span className="text-[11px] text-slate-400">
                    {Math.min(featuredArticles.length, 4)} items
                  </span>

                </div>

              </div>

              <div className="divide-y divide-slate-100">

                {featuredArticles.slice(1, 5).map(article => (
                  <button
                    key={article.id}
                    type="button"
                    onClick={() =>
                      onSelectArticle(article.slug)
                    }
                    className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-slate-50 transition group"
                  >

                    <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 group-hover:bg-violet-50 group-hover:text-violet-700 transition">

                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-4 h-4"
                      >
                        <path d="M5 4h14v16H5z" />
                        <path d="M8 8h8" />
                        <path d="M8 12h8" />
                        <path d="M8 16h5" />
                      </svg>

                    </div>

                    <div className="min-w-0 flex-1">

                      <p className="text-sm font-medium text-slate-700 truncate group-hover:text-violet-700 transition">
                        {article.title}
                      </p>

                      <div className="flex items-center gap-2 mt-1">

                        {article.category_name && (
                          <>
                            <span className="text-[10px] text-violet-600">
                              {article.category_name}
                            </span>

                            <span className="text-slate-300">
                              •
                            </span>
                          </>
                        )}

                        <span className="text-[10px] uppercase tracking-wide text-slate-400">
                          {article.content_type
                            ?.replaceAll("_", " ")
                            || "Guide"}
                        </span>

                        <span className="text-slate-300">
                          •
                        </span>

                        <span className="text-[10px] text-slate-400">
                          {article.view_count || 0} views
                        </span>

                      </div>

                    </div>

                    <span className="text-slate-300 group-hover:text-violet-600 group-hover:translate-x-0.5 transition">
                      →
                    </span>

                  </button>
                ))}

                {featuredArticles.length === 1 && (
                  <div className="px-5 py-8 text-center">
                    <p className="text-xs text-slate-400">
                      More knowledge resources will appear here as they are featured.
                    </p>
                  </div>
                )}

              </div>

            </div>

          </div>

        )}

      </section>


      {

}
      <section>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">

          <div>

            <div className="inline-flex items-center gap-2 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />

              <span className="text-[10px] uppercase tracking-wider text-violet-700 font-semibold">
                Taxonomy
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-semibold text-slate-800">
              Browse by Area
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Browse knowledge by area.
            </p>

          </div>

          <span className="text-xs text-slate-400">
            {categories.length} categories
          </span>

        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">

          {categories.map(category => {

            const count =
              category.article_count || 0

            const hasContent =
              count > 0

            return (
              <button
                key={category.id}
                type="button"
                onClick={() =>
                  onSelectCategory(category.id)
                }
                className={`group relative overflow-hidden bg-white border rounded-xl p-5 text-left shadow-sm transition-all ${
                  hasContent
                    ? "border-slate-200 border-l-2 border-l-violet-100 hover:border-violet-200 hover:border-l-violet-500 hover:shadow-md hover:-translate-y-0.5"
                    : "border-slate-200 border-l-2 border-l-slate-100 hover:border-slate-300 hover:shadow-sm"
                }`}
              >

                <div className="flex items-start justify-between gap-3">

                  <div
                    className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 transition ${
                      hasContent
                        ? "bg-violet-50 text-violet-700 group-hover:bg-violet-600 group-hover:text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <CategoryIcon name={category.name} />
                  </div>

                  <span
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                      hasContent
                        ? "bg-violet-50 border-violet-100 text-violet-700"
                        : "bg-slate-50 border-slate-200 text-slate-400"
                    }`}
                  >
                    {count} guide{count === 1 ? "" : "s"}
                  </span>

                </div>

                <h3
                  className={`font-semibold mt-4 transition ${
                    hasContent
                      ? "text-slate-800 group-hover:text-violet-700"
                      : "text-slate-600"
                  }`}
                >
                  {category.name}
                </h3>

                <p className="text-xs text-slate-500 leading-relaxed mt-2 line-clamp-2">
                  {category.description ||
                    "Healthcare knowledge and operational guidance."}
                </p>

                <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-100">

                  <span className="text-[11px] text-slate-400">
                    {hasContent
                      ? "Browse knowledge"
                      : "Content being expanded"}
                  </span>

                  <span
                    className={`text-xs font-semibold ${
                      hasContent
                        ? "text-violet-600"
                        : "text-slate-400"
                    }`}
                  >
                    Explore →
                  </span>

                </div>

              </button>
            )
          })}

        </div>

      </section>


      {

}
      <section className="relative overflow-hidden rounded-xl bg-slate-900 border border-slate-800 px-6 py-7 sm:px-8">

        <div className="absolute -right-8 -top-10 w-32 h-32 rounded-full bg-violet-500/10" />
        <div className="absolute -right-3 -bottom-12 w-24 h-24 rounded-full bg-indigo-400/10" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

          <div className="flex items-start gap-4 max-w-3xl">

            <div className="w-11 h-11 rounded-xl bg-violet-500/15 text-violet-300 border border-violet-400/20 flex items-center justify-center shrink-0">

              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="M4 5h16v11H8l-4 4V5Z" />
                <path d="M8 9h8" />
                <path d="M8 12h5" />
              </svg>

            </div>

            <div>

              <div className="inline-flex items-center gap-2 mb-1.5">

                <span className="text-[10px] uppercase tracking-[0.14em] text-violet-300 font-semibold">
                  TaifaCare AI Assistant
                </span>

              </div>

              <h2 className="text-base sm:text-lg font-bold text-white">
                Need guidance while working?
              </h2>

              <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-2xl">
                Ask about patient management, screening and triage,
                consultations, laboratory, pharmacy, billing and other
                approved HMIS knowledge-base guidance.
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={() => {
              if (window.openTaifaCareAssistant) {
                window.openTaifaCareAssistant()
              }
            }}
            className="shrink-0 inline-flex items-center justify-center gap-2 bg-violet-500 hover:bg-violet-400 text-slate-950 font-semibold px-4 py-2.5 rounded-lg shadow-sm transition"
          >
            Ask the AI Assistant
            <span>→</span>
          </button>

        </div>

      </section>

    </div>
  )
}


function CategoryIcon({ name }) {
  const value = (name || "").toLowerCase()

  if (
    value.includes("getting started") ||
    value.includes("system administration")
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <rect x="4" y="4" width="16" height="16" rx="3" />
        <path d="M8 9h8" />
        <path d="M8 13h5" />
        <path d="M8 17h6" />
      </svg>
    )
  }

  if (
    value.includes("patient") ||
    value.includes("management")
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <circle cx="12" cy="8" r="3" />
        <path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" />
      </svg>
    )
  }

  if (
    value.includes("clinical") ||
    value.includes("consult")
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <path d="M3 12h4l2-5 4 10 2-5h6" />
      </svg>
    )
  }

  if (
    value.includes("billing") ||
    value.includes("finance")
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <rect x="4" y="5" width="16" height="14" rx="2" />
        <path d="M8 9h8" />
        <path d="M8 13h4" />
        <path d="M8 16h6" />
      </svg>
    )
  }

  if (
    value.includes("compliance") ||
    value.includes("security")
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <path d="M12 3 19 6v5c0 4.7-3 8.2-7 10-4-1.8-7-5.3-7-10V6l7-3Z" />
        <path d="m9 12 2 2 4-5" />
      </svg>
    )
  }

  if (
    value.includes("troubleshooting") ||
    value.includes("release")
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v5" />
        <path d="M12 16h.01" />
      </svg>
    )
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
    >
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M12 8v8" />
      <path d="M8 12h8" />
    </svg>
  )
}


function ActivityCard({
  label,
  value,
  description,
  icon,
  iconClass,
}) {
  return (
    <div className="relative overflow-hidden bg-white border border-slate-200 border-t-2 border-t-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">

      <div className="flex items-center justify-between mb-4">

        <span className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">
          {label}
        </span>

        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center ring-1 ring-black/5 ${iconClass}`}
        >
          {icon}
        </div>

      </div>

      <div className="text-2xl font-bold text-slate-800">
        {value}
      </div>

      <p className="text-xs text-slate-400 mt-1">
        {description}
      </p>

    </div>
  )
}
