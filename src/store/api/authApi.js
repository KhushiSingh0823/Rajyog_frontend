import { createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from './apiConfig'

/**
 * Authentication API Async Thunks
 */

// Login async thunk
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/auth/login', credentials)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed. Please try again.')
    }
  }
)

// Register async thunk
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/auth/register', userData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed. Please try again.')
    }
  }
)

// Logout async thunk
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/auth/logout')
      return response.data
    } catch (error) {
      // Logout should succeed even if API call fails
      console.error('Logout API error:', error)
      return { success: true }
    }
  }
)

// Get user profile async thunk
export const fetchUserProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/auth/profile')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user profile.')
    }
  }
)

// Update user profile async thunk
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await apiClient.put('/auth/profile', userData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile.')
    }
  }
)

// Change password async thunk
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await apiClient.put('/auth/change-password', passwordData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to change password.')
    }
  }
)

// Forgot password async thunk
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send reset link.')
    }
  }
)

// Reset password async thunk
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (resetData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/auth/reset-password', resetData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reset password.')
    }
  }
)

// Verify token async thunk
export const verifyToken = createAsyncThunk(
  'auth/verifyToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/auth/verify')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Token verification failed.')
    }
  }
)

// Refresh token async thunk
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (refreshToken, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/auth/refresh-token', { refreshToken })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to refresh token.')
    }
  }
)
