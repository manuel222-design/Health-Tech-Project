import { useEffect, useRef, useState } from "react"

import Login from "./pages/Login"
import Register from "./pages/Register"
import Landing from "./pages/Landing"
import Articles from "./pages/Articles"
import ArticleView from "./pages/ArticleView"
import AdminArticles from "./pages/AdminArticles"
import AdminUsers from "./pages/AdminUsers"
import AdminAnalytics from "./pages/AdminAnalytics"
import AdminFeedback from "./pages/AdminFeedback"
import AdminAuditLog from "./pages/AdminAuditLog"
import Products from "./pages/Products"
import ProductDetails from "./pages/ProductDetails"
import ArticleForm from "./pages/ArticleForm"
import ChatWidget from "./components/ChatWidget"
import ChatEmbed from "./pages/ChatEmbed"
import Home from "./pages/Home"
import ErrorPage from "./pages/ErrorPage"
import HelpSupport from "./pages/HelpSupport"
import AdminSupport from "./pages/AdminSupport"

import {
  getCategories,
  getMyNotifications,
  getContentNotifications,
} from "./services/api"


function CategorySidebarIcon({ name }) {
  const value = (name || "").toLowerCase()

  if (
    value.includes("patient") ||
    value.includes("management")
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4 h-4"
        aria-hidden="true"
      >
        <circle cx="12" cy="8" r="3" />
        <path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" />
      </svg>
    )
  }

  if (
    value.includes("screen") ||
    value.includes("triage")
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4 h-4"
        aria-hidden="true"
      >
        <rect x="5" y="4" width="14" height="16" rx="2" />
        <path d="M9 4.5h6" />
        <path d="M9 9h6" />
        <path d="M9 13h3" />
        <path d="m9 16 2 2 4-4" />
      </svg>
    )
  }

  if (
    value.includes("clinical") ||
    value.includes("workflow") ||
    value.includes("consult")
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4 h-4"
        aria-hidden="true"
      >
        <path d="M3 12h4l2-5 4 10 2-5h4" />
        <path d="M17 12h4" />
      </svg>
    )
  }

  if (
    value.includes("schedul") ||
    value.includes("appointment")
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4 h-4"
        aria-hidden="true"
      >
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M8 3v4" />
        <path d="M16 3v4" />
        <path d="M4 9h16" />
        <path d="M8 13h3" />
        <path d="M14 13h2" />
        <path d="M8 16h3" />
      </svg>
    )
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
      aria-hidden="true"
    >
      <path d="M5 4h14v16H5z" />
      <path d="M8 8h8" />
      <path d="M8 12h8" />
      <path d="M8 16h5" />
    </svg>
  )
}


