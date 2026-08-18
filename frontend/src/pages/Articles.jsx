import { useState, useEffect } from "react"
import {
  getArticles,
  searchArticles,
  getCategories,
  getTags,
  getProducts,
} from "../services/api"

const MODULE_TAGS = new Set([
  "Registration",
  "Appointments",
  "Triage & Vitals",
  "Consultation",
  "Laboratory",
  "Radiology",
  "Procedures",
  "Pharmacy",
  "Admissions",
  "Maternity",
  "ANC",
  "PNC",
  "CWC",
  "Family Planning",
  "TB",
  "Nutrition",
  "EPI",
  "Pre-Conception Care",
  "Medically Assisted Therapy",
  "Referred Patients",
  "Accounting",
  "Billing & Claims",
  "Reports",
  "User Administration",
])

export default function Articles({
  onSelectArticle,
  initialCategory = "",
}) {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [searching, setSearching] = useState(false)

  const [categories, setCategories] = useState([])
  const [categoryFilter, setCategoryFilter] = useState(initialCategory)

  const [typeFilter, setTypeFilter] = useState("")

  const [allTags, setAllTags] = useState([])
  const [tagFilter, setTagFilter] = useState("")

  const [products, setProducts] = useState([])
  const [productFilter, setProductFilter] = useState("")

  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    Promise.all([
      getArticles(),
      getCategories(),
      getTags(),
      getProducts(),
    ])
      .then(([articlesRes, categoriesRes, tagsRes, productsRes]) => {
        const results =
          articlesRes.data.results ||
          articlesRes.data ||
          []

        setArticles(results)
        setCategories(categoriesRes.data || [])

        setAllTags(
          (tagsRes.data || []).filter(tag =>
            MODULE_TAGS.has(tag.name)
          )
        )

        setProducts(productsRes.data || [])
      })
      .catch(error => {
        console.error("ARTICLES PAGE LOAD ERROR:", error)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  async function runSearch(
    q,
    catFilter,
    typeF,
    tagF,
    productF
  ) {
    const filters = {}

    if (catFilter) {
      filters.category_id = catFilter
    }

    if (typeF) {
      filters.content_type = typeF
    }

    if (tagF) {
      filters.tag_id = tagF
    }

    if (productF) {
      filters.product_id = productF
    }

    if (q.trim().length < 2) {
      setSearching(false)

      try {
        const res = await getArticles(filters)

        setArticles(
          res.data.results ||
          res.data ||
          []
        )
      } catch (error) {
        console.error("ARTICLE FILTER ERROR:", error)
      }

      return
    }

    setSearching(true)

    try {
      const res = await searchArticles(q, filters)

      setArticles(
        res.data.results || []
      )
    } catch (error) {
      console.error("ARTICLE SEARCH ERROR:", error)
      setArticles([])
    } finally {
      setSearching(false)
    }
  }

  function handleSearch(e) {
    const q = e.target.value

    setSearch(q)

    clearTimeout(window.__searchDebounce)

    if (q.trim().length < 2) {
      setSuggestions([])
      setShowSuggestions(false)

      window.__searchDebounce = setTimeout(() => {
        runSearch(
          q,
          categoryFilter,
          typeFilter,
          tagFilter,
          productFilter
        )
      }, 150)

      return
    }

    window.__searchDebounce = setTimeout(() => {
      runSearch(
        q,
        categoryFilter,
        typeFilter,
        tagFilter,
        productFilter
      )
    }, 250)

    setTimeout(async () => {
      try {
        const res = await searchArticles(q, {})

        const results = (
          res.data.results || []
        ).slice(0, 3)

        setSuggestions(results)
        setShowSuggestions(results.length > 0)
      } catch (error) {
        console.error(
          "ARTICLE SUGGESTION ERROR:",
          error
        )
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 300)
  }

  function handleSuggestionClick(slug) {
    setShowSuggestions(false)
    onSelectArticle(slug)
  }

  function applyFilters(
    category = categoryFilter,
    type = typeFilter,
    tag = tagFilter,
    product = productFilter
  ) {
    setShowSuggestions(false)

    runSearch(
      search,
      category,
      type,
      tag,
      product
    )
  }

  function handleCategoryChange(e) {
    const value = e.target.value

    setShowSuggestions(false)
    setCategoryFilter(value)

    applyFilters(
      value,
      typeFilter,
      tagFilter,
      productFilter
    )
  }

  function handleModuleChange(e) {
    const value = e.target.value

    setShowSuggestions(false)
    setTagFilter(value)

    applyFilters(
      categoryFilter,
      typeFilter,
      value,
      productFilter
    )
  }

  function handleContentTypeChange(e) {
    const value = e.target.value

    setShowSuggestions(false)
    setTypeFilter(value)

    applyFilters(
      categoryFilter,
      value,
      tagFilter,
      productFilter
    )
  }

  function handleProductChange(e) {
    const value = e.target.value

    setShowSuggestions(false)
    setProductFilter(value)

    applyFilters(
      categoryFilter,
      typeFilter,
      tagFilter,
      value
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-400">
          Loading knowledge articles...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20">

      {/* ======================================================
          HEADER
      ====================================================== */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">

          <div>
            <div className="text-[10px] uppercase tracking-wider font-semibold text-teal-700 mb-2">
              TaifaCare Knowledge Centre
            </div>

            <h2 className="text-2xl font-bold text-slate-800">
              Knowledge Articles
            </h2>

            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Find verified guidance for TaifaCare HMIS
              workflows, clinical services and system operations.
            </p>
          </div>

          <div className="text-xs text-slate-400">
            {articles.length} result
            {articles.length === 1 ? "" : "s"}
          </div>

        </div>
      </section>

      {/* ======================================================
          SEARCH + FILTERS
      ====================================================== */}
      <section className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">

        {/* SEARCH */}
        <div className="mb-4">

          <input
            type="text"
            value={search}
            onChange={handleSearch}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true)
              }
            }}
            onBlur={() => {
              setTimeout(() => {
                setShowSuggestions(false)
              }, 150)
            }}
            placeholder="Search registration, vitals, laboratory, pharmacy..."
            className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />

          {/* AUTOCOMPLETE */}
          {showSuggestions &&
            suggestions.length > 0 && (
              <div className="mt-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

                {suggestions.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onMouseDown={() => {
                      setShowSuggestions(false)
                      handleSuggestionClick(item.slug)
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-teal-50 border-b border-slate-100 last:border-0 transition"
                  >
                    {item.title}
                  </button>
                ))}

              </div>
            )}

        </div>

        {/* FILTERS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

          {/* CATEGORY */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2">

            <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400 px-1.5 mb-1">
              Category
            </label>

            <select
              value={categoryFilter}
              onChange={handleCategoryChange}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">
                All categories
              </option>

              {categories.map(category => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>

          </div>

          {/* HMIS MODULE */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2">

            <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400 px-1.5 mb-1">
              HMIS Module
            </label>

            <select
              value={tagFilter}
              onChange={handleModuleChange}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">
                All HMIS modules
              </option>

              {allTags.map(tag => (
                <option
                  key={tag.id}
                  value={tag.id}
                >
                  {tag.name}
                </option>
              ))}
            </select>

          </div>

          {/* CONTENT TYPE */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2">

            <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400 px-1.5 mb-1">
              Content Type
            </label>

            <select
              value={typeFilter}
              onChange={handleContentTypeChange}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">
                All content types
              </option>

              <option value="how_to">
                How-To Guide
              </option>

              <option value="sop">
                SOP
              </option>

              <option value="faq">
                FAQ
              </option>

              <option value="feature_reference">
                Feature Reference
              </option>

              <option value="troubleshooting">
                Troubleshooting
              </option>

              <option value="release_notes">
                Release Notes
              </option>
            </select>

          </div>

          {/* PRODUCT */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2">

            <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400 px-1.5 mb-1">
              Product
            </label>

            <select
              value={productFilter}
              onChange={handleProductChange}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">
                All products
              </option>

              {products.map(product => (
                <option
                  key={product.id}
                  value={product.id}
                >
                  {product.name}
                  {" "}
                  v{product.version || "N/A"}
                </option>
              ))}
            </select>

          </div>

        </div>

      </section>

      {/* ======================================================
          SEARCHING STATUS
      ====================================================== */}
      {searching && (
        <div className="text-xs text-slate-400">
          Searching the knowledge base...
        </div>
      )}

      {/* ======================================================
          ARTICLE RESULTS
      ====================================================== */}
      <section className="grid gap-4">

        {articles.map(article => (
          <button
            key={article.id}
            type="button"
            onClick={() =>
              onSelectArticle(article.slug)
            }
            className="w-full text-left bg-white border border-slate-200 rounded-xl p-5 hover:border-teal-300 hover:shadow-md transition group"
          >

            <div className="flex items-start gap-4">

              {/* ARTICLE ICON */}
              <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 group-hover:bg-teal-600 group-hover:text-white transition">

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

              {/* ARTICLE INFORMATION */}
              <div className="min-w-0 flex-1">

                <div className="flex items-start justify-between gap-3">

                  <h3 className="font-semibold text-slate-800 group-hover:text-teal-700 transition">
                    {article.title}
                  </h3>

                  <span className="text-slate-300 group-hover:text-teal-600 text-lg shrink-0">
                    →
                  </span>

                </div>

                {/* TAXONOMY BADGES */}
                <div className="flex flex-wrap gap-2 mt-3">

                  {article.category_name && (
                    <span className="text-[11px] bg-teal-50 text-teal-700 border border-teal-100 px-2.5 py-1 rounded-full">
                      {article.category_name}
                    </span>
                  )}

                  {article.content_type && (
                    <span className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full capitalize">
                      {article.content_type.replaceAll(
                        "_",
                        " "
                      )}
                    </span>
                  )}

                  <span className="text-[11px] bg-cyan-50 text-cyan-700 border border-cyan-100 px-2.5 py-1 rounded-full">
                    {article.product_name || "TaifaCare"}
                    {" "}
                    v{article.product_version || "1.0"}
                  </span>

                </div>

                <p className="text-xs text-slate-400 mt-3">
                  Published knowledge article
                </p>

              </div>

            </div>

          </button>
        ))}

      </section>

      {/* ======================================================
          EMPTY STATE
      ====================================================== */}
      {articles.length === 0 && (
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
              <circle
                cx="11"
                cy="11"
                r="7"
              />

              <path d="m16 16 4 4" />

            </svg>

          </div>

          <h3 className="font-semibold text-slate-700">
            No matching articles
          </h3>

          <p className="text-sm text-slate-400 mt-1">
            Try a different search term, category or HMIS module.
          </p>

        </div>
      )}

    </div>
  )
}