import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const login = (email, password) =>
  api.post('/auth/login', { email, password })

export const register = (username, email, password, role) =>
  api.post('/auth/register', { username, email, password, role })

export const approveArticle = (slug) => api.post(`/articles/${slug}/approve`)
export const getArticles   = ()     => api.get('/articles')
export const getAllArticlesAdmin = () => api.get('/articles/admin/all')
export const getArticleAdmin = (slug) => api.get(`/articles/admin/${slug}`)
export const getArticle    = (slug) => api.get(`/articles/${slug}`)
export const searchArticles = (q, filters = {}) => {
  const params = new URLSearchParams({ q, ...filters })
  return api.get(`/articles/search?${params.toString()}`)
}

export const getCategories = () => api.get('/categories')
export const getTags = () => api.get('/tags')
export const createTag = (name) => api.post('/tags', { name })

export const sendMessage = (message, sessionToken) =>
  api.post('/chat', { message, session_token: sessionToken })

export const createArticle = (data) => api.post('/articles', data)
export const updateArticle = (slug, data) => api.put(`/articles/${slug}`, data)
export const deleteArticle = (slug) => api.delete(`/articles/${slug}`)
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