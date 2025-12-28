import { createSlice } from '@reduxjs/toolkit'
import {
  adminLogin,
  adminLogout,
  fetchAdminProfile,
  changeAdminPassword,
  verifyAdminToken,
} from './api/adminAuthApi'

/**
 * Admin Object Structure (stored in state and localStorage):
 * {
 *   _id: string,
 *   name: string,
 *   email: string,
 *   role: string (e.g., "admin", "superadmin"),
 *   token: string (JWT token for API authentication),
 *   createdAt: string (ISO date)
 * }
 */

// Load initial state from localStorage if available
const loadAdminFromStorage = () => {
  try {
    const serializedAdmin = localStorage.getItem('admin')
    if (serializedAdmin === null) {
      return null
    }
    return JSON.parse(serializedAdmin)
  } catch (err) {
    return null
  }
}

const initialState = {
  admin: loadAdminFromStorage(),
  isAuthenticated: !!loadAdminFromStorage(),
  isLoading: false,
  error: null,
  success: null,
}

const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState,
  reducers: {
    // Manual logout (without API call)
    adminLogoutLocal: (state) => {
      state.admin = null
      state.isAuthenticated = false
      state.isLoading = false
      state.error = null
      state.success = null
      // Clear from localStorage
      try {
        localStorage.removeItem('admin')
      } catch (err) {
        console.error('Failed to remove admin from localStorage:', err)
      }
    },

    // Clear error
    clearAdminError: (state) => {
      state.error = null
    },

    // Clear success message
    clearAdminSuccess: (state) => {
      state.success = null
    },

    // Set admin manually (for initial auth check)
    setAdmin: (state, action) => {
      state.admin = action.payload
      state.isAuthenticated = !!action.payload
    },
  },
  extraReducers: (builder) => {
    // Admin Login
    builder
      .addCase(adminLogin.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.success = null
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true

        // Combine admin data with token (API returns data in 'user' field)
        const adminData = {
          ...action.payload.user,
          token: action.payload.token
        }

        state.admin = adminData
        state.error = null
        state.success = action.payload.message || 'Admin login successful!'

        // Persist to localStorage with token
        try {
          localStorage.setItem('admin', JSON.stringify(adminData))
        } catch (err) {
          console.error('Failed to save admin to localStorage:', err)
        }
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.admin = null
        state.error = action.payload || 'Admin login failed'
      })

    // Admin Logout
    builder
      .addCase(adminLogout.fulfilled, (state) => {
        state.admin = null
        state.isAuthenticated = false
        state.isLoading = false
        state.error = null
        state.success = null
        // Clear from localStorage
        try {
          localStorage.removeItem('admin')
        } catch (err) {
          console.error('Failed to remove admin from localStorage:', err)
        }
      })

    // Fetch Admin Profile
    builder
      .addCase(fetchAdminProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchAdminProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.admin = { ...state.admin, ...action.payload }
        // Update localStorage
        try {
          localStorage.setItem('admin', JSON.stringify(state.admin))
        } catch (err) {
          console.error('Failed to update admin in localStorage:', err)
        }
      })
      .addCase(fetchAdminProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || 'Failed to fetch admin profile'
      })

    // Change Admin Password
    builder
      .addCase(changeAdminPassword.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.success = null
      })
      .addCase(changeAdminPassword.fulfilled, (state) => {
        state.isLoading = false
        state.success = 'Password changed successfully!'
      })
      .addCase(changeAdminPassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || 'Failed to change password'
      })

    // Verify Admin Token
    builder
      .addCase(verifyAdminToken.fulfilled, (state, action) => {
        state.isAuthenticated = true
        state.admin = action.payload.admin || state.admin
      })
      .addCase(verifyAdminToken.rejected, (state) => {
        state.isAuthenticated = false
        state.admin = null
        // Clear from localStorage
        try {
          localStorage.removeItem('admin')
        } catch (err) {
          console.error('Failed to remove admin from localStorage:', err)
        }
      })
  },
})

// Export actions
export const { adminLogoutLocal, clearAdminError, clearAdminSuccess, setAdmin } = adminAuthSlice.actions

// Selectors
export const selectAdminAuth = (state) => state.adminAuth
export const selectAdmin = (state) => state.adminAuth.admin
export const selectIsAdminAuthenticated = (state) => state.adminAuth.isAuthenticated
export const selectAdminIsLoading = (state) => state.adminAuth.isLoading
export const selectAdminError = (state) => state.adminAuth.error
export const selectAdminSuccess = (state) => state.adminAuth.success
export const selectAdminToken = (state) => state.adminAuth.admin?.token

// Export reducer
export default adminAuthSlice.reducer

// Re-export async thunks for convenience
export {
  adminLogin,
  adminLogout,
  fetchAdminProfile,
  changeAdminPassword,
  verifyAdminToken,
}
