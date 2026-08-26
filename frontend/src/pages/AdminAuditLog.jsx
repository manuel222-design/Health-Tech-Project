import { useState, useEffect } from "react"
import { getAuditLogs } from "../services/api"

const ACTION_LABELS = {
  create_article:   "Created article",
  update_article:   "Updated article",
  approve_article:  "Approved article",
  archive_article:  "Archived article",
  change_role:      "Changed user role",
  toggle_active:    "Changed account status",
}

export default function AdminAuditLog() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAuditLogs()
      .then(res => setLogs(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-slate-400">Loading audit log...</div>
    </div>
  )

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Audit Log</h2>
        <p className="text-slate-500 text-sm">Record of all administrative actions — who did what, when</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {logs.length === 0 ? (
          <p className="text-sm text-slate-400 p-6">No actions logged yet</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {logs.map(log => (
              <div key={log.id} className="p-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-800">
                    <span className="font-semibold">{log.actor_name}</span>
                    {" "}
                    {ACTION_LABELS[log.action] || log.action}
                    {log.target_type === "article" && " (article)"}
                    {log.target_type === "user" && " (user account)"}
                  </p>
                  {log.details && (
                    <p className="text-xs text-slate-400 mt-0.5">{log.details}</p>
                  )}
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}