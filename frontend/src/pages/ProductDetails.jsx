import { useEffect, useState } from "react"
import { getProductDetails } from "../services/api"

export default function ProductDetails({
  slug,
  onBack,
  onSelectArticle,
}) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    setLoading(true)
    setError("")

    getProductDetails(slug)
      .then(res => setProduct(res.data))
      .catch(error => {
        console.error(
          "PRODUCT DETAILS LOAD ERROR:",
          error
        )
        setError("Failed to load product details.")
      })
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-400">
            Loading product details...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-5">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700 font-medium"
        >
          ← Back to Products
        </button>

        <div className="bg-white border border-red-200 rounded-xl p-8 text-center">
          <div className="w-11 h-11 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3">
            !
          </div>

          <h2 className="font-semibold text-slate-800 mb-1">
            Unable to load product
          </h2>

          <p className="text-sm text-slate-500">
            {error}
          </p>
        </div>
      </div>
    )
  }

  if (!product) {
    return null
  }

  const articles = product.articles || []

  return (
    <div className="space-y-7 pb-10">

      {}

      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700 font-medium"
      >
        ← Back to Products
      </button>


      {}

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

        <div className="h-2 bg-gradient-to-r from-violet-500 to-indigo-500" />

        <div className="p-6 sm:p-8">

          <div className="flex flex-col sm:flex-row sm:items-start gap-5">

            <div className="w-16 h-16 rounded-2xl bg-violet-50 text-violet-700 flex items-center justify-center text-3xl shrink-0">
              {product.icon || "📦"}
            </div>

            <div className="min-w-0 flex-1">

              <div className="flex flex-wrap items-center gap-2">

                <h1 className="text-2xl font-bold text-slate-800">
                  {product.name}
                </h1>

                <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                  v{product.version || "N/A"}
                </span>

              </div>

              <p className="text-sm text-slate-500 mt-2 max-w-3xl leading-relaxed">
                {product.description ||
                  "No description provided."}
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-4">

                <div className="inline-flex items-center gap-2 text-xs text-slate-500">
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

                  {product.article_count || 0} article
                  {(product.article_count || 0) === 1
                    ? ""
                    : "s"}
                </div>

                <span className="text-slate-300">
                  •
                </span>

                <span className="text-xs text-slate-500">
                  Supported knowledge product
                </span>

              </div>

            </div>

          </div>

        </div>

      </section>


      {}

      <section>

        <div className="flex items-end justify-between mb-4">

          <div>

            <h2 className="text-lg font-bold text-slate-800">
              Knowledge Articles
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Guidance associated with {product.name}.
            </p>

          </div>

          <span className="text-xs text-slate-400">
            {articles.length} article
            {articles.length === 1
              ? ""
              : "s"}
          </span>

        </div>


        {articles.length === 0 ? (

          <div className="bg-white border border-slate-200 rounded-xl py-16 px-6 text-center">

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
                <path d="M5 5h14v14H5z" />
                <path d="M8 9h8" />
                <path d="M8 13h5" />
              </svg>

            </div>

            <h3 className="font-semibold text-slate-700">
              No articles linked yet
            </h3>

            <p className="text-sm text-slate-400 mt-1">
              Knowledge articles associated with this product will appear here.
            </p>

          </div>

        ) : (

          <div className="grid gap-3">

            {articles.map(article => (

              <button
                key={article.id}
                type="button"
                onClick={() =>
                  onSelectArticle(article.slug)
                }
                className="w-full text-left bg-white border border-slate-200 rounded-xl p-5 hover:border-violet-300 hover:shadow-sm transition group"
              >

                <div className="flex items-start gap-4">

                  <div className="w-10 h-10 rounded-lg bg-violet-50 text-violet-700 flex items-center justify-center shrink-0 group-hover:bg-violet-600 group-hover:text-white transition">

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

                    <h3 className="font-semibold text-slate-800 group-hover:text-violet-700 transition">
                      {article.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2 mt-2">

                      <span className="text-xs bg-violet-50 text-violet-700 px-2 py-1 rounded-full">
                        {article.content_type
                          ?.replaceAll("_", " ")
                          || "Guide"}
                      </span>

                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                        v
                        {article.product_version ||
                          product.version ||
                          "N/A"}
                      </span>

                      {article.status && (
                        <span className="text-xs text-slate-400 capitalize">
                          {article.status.replaceAll(
                            "_",
                            " "
                          )}
                        </span>
                      )}

                    </div>

                  </div>


                  <span className="text-slate-300 group-hover:text-violet-600 group-hover:translate-x-1 transition text-lg shrink-0">
                    →
                  </span>

                </div>

              </button>

            ))}

          </div>

        )}

      </section>

    </div>
  )
}