export default function App() {


  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [user, setUser] = useState(() => {

    const token = localStorage.getItem("token")
    const username = localStorage.getItem("username")
    const role = localStorage.getItem("role")
    const refresh_token = localStorage.getItem("refresh_token")

    if (!token) return null

    return {
      token,
      refresh_token,
      username: username || "User",
      role: role || "viewer",
    }
  })


  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)

  const [notifications, setNotifications] = useState([])
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const notificationRef = useRef(null)

  const [sidebarCategories, setSidebarCategories] = useState([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("darkMode") === "true"
  )

    const [profileOpen, setProfileOpen] = useState(false)


  const initialPath = window.location.pathname

  const initialSlug = initialPath.startsWith("/article/")
    ? initialPath.split("/article/")[1]
    : null


  const [currentPage, setCurrentPage] = useState(() => {

    if (
      initialPath === "/" ||
      initialPath === "/landing"
    ) {
      const token = localStorage.getItem("token")
      const role = localStorage.getItem("role")

      return token
        ? getRoleLandingPage(role)
        : "landing"
    }

    if (initialPath === "/login") {
      return "login"
    }

    if (initialPath === "/register") {
      return "register"
    }

    if (
      initialPath === "/dashboard"
    ) {
      return "home"
    }

    if (
      initialPath === "/articles"
    ) {
      return "articles"
    }

    if (
      initialPath.startsWith("/article/")
    ) {
      return "article"
    }
    
        if (initialPath === "/content-review") {
      return "review"
    }

    if (
      initialPath === "/manage-articles" ||
      initialPath === "/manage-articles/"
    ) {
      return "manage"
    }

    if (
      initialPath === "/manage-articles/new"
    ) {
      return "form"
    }

    if (
      initialPath.startsWith("/manage-articles?edit=")
    ) {
      return "form"
    }

    if (initialPath === "/products") {
      return "products"
    }

    if (initialPath.startsWith("/product/")) {
      return "product"
    }

    if (initialPath === "/users") {
      return "users"
    }

    if (initialPath === "/analytics") {
      return "analytics"
    }

    if (initialPath === "/audit") {
      return "audit"
    }

    if (initialPath === "/feedback") {
      return "feedback"
    }

    if (initialPath === "/settings") {
      return "settings"
    }

    if (initialPath === "/help") {
      return "help"
    }

    if (initialPath === "/support-requests") {
      return "support"
    }

    if (initialPath === "/widget") {
      return "widget"
    }

    return "notfound"
  })


  const [selectedCategory, setSelectedCategory] =
    useState(null)

  const [selectedSlug, setSelectedSlug] =
    useState(initialSlug)

  const [selectedProductSlug, setSelectedProductSlug] =
    useState(null)

  const [editSlug, setEditSlug] =
    useState(null)


  const canManage =
    user?.role === "editor" ||
    user?.role === "admin"

  const isAdmin =
    user?.role === "admin"

  function displayName(username) {
    const name = (username || "User")
      .replace(/\s+Admin$/i, "")
      .trim()

    const withoutTitle = name.replace(
      /^(Dr\.?|Prof\.?|Mr\.?|Mrs\.?|Ms\.?|Miss)\s+/i,
      ""
    )

    return withoutTitle.split(/\s+/)[0] || "User"
  }

  function normalizeUser(userData) {

    const token =
      userData?.token ||
      userData?.access_token ||
      null

    const refresh_token =
      userData?.refresh_token ||
      localStorage.getItem("refresh_token") ||
      null

    const username =
      userData?.username ||
      localStorage.getItem("username") ||
      "User"

    const role =
      userData?.role ||
      localStorage.getItem("role") ||
      "viewer"

    return {
      token,
      refresh_token,
      username,
      role,
    }
  }

  function getRoleLandingPage(role) {
    if (role === "admin") return "home"
    if (role === "editor") return "manage"
    return "articles"
  }


  function persistUser(userData) {

    const normalized =
      normalizeUser(userData)

    if (!normalized.token) {
      throw new Error(
        "No access token returned"
      )
    }

    localStorage.setItem(
      "token",
      normalized.token
    )

    localStorage.setItem(
      "username",
      normalized.username
    )

    localStorage.setItem(
      "role",
      normalized.role
    )

    if (
      normalized.refresh_token
    ) {
      localStorage.setItem(
        "refresh_token",
        normalized.refresh_token
      )
    }

    return normalized
  }


  function handleLogin(userData) {

    try {

      const normalized =
        persistUser(userData)

      setUser(normalized)

      setShowLogin(false)
      setShowRegister(false)

      setProfileOpen(false)
      setNotificationsOpen(false)

      const destination =
        getRoleLandingPage(normalized.role)

      goTo(destination)

    } catch (error) {
      console.error(
        "LOGIN STATE ERROR:",
        error
      )
    }
  }


  function openLogin() {

    setShowRegister(false)

    setShowLogin(true)

    setCurrentPage("login")

    window.history.pushState(
      {},
      "",
      "/login"
    )
  }


  function openRegister() {

    setShowLogin(false)

    setShowRegister(true)

    setCurrentPage("register")

    window.history.pushState(
      {},
      "",
      "/register"
    )
  }


  function goLanding() {

    setShowLogin(false)
    setShowRegister(false)

    setCurrentPage("landing")

    setSelectedSlug(null)
    setSelectedProductSlug(null)
    setEditSlug(null)

    window.history.pushState(
      {},
      "",
      "/"
    )
  }


  useEffect(() => {

    document.documentElement.classList.toggle(
      "dark",
      darkMode
    )

    localStorage.setItem(
      "darkMode",
      darkMode
    )

  }, [darkMode])


  useEffect(() => {

    getCategories()
      .then(res =>
        setSidebarCategories(
          res.data || []
        )
      )
      .catch(() =>
        setSidebarCategories([])
      )

  }, [])


  useEffect(() => {

    function handleOutsideClick(event) {

      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target
        )
      ) {
        setNotificationsOpen(false)
      }

    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    )

    return () =>
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      )

  }, [])


  function handleLogout() {

    localStorage.removeItem("token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("username")
    localStorage.removeItem("role")

    setUser(null)

    setNotifications([])

    setProfileOpen(false)
    setNotificationsOpen(false)

    setShowLogin(false)
    setShowRegister(false)

    setCurrentPage("landing")

    window.history.pushState(
      {},
      "",
      "/"
    )
  }


  function goTo(page) {

    setCurrentPage(page)

    setSelectedSlug(null)

    setEditSlug(null)

    setShowLogin(false)

    setShowRegister(false)

    setProfileOpen(false)

    setNotificationsOpen(false)


    if (page === "home") {

      setSelectedCategory("")

      window.history.pushState(
        {},
        "",
        "/dashboard"
      )
    }


    if (page === "articles") {

      setSelectedCategory("")

      window.history.pushState(
        {},
        "",
        "/articles"
      )
    }


    if (page === "review") {

      window.history.pushState(
        {},
        "",
        "/content-review"
      )
    }


    if (page === "manage") {

      window.history.pushState(
        {},
        "",
        "/manage-articles"
      )
    }


    if (page === "products") {

      window.history.pushState(
        {},
        "",
        "/products"
      )
    }


    if (page === "users") {

      window.history.pushState(
        {},
        "",
        "/users"
      )
    }


    if (page === "analytics") {

      window.history.pushState(
        {},
        "",
        "/analytics"
      )
    }


    if (page === "audit") {

      window.history.pushState(
        {},
        "",
        "/audit"
      )
    }

    if (page === "feedback") {

      window.history.pushState(
        {},
        "",
        "/feedback"
      )
    }

    if (page === "settings") {

      window.history.pushState(
        {},
        "",
        "/settings"
      )
    }

    if (page === "help") {

      window.history.pushState(
        {},
        "",
        "/help"
      )
    }

    if (page === "support") {

      window.history.pushState(
        {},
        "",
        "/support-requests"
      )
    }

  }


  function handleSelectArticle(slug) {

    setSelectedSlug(slug)

    setCurrentPage("article")

    window.history.pushState(
      {},
      "",
      `/article/${slug}`
    )
  }


  function handleSelectProduct(slug) {

    setSelectedProductSlug(slug)

    setCurrentPage("product")

    window.history.pushState(
      {},
      "",
      `/product/${slug}`
    )
  }


  function handleSelectCategory(categoryId) {

        setCategoriesOpen(true)
setSelectedCategory(categoryId)

    setCurrentPage("articles")

    setSelectedSlug(null)

    setEditSlug(null)

    window.history.pushState(
      {},
      "",
      "/articles"
    )
  }


  useEffect(() => {

    window.openHealthtechArticle =
      handleSelectArticle

    window.openTaifaCareArticle =
      handleSelectArticle

    return () => {

      delete window.openHealthtechArticle
      delete window.openTaifaCareArticle

    }

  }, [])


  useEffect(() => {

    async function refreshNotifications() {

      if (!user) {
        setNotifications([])
        return
      }

      try {

        const requests = [
          getMyNotifications(),
        ]

        if (user.role === "admin" || user.role === "editor") {
          requests.push(getContentNotifications())
        }

        const results = await Promise.all(requests)

        const ratings = results[0]
        const content = results[1]

        const ratingItems =
          (ratings?.data || []).map(item => ({
            ...item,
            notification_type:
              item.notification_type || "feedback",
            source: "feedback",
          }))

        const contentItems =
          (content?.data || []).map(item => ({
            ...item,
            notification_type:
              item.notification_type || "content",
            source: "content",
          }))

        setNotifications([
          ...contentItems,
          ...ratingItems,
        ])

      } catch (error) {

        console.error(
          "NOTIFICATION REFRESH ERROR:",
          error
        )

        setNotifications([])

      }
    }

    refreshNotifications()

  }, [user, currentPage])


  function handleEditArticle(slug) {

    if (!canManage) return

    setEditSlug(slug)

    setCurrentPage("form")

    window.history.pushState(
      {},
      "",
      `/manage-articles?edit=${encodeURIComponent(slug)}`
    )
  }


  function handleCreateArticle() {

    if (!canManage) return

    setEditSlug(null)

    setCurrentPage("form")

    window.history.pushState(
      {},
      "",
      "/manage-articles/new"
    )
  }


  function handleFormDone() {

    setCurrentPage("manage")

    setEditSlug(null)

    window.history.pushState(
      {},
      "",
      "/manage-articles"
    )
  }


  function handleNotificationClick(notification) {
    setNotificationsOpen(false)

    setNotifications(prev =>
      prev.filter(item => {
        const clickedId = notification?.id
        const itemId = item?.id

        if (clickedId && itemId) {
          return itemId !== clickedId
        }

        return !(
          item?.source === notification?.source &&
          (
            item?.slug === notification?.slug ||
            item?.article_slug === notification?.article_slug ||
            item?.article_title === notification?.article_title ||
            item?.title === notification?.title
          )
        )
      })
    )

    if (
      notification?.type === "article_review" ||
      notification?.notification_type === "article_review"
    ) {
      goTo("manage")
      return
    }

    const slug =
      notification?.slug ||
      notification?.article_slug ||
      notification?.article?.slug

    if (slug) {
      handleSelectArticle(slug)
      return
    }

    if (isAdmin || canManage) {
      goTo("manage")
      return
    }

    if (canManage) {
      goTo("manage")
    }
  }

  function notificationTitle(notification) {

    return (
      notification?.title ||
      notification?.message ||
      notification?.text ||
      "New notification"
    )
  }


  function notificationSubtitle(notification) {

    return (
      notification?.article_title ||
      notification?.article?.title ||
      notification?.comments ||
      ""
    )

  }


  const pageTitle = {

    home:
      "Dashboard",

    articles:
      "Search & Browse",

    article:
      "Search & Browse",

    manage:
      editSlug
        ? "Edit Article"
        : "Manage Articles",

    products:
      "Products",

    product:
      "Product Details",

    users:
      "User Management",

    analytics:
      "Analytics",

    audit:
      "Audit Log",

    feedback:
      "Feedback",

    settings:
      "Settings",

    help:
      "Help & Support",

    support:
      "Support Requests",
  }

  const pageAllowed =
  currentPage === "home"
    ? isAdmin
    : currentPage === "review"
    ? canManage
    : currentPage === "manage" ||
      currentPage === "form" ||
      currentPage === "products" ||
      currentPage === "product"
    ? canManage
    : currentPage === "users" ||
      currentPage === "analytics" ||
      currentPage === "audit" ||
      currentPage === "support"
    ? isAdmin
    : true

  if (currentPage === "widget") {
    return <ChatEmbed />
  }

  if (!user) {

    if (
      showRegister ||
      currentPage === "register"
    ) {

      return (
        <Register
          onRegister={handleLogin}
          onBackToLogin={openLogin}
        />
      )
    }


    if (
      showLogin ||
      currentPage === "login"
    ) {

      return (
        <Login
          onLogin={handleLogin}
          onShowRegister={openRegister}
        />
      )
    }


    if (
      currentPage === "articles" ||
      currentPage === "article"
    ) {

      return (
        <div className="min-h-screen bg-slate-100 text-slate-800">

          <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">

              <button
                type="button"
                onClick={goLanding}
                className="flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-white font-extrabold text-xs">
                  TC
                </div>

                <div className="text-left">
                  <div className="text-sm font-semibold text-slate-800">
                    Taifa Care
                  </div>

                  <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400">
                    Knowledge Centre
                  </div>
                </div>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={openLogin}
                  className="px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-violet-700 transition"
                >
                  Sign in
                </button>

                <button
                  type="button"
                  onClick={openRegister}
                  className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition"
                >
                  Get started
                </button>
              </div>

            </div>
          </header>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

            {currentPage === "articles" && (
              <>
                <div className="mb-6">
                  <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">
                    Knowledge Base
                  </h1>

                  <p className="text-sm text-slate-500 mt-1">
                    Browse healthcare guidance and practical workflows.
                  </p>
                </div>

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

          </main>

          <ChatWidget
            onOpenArticle={handleSelectArticle}
          />

        </div>
      )
    }


    return (
      <>
        <Landing
          onLogin={openLogin}
          onRegister={openRegister}
          onOpenAssistant={() =>
            window.openTaifaCareAssistant?.()
          }
          onOpenKnowledge={() =>
            goTo("articles")
          }
        />

        <ChatWidget
          onOpenArticle={handleSelectArticle}
        />
      </>
    )
  }

  function handleMobileNavigate(page) {
    setMobileMenuOpen(false)
    goTo(page)
  }

  return (

    <div className="min-h-screen bg-slate-100 text-slate-800">


      <aside className="fixed left-0 top-0 bottom-0 w-60 bg-slate-950 text-slate-300 hidden md:flex flex-col z-40 shadow-2xl shadow-slate-950/30">

        <div className="relative px-5 py-5 border-b border-slate-800/80 overflow-hidden">

          <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-violet-500/10 blur-2xl pointer-events-none" />

          <div
            className="relative flex items-center gap-3 cursor-pointer group"
            onClick={() =>
              goTo(getRoleLandingPage(user?.role))
            }
          >

            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shrink-0 shadow-lg shadow-violet-950/40 ring-1 ring-violet-400/20 group-hover:ring-violet-300/40 transition">

              <span className="text-white font-extrabold text-sm tracking-tight">
                TC
              </span>

              <span className="absolute -right-0.5 -bottom-0.5 w-2.5 h-2.5 rounded-full bg-violet-300 ring-2 ring-slate-950" />

            </div>


            <div className="min-w-0">

              <div className="text-white font-bold text-[15px] tracking-tight group-hover:text-violet-200 transition">
                Taifa Care
              </div>

              <div className="text-slate-500 text-[10px] uppercase tracking-[0.12em] mt-0.5">
                Knowledge Centre
              </div>

            </div>

          </div>


        </div>


        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900/95">

          {isAdmin && (
            <button
              onClick={() =>
                goTo("home")
              }
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
                currentPage === "home"
                  ? "bg-violet-950/60 text-violet-300 border border-violet-900 shadow-sm"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100 border border-transparent"
              }`}
            >

            <span className="w-5 h-5 flex items-center justify-center shrink-0">

              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <path d="M3 10.5 12 3l9 7.5" />
                <path d="M5.5 9.5V21h13V9.5" />
                <path d="M9.5 21v-6h5v6" />
              </svg>

            </span>

            <span>
              Dashboard
            </span>

            </button>
          )}


          <div className="mt-5 pt-5 pb-2 px-3 border-t border-slate-800 text-[10px] uppercase tracking-[0.14em] text-slate-500 font-semibold">
            Knowledge
          </div>


          <div className="flex items-center gap-1.5">

            <button
              onClick={() => goTo("articles")}
              className={`flex-1 min-w-0 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
                currentPage === "articles" ||
                currentPage === "article"
                  ? "bg-violet-950/60 text-violet-300 border border-violet-900 shadow-sm"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100 border border-transparent"
              }`}
            >

              <span className="w-5 h-5 flex items-center justify-center shrink-0">

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4"
                >
                  <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16.5A1.5 1.5 0 0 0 18.5 18H6.5A2.5 2.5 0 0 0 4 20.5V5.5Z" />
                  <path d="M7 7h8" />
                  <path d="M7 10h8" />
                  <path d="M7 13h5" />
                </svg>

              </span>

              <span className="min-w-0 flex-1 text-left font-medium truncate">
                Knowledge Base
              </span>

              <span className="min-w-[24px] h-5 px-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-semibold flex items-center justify-center shrink-0">
                {sidebarCategories.reduce(
                  (sum, category) =>
                    sum + (category.article_count || 0),
                  0
                )}
              </span>

            </button>


            {sidebarCategories.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  setCategoriesOpen(prev => !prev)
                }
                aria-label={
                  categoriesOpen
                    ? "Hide knowledge base categories"
                    : "Show knowledge base categories"
                }
                aria-expanded={categoriesOpen}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition shrink-0 ${
                  categoriesOpen
                    ? "bg-slate-800 text-violet-300"
                    : "text-slate-500 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`w-4 h-4 transition-transform duration-200 ${
                    categoriesOpen ? "rotate-180" : ""
                  }`}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            )}

          </div>


          {sidebarCategories.length > 0 && categoriesOpen && (

            <div className="mt-2 rounded-xl bg-slate-900/35 border border-slate-800/70 p-1.5 space-y-1">

              <div className="px-2.5 pt-1 pb-1.5 text-[10px] uppercase tracking-[0.14em] text-slate-500 font-semibold">
                Clinical Areas
              </div>

              {sidebarCategories.map(category => (

                <button
                  key={category.id}
                  type="button"
                  onClick={() =>
                    handleSelectCategory(category.id)
                  }
                  className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left transition group ${
                    currentPage === "articles" &&
                    selectedCategory === category.id
                      ? "bg-violet-950/70 text-violet-300"
                      : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-200"
                  }`}
                >

                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                      currentPage === "articles" &&
                      selectedCategory === category.id
                        ? "bg-violet-900 text-violet-300"
                        : "bg-slate-800 text-slate-500 group-hover:text-violet-400"
                    }`}
                  >
                    <CategorySidebarIcon
                      name={category.name}
                    />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium">
                      {category.name}
                    </span>
                  </span>

                  <span
                    className={`min-w-[24px] h-5 px-1.5 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 border ${
                      currentPage === "articles" &&
                      selectedCategory === category.id
                        ? "bg-violet-900/70 text-violet-300 border-violet-800"
                        : "bg-slate-900 text-slate-500 border-slate-800 group-hover:text-slate-300 group-hover:border-slate-700"
                    }`}
                  >
                    {category.article_count || 0}
                  </span>

                </button>

              ))}

            </div>

          )}


          {canManage && (

            <button
              onClick={() =>
                goTo("manage")
              }
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                currentPage === "manage"
                  ? "bg-slate-800 text-white border-l-2 border-violet-500"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >

              <span className="w-5 h-5 flex items-center justify-center shrink-0">

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4"
                >
                  <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />
                  <path d="m13.5 7.5 3 3" />
                </svg>

              </span>

              <span>
                Manage Articles
              </span>

            </button>

          )}


          {canManage && (

            <button
              onClick={() =>
                goTo("products")
              }
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                currentPage === "products" ||
                currentPage === "product"
                  ? "bg-slate-800 text-white border-l-2 border-violet-500"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >

              <span className="w-5 h-5 flex items-center justify-center shrink-0">

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4"
                >
                  <path d="M4 7h16v13H4z" />
                  <path d="M8 7V5h8v2" />
                  <path d="M8 11h8" />
                  <path d="M8 15h5" />
                </svg>

              </span>

              <span>
                Products
              </span>

            </button>

          )}


          {isAdmin && (

            <>

              <div className="mt-5 pt-5 pb-2 px-3 border-t border-slate-800 text-[10px] uppercase tracking-[0.14em] text-slate-500 font-semibold">
                Administration
              </div>


              <button
                onClick={() =>
                  goTo("users")
                }
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                  currentPage === "users"
                    ? "bg-slate-800 text-white border-l-2 border-violet-500"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >

                <span className="w-5 h-5 flex items-center justify-center shrink-0">

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                  >
                    <circle cx="12" cy="8" r="3" />
                    <path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" />
                  </svg>

                </span>

                <span>
                  Users
                </span>

              </button>


              <button
                onClick={() =>
                  goTo("analytics")
                }
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                  currentPage === "analytics"
                    ? "bg-slate-800 text-white border-l-2 border-violet-500"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >

                <span className="w-5 h-5 flex items-center justify-center shrink-0">

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                  >
                    <path d="M4 19V5" />
                    <path d="M4 19h16" />
                    <path d="M8 16v-5" />
                    <path d="M12 16V8" />
                    <path d="M16 16v-3" />
                    <path d="M20 16V6" />
                  </svg>

                </span>

                <span>
                  Analytics
                </span>

              </button>


              <button
                onClick={() =>
                  goTo("feedback")
                }
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                  currentPage === "feedback"
                    ? "bg-slate-800 text-white border-l-2 border-violet-500"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >

                <span className="w-5 h-5 flex items-center justify-center shrink-0">

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                  >
                    <path d="M20 6H4v12h4l4 3 4-3h4V6Z" />
                    <path d="M8 10h8" />
                    <path d="M8 14h5" />
                  </svg>

                </span>

                <span>
                  Feedback
                </span>

              </button>


              <button
                onClick={() =>
                  goTo("support")
                }
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                  currentPage === "support"
                    ? "bg-slate-800 text-white border-l-2 border-violet-500"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className="w-5 h-5 flex items-center justify-center shrink-0">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                  >
                    <path d="M5 5h14v11H9l-4 3V5Z" />
                    <path d="M9 9h6" />
                    <path d="M9 12h4" />
                  </svg>
                </span>

                <span>
                  Support Requests
                </span>
              </button>


              <button
                onClick={() =>
                  goTo("audit")
                }
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                  currentPage === "audit"
                    ? "bg-slate-800 text-white border-l-2 border-violet-500"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >

                <span className="w-5 h-5 flex items-center justify-center shrink-0">

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                  >
                    <circle cx="12" cy="12" r="8.5" />
                    <path d="M12 7v5l3 2" />
                  </svg>

                </span>

                <span>
                  Audit Log
                </span>

              </button>

            </>

          )}

        </nav>


        <div className="px-3 pb-4 pt-3 border-t border-slate-800/80">

          <button
            type="button"
            onClick={() => goTo("help")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
              currentPage === "help"
                ? "bg-violet-950/60 text-violet-300 border border-violet-900 shadow-sm"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-100 border border-transparent"
            }`}
          >

            <span className="w-5 h-5 flex items-center justify-center shrink-0">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M9.5 9a2.5 2.5 0 1 1 3.9 2.1c-.9.5-1.4 1-1.4 2.1" />
                <path d="M12 17h.01" />
              </svg>
            </span>

            <span>
              Help & Support
            </span>

          </button>

          <button
            type="button"
            onClick={() => goTo("settings")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
              currentPage === "settings"
                ? "bg-violet-950/60 text-violet-300 border border-violet-900 shadow-sm"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-100 border border-transparent"
            }`}
          >

            <span className="w-5 h-5 flex items-center justify-center shrink-0">

              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <path d="M12 3l1.2 2.7 2.9.8-.9 2.9 2.2 2.1-2.2 2.1.9 2.9-2.9.8L12 21l-1.2-2.7-2.9-.8.9-2.9-2.2-2.1 2.2-2.1-.9-2.9 2.9-.8L12 3Z" />
                <circle cx="12" cy="12" r="2.5" />
              </svg>

            </span>

            <span>
              Settings
            </span>

          </button>

        </div>

      </aside>



      <div className="md:hidden sticky top-0 z-50 bg-slate-950 text-white border-b border-slate-800 shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() =>
              handleMobileNavigate(
                getRoleLandingPage(user?.role)
              )
            }
            className="flex items-center gap-2 min-w-0"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center font-extrabold text-xs shrink-0">
              TC
            </div>

            <div className="min-w-0 text-left">
              <div className="font-semibold text-sm truncate">
                Taifa Care
              </div>

              <div className="text-[10px] text-slate-400 uppercase tracking-wider truncate">
                {pageTitle[currentPage] || "Knowledge Centre"}
              </div>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="M4 6h16" />
                <path d="M4 12h16" />
                <path d="M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[100]">

          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-slate-950/60"
          />

          <aside className="absolute top-0 right-0 h-[100dvh] w-[88vw] max-w-sm bg-slate-950 text-slate-300 shadow-2xl flex flex-col">

            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 shrink-0">

              <div className="flex items-center gap-3 min-w-0">

                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-white font-extrabold text-sm shrink-0">
                  TC
                </div>

                <div className="min-w-0">
                  <div className="text-white font-bold text-sm truncate">
                    Taifa Care
                  </div>

                  <div className="text-slate-500 text-[10px] uppercase tracking-wider">
                    Knowledge Centre
                  </div>
                </div>

              </div>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-xl shrink-0"
              >
                ×
              </button>

            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4">

              <div className="space-y-1">

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => handleMobileNavigate("home")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${
                      currentPage === "home"
                        ? "bg-violet-950/70 text-violet-300 border border-violet-900"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <span className="w-5 text-center">⌂</span>
                    <span className="flex-1 text-left">Dashboard</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleMobileNavigate("articles")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${
                    currentPage === "articles" || currentPage === "article"
                      ? "bg-violet-950/70 text-violet-300 border border-violet-900"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <span className="w-5 text-center">▤</span>

                  <span className="flex-1 text-left">
                    Knowledge Base
                  </span>

                  <span className="text-xs text-slate-500">
                    {sidebarCategories.reduce(
                      (sum, category) =>
                        sum + (category.article_count || 0),
                      0
                    )}
                  </span>
                </button>

                {canManage && (
                  <button
                    type="button"
                    onClick={() => handleMobileNavigate("manage")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${
                      currentPage === "manage"
                        ? "bg-violet-950/70 text-violet-300 border border-violet-900"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <span className="w-5 text-center">✎</span>
                    <span className="flex-1 text-left">
                      Manage Articles
                    </span>
                  </button>
                )}

                {canManage && (
                  <button
                    type="button"
                    onClick={() => handleMobileNavigate("products")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${
                      currentPage === "products" || currentPage === "product"
                        ? "bg-violet-950/70 text-violet-300 border border-violet-900"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <span className="w-5 text-center">▣</span>
                    <span className="flex-1 text-left">
                      Products
                    </span>
                  </button>
                )}

                {isAdmin && (
                  <>
                    <div className="mt-5 mb-2 px-4 pt-4 border-t border-slate-800">
                      <div className="text-[10px] uppercase tracking-[0.14em] text-slate-500 font-semibold">
                        Administration
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleMobileNavigate("users")}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${
                        currentPage === "users"
                          ? "bg-violet-950/70 text-violet-300 border border-violet-900"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <span className="w-5 text-center">●</span>
                      <span className="flex-1 text-left">Users</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMobileNavigate("analytics")}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${
                        currentPage === "analytics"
                          ? "bg-violet-950/70 text-violet-300 border border-violet-900"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <span className="w-5 text-center">▥</span>
                      <span className="flex-1 text-left">Analytics</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMobileNavigate("feedback")}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${
                        currentPage === "feedback"
                          ? "bg-violet-950/70 text-violet-300 border border-violet-900"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <span className="w-5 text-center">♡</span>
                      <span className="flex-1 text-left">Feedback</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMobileNavigate("support")}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${
                        currentPage === "support"
                          ? "bg-violet-950/70 text-violet-300 border border-violet-900"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <span className="w-5 text-center">✉</span>
                      <span className="flex-1 text-left">Support Requests</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMobileNavigate("audit")}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${
                        currentPage === "audit"
                          ? "bg-violet-950/70 text-violet-300 border border-violet-900"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <span className="w-5 text-center">◷</span>
                      <span className="flex-1 text-left">Audit Log</span>
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => handleMobileNavigate("help")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${
                    currentPage === "help"
                      ? "bg-violet-950/70 text-violet-300 border border-violet-900"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <span className="w-5 text-center">?</span>
                  <span className="flex-1 text-left">Help & Support</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleMobileNavigate("settings")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${
                    currentPage === "settings"
                      ? "bg-violet-950/70 text-violet-300 border border-violet-900"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <span className="w-5 text-center">⚙</span>
                  <span className="flex-1 text-left">Settings</span>
                </button>

              </div>

            </nav>

            <div className="shrink-0 border-t border-slate-800 p-3">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm text-slate-200"
              >
                Sign out
              </button>
            </div>

          </aside>
        </div>
      )}


      <div className="md:ml-60 min-h-screen min-w-0 overflow-x-hidden">


        <header className="relative bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">

          <div>

            <h1 className="text-lg font-semibold text-slate-800">
              {pageTitle[currentPage] ||
                "Taifa Care HMIS"}
            </h1>

            <p className="text-xs text-slate-400 mt-0.5">
              Taifa Care Health Management Information System
            </p>

          </div>


          <div className="flex items-center gap-3">



            <div
              ref={notificationRef}
              className="relative"
            >

              <button
                type="button"
                onClick={() =>
                  setNotificationsOpen(
                    prev => !prev
                  )
                }
                className={`relative w-9 h-9 flex items-center justify-center rounded-lg transition ${
                  notificationsOpen
                    ? "bg-slate-100 text-violet-700"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
                aria-label="Notifications"
                title="Notifications"
              >

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                  <path d="M10 21h4" />
                </svg>


                {notifications.length > 0 && (

                  <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white">
                    {notifications.length > 99
                      ? "99+"
                      : notifications.length}
                  </span>

                )}

              </button>


              {notificationsOpen && (

                <div className="absolute right-0 top-11 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl z-[70] overflow-hidden">

                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">

                    <div>

                      <h3 className="text-sm font-semibold text-slate-800">
                        Notifications
                      </h3>

                      <p className="text-xs text-slate-400 mt-0.5">
                        {notifications.length === 0
                          ? "You're all caught up"
                          : `${notifications.length} item${notifications.length !== 1 ? "s" : ""} requiring attention`}
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setNotificationsOpen(false)
                      }
                      className="text-slate-400 hover:text-slate-700 text-lg"
                      aria-label="Close notifications"
                    >
                      ×
                    </button>

                  </div>


                  <div className="max-h-80 overflow-y-auto">

                    {notifications.length === 0 ? (

                      <div className="px-5 py-10 text-center">

                        <div className="w-10 h-10 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center mx-auto mb-3">

                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-5 h-5"
                          >
                            <path d="m5 12 4 4L19 6" />
                          </svg>

                        </div>

                        <p className="text-sm font-medium text-slate-700">
                          No new notifications
                        </p>

                        <p className="text-xs text-slate-400 mt-1">
                          Everything looks up to date.
                        </p>

                      </div>

                    ) : (

                      notifications
                        .slice(0, 10)
                        .map((notification, index) => (

                          <button
                            key={
                              notification.id ||
                              `${notification.source}-${index}`
                            }
                            type="button"
                            onClick={() =>
                              handleNotificationClick(
                                notification
                              )
                            }
                            className="w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition"
                          >

                            <div className="flex gap-3">

                              <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-700 flex items-center justify-center shrink-0">

                                {notification.source === "feedback" ? (

                                  <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="w-4 h-4"
                                  >
                                    <path d="M5 5h14v10H8l-3 3V5Z" />
                                    <path d="M8 9h8" />
                                    <path d="M8 12h5" />
                                  </svg>

                                ) : (

                                  <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="w-4 h-4"
                                  >
                                    <rect
                                      x="5"
                                      y="4"
                                      width="14"
                                      height="16"
                                      rx="2"
                                    />
                                    <path d="m9 12 2 2 4-4" />
                                  </svg>

                                )}

                              </div>


                              <div className="min-w-0 flex-1">

                                <p className="text-sm font-medium text-slate-700">
                                  {notificationTitle(
                                    notification
                                  )}
                                </p>

                                {notificationSubtitle(
                                  notification
                                ) && (

                                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                                    {notificationSubtitle(
                                      notification
                                    )}
                                  </p>

                                )}

                                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wide">
                                  {notification.source === "feedback"
                                    ? "Feedback"
                                    : "Content"}
                                </p>

                              </div>

                              <span className="text-slate-300 self-center">
                                →
                              </span>

                            </div>

                          </button>

                        ))

                    )}

                  </div>


                  {notifications.length > 10 && (

                    <div className="px-4 py-3 border-t border-slate-100">

                      <button
                        type="button"
                        onClick={() =>
                          goTo("manage")
                        }
                        className="w-full text-center text-xs font-semibold text-violet-700 hover:text-violet-800"
                      >
                        View all notifications →
                      </button>

                    </div>

                  )}

                </div>

              )}

            </div>







            <button
              onClick={() =>
                setProfileOpen(prev => !prev)
              }
              className="hidden sm:flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100 transition"
              aria-label="Open user menu"
            >

              <div className="text-right">

                <div className="text-xs font-medium text-slate-700">
                  {displayName(user?.username)}
                </div>

                <div className="text-[11px] text-slate-400 capitalize">
                  {user?.role || "viewer"}
                </div>

              </div>


              <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-semibold">

                {displayName(user?.username)
                  .substring(0, 2)
                  .toUpperCase()}

              </div>


              <span className="text-slate-400 text-xs">
                ▾
              </span>

            </button>


            {profileOpen && (

              <div className="absolute right-6 top-14 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50">

                <div className="px-4 py-2 border-b border-slate-100">

                  <p className="text-sm font-medium text-slate-800">
                    {displayName(user?.username)}
                  </p>

                  <p className="text-xs text-slate-400 capitalize">
                    {user?.role || "viewer"}
                  </p>

                </div>


                <div className="px-4 py-2 border-b border-slate-100">
                </div>

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


        {!pageAllowed ? (
          <ErrorPage
            code="403"
            title="Access restricted"
            message="You do not have permission to access this area."
            onHome={() => goTo("home")}
            onBack={() => goTo("home")}
          />
        ) : (
          <>
          </>
        )}

        <main className="min-w-0 px-4 py-5 sm:px-6 lg:px-8">

          {currentPage === "help" && (

            <HelpSupport
              onSelectArticle={(slug) => {
                if (slug) {
                  handleSelectArticle(slug)
                } else {
                  goTo("articles")
                }
              }}
              onOpenAssistant={() =>
                window.openTaifaCareAssistant?.()
              }
            />

          )}

          {currentPage === "home" && (

            <Home
              onSelectArticle={handleSelectArticle}
              onSelectCategory={handleSelectCategory}
            />

          )}


          {currentPage === "articles" && (

            <Articles
              onSelectArticle={handleSelectArticle}
              initialCategory={selectedCategory}
            />

          )}


          {currentPage === "article" &&
            selectedSlug && (

              <ArticleView
                slug={selectedSlug}
                onBack={() =>
                  goTo("articles")
                }
              />

            )}


          {currentPage === "review" &&
            canManage && (

              <AdminArticles
                onEdit={handleEditArticle}
                onCreate={handleCreateArticle}
                userRole={user?.role || "viewer"}
                reviewMode
              />

            )}


          {currentPage === "manage" &&
            canManage && (

              <AdminArticles
                onEdit={handleEditArticle}
                onCreate={handleCreateArticle}
                userRole={user?.role || "viewer"}
              />

            )}

          {currentPage === "form" &&
            canManage && (

              <ArticleForm
                slug={editSlug}
                onDone={handleFormDone}
                onCancel={() =>
                  goTo("manage")
                }
              />

            )}


          {currentPage === "products" &&
            canManage && (

              <Products
                onSelectProduct={
                  handleSelectProduct
                }
              />

            )}


          {currentPage === "product" &&
            selectedProductSlug && (

              <ProductDetails
                slug={selectedProductSlug}
                onBack={() =>
                  goTo("products")
                }
                onSelectArticle={
                  handleSelectArticle
                }
              />

            )}


          {currentPage === "users" &&
            isAdmin && (
              <AdminUsers />
            )}


          {currentPage === "analytics" &&
            isAdmin && (
              <AdminAnalytics />
            )}


          {currentPage === "feedback" &&
            isAdmin && (
              <AdminFeedback />
            )}


          {currentPage === "support" &&
            isAdmin && (
              <AdminSupport />
            )}

          {currentPage === "audit" &&
            isAdmin && (
              <AdminAuditLog />
            )}


          {currentPage === "settings" && (

            <section className="max-w-5xl mx-auto space-y-8 pb-20">

              <div>

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5"
                    >
                      <path d="M12 3l1.2 2.7 2.9.8-.9 2.9 2.2 2.1-.9 2.9-2.9.8L12 21l-1.2-2.7-2.9-.8.9-2.9-2.2-2.1.9-2.9 2.9-.8.9-2.9L12 3Z" />
                      <circle cx="12" cy="12" r="2.5" />
                    </svg>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                      Settings
                    </h2>

                    <p className="text-sm text-slate-500 mt-0.5">
                      Manage your account and Taifa Care preferences.
                    </p>
                  </div>

                </div>

              </div>


              <section>

                <div className="flex items-center justify-between mb-3">

                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                      Profile
                    </h3>

                    <p className="text-xs text-slate-400 mt-1">
                      Your current Taifa Care account.
                    </p>
                  </div>

                </div>


                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">

                    <div className="flex items-center gap-4 min-w-0">

                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 text-white flex items-center justify-center text-lg font-bold shrink-0 shadow-sm">
                        {(user?.name || user?.email || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </div>


                      <div className="min-w-0">

                        <div className="font-semibold text-slate-800 truncate">
                          {user?.name || "Taifa Care User"}
                        </div>

                        <div className="text-sm text-slate-500 mt-0.5 truncate">
                          {user?.email || "Signed-in account"}
                        </div>

                      </div>

                    </div>


                    <span className="inline-flex items-center gap-2 self-start sm:self-center px-3 py-1.5 rounded-full bg-violet-50 text-violet-700 border border-violet-100 text-xs font-semibold capitalize">

                      <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />

                      {user?.role || "viewer"}

                    </span>

                  </div>

                </div>

              </section>


              <section>

                <div className="mb-3">

                  <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                    Preferences
                  </h3>

                  <p className="text-xs text-slate-400 mt-1">
                    Personalize how the application behaves.
                  </p>

                </div>


                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

                  <div className="p-6">

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                      <div className="flex items-start gap-4">

                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">

                          {darkMode ? (
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="w-5 h-5"
                            >
                              <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3 6.7 6.7 0 0 0 21 12.8Z" />
                            </svg>
                          ) : (
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="w-5 h-5"
                            >
                              <circle cx="12" cy="12" r="4" />
                              <path d="M12 2v2" />
                              <path d="M12 20v2" />
                              <path d="m4.93 4.93 1.41 1.41" />
                              <path d="m17.66 17.66 1.41 1.41" />
                              <path d="M2 12h2" />
                              <path d="M20 12h2" />
                              <path d="m6.34 17.66-1.41 1.41" />
                              <path d="m19.07 4.93-1.41 1.41" />
                            </svg>
                          )}

                        </div>


                        <div>

                          <div className="font-semibold text-slate-800">
                            Appearance
                          </div>

                          <p className="text-sm text-slate-500 mt-1 max-w-xl">
                            Choose the visual theme used across your Taifa Care workspace.
                          </p>

                        </div>

                      </div>


                      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1 shrink-0">

                        <button
                          type="button"
                          onClick={() => {
                            setDarkMode(false)
                            localStorage.setItem(
                              "darkMode",
                              "false"
                            )
                          }}
                          className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                            !darkMode
                              ? "bg-white text-slate-800 shadow-sm border border-slate-200"
                              : "text-slate-500 hover:text-slate-700"
                          }`}
                        >
                          Light
                        </button>


                        <button
                          type="button"
                          onClick={() => {
                            setDarkMode(true)
                            localStorage.setItem(
                              "darkMode",
                              "true"
                            )
                          }}
                          className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                            darkMode
                              ? "bg-slate-800 text-white shadow-sm"
                              : "text-slate-500 hover:text-slate-700"
                          }`}
                        >
                          Dark
                        </button>

                      </div>

                    </div>

                  </div>

                </div>

              </section>


              <section>

                <div className="mb-3">

                  <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                    Role &amp; Permissions
                  </h3>

                  <p className="text-xs text-slate-400 mt-1">
                    Your permissions are determined by your assigned role.
                  </p>

                </div>


                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

                  <div className="p-6">

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                      <div className="flex items-center gap-4">

                        <div className="w-11 h-11 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center shrink-0">

                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-5 h-5"
                          >
                            <path d="M12 3 5 6v5c0 4.7 2.9 8.1 7 10 4.1-1.9 7-5.3 7-10V6l-7-3Z" />
                            <path d="m9.5 12 1.7 1.7 3.5-3.5" />
                          </svg>

                        </div>


                        <div>

                          <div className="text-sm font-semibold text-slate-800">
                            Current role
                          </div>

                          <div className="text-sm text-slate-500 mt-0.5 capitalize">
                            {user?.role || "viewer"}
                          </div>

                        </div>

                      </div>


                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 text-violet-700 border border-violet-100 text-xs font-semibold capitalize">

                        <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />

                        {user?.role || "viewer"}

                      </span>

                    </div>

                  </div>


                  <div className="border-t border-slate-100 p-6">

                    <div className="mb-4">

                      <div className="text-sm font-semibold text-slate-800">
                        Permissions
                      </div>

                      <p className="text-xs text-slate-500 mt-1">
                        Access available to your current role.
                      </p>

                    </div>


                    <div className="space-y-2.5">

                      {(user?.role === "admin" || user?.role === "editor") && (
                        <>
                          {[
                            "Create articles",
                            "Edit articles",
                            "Save drafts",
                            "Submit articles for review",
                          ].map(permission => (
                            <div
                              key={permission}
                              className="flex items-center gap-3 text-sm text-slate-600"
                            >
                              <span className="w-5 h-5 rounded-full bg-violet-50 text-violet-700 flex items-center justify-center shrink-0">
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  className="w-3.5 h-3.5"
                                >
                                  <path d="m5 12 4 4L19 6" />
                                </svg>
                              </span>

                              <span>{permission}</span>
                            </div>
                          ))}
                        </>
                      )}


                      {user?.role === "admin" && (
                        <>
                          {[
                            "Archive articles",
                            "Approve or reject submitted articles",
                            "Manage users",
                            "View analytics",
                            "View audit logs",
                          ].map(permission => (
                            <div
                              key={permission}
                              className="flex items-center gap-3 text-sm text-slate-600"
                            >
                              <span className="w-5 h-5 rounded-full bg-violet-50 text-violet-700 flex items-center justify-center shrink-0">
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  className="w-3.5 h-3.5"
                                >
                                  <path d="m5 12 4 4L19 6" />
                                </svg>
                              </span>

                              <span>{permission}</span>
                            </div>
                          ))}
                        </>
                      )}


                      {user?.role === "editor" && (
                        <>
                          {[
                            "Approve articles",
                            "Reject articles",
                            "Manage users",
                            "View analytics",
                            "View audit logs",
                          ].map(permission => (
                            <div
                              key={permission}
                              className="flex items-center gap-3 text-sm text-slate-500"
                            >
                              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  className="w-3.5 h-3.5"
                                >
                                  <path d="m7 7 10 10M17 7 7 17" />
                                </svg>
                              </span>

                              <span>{permission}</span>
                            </div>
                          ))}
                        </>
                      )}


                      {(!user?.role || user?.role === "viewer") && (
                        <>
                          {[
                            "Read published knowledge articles",
                            "Search and filter the knowledge base",
                          ].map(permission => (
                            <div
                              key={permission}
                              className="flex items-center gap-3 text-sm text-slate-600"
                            >
                              <span className="w-5 h-5 rounded-full bg-violet-50 text-violet-700 flex items-center justify-center shrink-0">
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  className="w-3.5 h-3.5"
                                >
                                  <path d="m5 12 4 4L19 6" />
                                </svg>
                              </span>

                              <span>{permission}</span>
                            </div>
                          ))}
                        </>
                      )}

                    </div>

                  </div>

                </div>

              </section>

            </section>

          )}


          {currentPage === "notfound" && (

            <ErrorPage
              code="404"
              title="Page not found"
              message="The page you are looking for does not exist or may have been moved."
              onHome={() =>
                goTo("home")
              }
              onBack={() =>
                goTo("articles")
              }
            />

          )}

        </main>

      </div>


      <ChatWidget onOpenArticle={handleSelectArticle} />

    </div>

  )
}
