import { useEffect, useState } from "react"
import { getProducts, createProduct } from "../services/api"

function ProductIcon({ name }) {
  const icon = (name || "").toLowerCase()

  if (icon === "health") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6"
        aria-hidden="true"
      >
        <rect x="4" y="4" width="16" height="16" rx="3" />
        <path d="M12 8v8" />
        <path d="M8 12h8" />
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
      className="w-6 h-6"
      aria-hidden="true"
    >
      <path d="M4 7h16v13H4z" />
      <path d="M8 7V5h8v2" />
      <path d="M8 12h8" />
      <path d="M8 16h5" />
    </svg>
  )
}

export default function Products({ onSelectProduct }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState("")

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [version, setVersion] = useState("")
  const [icon, setIcon] = useState("health")

  function loadProducts() {
    setLoading(true)

    getProducts()
      .then(res => setProducts(res.data || []))
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

  function resetForm() {
    setName("")
    setDescription("")
    setVersion("")
    setIcon("health")
    setError("")
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
        icon: icon.trim() || "health",
      })

      setProducts(prev => [...prev, res.data])
      resetForm()
      setShowForm(false)
    } catch (err) {
      if (err.response?.status === 400) {
        setError(
          err.response.data?.detail ||
          "A product with this name or slug already exists."
        )
      } else if (
        err.response?.status === 401 ||
        err.response?.status === 403
      ) {
        setError("You don't have permission to create products.")
      } else {
        setError("Failed to create product.")
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-7 pb-10">

      {/* Header */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              <span className="text-[10px] uppercase tracking-wider font-semibold text-teal-700">
                System Catalogue
              </span>
            </div>

            <h2 className="text-2xl font-bold text-slate-800">
              Products
            </h2>

            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Browse the products and systems supported by the Taifa Care
              knowledge system.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowForm(prev => !prev)
              setError("")
            }}
            className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition shadow-sm"
          >
            {showForm ? "Cancel" : "+ Add Product"}
          </button>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <h3 className="text-base font-semibold text-slate-800">
              Add New Product
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Register a supported product so knowledge articles can be
              associated with it.
            </p>
          </div>

          <form onSubmit={handleCreate} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Product Name
              </label>

              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. TaifaCare"
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Description
              </label>

              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Briefly describe the product..."
                rows={3}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Version
                </label>

                <input
                  type="text"
                  value={version}
                  onChange={e => setVersion(e.target.value)}
                  placeholder="e.g. 1.0"
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Icon
                </label>

                <input
                  type="text"
                  value={icon}
                  onChange={e => setIcon(e.target.value)}
                  placeholder="e.g. health"
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />

                <p className="text-[11px] text-slate-400 mt-1">
                  Use <span className="font-medium">health</span> for the
                  healthcare icon.
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  resetForm()
                  setShowForm(false)
                }}
                className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-600 text-sm hover:bg-slate-50 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium disabled:opacity-50 transition"
              >
                {saving ? "Creating..." : "Create Product"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Product list */}
      <section>
        <div className="flex items-end justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">
              Available Products
            </h3>

            <p className="text-xs text-slate-400 mt-1">
              Select a product to view its associated knowledge.
            </p>
          </div>

          {!loading && (
            <span className="text-xs text-slate-400">
              {products.length} product{products.length === 1 ? "" : "s"}
            </span>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-9 h-9 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-slate-400">
                Loading products...
              </p>
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center px-6">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                <ProductIcon name="default" />
              </div>

              <h3 className="text-base font-semibold text-slate-700">
                No products yet
              </h3>

              <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
                Create your first product to organize knowledge base articles.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {products.map(product => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => onSelectProduct(product.slug)}
                  className="w-full p-5 flex items-center gap-4 text-left hover:bg-slate-50 transition group"
                >
                  <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 group-hover:bg-teal-600 group-hover:text-white transition">
                    <ProductIcon name={product.icon} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-800 group-hover:text-teal-700 transition">
                        {product.name}
                      </h3>

                      <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                        v{product.version || "N/A"}
                      </span>
                    </div>

                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                      {product.description ||
                        "No description provided."}
                    </p>

                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-slate-400">
                        {product.article_count || 0} article
                        {product.article_count === 1 ? "" : "s"}
                      </span>

                      <span className="text-slate-300">
                        •
                      </span>

                      <span className="text-xs text-slate-400">
                        Supported system
                      </span>
                    </div>
                  </div>

                  <span className="text-slate-300 group-hover:text-teal-600 group-hover:translate-x-1 transition text-lg shrink-0">
                    →
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  )
}
