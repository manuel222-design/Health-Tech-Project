import { useState } from "react"
import Login from "./pages/Login"
import Articles from "./pages/Articles"
import ArticleView from "./pages/ArticleView"
import ChatWidget from "./components/ChatWidget"

export default function App() {
  const [user, setUser] = useState(() => {
    const token    = localStorage.getItem("token")
    const username = localStorage.getItem("username")
    const role     = localStorage.getItem("role")
    return token ? { token, username, role } : null
  })
  const [currentPage, setCurrentPage]     = useState("articles")
  const [selectedSlug, setSelectedSlug]   = useState(null)

  function handleLogin(userData) { setUser(userData) }

  function handleLogout() {
    localStorage.clear()
    setUser(null)
  }

  function handleSelectArticle(slug) {
    setSelectedSlug(slug)
    setCurrentPage("article")
  }

  function handleBack() {
    setCurrentPage("articles")
    setSelectedSlug(null)
  }

  if (!user) return <Login onLogin={handleLogin} />

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-teal-600 text-white px-6 py-4 flex justify-between items-center shadow">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setCurrentPage("articles")}
        >
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-teal-600 text-sm font-bold">HC</span>
          </div>
          <span className="font-semibold text-lg">Healthtech KB</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-teal-100">
            {user.username} · {user.role}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm bg-teal-700 hover:bg-teal-800 px-3 py-1.5 rounded-lg transition"
          >
            Sign out
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {currentPage === "articles" && (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">
              Knowledge Base
            </h2>
            <p className="text-gray-500 mb-6">
              HMIS guides and clinical workflows
            </p>
            <Articles onSelectArticle={handleSelectArticle} />
          </>
        )}

        {currentPage === "article" && selectedSlug && (
          <ArticleView slug={selectedSlug} onBack={handleBack} />
        )}
      </main>
      <ChatWidget />
    </div>
  )
}
