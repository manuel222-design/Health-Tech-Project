import { useState, useEffect } from "react"
import {
  getArticle,
  submitFeedback,
  getFeedbackSummary,
} from "../services/api"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

function slugifyHeading(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function extractHeadings(markdown = "") {
  const lines = markdown.split("\n")
  const headings = []
  const usedIds = new Map()

  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)$/)

    if (!match) continue

    const level = match[1].length
    const text = match[2]
      .trim()
      .replace(/[*_`]/g, "")

    const baseId = slugifyHeading(text)
    const count = usedIds.get(baseId) || 0
    usedIds.set(baseId, count + 1)

    const id =
      count === 0
        ? baseId
        : `${baseId}-${count + 1}`

    headings.push({
      level,
      text,
      id,
    })
  }

  return headings
}

function MetadataBadge({
  children,
  className = "",
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-full border ${className}`}
    >
      {children}
    </span>
  )
}

export default function ArticleView({
  slug,
  onBack,
}) {
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [summary, setSummary] = useState(null)
  const [showToc, setShowToc] = useState(false)

  useEffect(() => {
    let active = true

    setLoading(true)
    setError("")
    setArticle(null)
    setSubmitted(false)
    setRating(0)
    setHoverRating(0)
    setComment("")
    setShowToc(false)

    getArticle(slug)
      .then(res => {
        if (active) {
          setArticle(res.data)
        }
      })
      .catch(err => {
        console.error(
          "ARTICLE LOAD ERROR:",
          err
        )

        if (active) {
          setError(
            err.response?.data?.detail ||
            `Failed to load article (${err.response?.status || "network error"})`
          )
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    getFeedbackSummary(slug)
      .then(res => {
        if (active) {
          setSummary(res.data)
        }
      })
      .catch(err => {
        console.error(
          "FEEDBACK SUMMARY ERROR:",
          err
        )
      })

    return () => {
      active = false
    }
  }, [slug])

  async function handleSubmitFeedback() {
    if (rating === 0) return

    try {
      await submitFeedback(
        slug,
        rating,
        comment
      )

      setSubmitted(true)

      const res =
        await getFeedbackSummary(slug)

      setSummary(res.data)
    } catch (err) {
      console.error(
        "FEEDBACK SUBMISSION ERROR:",
        err
      )

      alert("Failed to submit feedback")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">

          <div className="w-10 h-10 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin mx-auto mb-4" />

          <p className="text-sm text-slate-500">
            Loading knowledge article...
          </p>

        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">

        <div className="text-center max-w-lg">

          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-red-50 border border-red-100">
              <span className="text-2xl font-bold text-red-500">
                404
              </span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">
            Article not found
          </h1>

          <p className="text-slate-500 leading-relaxed mb-8">
            {error ||
              "We couldn't find the knowledge article you're looking for. It may have been unpublished or the link may be incorrect."}
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-3">

            <button
              type="button"
              onClick={onBack}
              className="px-5 py-2.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition font-medium"
            >
              Back to Knowledge Base
            </button>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="px-5 py-2.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
            >
              Try Again
            </button>

          </div>

        </div>

      </div>
    )
  }

  const body =
    article.body_markdown || ""

  const headings =
    extractHeadings(body)

  const apiBase =
    import.meta.env.VITE_API_BASE ||
    "/api/v1"

  const pdfUrl =
    `${apiBase}/articles/${slug}/pdf`

  const updatedDate =
    article.updated_at ||
    article.published_at ||
    article.created_at

  const articleDate =
    updatedDate
      ? new Date(updatedDate).toLocaleDateString(
          "en-GB",
          {
            day: "numeric",
            month: "long",
            year: "numeric",
          }
        )
      : "Not available"

  const contentType =
    article.content_type
      ? article.content_type
          .replaceAll("_", " ")
          .replace(
            /\b\w/g,
            char => char.toUpperCase()
          )
      : "How-To Guide"

  const categoryName =
    article.category_name ||
    article.category?.name ||
    ""

  const productName =
    article.product_name ||
    article.product?.name ||
    "TaifaCare"

  const productVersion =
    article.product_version ||
    article.product?.version ||
    "1.0"

  const roleText =
    article.roles ||
    article.target_roles ||
    ""

  return (
    <div className="max-w-6xl mx-auto pb-16">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">

        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-violet-700 hover:text-violet-800 font-medium"
        >
          <span>←</span>
          Back to Knowledge Base
        </button>

        <a
          href={pdfUrl}
          download
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition shadow-sm"
        >
          <span>📄</span>
          Download PDF
        </a>

      </div>


      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

        <div className="h-1.5 bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500" />

        <div className="p-6 sm:p-8 lg:p-10">

          <div className="flex flex-wrap gap-2 mb-5">

            {categoryName && (
              <MetadataBadge className="bg-violet-50 border-violet-100 text-violet-700">
                {categoryName}
              </MetadataBadge>
            )}

            <MetadataBadge className="bg-slate-50 border-slate-200 text-slate-600">
              {contentType}
            </MetadataBadge>

            <MetadataBadge className="bg-indigo-50 border-indigo-100 text-indigo-700">
              {productName} v{productVersion}
            </MetadataBadge>

            {article.status && (
              <MetadataBadge className="bg-emerald-50 border-emerald-100 text-emerald-700">
                {article.status.replaceAll(
                  "_",
                  " "
                )}
              </MetadataBadge>
            )}

          </div>

          <h1 className="text-3xl sm:text-4xl font-bold leading-tight text-slate-900">
            {article.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-3xl mt-4">
            Verified knowledge guidance for
            healthcare teams working with
            TaifaCare HMIS.
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-6 text-xs text-slate-400">

            <span>
              Last updated: {articleDate}
            </span>

            <span className="hidden sm:inline text-slate-300">
              •
            </span>

            <span>
              Product: {productName}
            </span>

            <span className="hidden sm:inline text-slate-300">
              •
            </span>

            <span>
              Version {productVersion}
            </span>

            {article.view_count !== undefined && (
              <>
                <span className="hidden sm:inline text-slate-300">
                  •
                </span>

                <span>
                  {article.view_count || 0} views
                </span>
              </>
            )}

          </div>

          {roleText && (
            <div className="mt-5 pt-5 border-t border-slate-100">

              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                Intended users
              </span>

              <p className="text-sm text-slate-600 mt-1">
                {roleText}
              </p>

            </div>
          )}

        </div>

      </section>


      <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-6 mt-6">

        {headings.length > 0 && (
          <aside className="lg:sticky lg:top-6 lg:self-start">

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

              <button
                type="button"
                onClick={() =>
                  setShowToc(!showToc)
                }
                className="w-full flex items-center justify-between px-4 py-3.5 text-left"
              >

                <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                  On this page
                </span>

                <span className="text-slate-400 lg:hidden">
                  {showToc ? "▾" : "▸"}
                </span>

              </button>

              <div
                className={`${
                  showToc
                    ? "block"
                    : "hidden lg:block"
                } border-t border-slate-100`}
              >

                <div className="p-3 space-y-1 max-h-[65vh] overflow-y-auto">

                  {headings.map(
                    (heading, index) => (
                      <a
                        key={`${heading.id}-${index}`}
                        href={`#${heading.id}`}
                        onClick={() => setShowToc(false)}
                        className={`block w-full text-left rounded-lg px-3 py-2 text-xs transition ${
                          heading.level === 3
                            ? "ml-3 text-slate-500 hover:text-violet-700"
                            : "font-medium text-slate-700 hover:text-violet-700"
                        }`}
                      >
                        {heading.text}
                      </a>
                    )
                  )}

                </div>

              </div>

            </div>

          </aside>
        )}


        <article className="min-w-0">

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 lg:p-10">

            <div className="article-content max-w-none">

              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{

                  h1: () => null,

                  h2: ({ children }) => {
                    const text = String(children)
                    const id =
                      slugifyHeading(text)

                    return (
                      <h2
                        id={id}
                        className="scroll-mt-24 text-xl sm:text-2xl font-bold text-slate-800 mt-10 mb-4 pb-2 border-b border-slate-100"
                      >
                        {children}
                      </h2>
                    )
                  },

                  h3: ({ children }) => {
                    const text = String(children)
                    const id =
                      slugifyHeading(text)

                    return (
                      <h3
                        id={id}
                        className="scroll-mt-24 text-lg font-bold text-slate-800 mt-8 mb-3"
                      >
                        {children}
                      </h3>
                    )
                  },

                  p: ({ children }) => (
                    <p className="text-[15px] leading-7 text-slate-700 mb-5">
                      {children}
                    </p>
                  ),

                  ul: ({ children }) => (
                    <ul className="list-disc pl-6 space-y-2 text-[15px] leading-7 text-slate-700 mb-5">
                      {children}
                    </ul>
                  ),

                  ol: ({ children }) => (
                    <ol className="list-decimal pl-6 space-y-2 text-[15px] leading-7 text-slate-700 mb-5">
                      {children}
                    </ol>
                  ),

                  li: ({ children }) => (
                    <li className="pl-1">
                      {children}
                    </li>
                  ),

                  strong: ({ children }) => (
                    <strong className="font-semibold text-slate-900">
                      {children}
                    </strong>
                  ),

                  a: ({ children, href }) => (
                    <a
                      href={href}
                      target={
                        href?.startsWith("http")
                          ? "_blank"
                          : undefined
                      }
                      rel={
                        href?.startsWith("http")
                          ? "noreferrer"
                          : undefined
                      }
                      className="text-violet-700 font-medium hover:text-violet-800 hover:underline"
                    >
                      {children}
                    </a>
                  ),

                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-violet-400 bg-violet-50 rounded-r-xl px-5 py-4 my-6 text-sm text-violet-900">
                      {children}
                    </blockquote>
                  ),

                  table: ({ children }) => (
                    <div className="my-8 w-full overflow-x-auto">
                      <div className="inline-block min-w-full border border-slate-200 rounded-xl overflow-hidden">
                        <table className="w-full border-collapse text-sm">
                          {children}
                        </table>
                      </div>
                    </div>
                  ),

                  thead: ({ children }) => (
                    <thead className="bg-slate-50">
                      {children}
                    </thead>
                  ),

                  th: ({ children }) => (
                    <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-700 whitespace-nowrap">
                      {children}
                    </th>
                  ),

                  td: ({ children }) => (
                    <td className="border-b border-slate-100 px-4 py-3 text-slate-600 align-top">
                      {children}
                    </td>
                  ),

                  hr: () => (
                    <hr className="my-8 border-slate-200" />
                  ),

                  code: ({
                    inline,
                    children,
                  }) => (
                    inline ? (
                      <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[13px]">
                        {children}
                      </code>
                    ) : (
                      <code className="block bg-slate-950 text-slate-100 rounded-xl p-4 overflow-x-auto text-sm leading-6">
                        {children}
                      </code>
                    )
                  ),

                  img: ({
                    src,
                    alt,
                  }) => (
                    <figure className="my-7">

                      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                        <img
                          src={src}
                          alt={alt || "Article image"}
                          loading="lazy"
                          className="max-w-full h-auto object-contain mx-auto"
                        />
                      </div>

                      {alt && (
                        <figcaption className="text-xs text-slate-400 text-center mt-2">
                          {alt}
                        </figcaption>
                      )}

                    </figure>
                  ),

                }}
              >
                {body}
              </ReactMarkdown>

            </div>

          </div>


          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 mt-6">

            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

              <div>

                <div className="text-[10px] uppercase tracking-wider font-semibold text-violet-700">
                  Knowledge quality
                </div>

                <h2 className="text-lg font-bold text-slate-800 mt-1">
                  Was this article helpful?
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Your feedback helps improve the knowledge base.
                </p>

              </div>

              {summary &&
                summary.total_ratings > 0 && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-left">

                    <div className="text-sm font-semibold text-amber-700">
                      ⭐ {summary.average_rating}
                    </div>

                    <div className="text-xs text-amber-600 mt-0.5">
                      {summary.total_ratings} rating
                      {summary.total_ratings !== 1
                        ? "s"
                        : ""}
                    </div>

                  </div>
                )}

            </div>


            {submitted ? (

              <div className="mt-5 bg-violet-50 border border-violet-200 rounded-xl px-4 py-4">

                <div className="flex items-start gap-3">

                  <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                    ✓
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-violet-800">
                      Thanks for your feedback!
                    </p>

                    <p className="text-xs text-violet-700 mt-1">
                      Your response has been recorded.
                    </p>
                  </div>

                </div>

              </div>

            ) : (

              <div className="mt-5">

                <div className="flex items-center gap-1 mb-4">

                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setRating(star)
                      }
                      onMouseEnter={() =>
                        setHoverRating(star)
                      }
                      onMouseLeave={() =>
                        setHoverRating(0)
                      }
                      aria-label={`Rate ${star} out of 5`}
                      className="text-2xl leading-none transition-transform hover:scale-110"
                    >
                      {(hoverRating || rating) >=
                      star
                        ? "⭐"
                        : "☆"}
                    </button>
                  ))}

                </div>

                <textarea
                  value={comment}
                  onChange={e =>
                    setComment(e.target.value)
                  }
                  placeholder="Optional comment about this article..."
                  rows={3}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 resize-none"
                />

                <button
                  type="button"
                  onClick={handleSubmitFeedback}
                  disabled={rating === 0}
                  className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Feedback
                </button>

              </div>

            )}

          </section>

        </article>

      </div>

    </div>
  )
}
