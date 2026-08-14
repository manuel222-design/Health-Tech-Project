import { useEffect, useState } from "react"
import { getProducts, createProduct } from "../services/api"

export default function Products({ onSelectProduct }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState("")

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [version, setVersion] = useState("")
  const [icon, setIcon] = useState("")

  function loadProducts() {
    setLoading(true)

    getProducts()
      .then(res => setProducts(res.data))
      .catch(() => setError("Failed to load products."))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadProducts()
  }, [])

  function generateSlug(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
  }

  async function handleCreate(e) {
    e.preventDefault()

    if (!name.trim() || !version.trim()) {
      setError("Product name and version are required.")
      return
    }

    setSaving(true)
    setError("")

    try {
      const res = await createProduct({
        name: name.trim(),
        slug: generateSlug(name),
        description: description.trim(),
        version: version.trim(),
        icon: icon.trim() || "📦"
      })

      setProducts(prev => [...prev, res.data])

      setName("")
      setDescription("")
      setVersion("")
      setIcon("")
      setShowForm(false)
    } catch (err) {
      if (err.response?.status === 400) {
        setError(
          err.response.data?.detail ||
          "A product with this name or slug already exists."
        )
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        setError("You don't have permission to create products.")
      } else {
        setError("Failed to create product.")
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Products
          </h2>

          <p className="text-gray-500 mt-1">
            Manage products supported by the Healthtech Knowledge System.
          </p>
        </div>

        <button
          onClick={() => {
            setShowForm(prev => !prev)
            setError("")
          }}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition"
        >
          {showForm ? "Cancel" : "+ Add Product"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-5 text-sm">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-5">
            Add New Product
          </h3>

          <form onSubmit={handleCreate} className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name
              </label>

              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Taifa Care"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>

              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe the product..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Version
                </label>

                <input
                  type="text"
                  value={version}
                  onChange={e => setVersion(e.target.value)}
                  placeholder="e.g. 1.0"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icon
                </label>

                <input
                  type="text"
                  value={icon}
                  onChange={e => setIcon(e.target.value)}
                  placeholder="e.g. 🏥"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

            </div>

            <div className="flex justify-end gap-3 pt-2">

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium disabled:opacity-50"
              >
                {saving ? "Creating..." : "Create Product"}
              </button>

            </div>

          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

        {loading ? (
          <div className="py-16 text-center text-gray-400">
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">📦</div>

            <h3 className="text-lg font-semibold text-gray-700">
              No products yet
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Create your first product to organize knowledge base articles.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">

            {products.map(product => (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product.slug)}
                className="p-5 flex items-center justify-between hover:bg-gray-50 transition"
              >

                <div className="flex items-center gap-4">

                  <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-2xl">
                    {product.icon || "📦"}
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {product.name}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      {product.description || "No description provided."}
                    </p>

                    <div className="flex items-center gap-3 mt-2">

                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                        Version {product.version}
                      </span>

                      <span className="text-xs text-gray-500">
                        {product.article_count || 0} article
                        {product.article_count === 1 ? "" : "s"}
                      </span>

                    </div>
                  </div>

                </div>

                <div className="text-xs text-gray-400 hidden sm:block">
                  {product.slug}
                </div>

              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  )
}
