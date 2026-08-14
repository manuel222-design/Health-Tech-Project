import { useEffect, useState } from "react"
import { getProductDetails } from "../services/api"

export default function ProductDetails({ slug, onBack, onSelectArticle }) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    setLoading(true)
    setError("")

    getProductDetails(slug)
      .then(res => setProduct(res.data))
      .catch(() => setError("Failed to load product details."))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="py-16 text-center text-gray-400">
        Loading product details...
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <button
          onClick={onBack}
          className="text-sm text-teal-600 hover:text-teal-700 mb-5"
        >
          ← Back to Products
        </button>

        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    )
  }

  if (!product) {
    return null
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="text-sm text-teal-600 hover:text-teal-700 mb-5"
      >
        ← Back to Products
      </button>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-teal-50 rounded-xl flex items-center justify-center text-3xl">
            {product.icon || "📦"}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {product.name}
            </h2>

            <p className="text-gray-500 mt-1">
              {product.description || "No description provided."}
            </p>

            <div className="flex items-center gap-3 mt-3">
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                Version {product.version || "N/A"}
              </span>

              <span className="text-xs text-gray-500">
                {product.article_count} article
                {product.article_count === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Knowledge Articles
        </h3>

        <p className="text-sm text-gray-500 mt-1">
          Articles and operational guidance associated with {product.name}.
        </p>
      </div>

      {product.articles?.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-12 text-center">
          <div className="text-3xl mb-3">📚</div>

          <p className="text-gray-500">
            No articles have been linked to this product yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {product.articles.map(article => (
            <button
              key={article.id}
              onClick={() => onSelectArticle(article.slug)}
              className="w-full text-left bg-white rounded-xl border border-gray-200 p-5 hover:border-teal-300 hover:shadow-sm transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-gray-800">
                    {article.title}
                  </h4>

                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded">
                      {article.content_type.replaceAll("_", " ")}
                    </span>

                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                      v{article.product_version || product.version || "N/A"}
                    </span>

                    <span className="text-xs text-gray-500">
                      {article.status.replaceAll("_", " ")}
                    </span>
                  </div>
                </div>

                <span className="text-gray-400 text-lg">
                  →
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}