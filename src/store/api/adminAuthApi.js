import { createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from './apiConfig'

/**
 * Admin Login API
 *
 * Request body:
 * {
 *   email: string,
 *   password: string
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   token: string,
 *   admin: {
 *     _id: string,
 *     name: string,
 *     email: string,
 *     role: string
 *   }
 * }
 */
export const adminLogin = createAsyncThunk(
  'adminAuth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/auth/login', credentials)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Admin login failed'
      )
    }
  }
)

/**
 * Admin Logout API
 */
export const adminLogout = createAsyncThunk(
  'adminAuth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/admin/logout')
      return response.data
    } catch (error) {
      // Even if logout fails on server, we'll clear local state
      return rejectWithValue(
        error.response?.data?.message || 'Admin logout failed'
      )
    }
  }
)

/**
 * Verify Admin Token
 */
export const verifyAdminToken = createAsyncThunk(
  'adminAuth/verifyToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/admin/verify')
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Token verification failed'
      )
    }
  }
)

/**
 * Fetch Admin Profile
 */
export const fetchAdminProfile = createAsyncThunk(
  'adminAuth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/admin/profile')
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch admin profile'
      )
    }
  }
)

/**
 * Change Admin Password
 */
export const changeAdminPassword = createAsyncThunk(
  'adminAuth/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await apiClient.put('/admin/change-password', passwordData)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to change password'
      )
    }
  }
)
