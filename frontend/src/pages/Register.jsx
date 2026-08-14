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

    setError("")
    setLoading(true)

    try {

      const res = await register(
        username,
        email,
        password,
        department
      )

      console.log("REGISTER SUCCESS:", res.data)

      localStorage.setItem(
        "token",
        res.data.access_token
      )

      if (res.data.refresh_token) {
        localStorage.setItem(
          "refresh_token",
          res.data.refresh_token
        )
      }

      onRegister(res.data)

    } catch (err) {

      console.error(
        "REGISTER ERROR:",
        err.response?.data || err
      )

      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Registration failed"
      )

    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
      >

        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Create Account
        </h2>


        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}


        <input
          className="w-full border p-3 rounded mb-3"
          placeholder="Username"
          value={username}
          onChange={(e)=>setUsername(e.target.value)}
          required
        />


        <input
          className="w-full border p-3 rounded mb-3"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          required
        />


        <input
          className="w-full border p-3 rounded mb-3"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          required
        />


        <input
          className="w-full border p-3 rounded mb-4"
          placeholder="Department (optional)"
          value={department}
          onChange={(e)=>setDepartment(e.target.value)}
        />


        <button
          disabled={loading}
          className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700"
        >
          {loading ? "Creating Account..." : "Register"}
        </button>


        <button
          type="button"
          onClick={onBackToLogin}
          className="w-full mt-4 text-gray-600"
        >
          Back to Login
        </button>


      </form>

    </div>
  )
}