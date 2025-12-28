import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  selectAstrologer,
  selectIsAstrologerAuthenticated,
  astrologerLogoutLocal,
  toggleAstrologerAvailability,
} from '../../store/astrologerAuthSlice'
import { useAstrologerSocket } from '../../hooks/useAstrologerSocket'

const AstrologerLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()

  const astrologer = useSelector(selectAstrologer)
  const isAuthenticated = useSelector(selectIsAstrologerAuthenticated)

  const [isAvailable, setIsAvailable] = useState(() => {
    // Load from localStorage initially
    const saved = localStorage.getItem('astrologerAvailable')
    return saved !== null ? JSON.parse(saved) : true // Default to available
  })

  // Sync isAvailable state with astrologer data when it changes
  useEffect(() => {
    if (astrologer && astrologer.isAvailable !== undefined) {
      setIsAvailable(astrologer.isAvailable)
    }
  }, [astrologer])

  // Initialize Socket.IO connection for astrologer
  const { socket, isConnected, activeUsers } = useAstrologerSocket()

  useEffect(() => {
    console.log('🔮 AstrologerLayout: Socket connection status:', isConnected ? 'CONNECTED ✓' : 'DISCONNECTED ✗')
    console.log('👥 AstrologerLayout: Active users count:', activeUsers?.length || 0)
  }, [isConnected, activeUsers])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/astrologer')
    }
  }, [isAuthenticated, navigate])

  const menuItems = [
    {
      name: 'Dashboard',
      icon: '📊',
      path: '/astrologer/dashboard',
      description: 'Overview and analytics'
    },
    {
      name: 'Users',
      icon: '👥',
      path: '/astrologer/users',
      description: 'Chat with users'
    },
  ]

  const handleLogout = () => {
    // Clear astrologer data and redirect to login
    dispatch(astrologerLogoutLocal())
    navigate('/astrologer')
  }

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen)
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const toggleAvailability = async () => {
    try {
      console.log('🔮 Toggling astrologer availability...')

      // Call API to toggle availability
      const result = await dispatch(toggleAstrologerAvailability()).unwrap()

      if (result && result.data) {
        const newStatus = result.data.isAvailable
        setIsAvailable(newStatus)

        // Save to localStorage
        localStorage.setItem('astrologerAvailable', JSON.stringify(newStatus))

        console.log('✅ Availability toggled successfully:', newStatus ? 'ONLINE' : 'OFFLINE')
        console.log('📡 API Response:', result.message)

        // The backend will automatically broadcast via Socket.IO
        // No need to emit manually
      }
    } catch (error) {
      console.error('❌ Failed to toggle availability:', error)
      // Revert the UI state on error
      alert('Failed to update availability. Please try again.')
    }
  }

  // Listen for availability changes broadcast from backend
  useEffect(() => {
    if (!socket) return

    const handleAvailabilityChange = (data) => {
      console.log('📡 Astrologer availability broadcast received:', data)

      // Update local state if this is our own availability change
      if (data.astrologerId === astrologer?._id) {
        console.log('✅ Our availability changed:', data.isAvailable ? 'ONLINE' : 'OFFLINE')
        setIsAvailable(data.isAvailable)
        localStorage.setItem('astrologerAvailable', JSON.stringify(data.isAvailable))
      } else {
        console.log('📢 Another astrologer changed availability:', data.name, '-', data.isAvailable ? 'ONLINE' : 'OFFLINE')
      }
    }

    socket.on('astrologer:availability', handleAvailabilityChange)

    return () => {
      socket.off('astrologer:availability', handleAvailabilityChange)
    }
  }, [socket, astrologer])

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🔮</div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                <span className="text-purple-600">Raj</span>
                <span className="text-gray-800">Yog</span>
              </h1>
              <p className="text-xs text-gray-600">Astrologer Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-2 pb-20 overflow-y-auto flex-1">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
                location.pathname === item.path
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-xs text-gray-500">{item.description}</div>
              </div>
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
          >
            <span className="text-xl">🚪</span>
            <div>
              <div className="font-medium">Logout</div>
              <div className="text-xs text-gray-500">Sign out</div>
            </div>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'ml-64' : 'ml-0'
      }`}>
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h2 className="text-2xl font-semibold text-gray-900">
                {menuItems.find(item => item.path === location.pathname)?.name || 'Astrologer Panel'}
              </h2>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* Socket Connection Status */}
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-xs text-gray-600">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              {/* Availability Toggle */}
              <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <button
                  onClick={toggleAvailability}
                  className="relative inline-flex items-center h-6 rounded-full w-14 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  style={{ backgroundColor: isAvailable ? '#10b981' : '#6b7280' }}
                  title={isAvailable ? 'Click to go offline' : 'Click to go online'}
                >
                  <span
                    className={`inline-block w-5 h-5 transform transition-transform duration-200 bg-white rounded-full shadow-md ${
                      isAvailable ? 'translate-x-8' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`text-sm font-semibold ${isAvailable ? 'text-green-600' : 'text-gray-600'}`}>
                  {isAvailable ? 'Online' : 'Offline'}
                </span>
              </div>

              {astrologer && (
                <div className="relative">
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-200"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-white">
                        {astrologer.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="text-left hidden sm:block">
                      <div className="text-sm font-medium text-gray-900">{astrologer.name}</div>
                      <div className="text-xs text-gray-500">{astrologer.email}</div>
                    </div>
                    <svg
                      className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                        <div className="py-1">
                          {/* Astrologer Info */}
                          <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-sm font-semibold text-gray-900">{astrologer.name}</p>
                            <p className="text-xs text-gray-500 truncate">{astrologer.email}</p>
                            {astrologer.role && (
                              <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                                {astrologer.role}
                              </span>
                            )}
                          </div>

                          {/* Menu Items */}
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false)
                              navigate('/astrologer/profile')
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>Profile Settings</span>
                          </button>

                          <div className="border-t border-gray-100 my-1" />

                          {/* Logout Button */}
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false)
                              handleLogout()
                            }}
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
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default AstrologerLayout
