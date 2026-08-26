import { useEffect, useMemo, useState } from "react"
import { getArticles, searchArticles, createSupportRequest } from "../services/api"

const FALLBACK_FAQS = [
  {
    question: "How do I search the Knowledge Base?",
    answer:
      "Open Knowledge Base from the navigation and use the search field. You can also filter knowledge by category, content type, product, and supported module.",
  },
  {
    question: "How do I reset my password?",
    answer:
      "Open the Sign In page and select “Forgot password?”. Enter your registered email address and follow the verification steps.",
  },
  {
    question: "What can a Viewer do?",
    answer:
      "Viewers can access the Knowledge Base, search healthcare guidance, use available assistant features, and provide feedback. Content-management and administration functions are restricted.",
  },
  {
    question: "What can an Editor do?",
    answer:
      "Editors can work with knowledge content, including creating and managing articles and products. Administrative functions such as user management and audit administration remain restricted.",
  },
  {
    question: "What can an Administrator do?",
    answer:
      "Administrators have the broadest access, including the dashboard, content management, user management, analytics, feedback, and audit-log functions.",
  },
  {
    question: "How do I get help with the AI assistant?",
    answer:
      "Open the Taifa Care Assistant from the available assistant controls and ask a clear question. The assistant can help you locate relevant knowledge and guide you toward available articles.",
  },
]

