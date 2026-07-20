import { useState, useEffect } from "react"
import { getAllArticlesAdmin, deleteArticle, approveArticle } from "../services/api"

export default function AdminArticles({ onEdit, onCreate }) {
  const [articles, setArticles] = useState([])
  const [loading, setLoading]   = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [approving, setApproving] = useState(null)

  function loadArticles() {
    setLoading(true)
    getAllArticlesAdmin()
      .then(res => setArticles(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadArticles() }, [])

  async function handleDelete(slug, title) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return
    setDeleting(slug)
    try {
      await deleteArticle(slug)
      setArticles(prev => prev.filter(a => a.slug !== slug))
    } catch (err) {
      alert("Failed to delete article. You may not have permission.")
    } finally {
      setDeleting(null)
    }
  }

  async function handleApprove(slug) {
    setApproving(slug)
    try {
      await approveArticle(slug)
      setArticles(prev => prev.map(a =>
        a.slug === slug ? { ...a, status: "published" } : a
      ))
    } catch (err) {
      alert("Failed to approve article. Admin access required.")
    } finally {
      setApproving(null)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-gray-400">Loading articles...</div>
    </div>
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Manage Articles</h2>
          <p className="text-gray-500 text-sm">Create, edit, and delete knowledge base articles</p>
        </div>
        <button
          onClick={onCreate}
          className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-4 py-2.5 rounded-lg text-sm transition"
        >
          + New Article
        </button>
      </div>

      <div className="grid gap-3">
        {articles.map(article => (
          <div
            key={article.id}
            className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4"
          >
            <div>
              <h3 className="font-semibold text-gray-800">{article.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-400">{article.slug}</span>
                <span className={`text-xs rounded-full px-2 py-0.5 border ${
                  article.status === "published"
                    ? "bg-teal-50 text-teal-700 border-teal-200"
                    : article.status === "pending_review"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}>
                  {article.status}
                </span>
              </div>
            </div>

            <div className="flex gap-2 shrink-0">
              {article.status !== "published" && (
                <button
                  onClick={() => handleApprove(article.slug)}
                  disabled={approving === article.slug}
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium px-3 py-1.5 border border-teal-200 rounded-lg hover:bg-teal-50 transition disabled:opacity-50"
                >
                  {approving === article.slug ? "Approving..." : "Approve"}
                </button>
              )}
              <button
                onClick={() => onEdit(article.slug)}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium px-3 py-1.5 border border-teal-200 rounded-lg hover:bg-teal-50 transition"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(article.slug, article.title)}
                disabled={deleting === article.slug}
                className="text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1.5 border border-red-200 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
              >
                {deleting === article.slug ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        ))}

        {articles.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No articles yet. Click "New Article" to create one.
          </div>
        )}
      </div>
    </div>
  )
}