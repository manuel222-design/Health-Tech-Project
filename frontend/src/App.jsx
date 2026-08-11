import { useState, useEffect } from "react"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Articles from "./pages/Articles"
import ArticleView from "./pages/ArticleView"
import AdminArticles from "./pages/AdminArticles"
import AdminUsers from "./pages/AdminUsers"
import AdminAnalytics from "./pages/AdminAnalytics"
import AdminAuditLog from "./pages/AdminAuditLog"
import ArticleForm from "./pages/ArticleForm"
import ChatWidget from "./components/ChatWidget"
import Home from "./pages/Home"

export default function App() {
  const [user, setUser] = useState(() => {
    const token    = localStorage.getItem("token")
    const username = localStorage.getItem("username")
    const role     = localStorage.getItem("role")
    return token ? { token, username, role } : null
  })
  const [showRegister, setShowRegister] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [currentPage, setCurrentPage] = useState("articles")
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedSlug, setSelectedSlug] = useState(null)
  const [editSlug, setEditSlug]         = useState(null)

  const canManage = user?.role === "editor" || user?.role === "admin"

  const isAdmin = user?.role === "admin"

  function handleLogin(userData) { setUser(userData) }

  function handleLogout() {
    localStorage.clear()
    setUser(null)
  }

  function goTo(page) {
    setCurrentPage(page)
    setSelectedSlug(null)
    setEditSlug(null)

    if (page === "home") {
      setSelectedCategory("")
    }
    if (page === "articles") {
      setSelectedCategoryId("")
    }
  }

  function handleSelectArticle(slug) {
    setSelectedSlug(slug)
    setCurrentPage("article")
  }

  function handleSelectCategory(categoryId) {
    setSelectedCategory(categoryId)
    setCurrentPage("articles")
    setSelectedSlug(null)
    setEditSlug(null)
  }

  useEffect(() => {
    window.openHealthtechArticle = handleSelectArticle
    return () => { delete window.openHealthtechArticle }
  }, [])

  useEffect(() => {
    if (!user) return
    import("./services/api").then(({ getMyNotifications }) => {
      getMyNotifications()
        .then(res => setNotifications(res.data))
        .catch(() => setNotifications([]))
    })
  }, [user])

  function handleEditArticle(slug) {
    setEditSlug(slug)
    setCurrentPage("form")
  }

  function handleCreateArticle() {
    setEditSlug(null)
    setCurrentPage("form")
  }

  function handleFormDone() {
    setCurrentPage("admin")
  }

  if (!user) {
    if (showRegister) {
      return <Register onRegister={handleLogin} onBackToLogin={() => setShowRegister(false)} />
    }
    return <Login onLogin={handleLogin} onShowRegister={() => setShowRegister(true)} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-teal-600 text-white shadow">
        <div className="px-4 py-3 flex flex-wrap md:flex-nowrap justify-between items-center gap-3">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => goTo("home")}
          >
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0">
              <span className="text-teal-600 text-sm font-bold">HC</span>
            </div>
            <span className="font-semibold text-base sm:text-lg whitespace-nowrap">Healthtech KB</span>
          </div>

          <div className="flex items-center gap-4">
          {notifications.length > 0 && (
            <span
              title={`${notifications.length} of your article(s) have a low rating`}
              className="text-xs bg-red-500 text-white rounded-full px-2 py-0.5 font-medium"
            >
              {notifications.length} low-rated
            </span>
          )}
          <span className="text-sm text-teal-100">
            {user.username} · {user.role}
          </span>
            <button
              onClick={handleLogout}
              className="text-sm bg-teal-700 hover:bg-teal-800 px-3 py-1.5 rounded-lg transition whitespace-nowrap"
            >
              Sign out
            </button>
          </div>
        </div>

        <div className="px-4 pb-3 flex items-center gap-4 text-sm overflow-x-auto">
          <button
            onClick={() => goTo("home")}
            className={`whitespace-nowrap hover:text-teal-100 ${currentPage === "home" ? "font-semibold" : "text-teal-100"}`}
          >
            Home
          </button>
          <button
            onClick={() => goTo("articles")}
            className={`whitespace-nowrap hover:text-teal-100 ${currentPage === "articles" || currentPage === "article" ? "font-semibold" : "text-teal-100"}`}
          >
            Knowledge Base
          </button>
          {canManage && (
            <button
              onClick={() => goTo("admin")}
              className={`whitespace-nowrap hover:text-teal-100 ${currentPage === "admin" || currentPage === "form" ? "font-semibold" : "text-teal-100"}`}
            >
              Manage Articles
            </button>
          )}
          {isAdmin && (
              <button
                onClick={() => goTo("users")}
                className={`whitespace-nowrap hover:text-teal-100 ${currentPage === "users" ? "font-semibold" : "text-teal-100"}`}
              >
                Manage Users
              </button>
          )}
          {isAdmin && (
              <button
                onClick={() => goTo("analytics")}
                className={`whitespace-nowrap hover:text-teal-100 ${currentPage === "analytics" ? "font-semibold" : "text-teal-100"}`}
              >
                Analytics
              </button>
          )}
          {isAdmin && (
              <button
                onClick={() => goTo("audit")}
                className={`whitespace-nowrap hover:text-teal-100 ${currentPage === "audit" ? "font-semibold" : "text-teal-100"}`}
              >
                Audit Log
              </button>
          )}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {currentPage === "home" && (
          <Home
            onSelectArticle={handleSelectArticle}
            onSelectCategory={handleSelectCategory}
          />
        )}

        {currentPage === "articles" && (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Knowledge Base</h2>
            <p className="text-gray-500 mb-6">HMIS guides and clinical workflows</p>
            <Articles
              onSelectArticle={handleSelectArticle}
              initialCategory={selectedCategory}
            />

          </>
        )}

        {currentPage === "article" && selectedSlug && (
          <ArticleView slug={selectedSlug} onBack={() => goTo("articles")} />
        )}

        {currentPage === "admin" && canManage && (
          <AdminArticles onEdit={handleEditArticle} onCreate={handleCreateArticle} />
        )}

        {currentPage === "form" && canManage && (
          <ArticleForm
            slug={editSlug}
            onDone={handleFormDone}
            onCancel={() => goTo("admin")}
          />
        )}
        {currentPage === "users" && isAdmin && (
          <AdminUsers />
        )}
        {currentPage === "analytics" && isAdmin && (
          <AdminAnalytics />
        )}
        {currentPage === "audit" && isAdmin && (
          <AdminAuditLog />
        )}
      </main>

      <ChatWidget />
    </div>
  )
}
