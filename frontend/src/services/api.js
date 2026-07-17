import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const login = (email, password) =>
  api.post('/auth/login', { email, password })

export const getArticles   = ()     => api.get('/articles')
export const getAllArticlesAdmin = () => api.get('/articles/admin/all')
export const getArticleAdmin = (slug) => api.get(`/articles/admin/${slug}`)
export const getArticle    = (slug) => api.get(`/articles/${slug}`)
export const searchArticles = (q)   => api.get(`/articles/search?q=${q}`)

export const getCategories = () => api.get('/categories')

export const sendMessage = (message) =>
  api.post('/chat', { message })

export const createArticle = (data) => api.post('/articles', data)
export const updateArticle = (slug, data) => api.put(`/articles/${slug}`, data)
export const deleteArticle = (slug) => api.delete(`/articles/${slug}`)
export default api