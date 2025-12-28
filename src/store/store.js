import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import adminAuthReducer from './adminAuthSlice'
import astrologerAuthReducer from './astrologerAuthSlice'
import blogReducer from './blogSlice'
import bannerReducer from './bannerSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    adminAuth: adminAuthReducer,
    astrologerAuth: astrologerAuthReducer,
    blog: blogReducer,
    banner: bannerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serialization checks
        ignoredActions: ['auth/loginSuccess', 'auth/updateUserProfile'],
      },
    }),
})

export default store
