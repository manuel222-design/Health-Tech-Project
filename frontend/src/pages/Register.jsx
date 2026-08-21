import { useState } from "react"
import { register } from "../services/api"

export default function Register({ onRegister, onBackToLogin }) {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [department, setDepartment] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()

    if (!username.trim() || !email.trim() || !password) {
      setError("Please complete the required fields")
      return
    }

    setError("")
    setLoading(true)

    try {
      const res = await register(
        username.trim(),
        email.trim(),
        password,
        department.trim() || null
      )

      const userData = {
        token: res.data.access_token,
        refresh_token: res.data.refresh_token || null,
        username: res.data.username || username.trim(),
        role: res.data.role || "viewer",
      }

      if (!userData.token) {
        throw new Error("Registration succeeded but no access token was returned")
      }

      localStorage.setItem("token", userData.token)

      if (userData.refresh_token) {
        localStorage.setItem("refresh_token", userData.refresh_token)
      } else {
        localStorage.removeItem("refresh_token")
      }

      localStorage.setItem("username", userData.username)
      localStorage.setItem("role", userData.role)

      onRegister(userData)
    } catch (err) {
      console.error("REGISTER ERROR:", err)

      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Registration failed. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-700 via-indigo-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">
              TC
            </span>
          </div>

          <h1 className="text-2xl font-bold text-gray-800">
            Create Account
          </h1>

          <p className="text-gray-500 mt-1">
            Join Taifa Care
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your name"
              autoComplete="username"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              autoComplete="new-password"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
              <span className="text-gray-400 font-normal"> (optional)</span>
            </label>

            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Clinical, ICT, Administration"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-500">
            New accounts start with Viewer access. An administrator can
            assign additional roles and permissions after registration.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <button
          type="button"
          onClick={onBackToLogin}
          className="w-full text-indigo-700 hover:text-indigo-800 text-sm font-medium py-2 mt-3"
        >
          Already have an account? Sign in
        </button>

        <p className="text-center text-xs text-gray-500 mt-4">
          Taifa Care Knowledge Centre
        </p>
      </div>
    </main>
  )
}
