import { useState } from "react"
import { login, forgotPassword, resetPassword } from "../services/api"

function EyeIcon({ open }) {
  return open ? (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
      aria-hidden="true"
    >
      <path d="M2 2l20 20" />
      <path d="M6.7 6.7C4.2 8.3 2.7 10.2 2 12c1.5 3.5 5.3 7 10 7 1.7 0 3.2-.4 4.5-1.1" />
      <path d="M10.7 10.7a2 2 0 0 0 2.8 2.8"z />
      <path d="M9.9 5.2C10.6 5.1 11.3 5 12 5c4.7 0 8.5 3.5 10 7-0.6 1.4-1.7 3-3.3 4.3" />
    </svg>
  ) : (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
      aria-hidden="true"
    >
      <path d="M2 12s3.8-7 10-7 10 7 10 7-3.8 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

export default function Login({ onLogin, onShowRegister }) {
  const [view, setView] = useState("login")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const [resetEmail, setResetEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)

  const [resetStep, setResetStep] = useState("email")

  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  function clearMessages() {
    setError("")
    setMessage("")
  }

  async function handleLogin(e) {
    e.preventDefault()

    if (!email.trim() || !password) {
      setError("Please enter both email and password.")
      return
    }

    setLoading(true)
    clearMessages()

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

      if (err.response?.status === 429) {
        setError(
          "Too many login attempts. Please wait a few minutes before trying again."
        )
      } else {
        setError(
          err.response?.data?.detail ||
          "Invalid email or password. Please try again."
        )
      }
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
    clearMessages()

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
      console.error(
        "FORGOT PASSWORD ERROR:",
        err
      )

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

    if (!resetEmail.trim()) {
      setError("Please enter your email address.")
      return
    }

    if (!/^\d{6}$/.test(otp.trim())) {
      setError("Please enter the 6-digit verification code.")
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
    clearMessages()

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
      }, 1500)

    } catch (err) {
      console.error(
        "RESET PASSWORD ERROR:",
        err
      )

      setError(
        err.response?.data?.detail ||
        "Unable to reset your password. Please check your code and try again."
      )
    } finally {
      setLoading(false)
    }
  }

  function openForgotPassword() {
    clearMessages()
    setResetEmail(email)
    setResetStep("email")
    setView("forgot")
  }

  function backToLogin() {
    clearMessages()
    setView("login")
    setResetStep("email")
  }

  if (view === "forgot") {
    return (
      <main className="min-h-screen bg-gradient-to-br from-violet-700 to-blue-800 flex items-center justify-center p-4">

        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">

          <div className="text-center mb-8">

            <div className="w-16 h-16 bg-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">
                TC
              </span>
            </div>

            <h1 className="text-2xl font-bold text-slate-800">
              Reset your password
            </h1>

            <p className="text-slate-500 mt-1 text-sm">
              Verify your account and create a new password.
            </p>

          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-5 text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-violet-50 border border-violet-200 text-violet-800 px-4 py-3 rounded-lg mb-5 text-sm">
              {message}
            </div>
          )}

          {resetStep === "email" && (
            <form
              onSubmit={handleForgotPassword}
              className="space-y-5"
            >

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email address
                </label>

                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) =>
                    setResetEmail(e.target.value)
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  required
                />

              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
              >
                {loading
                  ? "Sending..."
                  : "Send Verification Code"}
              </button>

            </form>
          )}

          {resetStep === "otp" && (
            <form
              onSubmit={handleResetPassword}
              className="space-y-5"
            >

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-1">
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
                  placeholder="Enter 6-digit code"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm tracking-[0.35em] text-center focus:outline-none focus:ring-2 focus:ring-violet-500"
                  required
                />

                <p className="text-xs text-slate-400 mt-2">
                  The code expires after 10 minutes.
                </p>

              </div>

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-1">
                  New password
                </label>

                <div className="relative">

                  <input
                    type={
                      showNewPassword
                        ? "text"
                        : "password"
                    }
                    value={newPassword}
                    onChange={(e) =>
                      setNewPassword(e.target.value)
                    }
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowNewPassword(
                        prev => !prev
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-600 transition"
                    aria-label={
                      showNewPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    <EyeIcon
                      open={showNewPassword}
                    />
                  </button>

                </div>

              </div>

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-1">
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
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  required
                />

              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
              >
                {loading
                  ? "Resetting..."
                  : "Reset Password"}
              </button>

            </form>
          )}

          <button
            type="button"
            onClick={backToLogin}
            className="w-full text-violet-700 hover:text-violet-800 text-sm font-medium py-2 mt-4"
          >
            ← Back to sign in
          </button>

        </div>

      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-700 to-blue-800 flex items-center justify-center p-4">

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">

        <div className="text-center mb-8">

          <div className="w-16 h-16 bg-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">
              TC
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-800">
            Taifa Care HMIS
          </h1>

          <p className="text-slate-500 mt-1">
            Sign in to access knowledge system
          </p>

        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-5 text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-violet-50 border border-violet-200 text-violet-800 px-4 py-3 rounded-lg mb-5 text-sm">
            {message}
          </div>
        )}

        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >

          <div>

            <label className="block text-sm font-medium text-slate-700 mb-1">
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
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              required
            />

          </div>


          <div>

            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>

            <div className="relative">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Password"
                autoComplete="current-password"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(prev => !prev)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-600 transition"
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                <EyeIcon
                  open={showPassword}
                />
              </button>

            </div>

            {/* Forgot password is BELOW the field */}
            <div className="flex justify-end mt-2">

              <button
                type="button"
                onClick={openForgotPassword}
                className="text-xs font-semibold text-violet-700 hover:text-violet-800 transition"
              >
                Forgot password?
              </button>

            </div>

          </div>


          <button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Signing in..."
              : "Sign In"}
          </button>

        </form>


        <button
          type="button"
          onClick={onShowRegister}
          className="w-full mt-4 text-violet-700 hover:text-violet-800 text-sm font-medium py-2"
        >
          Don't have an account? Create one
        </button>


        <p className="text-center text-xs text-slate-500 mt-4">
          Taifa Care Knowledge Centre
        </p>

      </div>

    </main>
  )
}
