import { useState } from "react"
import { login, forgotPassword, resetPassword } from "../services/api"

export default function Login({ onLogin, onShowRegister }) {
  const [view, setView] = useState("login")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const [resetEmail, setResetEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [resetStep, setResetStep] = useState("email")

  async function handleLogin(e) {
    e.preventDefault()

    if (!email.trim() || !password) {
      setError("Please enter both email and password.")
      return
    }

    setLoading(true)
    setError("")
    setMessage("")

    try {
      const res = await login(
        email.trim(),
        password
      )

      const userData = {
        token: res.data.access_token,
        refresh_token: res.data.refresh_token || null,
        username: res.data.username || "User",
        role: res.data.role || "viewer",
      }

      localStorage.setItem(
        "token",
        userData.token
      )

      if (userData.refresh_token) {
        localStorage.setItem(
          "refresh_token",
          userData.refresh_token
        )
      }

      localStorage.setItem(
        "username",
        userData.username
      )

      localStorage.setItem(
        "role",
        userData.role
      )

      onLogin(userData)

    } catch (err) {
      console.error("LOGIN ERROR:", err)

      setError(
        err.response?.data?.detail ||
        "Invalid email or password. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleForgotPassword(e) {
    e.preventDefault()

    if (!resetEmail.trim()) {
      setError("Please enter your registered email address.")
      return
    }

    setLoading(true)
    setError("")
    setMessage("")

    try {
      const res = await forgotPassword(
        resetEmail.trim()
      )

      setMessage(
        res.data?.message ||
        "If an account exists for this email, a verification code has been sent."
      )

      setResetStep("otp")

    } catch (err) {
      console.error("FORGOT PASSWORD ERROR:", err)

      setError(
        err.response?.data?.detail ||
        "Unable to process the password reset request."
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault()

    if (!resetEmail.trim() || !otp.trim()) {
      setError("Please enter your email and verification code.")
      return
    }

    if (!/^\d{6}$/.test(otp.trim())) {
      setError("The verification code must contain 6 digits.")
      return
    }

    if (!newPassword || !confirmPassword) {
      setError("Please enter and confirm your new password.")
      return
    }

    if (newPassword.length < 8) {
      setError("Your new password must be at least 8 characters.")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("The passwords do not match.")
      return
    }

    setLoading(true)
    setError("")
    setMessage("")

    try {
      const res = await resetPassword(
        resetEmail.trim(),
        otp.trim(),
        newPassword
      )

      setMessage(
        res.data?.message ||
        "Password reset successfully. You can now sign in."
      )

      setTimeout(() => {
        setView("login")
        setResetStep("email")
        setResetEmail("")
        setOtp("")
        setNewPassword("")
        setConfirmPassword("")
        setMessage("")
      }, 1200)

    } catch (err) {
      console.error("RESET PASSWORD ERROR:", err)

      setError(
        err.response?.data?.detail ||
        "Unable to reset your password."
      )
    } finally {
      setLoading(false)
    }
  }

  function switchToForgot() {
    setView("forgot")
    setError("")
    setMessage("")
    setResetStep("email")
  }

  function switchToLogin() {
    setView("login")
    setError("")
    setMessage("")
    setResetStep("email")
  }

  if (view === "forgot") {
    return (
      <main className="min-h-screen bg-gradient-to-br from-teal-700 to-blue-800 flex items-center justify-center p-4">

        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">

          <div className="text-center mb-8">

            <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">
                TC
              </span>
            </div>

            <h1 className="text-2xl font-bold text-gray-800">
              Reset your password
            </h1>

            <p className="text-gray-500 mt-1 text-sm">
              Verify your account and create a new password.
            </p>

          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-5 text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-teal-50 border border-teal-200 text-teal-800 px-4 py-3 rounded-lg mb-5 text-sm">
              {message}
            </div>
          )}

          {resetStep === "email" && (
            <form onSubmit={handleForgotPassword} className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>

                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Verification Code"}
              </button>

            </form>
          )}

          {resetStep === "otp" && (
            <form onSubmit={handleResetPassword} className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Verification code
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) =>
                    setOtp(
                      e.target.value.replace(/\D/g, "")
                    )
                  }
                  placeholder="6-digit code"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm tracking-[0.3em] text-center focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New password
                </label>

                <div className="relative">

                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) =>
                      setNewPassword(e.target.value)
                    }
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowNewPassword(
                        prev => !prev
                      )
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-teal-700 font-semibold px-2 py-1"
                  >
                    {showNewPassword ? "Hide" : "Show"}
                  </button>

                </div>

              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm password
                </label>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  placeholder="Repeat your new password"
                  autoComplete="new-password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>

            </form>
          )}

          <button
            type="button"
            onClick={switchToLogin}
            className="w-full text-teal-700 hover:text-teal-800 text-sm font-medium py-2 mt-4"
          >
            ← Back to sign in
          </button>

        </div>

      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-700 to-blue-800 flex items-center justify-center p-4">

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">

        <div className="text-center mb-8">

          <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">
              TC
            </span>
          </div>

          <h1 className="text-2xl font-bold text-gray-800">
            Taifa Care HMIS
          </h1>

          <p className="text-gray-500 mt-1">
            Sign in to access knowledge system
          </p>

        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-5 text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-teal-50 border border-teal-200 text-teal-800 px-4 py-3 rounded-lg mb-5 text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Email address"
              autoComplete="email"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />

          </div>


          <div>

            <div className="flex items-center justify-between mb-1">

              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>

              <button
                type="button"
                onClick={switchToForgot}
                className="text-xs font-semibold text-teal-700 hover:text-teal-800"
              >
                Forgot password?
              </button>

            </div>

            <div className="relative">

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Password"
                autoComplete="current-password"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(prev => !prev)
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-teal-700 font-semibold px-2 py-1"
              >
                {showPassword ? "Hide" : "Show"}
              </button>

            </div>

          </div>


          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

        </form>


        <button
          type="button"
          onClick={onShowRegister}
          className="w-full mt-4 text-teal-700 hover:text-teal-800 text-sm font-medium py-2"
        >
          Don't have an account? Create one
        </button>


        <p className="text-center text-xs text-gray-500 mt-4">
          Taifa Care HMIS Knowledge Base & Chatbot System
        </p>

      </div>

    </main>
  )
}
