import { useState, useEffect } from "react"
import { getArticleAdmin, createArticle, updateArticle, getCategories, getTags, getProducts, createTag, createCategory, revertArticle, uploadMedia } from "../services/api"

export default function ArticleForm({ slug, onDone, onCancel }) {
  const isEditing = Boolean(slug)

  const [title, setTitle]     = useState("")
  const [articleSlug, setArticleSlug] = useState("")
  const [body, setBody]       = useState("")
  const [status, setStatus]   = useState("draft")
  const [contentType, setContentType] = useState("how_to")
  const [categoryId, setCategoryId] = useState("")
  const [newCategoryInput, setNewCategoryInput] = useState("")
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [tagIds, setTagIds]         = useState([])
  const [categories, setCategories] = useState([])
  const [allTags, setAllTags]       = useState([])
  const [newTagInput, setNewTagInput] = useState("")
  const [creatingTag, setCreatingTag] = useState(false)
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState("")
  const [hasPreviousVersion, setHasPreviousVersion] = useState(false)
  const [reverting, setReverting] = useState(false)
  const [productVersion, setProductVersion] = useState("") 
  const [productId, setProductId] = useState("")
  const [products, setProducts] = useState([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    getCategories().then(res => setCategories(res.data))
    getTags().then(res => setAllTags(res.data))
    getProducts().then(res => setProducts(res.data))
  }, [])

  useEffect(() => {
    if (!isEditing) return
    getArticleAdmin(slug)
      .then(res => {
        setTitle(res.data.title)
        setArticleSlug(res.data.slug)
        setBody(res.data.body_markdown)
        setStatus(res.data.status)
        setCategoryId(res.data.category_id || "")
        setTagIds(res.data.tag_ids || [])
        setContentType(res.data.content_type || "how_to")
        setHasPreviousVersion(res.data.has_previous_version || false)
        setProductVersion(res.data.product_version || "")
        setProductId(res.data.product_id || "")
      })
      .finally(() => setLoading(false))
  }, [slug])

  async function handleRevert() {
    if (!window.confirm("Revert to the previous version of this article's content?")) return
    setReverting(true)
    try {
      await revertArticle(slug)
      const res = await getArticleAdmin(slug)
      setBody(res.data.body_markdown)
      setHasPreviousVersion(res.data.has_previous_version)
    } catch {
      alert("Failed to revert")
    } finally {
      setReverting(false)
    }
  }

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

  function toggleTag(tagId) {
    setTagIds(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    )
  }
  
  async function handleCreateTag() {
    const name = newTagInput.trim()
    if (!name) return
    setCreatingTag(true)
    try {
      const res = await createTag(name)
      setAllTags(prev => prev.find(t => t.id === res.data.id) ? prev : [...prev, res.data])
      setTagIds(prev => prev.includes(res.data.id) ? prev : [...prev, res.data.id])
      setNewTagInput("")
    } catch {
      alert("Failed to create tag")
    } finally {
      setCreatingTag(false)
    }
  }

  async function handleCreateCategory() {
    const name = newCategoryInput.trim()
    if (!name) return
    setCreatingCategory(true)
    try {
      const res = await createCategory(name)
      setCategories(prev => prev.find(c => c.id === res.data.id) ? prev : [...prev, res.data])
      setCategoryId(res.data.id)
      setNewCategoryInput("")
    } catch {
      alert("Failed to create category")
    } finally {
      setCreatingCategory(false)
    }
  }
  async function handleImageUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await uploadMedia(file, isEditing ? slug : null)
      const markdownImage = `\n![${file.name}](${res.data.url})\n`
      setBody(prev => prev + markdownImage)
    } catch {
      alert("Failed to upload image")
    } finally {
      setUploading(false)
      e.target.value = ""
    }
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
        await updateArticle(slug, { title, body_markdown: body, status, category_id: categoryId || null, tag_ids: tagIds, content_type: contentType, product_id: productId || null, product_version: productVersion })
      } else {
        await createArticle({
          title,
          slug: articleSlug,
          body_markdown: body,
          status,
          category_id: categoryId || null,
          tag_ids: tagIds,
          content_type: contentType,
          product_id: productId || null,
          product_version: productVersion
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
          
          <div className="grid md:grid-cols-2 gap-4">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product
              </label>
              
              <select
                value={productId}
                onChange={e => setProductId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
             >
              <option value="">No product</option>
              
              {products.map(product => (
                <option key={product.id} value={product.id}> 
                 {product.icon ? `${product.icon} ` : ""}
                 {product.name}
                 {product.version ? ` — v${product.version}` : ""}
                </option>
             ))}
            </select>

            <p className="text-xs text-gray-400 mt-1">
              Link this guide to a healthcare product or system.
            </p>
          </div>

          <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Product Version
    </label>

    <input
      type="text"
      value={productVersion}
      onChange={e => setProductVersion(e.target.value)}
      placeholder="e.g. 1.0"
      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
    />

    <p className="text-xs text-gray-400 mt-1">
      Version of the product this guide applies to.
    </p>
  </div>

</div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Content <span className="text-gray-400">(Markdown supported)</span>
              </label>
              <div className="flex gap-2 items-center">
                <label className="text-xs text-teal-700 border border-teal-200 hover:bg-teal-50 px-2 py-1 rounded transition cursor-pointer">
                  {uploading ? "Uploading..." : "Upload Image"}
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
                {isEditing && hasPreviousVersion && (
                  <button
                    type="button"
                    onClick={handleRevert}
                    disabled={reverting}
                    className="text-xs text-amber-700 border border-amber-200 hover:bg-amber-50 px-2 py-1 rounded transition disabled:opacity-50"
                  >
                    {reverting ? "Reverting..." : "↺ Revert to previous version"}
                  </button>
                )}
              </div>
              </div>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={12}
              placeholder=" Overview&#10;Write your article content here using Markdown..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">No category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategoryInput}
                onChange={e => setNewCategoryInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleCreateCategory())}
                placeholder="Create a new category..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                type="button"
                onClick={handleCreateCategory}
                disabled={creatingCategory || !newCategoryInput.trim()}
                className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
              >
                {creatingCategory ? "Adding..." : "+ Add Category"}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {allTags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`text-xs rounded-full px-3 py-1.5 border transition ${
                    tagIds.includes(tag.id)
                      ? "bg-teal-600 text-white border-teal-600"
                      : "bg-white text-gray-600 border-gray-300 hover:border-teal-400"
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTagInput}
                onChange={e => setNewTagInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleCreateTag())}
                placeholder="Create a new tag..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                type="button"
                onClick={handleCreateTag}
                disabled={creatingTag || !newTagInput.trim()}
                className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
              >
                {creatingTag ? "Adding..." : "+ Add Tag"}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
            <select
              value={contentType}
              onChange={e => setContentType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="how_to">How-To Guide</option>
              <option value="sop">SOP</option>
              <option value="faq">FAQ</option>
              <option value="feature_reference">Feature Reference</option>
              <option value="troubleshooting">Troubleshooting</option>
              <option value="release_notes">Release Notes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Version <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              value={productVersion}
              onChange={e => setProductVersion(e.target.value)}
              placeholder="e.g. Taifa Care v2.4"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
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
              <option value="pending_review">Pending Review</option>
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
