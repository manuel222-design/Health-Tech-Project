import { useState, useEffect } from "react"
import { listUsers, updateUserRole, toggleUserActive } from "../services/api"

export default function AdminUsers() {
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  function loadUsers() {
    setLoading(true)
    listUsers()
      .then(res => setUsers(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadUsers() }, [])

  async function handleRoleChange(userId, newRole) {
    setUpdating(userId)
    try {
      await updateUserRole(userId, newRole)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
    } catch {
      alert("Failed to update role")
    } finally {
      setUpdating(null)
    }
  }

  async function handleToggleActive(userId) {
    setUpdating(userId)
    try {
      const res = await toggleUserActive(userId)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: res.data.is_active } : u))
    } catch {
      alert(err.response?.data?.detail || "Failed to update user")
    } finally {
      setUpdating(null)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-slate-400">Loading users...</div>
    </div>
  )

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Manage Users</h2>
        <p className="text-slate-500 text-sm">Assign roles and manage account access</p>
      </div>

      <div className="grid gap-3">
        {users.map(u => (
          <div
            key={u.id}
            className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap"
          >
            <div>
              <h3 className="font-semibold text-slate-800">{u.username}</h3>
              <p className="text-xs text-slate-400">{u.email}</p>
              <span className={`text-xs rounded-full px-2 py-0.5 border mt-1 inline-block ${
                u.is_active
                  ? "bg-violet-50 text-violet-700 border-violet-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}>
                {u.is_active ? "Active" : "Deactivated"}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <select
                value={u.role}
                onChange={e => handleRoleChange(u.id, e.target.value)}
                disabled={updating === u.id}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
                <option value="sme">SME</option>
              </select>

              <button
                onClick={() => handleToggleActive(u.id)}
                disabled={updating === u.id}
                className={`text-sm font-medium px-3 py-1.5 rounded-lg border transition disabled:opacity-50 ${
                  u.is_active
                    ? "text-red-600 border-red-200 hover:bg-red-50"
                    : "text-violet-600 border-violet-200 hover:bg-violet-50"
                }`}
              >
                {u.is_active ? "Deactivate" : "Reactivate"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}