function FAQRow({ item }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-slate-50 transition"
      >
        <span className="font-semibold text-slate-800">
          {item.question || item.title}
        </span>

        <span
          className={`shrink-0 w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center transition-transform ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        >
          ↓
        </span>
      </button>

      {open && (
        <div className="px-5 pb-5 text-sm leading-6 text-slate-600 border-t border-slate-100">
          <div className="pt-4">
            {item.answer || item.body_markdown || item.excerpt || "No additional information available."}
          </div>
        </div>
      )}
    </div>
  )
}

export default function HelpSupport({
  onSelectArticle,
  onOpenAssistant,
}) {
  const [faqArticles, setFaqArticles] = useState([])
  const [search, setSearch] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [loadingFaq, setLoadingFaq] = useState(true)
  const [error, setError] = useState("")

  const [subject, setSubject] = useState("")
  const [category, setCategory] = useState("Technical Issue")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")

  useEffect(() => {
    getArticles({ content_type: "faq" })
      .then(res => {
        const items =
          res.data?.results ||
          res.data ||
          []

        setFaqArticles(items)
      })
      .catch(err => {
        console.error("HELP FAQ LOAD ERROR:", err)
        setFaqArticles([])
      })
      .finally(() => {
        setLoadingFaq(false)
      })
  }, [])

  const displayedFaqs = useMemo(() => {
    if (search.trim()) {
      return searchResults
    }

    return faqArticles.length > 0
      ? faqArticles.slice(0, 8)
      : FALLBACK_FAQS
  }, [faqArticles, search, searchResults])

  async function handleSearch(e) {
    const value = e.target.value
    setSearch(value)
    setError("")

    if (value.trim().length < 2) {
      setSearchResults([])
      return
    }

    setSearching(true)

    try {
      const res = await searchArticles(value, {
        content_type: "faq",
        log_search: "false",
      })

      setSearchResults(
        (res.data?.results || []).slice(0, 8)
      )
    } catch (err) {
      console.error("HELP FAQ SEARCH ERROR:", err)
      setSearchResults([])
      setError("Unable to search FAQs right now.")
    } finally {
      setSearching(false)
    }
  }

  async function handleSubmitSupport(event) {
    event.preventDefault()

    setError("")
    setSubmitMessage("")

    if (!subject.trim() || !message.trim()) {
      setError("Please provide a subject and describe the issue.")
      return
    }

    setSubmitting(true)

    try {
      const response = await createSupportRequest({
        subject: subject.trim(),
        category,
        message: message.trim(),
      })

      setSubmitMessage(
        response.data?.message ||
        "Support request submitted successfully."
      )

      setSubject("")
      setMessage("")
      setCategory("Technical Issue")
    } catch (err) {
      console.error("SUPPORT REQUEST ERROR:", err)

      setError(
        err.response?.data?.detail ||
        "Unable to submit your support request."
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      <section className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 text-white p-7 sm:p-10 shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs font-semibold text-violet-200">
            Taifa Care Help Centre
          </div>

          <h2 className="mt-5 text-3xl sm:text-4xl font-bold tracking-tight">
            How can we help?
          </h2>

          <p className="mt-3 text-sm sm:text-base leading-7 text-slate-300 max-w-2xl">
            Find answers, explore the Knowledge Base, or open the Taifa Care
            assistant for guided help.
          </p>

          <div className="mt-7 relative max-w-2xl">
            <input
              value={search}
              onChange={handleSearch}
              type="search"
              placeholder="Search FAQs and help articles..."
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-5 py-4 pr-12 text-sm text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-violet-400"
            />

            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
              {searching ? "…" : "⌕"}
            </span>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4 mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              Frequently Asked Questions
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Common questions about using the Taifa Care knowledge system.
            </p>
          </div>

          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("")
                setSearchResults([])
              }}
              className="text-sm font-semibold text-violet-700 hover:text-violet-900"
            >
              Clear search
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loadingFaq && !search ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
            Loading FAQs…
          </div>
        ) : displayedFaqs.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <p className="font-semibold text-slate-700">
              No matching FAQs found.
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Try another search term or use the Taifa Care assistant.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedFaqs.map((item, index) => (
              <FAQRow
                key={
                  item.slug ||
                  item.id ||
                  `${item.question || item.title}-${index}`
                }
                item={item}
              />
            ))}
          </div>
        )}
      </section>

      <section className="grid md:grid-cols-2 gap-5">

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center text-xl">
            ?
          </div>

          <h3 className="mt-5 text-lg font-bold text-slate-800">
            Browse the Knowledge Base
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Explore healthcare guides, workflows, troubleshooting articles,
            FAQs, and product knowledge.
          </p>

          <button
            type="button"
            onClick={() => onSelectArticle?.("")}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-800 transition"
          >
            Open Knowledge Base
            <span>→</span>
          </button>
        </div>

        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-6">
          <div className="w-11 h-11 rounded-xl bg-white text-violet-700 flex items-center justify-center text-xl shadow-sm">
            AI
          </div>

          <h3 className="mt-5 text-lg font-bold text-slate-800">
            Need more guided help?
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Ask the Taifa Care assistant to help you find relevant knowledge
            and navigate available information.
          </p>

          <button
            type="button"
            onClick={() => onOpenAssistant?.()}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-700 text-white px-4 py-2.5 text-sm font-semibold hover:bg-violet-800 transition"
          >
            Open Assistant
            <span>→</span>
          </button>
        </div>

      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.16em] font-bold text-slate-400">
            Contact Support
          </p>

          <h3 className="mt-2 text-xl font-bold text-slate-800">
            Still need help?
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-500 max-w-2xl">
            Submit a support request and an administrator can review it from
            the system's support workspace.
          </p>
        </div>

        {submitMessage && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {submitMessage}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmitSupport}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Subject
            </label>

            <input
              value={subject}
              onChange={event => setSubject(event.target.value)}
              maxLength={180}
              placeholder="e.g. I cannot access an article"
              className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Category
            </label>

            <select
              value={category}
              onChange={event => setCategory(event.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            >
              <option>Account & Login</option>
              <option>Technical Issue</option>
              <option>Knowledge Base</option>
              <option>AI Assistant</option>
              <option>Other</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Describe the issue
            </label>

            <textarea
              value={message}
              onChange={event => setMessage(event.target.value)}
              maxLength={5000}
              rows={6}
              placeholder="Tell us what happened, where it happened, and what you expected to happen."
              className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            />
          </div>

          <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-xs text-slate-400">
              Your signed-in account is automatically attached to this request.
            </p>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex justify-center items-center gap-2 rounded-xl bg-violet-700 text-white px-5 py-3 text-sm font-semibold hover:bg-violet-800 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {submitting ? "Submitting..." : "Submit Support Request"}
            </button>
          </div>
        </form>
      </section>

    </div>
  )
}
