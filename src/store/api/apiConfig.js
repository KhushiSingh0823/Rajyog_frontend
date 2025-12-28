import axios from 'axios'

// Base API URL - Update this with your actual backend URL
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    // Priority: Check who's logged in (astrologer > admin > user)
    // This ensures the correct token is sent regardless of URL pattern

    try {
      // Check for astrologer first
      const astrologer = localStorage.getItem('astrologer')
      if (astrologer) {
        const astrologerData = JSON.parse(astrologer)
        if (astrologerData.token) {
          config.headers.Authorization = `Bearer ${astrologerData.token}`
          return config
        }
      }

      // Check for admin second
      const admin = localStorage.getItem('admin')
      if (admin) {
        const adminData = JSON.parse(admin)
        if (adminData.token) {
          config.headers.Authorization = `Bearer ${adminData.token}`
          return config
        }
      }

      // Check for user last
      const user = localStorage.getItem('user')
      if (user) {
        const userData = JSON.parse(user)
        if (userData.token) {
          config.headers.Authorization = `Bearer ${userData.token}`
          return config
        }
      }
    } catch (err) {
      console.error('Failed to parse auth data:', err)
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear user data
          // localStorage.removeItem('user')
          // window.location.href = '/admin'
          break
        case 403:
          console.error('Access forbidden')
          break
        case 404:
          console.error('Resource not found')
          break
        case 500:
          console.error('Server error')
          break
        default:
          console.error('API Error:', error.response.data)
      }
    } else if (error.request) {
      // Request made but no response
      console.error('Network error - no response received')
    } else {
      // Error in request setup
      console.error('Request error:', error.message)
    }
    return Promise.reject(error)
  }
)

export default apiClient
export { BASE_URL }
