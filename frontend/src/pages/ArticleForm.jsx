import { useState, useEffect } from "react"
import { getArticleAdmin, createArticle, updateArticle } from "../services/api"

export default function ArticleForm({ slug, onDone, onCancel }) {
  const isEditing = Boolean(slug)

  const [title, setTitle]     = useState("")
  const [articleSlug, setArticleSlug] = useState("")
  const [body, setBody]       = useState("")
  const [status, setStatus]   = useState("draft")
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState("")

  useEffect(() => {
    if (!isEditing) return
    getArticleAdmin(slug)
      .then(res => {
        setTitle(res.data.title)
        setArticleSlug(res.data.slug)
        setBody(res.data.body_markdown)
        setStatus(res.data.status)
      })
      .finally(() => setLoading(false))
  }, [slug])

  function generateSlug(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
  }

  function handleTitleChange(value) {
    setTitle(value)
    if (!isEditing) setArticleSlug(generateSlug(value))
  }

  async function handleSave() {
    if (!title.trim() || !articleSlug.trim() || !body.trim()) {
      setError("Title, slug, and content are all required")
      return
    }
    setSaving(true)
    setError("")
    try {
      if (isEditing) {
        await updateArticle(slug, { title, body_markdown: body, status })
      } else {
        await createArticle({
          title,
          slug: articleSlug,
          body_markdown: body,
          status
        })
      }
      onDone()
    } catch (err) {
      if (err.response?.status === 400) {
        setError("That slug is already taken. Please choose a different one.")
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        setError("You don't have permission to do this.")
      } else {
        setError("Something went wrong. Please try again.")
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-gray-400">Loading article...</div>
    </div>
  )

  return (
    <div>
      <button
        onClick={onCancel}
        className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-6 text-sm font-medium"
      >
        ← Back to articles
      </button>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          {isEditing ? "Edit Article" : "New Article"}
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-5 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={e => handleTitleChange(e.target.value)}
              placeholder="How to Reset Your HMIS Password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug {isEditing && <span className="text-gray-400">(cannot be changed)</span>}
            </label>
            <input
              type="text"
              value={articleSlug}
              disabled={isEditing}
              onChange={e => setArticleSlug(generateSlug(e.target.value))}
              placeholder="how-to-reset-hmis-password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content <span className="text-gray-400">(Markdown supported)</span>
            </label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={12}
              placeholder=" Overview&#10;Write your article content here using Markdown..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition disabled:opacity-50"
            >
              {saving ? "Saving..." : isEditing ? "Save Changes" : "Create Article"}
            </button>
            <button
              onClick={onCancel}
              className="text-gray-600 hover:text-gray-800 font-medium px-5 py-2.5 text-sm transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}