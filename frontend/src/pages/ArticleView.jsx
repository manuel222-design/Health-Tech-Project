import { useState, useEffect } from "react"
import { getArticle } from "../services/api"
import ReactMarkdown from "react-markdown"

export default function ArticleView({ slug, onBack }) {
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState("")

  useEffect(() => {
    getArticle(slug)
      .then(res => setArticle(res.data))
      .catch(() => setError("Article not found"))
      .finally(() => setLoading(false))
  }, [slug])

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
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {article.title}
        </h1>
        <p className="text-xs text-gray-400 mb-6">
          Last updated: {new Date(article.created_at).toLocaleDateString()}
        </p>
        <hr className="mb-6" />

        <div className="prose prose-teal max-w-none">
          <ReactMarkdown>{article.body_markdown}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}