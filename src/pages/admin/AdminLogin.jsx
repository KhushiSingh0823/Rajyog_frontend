import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  adminLogin,
  selectAdminIsLoading,
  selectAdminError,
  selectAdminSuccess,
  selectIsAdminAuthenticated,
  clearAdminError,
  clearAdminSuccess,
} from '../../store/adminAuthSlice'

const AdminLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const isLoading = useSelector(selectAdminIsLoading)
  const error = useSelector(selectAdminError)
  const success = useSelector(selectAdminSuccess)
  const isAuthenticated = useSelector(selectIsAdminAuthenticated)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard')
    }
  }, [isAuthenticated, navigate])

  // Clear errors on mount
  useEffect(() => {
    dispatch(clearAdminError())
    dispatch(clearAdminSuccess())
  }, [dispatch])

  // Handle successful login
  useEffect(() => {
    if (success && isAuthenticated) {
      navigate('/admin/dashboard')
    }
  }, [success, isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()

    const result = await dispatch(adminLogin({
      email,
      password,
    }))

    if (adminLogin.fulfilled.match(result)) {
      console.log('Admin login successful:', result.payload)
      // Navigation handled by useEffect
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div
          className="w-full h-full flex items-center justify-center relative"
          style={{
            backgroundColor: 'rgb(22, 78, 98)',
            clipPath: 'ellipse(95% 100% at 0% 50%)'
          }}
        >
          <div className="text-center">
            <div className="text-9xl mb-8">🧘‍♀️</div>
            <h2 className="text-4xl font-bold text-white mb-4">RajYog Admin</h2>
            <p className="text-xl text-gray-100 max-w-md">
              Manage your yoga and wellness platform with ease
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Login</h1>
            <p className="text-gray-600">Sign in to your admin account</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                <p className="text-sm">{success}</p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  // TODO: Implement forgot password functionality
                }}
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg font-semibold text-gray-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'rgb(249, 232, 133)' }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Back to Main Site */}
          <div className="text-center">
            <button
              onClick={() => navigate('/home')}
              className="text-sm text-gray-600 hover:text-primary transition-colors duration-200"
            >
              ← Back to main site
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin