import { useState, useEffect } from "react"
import { getAllArticlesAdmin, deleteArticle, approveArticle, rejectArticle } from "../services/api"

export default function AdminArticles({ onEdit, onCreate, userRole }) {
  const canManage = userRole === "admin"
  const canReview = userRole === "editor" || userRole === "admin"
  const [articles, setArticles] = useState([])
  const [loading, setLoading]   = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [approving, setApproving] = useState(null)
  const [rejecting, setRejecting] = useState(null)
  const [showPendingOnly, setShowPendingOnly] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  function loadArticles() {
    setLoading(true)
    getAllArticlesAdmin()
      .then(res => setArticles(res.data))
      .finally(() => setLoading(false))
  }
  
  const filteredArticles = articles.filter(article => {
    const query = searchQuery.trim().toLowerCase()

    if (!query) return true

    return (
      article.title?.toLowerCase().includes(query) ||
      article.slug?.toLowerCase().includes(query) ||
      article.category_name?.toLowerCase().includes(query) ||
      article.status?.toLowerCase().includes(query)
    )
  })
  useEffect(() => { loadArticles() }, [])

  async function handleDelete(slug, title) {
    if (!window.confirm(`Archive "${title}"? It will be hidden from the public knowledge base but can be restored later.`)) return
    setDeleting(slug)
    try {
      await deleteArticle(slug)
      setArticles(prev => prev.map(a => a.slug === slug ? { ...a, status: "archived" } : a))
    } catch {
      alert("Failed to archive article. You may not have permission.")
    } finally {
      setDeleting(null)
    }
  }

  async function handleApprove(slug) {
    setApproving(slug)

    try {
      await approveArticle(slug)

      setArticles(prev =>
        prev.map(a =>
          a.slug === slug
            ? { ...a, status: "published" }
            : a
        )
      )

      alert("Article approved and published successfully")

    } catch (error) {
      alert(
        error.response?.data?.detail ||
        "Failed to approve article."
      )
    } finally {
      setApproving(null)
    }
  }

  async function handleReject(slug) {
    const reason = window.prompt(
      "Reason for requesting changes (optional):"
    )

    if (reason === null) return

    setRejecting(slug)

    try {
      await rejectArticle(slug, reason || "Changes requested")

      setArticles(prev =>
        prev.map(a =>
          a.slug === slug
            ? { ...a, status: "draft" }
            : a
        )
      )
    } catch (error) {
      alert(
        error.response?.data?.detail ||
        "Failed to reject article."
      )
    } finally {
      setRejecting(null)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-gray-400">Loading articles...</div>
    </div>
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {userRole === "editor" 
              ? "Content Review"
              : "Manage Articles"}
          </h2>

          <p className="text-gray-500 text-sm">
            {userRole === "editor"
              ? "Review submitted articles, approve or request changes before publishing."
              : "Create, edit, archive, and manage knowledge base articles."}
          </p>
        </div>

        {canReview && (
          <button
            onClick={onCreate}
            className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-4 py-2.5 rounded-lg text-sm transition"
          >
            + New Article
          </button>
        )}
      </div>

      <div className="mb-6 space-y-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search articles by title, slug, category, or status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />

          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </svg>

          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <button
          onClick={() => setShowPendingOnly(!showPendingOnly)}
          className={`text-sm font-medium px-3 py-1.5 rounded-lg border transition ${
            showPendingOnly
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
          }`}
        >
          {showPendingOnly ? "Show All" : "Pending Only"}
        </button>
      </div>

      <div className="grid gap-3 pb-20">
        {(showPendingOnly ? articles.filter(a => a.status === "pending_review") : filteredArticles).map(article => (
          <div
            key={article.id}
            className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4"
          >
            <div>
              <h3 className="font-semibold text-gray-800">{article.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-400">{article.slug}</span>

                {article.category_name && (
                  <span className="text-xs rounded-full px-2 py-0.5 border bg-purple-50 text-purple-700 border-purple-200">
                    {article.category_name}
                  </span>
                )}

                <span className={`text-xs rounded-full px-2 py-0.5 border ${
                  article.status === "published"
                    ? "bg-teal-50 text-teal-700 border-teal-200"
                    : article.status === "pending_review"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : article.status === "archived"
                        ? "bg-gray-100 text-gray-600 border-gray-300"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                }`}>
                  {article.status}
                </span>
              </div>
            </div>

            <div className="flex gap-2 shrink-0">
              {article.status === "pending_review" && canReview && (
                <>
                  <button
                    onClick={() => handleApprove(article.slug)}
                    disabled={approving === article.slug || rejecting === article.slug}
                    className="text-sm text-white bg-teal-600 hover:bg-teal-700 font-medium px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                  >
                    {approving === article.slug ? "Approving..." : "Approve"}
                  </button>

                  <button
                    onClick={() => handleReject(article.slug)}
                    disabled={approving === article.slug || rejecting === article.slug}
                    className="text-sm text-amber-700 border border-amber-200 hover:bg-amber-50 font-medium px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                  >
                    {rejecting === article.slug ? "Rejecting..." : "Reject"}
                  </button>
                </>
              )}

              {canManage && (
                <>
                  <button
                    onClick={() => onEdit(article.slug)}
                    className="text-sm text-teal-600 hover:text-teal-700 font-medium px-3 py-1.5 border border-teal-200 rounded-lg hover:bg-teal-50 transition"
                  >
                    Edit
                  </button>

                  {article.status !== "archived" && (
                    <button
                      onClick={() => handleDelete(article.slug, article.title)}
                      disabled={deleting === article.slug}
                      className="text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1.5 border border-red-200 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                    >
                      {deleting === article.slug ? "Archiving..." : "Archive"}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}

        {filteredArticles.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            {searchQuery.trim()
              ? `No articles found for "${searchQuery}"`
              : "No articles yet. Click \"New Article\" to create one."}
          </div>
        )}
      </div>
    </div>
  )
}
