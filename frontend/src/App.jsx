import { useState, useEffect } from "react"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Articles from "./pages/Articles"
import ArticleView from "./pages/ArticleView"
import AdminArticles from "./pages/AdminArticles"
import AdminUsers from "./pages/AdminUsers"
import AdminAnalytics from "./pages/AdminAnalytics"
import AdminAuditLog from "./pages/AdminAuditLog"
import Products from "./pages/Products"
import ProductDetails from "./pages/ProductDetails"
import ArticleForm from "./pages/ArticleForm"
import ChatWidget from "./components/ChatWidget"
import Landing from "./pages/Landing"
import ErrorPage from "./pages/ErrorPage"
import { getCategories } from "./services/api"

export default function App() {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token")
    const username = localStorage.getItem("username")
    const role = localStorage.getItem("role")

    return token ? { token, username, role } : null
  })

  const [showRegister, setShowRegister] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [sidebarCategories, setSidebarCategories] = useState([])

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("darkMode") === "true"
  )
  
  const [profileOpen, setProfileOpen] = useState(false)

  const initialPath = window.location.pathname

  const initialSlug = initialPath.startsWith("/article/")
    ? initialPath.split("/article/")[1]
    : null

  const [currentPage, setCurrentPage] = useState(() => {
    if (initialPath === "/") return "home"
    if (initialPath === "/articles") return "articles"
    if (initialPath.startsWith("/article/")) return "article"

    return "notfound"
  })

  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedSlug, setSelectedSlug] = useState(initialSlug)
  const [selectedProductSlug, setSelectedProductSlug] = useState(null)
  const [editSlug, setEditSlug] = useState(null)

  const canManage =
    user?.role === "editor" || user?.role === "admin"

  const isSME = user?.role === "sme"
  const isAdmin = user?.role === "admin"

  function handleLogin(userData) {
    setUser(userData)
  }

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode)
    localStorage.setItem("darkMode", darkMode)
  }, [darkMode])

  useEffect(() => {
    getCategories()
      .then(res => setSidebarCategories(res.data || []))
      .catch(() => setSidebarCategories([]))
  }, [])

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
      window.history.pushState({}, "", "/")
    }

    if (page === "articles") {
      setSelectedCategory("")
      window.history.pushState({}, "", "/articles")
    }
  }

  function handleSelectArticle(slug) {
    setSelectedSlug(slug)
    setCurrentPage("article")
    window.history.pushState({}, "", `/article/${slug}`)
  }
  
  function handleSelectProduct(slug) {
    setSelectedProductSlug(slug)
    setCurrentPage("product")
    window.history.pushState({}, "", `/product/${slug}`)
  }


  function handleSelectCategory(categoryId) {
    setSelectedCategory(categoryId)
    setCurrentPage("articles")
    setSelectedSlug(null)
    setEditSlug(null)
    window.history.pushState({}, "", "/articles")
  }

  useEffect(() => {
    window.openHealthtechArticle = handleSelectArticle

    return () => {
      delete window.openHealthtechArticle
    }
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
    if (!canManage) return

    setEditSlug(slug)
    setCurrentPage("form")
  }

  function handleCreateArticle() {
    if (!canManage) return

    setEditSlug(null)
    setCurrentPage("form")
  }

  function handleFormDone() {
    setCurrentPage("admin")
  }

  if (!user) {
    if (showRegister) {
      return (
        <Register
          onRegister={handleLogin}
          onBackToLogin={() => setShowRegister(false)}
        />
      )
    }

    return (
      <Login
        onLogin={handleLogin}
        onShowRegister={() => setShowRegister(true)}
      />
    )
  }

  const pageTitle = {
    home: "Dashboard",
    articles: "Knowledge Base",
    article: "Knowledge Base",
    admin: "Content Management",
    form: "Article Management",
    products: "Products",
    product: "Product Details",
    users: "User Management",
    analytics: "Analytics",
    audit: "Audit Log"
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">


      <aside className="fixed left-0 top-0 bottom-0 w-60 bg-slate-900 text-slate-300 hidden md:flex flex-col z-40">


        <div className="px-5 py-5 border-b border-slate-800">

          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => goTo("home")}
          >

            <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">
                TC
              </span>
            </div>

            <div>
              <div className="text-white font-semibold text-sm">
                Taifa Care
              </div>

              <div className="text-slate-500 text-xs">
                HMIS Knowledge System
              </div>
            </div>

          </div>

        </div>



        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">


          <button
            onClick={() => goTo("home")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
              currentPage === "home"
                ? "bg-slate-800 text-white border-l-2 border-teal-500"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <span>▦</span>
            <span>Dashboard</span>
          </button>



          <div className="pt-5 pb-2 px-3 text-[10px] uppercase tracking-wider text-slate-600 font-semibold">
            Knowledge
          </div>

          <button
            onClick={() => goTo("articles")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
              currentPage === "articles" ||
              currentPage === "article"
                ? "bg-slate-800 text-white border-l-2 border-teal-500"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <span>▤</span>
            <span>Knowledge Base</span>
          </button>  

          {sidebarCategories.length > 0 && (
            <div className="ml-3 mt-2 pl-3 border-l border-slate-800 space-y-1">
              {sidebarCategories.map(category => (
                <button
                  key={category.id}
                  onClick={() => handleSelectCategory(category.id)}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs text-left transition ${
                    currentPage === "articles" && selectedCategory === category.id
                      ? "bg-slate-800 text-teal-400"
                      : "text-slate-500 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0"></span>
                  <span className="truncate">{category.name}</span>
                  <span className="ml-auto text-[10px] text-slate-600">
                    {category.article_count || 0}
                  </span>
                </button>
              ))}
            </div>
          )}

          {(canManage || isSME) && (
            <>
              <div className="pt-5 pb-2 px-3 text-[10px] uppercase tracking-wider text-slate-600 font-semibold">
                Content Management
              </div>

              <button
                onClick={() => goTo("admin")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                  currentPage === "admin"
                    ? "bg-slate-800 text-white border-l-2 border-teal-500"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span>✓</span>
                <span>SME Review</span>

                {notifications.length > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5">
                    {notifications.length}
                  </span>
                )}
              </button>
            </>
          )}


          {canManage && (
            <button
              onClick={() => goTo("form")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                currentPage === "form"
                  ? "bg-slate-800 text-white border-l-2 border-teal-500"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span>✎</span>
              <span>Manage Articles</span>
            </button>
          )}

          {canManage && (
            <button
              onClick={() => goTo("products")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                currentPage === "products" || currentPage === "product"
                  ? "bg-slate-800 text-white border-l-2 border-teal-500"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span>▣</span>
              <span>Products</span>
            </button>
          )}

          {isAdmin && (
            <>
              <div className="pt-5 pb-2 px-3 text-[10px] uppercase tracking-wider text-slate-600 font-semibold">
                Administration
              </div>

              <button
                onClick={() => goTo("users")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                  currentPage === "users"
                    ? "bg-slate-800 text-white border-l-2 border-teal-500"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span>♙</span>
                <span>Users</span>
              </button>

              <button
                onClick={() => goTo("analytics")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                  currentPage === "analytics"
                    ? "bg-slate-800 text-white border-l-2 border-teal-500"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span>▥</span>
                <span>Analytics</span>
              </button>

              <button
                onClick={() => goTo("audit")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                  currentPage === "audit"
                    ? "bg-slate-800 text-white border-l-2 border-teal-500"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span>◷</span>
                <span>Audit Log</span>
              </button>
            </>
          )}

        </nav>




      </aside>



      <div className="md:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between">

        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => goTo("home")}
        >

          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center font-bold text-xs">
            TC
          </div>

          <span className="font-semibold text-sm">
            Taifa Care HMIS
          </span>

        </div>

        <button
          onClick={handleLogout}
          className="text-xs bg-slate-800 px-3 py-1.5 rounded-lg"
        >
          Sign out
        </button>

      </div>



      <div className="md:ml-60 min-h-screen">


        <header className="relative bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">

          <div>

            <h1 className="text-lg font-semibold text-slate-800">
              {pageTitle[currentPage] || "Taifa Care HMIS"}
            </h1>

            <p className="text-xs text-slate-400 mt-0.5">
              Taifa Care Health Management Information System
            </p>

          </div>


          <div className="flex items-center gap-4">

            {notifications.length > 0 && (
              <span
                title={`${notifications.length} of your articles have a low rating`}
                className="text-xs bg-red-50 text-red-600 border border-red-100 rounded-full px-2.5 py-1 font-medium"
              >
                {notifications.length} low-rated
              </span>
            )}



            <button
              onClick={() => setDarkMode(prev => !prev)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition"
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? "☀" : "☾"}
            </button>



            <button
              onClick={() => setProfileOpen(prev => !prev)}
              className="hidden sm:flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100 transition"
              aria-label="Open user menu"
            >
              <div className="text-right">
                <div className="text-xs font-medium text-slate-700">
                  {user.username}
                </div>
                
                <div className="text-[11px] text-slate-400 capitalize">
                  {user.role}
                </div>
              </div>
              
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-semibold">
                {(user.username || "U").substring(0, 2).toUpperCase()}
              </div>
              
              <span className="text-slate-400 text-xs">
                ▾
              </span>
            </button>

            {profileOpen && (
              <div className="absolute right-6 top-14 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-sm font-medium text-slate-800">
                    {user.username}
                  </p>
                  <p className="text-xs text-slate-400 capitalize">
                    {user.role}
                  </p>
                </div>
                
                <button
                  onClick={() => setProfileOpen(false)}
                  className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                >
                  My Profile
                </button>

                <button
                  onClick={() => setProfileOpen(false)}
                  className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                >
                  Account Settings
                </button>
                
                <div className="border-t border-slate-100 my-1" />

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Sign out
                </button>
                
              </div>
            )}

          </div>

        </header>



        <main className="max-w-7xl mx-auto px-6 py-7">

          {currentPage === "home" && (
            <Home
              onSelectArticle={handleSelectArticle}
              onSelectCategory={handleSelectCategory}
            />
          )}

          {currentPage === "articles" && (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                Knowledge Base
              </h2>

              <p className="text-gray-500 mb-6">
                HMIS guides and clinical workflows
              </p>

              <Articles
                onSelectArticle={handleSelectArticle}
                initialCategory={selectedCategory}
              />
            </>
          )}

          {currentPage === "article" && selectedSlug && (
            <ArticleView
              slug={selectedSlug}
              onBack={() => goTo("articles")}
            />
          )}

          {currentPage === "admin" && (canManage || isSME) && (
            <AdminArticles
              onEdit={handleEditArticle}
              onCreate={handleCreateArticle}
              userRole={user.role}
            />
          )}

          {currentPage === "form" && canManage && (
            <ArticleForm
              slug={editSlug}
              onDone={handleFormDone}
              onCancel={() => goTo("admin")}
            />
          )}

          {currentPage === "products" && canManage && (
            <Products onSelectProduct={handleSelectProduct} />
          )}

          {currentPage === "product" && selectedProductSlug && (
            <ProductDetails
              slug={selectedProductSlug}
              onBack={() => goTo("products")}
              onSelectArticle={handleSelectArticle}
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

          {currentPage === "notfound" && (
            <ErrorPage
              code="404"
              title="Page not found"
              message="The page you are looking for does not exist or may have been moved."
              onHome={() => goTo("home")}
              onBack={() => goTo("articles")}
            />
          )}

        </main>

      </div>



      <ChatWidget />

    </div>
  )
}
