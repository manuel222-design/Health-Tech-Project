import { useEffect, useMemo, useState } from "react"
import {
  getAdminSupportRequests,
  updateSupportRequestStatus,
} from "../services/api"

function formatDate(value) {
  if (!value) return "Unknown date"

  try {
    return new Date(value).toLocaleString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return "Unknown date"
  }
}

function statusLabel(status) {
  return status
    .replace("_", " ")
    .replace(/\w/g, letter => letter.toUpperCase())
}

export default function AdminSupport() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [search, setSearch] = useState("")
  const [updatingId, setUpdatingId] = useState(null)

  async function loadRequests() {
    setLoading(true)
    setError("")

    try {
      const response = await getAdminSupportRequests()
      setRequests(response.data || [])
    } catch (err) {
      console.error("ADMIN SUPPORT LOAD ERROR:", err)
      setError(
        err.response?.data?.detail ||
        "Unable to load support requests."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [])

  async function handleStatusChange(id, status) {
    setUpdatingId(id)

    try {
      await updateSupportRequestStatus(id, status)

      setRequests(prev =>
        prev.map(item =>
          item.id === id
            ? {
                ...item,
                status,
                resolved_at:
                  status === "resolved"
                    ? new Date().toISOString()
                    : null,
              }
            : item
        )
      )
    } catch (err) {
      console.error("SUPPORT STATUS UPDATE ERROR:", err)

      setError(
        err.response?.data?.detail ||
        "Unable to update support request."
      )
    } finally {
      setUpdatingId(null)
    }
  }

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()

    return requests.filter(item => {
      const matchesStatus =
        !statusFilter ||
        item.status === statusFilter

      const matchesSearch =
        !query ||
        item.subject?.toLowerCase().includes(query) ||
        item.message?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.requester?.username?.toLowerCase().includes(query) ||
        item.requester?.email?.toLowerCase().includes(query)

      return matchesStatus && matchesSearch
    })
  }, [requests, statusFilter, search])

  const openCount =
    requests.filter(item => item.status === "open").length

  const inProgressCount =
    requests.filter(item => item.status === "in_progress").length

  const resolvedCount =
    requests.filter(item => item.status === "resolved").length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm text-slate-400">
          Loading support requests...
        </div>
      </div>
    )
  }

  return (
    <section className="space-y-6 pb-20">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Support Requests
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Review and manage technical, account, content, and assistant support requests.
          </p>
        </div>

        <button
          type="button"
          onClick={loadRequests}
          className="self-start rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Open
          </div>
          <div className="text-2xl font-bold text-slate-800 mt-2">
            {openCount}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            In progress
          </div>
          <div className="text-2xl font-bold text-violet-700 mt-2">
            {inProgressCount}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Resolved
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">
            {resolvedCount}
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_190px] gap-3">
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search requester, subject, category, or message..."
            className="border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />

          <select
            value={statusFilter}
            onChange={event => setStatusFilter(event.target.value)}
            className="border border-slate-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="">All statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(item => (
          <article
            key={item.id}
            className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5"
          >
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-slate-800">
                    {item.subject}
                  </h3>

                  <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-violet-50 text-violet-700">
                    {item.category}
                  </span>
                </div>

                <div className="text-xs text-slate-400 mt-2">
                  {item.requester?.username || "Unknown user"}
                  {" · "}
                  {item.requester?.email || "No email"}
                  {" · "}
                  {formatDate(item.created_at)}
                </div>
              </div>

              <select
                value={item.status}
                disabled={updatingId === item.id}
                onChange={event =>
                  handleStatusChange(
                    item.id,
                    event.target.value
                  )
                }
                className="border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-60"
              >
                <option value="open">Open</option>
                <option value="in_progress">In progress</option>
                <option value="resolved">Resolved</option>
              </select>

            </div>

            <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 p-4">
              <p className="text-sm text-slate-600 leading-6 whitespace-pre-wrap">
                {item.message}
              </p>
            </div>
          </article>
        ))}

        {filtered.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl py-16 px-6 text-center">
            <p className="font-semibold text-slate-700">
              No support requests found.
            </p>

            <p className="text-sm text-slate-500 mt-1">
              New requests submitted through Help & Support will appear here.
            </p>
          </div>
        )}
      </div>

    </section>
  )
}
