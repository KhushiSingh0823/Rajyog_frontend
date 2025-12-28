import { createSlice } from '@reduxjs/toolkit'
import {
  astrologerLogin,
  astrologerLogout,
  fetchAstrologerProfile,
  changeAstrologerPassword,
  verifyAstrologerToken,
  toggleAstrologerAvailability,
} from './api/astrologerAuthApi'

/**
 * Astrologer Object Structure (stored in state and localStorage):
 * {
 *   _id: string,
 *   name: string,
 *   email: string,
 *   role: string (e.g., "astrologer"),
 *   token: string (JWT token for API authentication),
 *   createdAt: string (ISO date)
 * }
 */

// Load initial state from localStorage if available
const loadAstrologerFromStorage = () => {
  try {
    const serializedAstrologer = localStorage.getItem('astrologer')
    if (serializedAstrologer === null) {
      return null
    }
    return JSON.parse(serializedAstrologer)
  } catch (err) {
    return null
  }
}

const initialState = {
  astrologer: loadAstrologerFromStorage(),
  isAuthenticated: !!loadAstrologerFromStorage(),
  isLoading: false,
  error: null,
  success: null,
}

const astrologerAuthSlice = createSlice({
  name: 'astrologerAuth',
  initialState,
  reducers: {
    // Manual logout (without API call)
    astrologerLogoutLocal: (state) => {
      state.astrologer = null
      state.isAuthenticated = false
      state.isLoading = false
      state.error = null
      state.success = null
      // Clear from localStorage
      try {
        localStorage.removeItem('astrologer')
      } catch (err) {
        console.error('Failed to remove astrologer from localStorage:', err)
      }
    },

    // Clear error
    clearAstrologerError: (state) => {
      state.error = null
    },

    // Clear success message
    clearAstrologerSuccess: (state) => {
      state.success = null
    },

    // Set astrologer manually (for initial auth check)
    setAstrologer: (state, action) => {
      state.astrologer = action.payload
      state.isAuthenticated = !!action.payload
    },
  },
  extraReducers: (builder) => {
    // Astrologer Login
    builder
      .addCase(astrologerLogin.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.success = null
      })
      .addCase(astrologerLogin.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true

        // Combine astrologer data with token (API returns data in 'user' field)
        const astrologerData = {
          ...action.payload.user,
          token: action.payload.token
        }

        state.astrologer = astrologerData
        state.error = null
        state.success = action.payload.message || 'Astrologer login successful!'

        // Persist to localStorage with token
        try {
          localStorage.setItem('astrologer', JSON.stringify(astrologerData))
        } catch (err) {
          console.error('Failed to save astrologer to localStorage:', err)
        }
      })
      .addCase(astrologerLogin.rejected, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.astrologer = null
        state.error = action.payload || 'Astrologer login failed'
      })

    // Astrologer Logout
    builder
      .addCase(astrologerLogout.fulfilled, (state) => {
        state.astrologer = null
        state.isAuthenticated = false
        state.isLoading = false
        state.error = null
        state.success = null
        // Clear from localStorage
        try {
          localStorage.removeItem('astrologer')
        } catch (err) {
          console.error('Failed to remove astrologer from localStorage:', err)
        }
      })

    // Fetch Astrologer Profile
    builder
      .addCase(fetchAstrologerProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchAstrologerProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.astrologer = { ...state.astrologer, ...action.payload }
        // Update localStorage
        try {
          localStorage.setItem('astrologer', JSON.stringify(state.astrologer))
        } catch (err) {
          console.error('Failed to update astrologer in localStorage:', err)
        }
      })
      .addCase(fetchAstrologerProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || 'Failed to fetch astrologer profile'
      })

    // Change Astrologer Password
    builder
      .addCase(changeAstrologerPassword.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.success = null
      })
      .addCase(changeAstrologerPassword.fulfilled, (state) => {
        state.isLoading = false
        state.success = 'Password changed successfully!'
      })
      .addCase(changeAstrologerPassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || 'Failed to change password'
      })

    // Verify Astrologer Token
    builder
      .addCase(verifyAstrologerToken.fulfilled, (state, action) => {
        state.isAuthenticated = true
        state.astrologer = action.payload.astrologer || state.astrologer
      })
      .addCase(verifyAstrologerToken.rejected, (state) => {
        state.isAuthenticated = false
        state.astrologer = null
        // Clear from localStorage
        try {
          localStorage.removeItem('astrologer')
        } catch (err) {
          console.error('Failed to remove astrologer from localStorage:', err)
        }
      })

    // Toggle Astrologer Availability
    builder
      .addCase(toggleAstrologerAvailability.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(toggleAstrologerAvailability.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload.data && action.payload.data.isAvailable !== undefined) {
          // Update astrologer availability in state
          if (state.astrologer) {
            state.astrologer.isAvailable = action.payload.data.isAvailable
          }
          // Update localStorage
          try {
            const astrologer = JSON.parse(localStorage.getItem('astrologer') || '{}')
            astrologer.isAvailable = action.payload.data.isAvailable
            localStorage.setItem('astrologer', JSON.stringify(astrologer))
          } catch (err) {
            console.error('Failed to update localStorage:', err)
          }
        }
        state.success = action.payload.message || 'Availability updated successfully'
      })
      .addCase(toggleAstrologerAvailability.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || 'Failed to toggle availability'
      })
  },
})

// Export actions
export const { astrologerLogoutLocal, clearAstrologerError, clearAstrologerSuccess, setAstrologer } = astrologerAuthSlice.actions

// Selectors
export const selectAstrologerAuth = (state) => state.astrologerAuth
export const selectAstrologer = (state) => state.astrologerAuth.astrologer
export const selectIsAstrologerAuthenticated = (state) => state.astrologerAuth.isAuthenticated
export const selectAstrologerIsLoading = (state) => state.astrologerAuth.isLoading
export const selectAstrologerError = (state) => state.astrologerAuth.error
export const selectAstrologerSuccess = (state) => state.astrologerAuth.success
export const selectAstrologerToken = (state) => state.astrologerAuth.astrologer?.token

// Export reducer
export default astrologerAuthSlice.reducer

// Re-export async thunks for convenience
export {
  astrologerLogin,
  astrologerLogout,
  fetchAstrologerProfile,
  changeAstrologerPassword,
  verifyAstrologerToken,
  toggleAstrologerAvailability,
}
