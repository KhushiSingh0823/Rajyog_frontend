import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Modal from './Modal'
import {
  loginUser,
  registerUser,
  logout,
  selectIsLoading,
  selectError,
  selectSuccess,
  selectIsAuthenticated,
  selectUser,
  clearError,
  clearSuccess,
} from '../store/authSlice'

const Layout = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const isLoading = useSelector(selectIsLoading)
  const error = useSelector(selectError)
  const success = useSelector(selectSuccess)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectUser)

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false)
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState('')
  const [signInPassword, setSignInPassword] = useState('')

  // Sign Up Form State
  const [signUpName, setSignUpName] = useState('')
  const [signUpEmail, setSignUpEmail] = useState('')
  const [signUpPassword, setSignUpPassword] = useState('')

  // Check for navigation state to open sign-in modal
  useEffect(() => {
    if (location.state?.openSignIn) {
      setIsSignInModalOpen(true)
      // Clear the state to prevent modal reopening on refresh
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location, navigate])

  // Clear errors when modals are opened
  useEffect(() => {
    if (isSignInModalOpen || isSignUpModalOpen) {
      dispatch(clearError())
      dispatch(clearSuccess())
    }
  }, [isSignInModalOpen, isSignUpModalOpen, dispatch])

  // Handle successful authentication
  useEffect(() => {
    if (isAuthenticated && success) {
      // Close modals
      setIsSignInModalOpen(false)
      setIsSignUpModalOpen(false)

      // Clear form fields
      setSignInEmail('')
      setSignInPassword('')
      setSignUpName('')
      setSignUpEmail('')
      setSignUpPassword('')

      // Optional: Navigate to home or dashboard
      // navigate('/home')
    }
  }, [isAuthenticated, success, navigate])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const openSignInModal = () => {
    setIsSignInModalOpen(true)
    setIsSignUpModalOpen(false)
  }

  const closeSignInModal = () => {
    setIsSignInModalOpen(false)
    setSignInEmail('')
    setSignInPassword('')
    dispatch(clearError())
    dispatch(clearSuccess())
  }

  const openSignUpModal = () => {
    setIsSignUpModalOpen(true)
    setIsSignInModalOpen(false)
  }

  const closeSignUpModal = () => {
    setIsSignUpModalOpen(false)
    setSignUpName('')
    setSignUpEmail('')
    setSignUpPassword('')
    dispatch(clearError())
    dispatch(clearSuccess())
  }

  const handleSignInSubmit = async (e) => {
    e.preventDefault()

    const result = await dispatch(loginUser({
      email: signInEmail,
      password: signInPassword,
    }))

    if (loginUser.fulfilled.match(result)) {
      console.log('Login successful:', result.payload)
      // Modal will close automatically via useEffect
    }
  }

  const handleSignUpSubmit = async (e) => {
    e.preventDefault()

    const result = await dispatch(registerUser({
      name: signUpName,
      email: signUpEmail,
      password: signUpPassword,
    }))

    if (registerUser.fulfilled.match(result)) {
      console.log('Registration successful:', result.payload)
      // Modal will close automatically via useEffect
    }
  }

  const handleGoogleSignIn = () => {
    // Handle Google sign in logic here
    console.log('Google sign in clicked')
    // Implement Google OAuth flow
  }

  const handleLogout = () => {
    dispatch(logout())
    setIsUserMenuOpen(false)
    navigate('/home')
  }

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen)
  }

  const serviceCategories = [
    {
      title: "Yoga Services",
      services: [
        "Hatha Yoga",
        "Vinyasa Flow",
        "Yin Yoga",
        "Power Yoga",
        "Restorative Yoga"
      ]
    },
    {
      title: "Meditation & Spirituality",
      services: [
        "Guided Meditation",
        "Mindfulness Training",
        "Spiritual Counseling",
        "Chakra Healing",
        "Breathing Techniques"
      ]
    },
    {
      title: "Wellness Programs",
      services: [
        "Health Consultation",
        "Personal Training",
        "Nutrition Guidance",
        "Lifestyle Coaching",
        "Stress Management"
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-accent">
      {/* Navbar */}
      <nav className="bg-accent shadow-md border-b border-gray-200 relative">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">

            {/* Logo Section */}
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <img
                  src="/Logo.png"
                  alt="RajYog Logo"
                  className="h-16 w-auto"
                />
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold text-gray-900">
                  RajYog's
                </h1>
                <p className="text-sm text-gray-600 font-medium">
                  Consult Online Astrologer anytime
                </p>
              </div>
            </div>

            {/* Action Buttons - Chat and Call */}
            <div className="hidden lg:flex items-center space-x-3">
              <button
                onClick={() => navigate('/chat-with-astrologer')}
                className="flex items-center space-x-2 px-6 py-3 rounded-lg font-bold text-gray-900 hover:opacity-90 transition-opacity duration-200 shadow-sm"
                style={{ backgroundColor: 'rgb(249, 232, 133)' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>Chat with Astrologer</span>
              </button>

              <button
                onClick={() => navigate('/call-with-astrologer')}
                className="flex items-center space-x-2 px-6 py-3 rounded-lg font-bold text-gray-900 hover:opacity-90 transition-opacity duration-200 shadow-sm"
                style={{ backgroundColor: 'rgb(249, 232, 133)' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>Call with Astrologer</span>
              </button>
            </div>

            {/* Sign In and Menu Icons */}
            <div className="flex items-center space-x-4">
              {/* User Menu or Sign In Button */}
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-2 p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200"
                    aria-label="User menu"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 flex items-center justify-center text-white font-semibold text-sm">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium hidden sm:inline">{user.name}</span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                        <div className="py-1">
                          {/* User Info */}
                          <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            {user.role && (
                              <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                                {user.role}
                              </span>
                            )}
                          </div>

                          {/* Menu Items */}
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false)
                              navigate('/profile')
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>My Profile</span>
                          </button>

                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false)
                              navigate('/orders')
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            <span>My Orders</span>
                          </button>

                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false)
                              navigate('/settings')
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>Settings</span>
                          </button>

                          <div className="border-t border-gray-100 my-1" />

                          {/* Logout Button */}
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  onClick={openSignInModal}
                  className="flex items-center space-x-2 p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200"
                  aria-label="Sign In"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm font-medium">Sign In</span>
                </button>
              )}

              {/* Menu Icon */}
              <button
                onClick={toggleMenu}
                className="p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200"
                aria-label="Toggle menu"
              >
                <svg
                  className={`h-6 w-6 transform transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Dropdown Menu - Full Width with rgb(207,54,68) background */}
        <div
          className={`absolute top-full left-0 w-full shadow-lg transform transition-all duration-300 ease-in-out z-50 ${
            isMenuOpen
              ? 'opacity-100 translate-y-0 visible'
              : 'opacity-0 -translate-y-2 invisible'
          }`}
          style={{ backgroundColor: 'rgb(207, 54, 68)' }}
        >
          <div className="px-4 py-8">
            <div className="max-w-7xl mx-auto">
              {/* Main Header - Left Aligned */}
              <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-white mb-3">Our Services</h2>
                <div className="w-24 h-1 bg-white rounded"></div>
              </div>

              {/* Service Categories - Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {serviceCategories.map((category, categoryIndex) => (
                  <div key={categoryIndex} className="space-y-6">
                    {/* Category Header - Bold and Prominent */}
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-white mb-3">
                        {category.title}
                      </h3>
                      <div className="w-16 h-1 bg-white rounded"></div>
                    </div>

                    {/* Services Submenu - Column Layout */}
                    <div className="space-y-3">
                      {category.services.map((service, serviceIndex) => (
                        <div
                          key={serviceIndex}
                          className="p-4 rounded-lg hover:bg-white/15 transition-all duration-200 cursor-pointer group border-l-4 border-transparent hover:border-white"
                        >
                          <div className="text-white font-bold group-hover:text-gray-100 transition-colors duration-200 text-lg">
                            {service}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer CTA - Left Aligned */}
              <div className="mt-8 pt-6">
                <p className="text-white/80 text-sm mb-3">
                  Ready to begin your wellness journey?
                </p>
                <button className="bg-white text-red-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200">
                  Book Consultation
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Overlay to close menu when clicking outside */}
        {isMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-20 z-40"
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </nav>

      {/* Main Content Area */}
      <main className="bg-accent min-h-[calc(100vh-6rem)]">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

            {/* Logo and Description */}
            <div className="col-span-1 md:col-span-2">
              <div className="mb-4">
                <img
                  src="/Logo.png"
                  alt="RajYog Logo"
                  className="h-12 w-auto"
                />
              </div>
              <p className="text-gray-300 mb-6 max-w-md">
                Transform your life through the ancient wisdom of yoga and meditation.
                Find inner peace, strength, and balance with our comprehensive wellness programs.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-primary transition-colors duration-200">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors duration-200">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors duration-200">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.112.222.085.343-.09.377-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.748-1.378 0 0-.599 2.282-.744 2.84-.282 1.084-1.064 2.456-1.549 3.235C9.584 23.815 10.77 24 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors duration-200">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="/home" className="text-gray-300 hover:text-primary transition-colors duration-200">Home</a></li>
                <li><a href="/about" className="text-gray-300 hover:text-primary transition-colors duration-200">About Us</a></li>
                <li><a href="/services" className="text-gray-300 hover:text-primary transition-colors duration-200">Services</a></li>
                <li><a href="/classes" className="text-gray-300 hover:text-primary transition-colors duration-200">Classes</a></li>
                <li><a href="/contact" className="text-gray-300 hover:text-primary transition-colors duration-200">Contact</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-primary mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="text-gray-300 text-sm">123 Wellness Street</p>
                    <p className="text-gray-300 text-sm">Peace City, PC 12345</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <p className="text-gray-300 text-sm">+1 (555) 123-4567</p>
                </div>
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-300 text-sm">info@rajyog.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Border */}
          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2024 RajYog. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="/privacy" className="text-gray-400 hover:text-primary text-sm transition-colors duration-200">Privacy Policy</a>
                <a href="/terms" className="text-gray-400 hover:text-primary text-sm transition-colors duration-200">Terms of Service</a>
                <a href="/cookies" className="text-gray-400 hover:text-primary text-sm transition-colors duration-200">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Sign In Modal */}
      <Modal
        isOpen={isSignInModalOpen}
        onClose={closeSignInModal}
        title="Welcome Back"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSignInSubmit} className="space-y-6">
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
            <label htmlFor="signin-email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="signin-email"
              value={signInEmail}
              onChange={(e) => setSignInEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter your email"
              required
              disabled={isLoading}
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="signin-password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="signin-password"
              value={signInPassword}
              onChange={(e) => setSignInPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter your password"
              required
              disabled={isLoading}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-6 rounded-lg font-semibold text-gray-900 hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'rgb(249, 232, 133)' }}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-3 py-3 px-6 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-base font-medium text-gray-700">Sign in with Google</span>
          </button>

          {/* Sign Up Link */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={openSignUpModal}
                className="font-semibold text-gray-900 hover:text-gray-700 transition-colors duration-200"
                style={{ color: 'rgb(207, 54, 68)' }}
              >
                Sign Up
              </button>
            </p>
          </div>
        </form>
      </Modal>

      {/* Sign Up Modal */}
      <Modal
        isOpen={isSignUpModalOpen}
        onClose={closeSignUpModal}
        title="Create Account"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSignUpSubmit} className="space-y-6">
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

          {/* Name Field */}
          <div>
            <label htmlFor="signup-name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="signup-name"
              value={signUpName}
              onChange={(e) => setSignUpName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter your full name"
              required
              disabled={isLoading}
            />
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="signup-email"
              value={signUpEmail}
              onChange={(e) => setSignUpEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter your email"
              required
              disabled={isLoading}
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="signup-password"
              value={signUpPassword}
              onChange={(e) => setSignUpPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Create a password"
              required
              minLength={6}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-6 rounded-lg font-semibold text-gray-900 hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'rgb(249, 232, 133)' }}
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Google Sign Up */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-3 py-3 px-6 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-base font-medium text-gray-700">Sign up with Google</span>
          </button>

          {/* Sign In Link */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={openSignInModal}
                className="font-semibold text-gray-900 hover:text-gray-700 transition-colors duration-200"
                style={{ color: 'rgb(207, 54, 68)' }}
              >
                Sign In
              </button>
            </p>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Layout