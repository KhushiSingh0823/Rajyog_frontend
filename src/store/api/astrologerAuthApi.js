import { createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from './apiConfig'

/**
 * Astrologer Login
 */
export const astrologerLogin = createAsyncThunk(
  'astrologerAuth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/astrologer/login', { email, password })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed')
    }
  }
)

/**
 * Astrologer Logout
 */
export const astrologerLogout = createAsyncThunk(
  'astrologerAuth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/astrologer/logout')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Logout failed')
    }
  }
)

/**
 * Fetch Astrologer Profile
 */
export const fetchAstrologerProfile = createAsyncThunk(
  'astrologerAuth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/astrologer/profile')
      return response.data.user || response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile')
    }
  }
)

/**
 * Change Astrologer Password
 */
export const changeAstrologerPassword = createAsyncThunk(
  'astrologerAuth/changePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put('/astrologer/change-password', {
        currentPassword,
        newPassword,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to change password')
    }
  }
)

/**
 * Verify Astrologer Token
 */
export const verifyAstrologerToken = createAsyncThunk(
  'astrologerAuth/verifyToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/astrologer/verify-token')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Token verification failed')
    }
  }
)

/**
 * Toggle Astrologer Availability
 */
export const toggleAstrologerAvailability = createAsyncThunk(
  'astrologerAuth/toggleAvailability',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.put('/astrologer/toggle-availability')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle availability')
    }
  }
)
