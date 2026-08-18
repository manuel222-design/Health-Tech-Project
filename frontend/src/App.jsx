import { useEffect, useRef, useState } from "react"

import Login from "./pages/Login"
import Register from "./pages/Register"
import Landing from "./pages/Landing"
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
import Home from "./pages/Home"
import ErrorPage from "./pages/ErrorPage"

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

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("darkMode") === "true"
  )

    const [profileOpen, setProfileOpen] = useState(false)


  const initialPath = window.location.pathname
  const initialSearch = window.location.search

  const initialSlug = initialPath.startsWith("/article/")
    ? initialPath.split("/article/")[1]
    : null


  const [currentPage, setCurrentPage] = useState(() => {

    if (
      initialPath === "/" ||
      initialPath === "/landing"
    ) {
      return "landing"
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

  const isSME =
    user?.role === "sme"

  const isAdmin =
    user?.role === "admin"

  function displayName(username) {
    const name = username || "User"

    return name.replace(/\s+Admin$/i, "").trim()
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

      setCurrentPage("home")

      window.history.pushState(
        {},
        "",
        "/dashboard"
      )

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

        if (user.role === "admin" || user.role === "sme" || user.role === "editor") {
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

    if (
      notification?.type === "article_review" ||
      notification?.notification_type === "article_review"
    ) {
      goTo("review")
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

    if (isSME || isAdmin) {
      goTo("review")
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
      "Knowledge Base",

    article:
      "Knowledge Base",

    review:
      "Content Review",

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
  }

  const pageAllowed =
  currentPage === "review"
    ? (isSME || isAdmin)
    : currentPage === "manage" ||
      currentPage === "form" ||
      currentPage === "products" ||
      currentPage === "product"
    ? canManage
    : currentPage === "users" ||
      currentPage === "analytics" ||
      currentPage === "audit"
    ? isAdmin
    : true

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


    return (
      <Landing
        onLogin={openLogin}
        onRegister={openRegister}
      />
    )
  }


  return (

    <div className="min-h-screen bg-slate-100 text-slate-800">


      <aside className="fixed left-0 top-0 bottom-0 w-60 bg-slate-900 text-slate-300 hidden md:flex flex-col z-40">

        <div className="px-5 py-5 border-b border-slate-800">

          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() =>
              goTo("home")
            }
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
            onClick={() =>
              goTo("home")
            }
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
              (currentPage === "articles" || currentPage === "article")
                ? "bg-slate-800 text-white border-l-2 border-teal-500"
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
                <path d="M3 10.5 12 3l9 7.5" />
                <path d="M5.5 9.5V21h13V9.5" />
                <path d="M9.5 21v-6h5v6" />
              </svg>

            </span>

            <span>
              Dashboard
            </span>

          </button>


          <div className="pt-5 pb-2 px-3 text-[10px] uppercase tracking-wider text-slate-600 font-semibold">
            Knowledge
          </div>


          <button
            onClick={() =>
              goTo("articles")
            }
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
              currentPage === "articles" ||
              currentPage === "article"
                ? "bg-slate-800 text-white border-l-2 border-teal-500"
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
                <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16.5A1.5 1.5 0 0 0 18.5 18H6.5A2.5 2.5 0 0 0 4 20.5V5.5Z" />
                <path d="M7 7h8" />
                <path d="M7 10h8" />
                <path d="M7 13h5" />
              </svg>

            </span>

            <span>
              Knowledge Base
            </span>

          </button>


          {sidebarCategories.length > 0 && (

            <div className="mt-3 space-y-1">

              <div className="px-3 pt-1 pb-2 text-[9px] uppercase tracking-[0.14em] text-slate-600 font-semibold">
                Clinical Areas
              </div>

              {sidebarCategories.map(category => (

                <button
                  key={category.id}
                  type="button"
                  onClick={() =>
                    handleSelectCategory(category.id)
                  }
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition group ${
                    currentPage === "articles" &&
                    selectedCategory === category.id
                      ? "bg-teal-950/70 text-teal-300 border border-teal-900"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent"
                  }`}
                >

                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      currentPage === "articles" &&
                      selectedCategory === category.id
                        ? "bg-teal-900 text-teal-300"
                        : "bg-slate-800 text-slate-500 group-hover:text-teal-400"
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
                    className={`text-[10px] font-semibold shrink-0 ${
                      currentPage === "articles" &&
                      selectedCategory === category.id
                        ? "text-teal-400"
                        : "text-slate-600"
                    }`}
                  >
                    {category.article_count || 0}
                  </span>

                </button>

              ))}

            </div>

          )}


          {(isSME || isAdmin) && (

            <>

              <div className="pt-5 pb-2 px-3 text-[10px] uppercase tracking-wider text-slate-600 font-semibold">
                Content Management
              </div>


              <button
                onClick={() =>
                  goTo("review")
                }
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                  currentPage === "review"
                    ? "bg-slate-800 text-white border-l-2 border-teal-500"
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
                    <rect
                      x="5"
                      y="4"
                      width="14"
                      height="16"
                      rx="2"
                    />
                    <path d="M9 4.5h6" />
                    <path d="m9 12 2 2 4-4" />
                    <path d="M9 8h6" />
                  </svg>

                </span>

                <span>
                  Content Review
                </span>


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
              onClick={() =>
                goTo("manage")
              }
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                currentPage === "manage"
                  ? "bg-slate-800 text-white border-l-2 border-teal-500"
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
                  ? "bg-slate-800 text-white border-l-2 border-teal-500"
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

              <div className="pt-5 pb-2 px-3 text-[10px] uppercase tracking-wider text-slate-600 font-semibold">
                Administration
              </div>


              <button
                onClick={() =>
                  goTo("users")
                }
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                  currentPage === "users"
                    ? "bg-slate-800 text-white border-l-2 border-teal-500"
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
                    ? "bg-slate-800 text-white border-l-2 border-teal-500"
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
                  goTo("audit")
                }
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                  currentPage === "audit"
                    ? "bg-slate-800 text-white border-l-2 border-teal-500"
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

      </aside>



      <div className="md:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between">

        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() =>
            goTo("home")
          }
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
                    ? "bg-slate-100 text-teal-700"
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

                        <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">

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

                              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">

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
                          goTo("review")
                        }
                        className="w-full text-center text-xs font-semibold text-teal-700 hover:text-teal-800"
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
                setDarkMode(prev => !prev)
              }
              className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition"
              title={
                darkMode
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              aria-label={
                darkMode
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >

              {darkMode ? "☀" : "☾"}

            </button>



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


              <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-semibold">

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
            (isSME || isAdmin) && (

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


          {currentPage === "audit" &&
            isAdmin && (
              <AdminAuditLog />
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
