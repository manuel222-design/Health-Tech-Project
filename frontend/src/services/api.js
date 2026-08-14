import axios from 'axios'

const API_BASE = "http://127.0.0.1:8000/api/v1"

const api = axios.create({
  baseURL: `${API_BASE}`,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE}/auth/refresh`, { refresh_token: refreshToken })
          localStorage.setItem('token', res.data.access_token)
          originalRequest.headers.Authorization = `Bearer ${res.data.access_token}`
          return api(originalRequest)
        } catch (refreshError) {
          localStorage.clear()
          window.location.reload()
        }
      }
    }
    return Promise.reject(error)
  }
)

export const login = (email, password) =>
  api.post('/auth/login', { email, password })

export const register = (username, email, password, department) =>
  api.post('/auth/register', {
    username,
    email,
    password,
    department
  })

export const submitSMEReview = (slug, decision, comments) =>
  api.post(`/articles/${slug}/sme-review`, {
    decision,
    comments
  })

export const getPendingSMEArticles = () =>
  api.get('/articles/sme/pending')

export const getSMEReviews = (slug) =>
  api.get(`/articles/${slug}/sme-reviews`)

export const approveArticle = (slug) => api.post(`/articles/${slug}/approve`)
export const getArticles = (filters = {}) => {
  const params = new URLSearchParams(filters)
  return api.get(`/articles?${params.toString()}`)
}
export const getAllArticlesAdmin = () => api.get('/articles/admin/all')
export const getArticleAdmin = (slug) => api.get(`/articles/admin/${slug}`)
export const getArticle    = (slug) => api.get(`/articles/${slug}`)
export const searchArticles = (q, filters = {}) => {
  const params = new URLSearchParams({ q, ...filters })
  return api.get(`/articles/search?${params.toString()}`)
}
export const getHomepage = () => api.get('/homepage')
export const getCategories = () => api.get('/categories')
export const getProducts = () => api.get('/products')
export const getProductDetails = (slug) =>
api.get(`/products/${slug}`)

export const createProduct = (data) =>
  api.post('/products', data)

export const createCategory = (name, description) =>
  api.post('/categories', { name, description })
export const getTags = () => api.get('/tags')
export const createTag = (name) => api.post('/tags', { name })

export const sendMessage = (message, sessionToken) =>
  api.post('/chat', { message, session_token: sessionToken })

export const createArticle = (data) => api.post('/articles', data)
export const updateArticle = (slug, data) => api.put(`/articles/${slug}`, data)
export const deleteArticle = (slug) => api.delete(`/articles/${slug}`)
export const uploadMedia = (file, articleId) => {
  const formData = new FormData()
  formData.append('file', file)
  if (articleId) formData.append('article_id', articleId)
  return api.post('/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
export default api

export const submitFeedback = (slug, rating, comment) =>
  api.post(`/articles/${slug}/feedback`, { rating, comment })
export const getFeedbackSummary = (slug) => api.get(`/articles/${slug}/feedback/summary`)

export const submitChatFeedback = (messageId, helpful) =>
  api.post(`/chat/${messageId}/feedback`, { helpful })

export const listUsers = () => api.get('/admin/users')
export const updateUserRole = (userId, role) => api.put(`/admin/users/${userId}/role`, { role })
export const toggleUserActive = (userId) => api.put(`/admin/users/${userId}/toggle-active`)

export const getAnalytics = () => api.get('/admin/analytics')

export const getAuditLogs = () => api.get('/admin/audit-logs')

export const rejectArticle = (slug, reason) => api.post(`/articles/${slug}/reject`, { reason })

export const revertArticle = (slug) => api.post(`/articles/${slug}/revert`)

export const getMyNotifications = () => api.get('/my-notifications')

export const getUnansweredQuestions = () => api.get('/admin/unanswered-questions')

export const getContentNotifications = () =>
  api.get('/content-notifications')
