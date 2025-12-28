import { createSlice } from '@reduxjs/toolkit'
import {
  loginUser,
  registerUser,
  logoutUser,
  fetchUserProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyToken,
} from './api/authApi'

/**
 * User Object Structure (stored in state and localStorage):
 * {
 *   _id: string,
 *   name: string,
 *   email: string,
 *   role: string (e.g., "admin", "user"),
 *   token: string (JWT token for API authentication),
 *   createdAt: string (ISO date)
 * }
 */

// Load initial state from localStorage if available
const loadUserFromStorage = () => {
  try {
    const serializedUser = localStorage.getItem('user')
    if (serializedUser === null) {
      return null
    }
    return JSON.parse(serializedUser)
  } catch (err) {
    return null
  }
}

const initialState = {
  user: loadUserFromStorage(),
  isAuthenticated: !!loadUserFromStorage(),
  isLoading: false,
  error: null,
  success: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Manual logout (without API call)
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.isLoading = false
      state.error = null
      state.success = null
      // Clear from localStorage
      try {
        localStorage.removeItem('user')
      } catch (err) {
        console.error('Failed to remove user from localStorage:', err)
      }
    },

    // Clear error
    clearError: (state) => {
      state.error = null
    },

    // Clear success message
    clearSuccess: (state) => {
      state.success = null
    },

    // Set user manually (for initial auth check)
    setUser: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = !!action.payload
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.success = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true

        // Combine user data with token
        const userData = {
          ...action.payload.user,
          token: action.payload.token
        }

        state.user = userData
        state.error = null
        state.success = action.payload.message || 'Login successful!'

        // Persist to localStorage with token
        try {
          localStorage.setItem('user', JSON.stringify(userData))
        } catch (err) {
          console.error('Failed to save user to localStorage:', err)
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
        state.error = action.payload || 'Login failed'
      })

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.success = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true

        // Combine user data with token
        const userData = {
          ...action.payload.user,
          token: action.payload.token
        }

        state.user = userData
        state.error = null
        state.success = action.payload.message || 'Registration successful!'

        // Persist to localStorage with token
        try {
          localStorage.setItem('user', JSON.stringify(userData))
        } catch (err) {
          console.error('Failed to save user to localStorage:', err)
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || 'Registration failed'
      })

    // Logout
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.isAuthenticated = false
        state.isLoading = false
        state.error = null
        state.success = null
        // Clear from localStorage
        try {
          localStorage.removeItem('user')
        } catch (err) {
          console.error('Failed to remove user from localStorage:', err)
        }
      })

    // Fetch Profile
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = { ...state.user, ...action.payload }
        // Update localStorage
        try {
          localStorage.setItem('user', JSON.stringify(state.user))
        } catch (err) {
          console.error('Failed to update user in localStorage:', err)
        }
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || 'Failed to fetch profile'
      })

    // Update Profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.success = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = { ...state.user, ...action.payload.user || action.payload }
        state.success = 'Profile updated successfully!'
        // Update localStorage
        try {
          localStorage.setItem('user', JSON.stringify(state.user))
        } catch (err) {
          console.error('Failed to update user in localStorage:', err)
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || 'Failed to update profile'
      })

    // Change Password
    builder
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.success = null
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false
        state.success = 'Password changed successfully!'
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || 'Failed to change password'
      })

    // Forgot Password
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.success = null
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false
        state.success = 'Password reset link sent to your email!'
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || 'Failed to send reset link'
      })

    // Reset Password
    builder
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.success = null
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false
        state.success = 'Password reset successful!'
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || 'Failed to reset password'
      })

    // Verify Token
    builder
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.isAuthenticated = true
        state.user = action.payload.user || state.user
      })
      .addCase(verifyToken.rejected, (state) => {
        state.isAuthenticated = false
        state.user = null
        // Clear from localStorage
        try {
          localStorage.removeItem('user')
        } catch (err) {
          console.error('Failed to remove user from localStorage:', err)
        }
      })
  },
})

// Export actions
export const { logout, clearError, clearSuccess, setUser } = authSlice.actions

// Selectors
export const selectAuth = (state) => state.auth
export const selectUser = (state) => state.auth.user
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectIsLoading = (state) => state.auth.isLoading
export const selectError = (state) => state.auth.error
export const selectSuccess = (state) => state.auth.success
export const selectToken = (state) => state.auth.user?.token

// Export reducer
export default authSlice.reducer

// Re-export async thunks for convenience
export {
  loginUser,
  registerUser,
  logoutUser,
  fetchUserProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyToken,
}
