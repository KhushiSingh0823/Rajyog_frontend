import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  selectAdmin,
  selectIsAdminAuthenticated,
  adminLogoutLocal,
} from '../../store/adminAuthSlice'
import { useAdminSocket } from '../../hooks/useAdminSocket'

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const [openMenus, setOpenMenus] = useState({
    horoscope: false,
  })

  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()

  const admin = useSelector(selectAdmin)
  const isAuthenticated = useSelector(selectIsAdminAuthenticated)

  const { isConnected, activeUsers } = useAdminSocket()

  useEffect(() => {
    console.log(
      '🏢 AdminLayout: Socket connection status:',
      isConnected ? 'CONNECTED ✓' : 'DISCONNECTED ✗'
    )
    console.log('👥 AdminLayout: Active users count:', activeUsers?.length || 0)
  }, [isConnected, activeUsers])

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin')
    }
  }, [isAuthenticated, navigate])

  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }))
  }

  useEffect(() => {
    if (location.pathname.startsWith('/admin/horoscope')) {
      setOpenMenus((prev) => ({ ...prev, horoscope: true }))
    }
  }, [location.pathname])

  const menuItems = [
    {
      name: 'Dashboard',
      icon: '📊',
      path: '/admin/dashboard',
      description: 'Overview and analytics'
    },
    {
      name: 'Users',
      icon: '👥',
      path: '/admin/users',
      description: 'Manage users and accounts'
    },
    {
      name: 'Astrologers',
      icon: '🔮',
      path: '/admin/astrologers',
      description: 'Manage astrologers'
    },
    {
      name: 'Blog',
      icon: '📝',
      path: '/admin/blogs',
      description: 'Create & manage blog posts'
    },
    {
      name: 'Banner',
      icon: '🏷️',
      path: '/admin/banner',
      description: 'Add & manage homepage banners'
    },
    {
      name: 'Videos',
      icon: '🎬',
      path: '/admin/videos',
      description: 'Manage Ads Videos'
    },
    {
      name: 'Horoscope',
      icon: '🔮',
      childrenKey: 'horoscope',
      description: 'Daily, Weekly, Yearly Horoscopes',
      children: [
        {
          name: 'Daily Horoscope',
          path: '/admin/horoscope/daily',
          icon: '✨'
        },
        {
          name: 'Weekly Horoscope',
          path: '/admin/horoscope/weekly',
          icon: '📅'
        },
        {
          name: 'Yearly Horoscope',
          path: '/admin/horoscope/yearly',
          icon: '📆'
        },
        {
          name: 'Horoscope Feedback',
          path: '/admin/horoscope/feedback',
          icon: '🙂'
        }
      ]
    }
  ]

  const handleLogout = () => {
    dispatch(adminLogoutLocal())
    navigate('/admin')
  }

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen)
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🧘‍♀️</div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                <span className="text-primary">Raj</span>
                <span className="text-gray-800">Yog</span>
              </h1>
              <p className="text-xs text-gray-600">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* FIXED PADDING ADDED HERE → pb-32 */}
        <nav className="p-4 space-y-2 pb-32 overflow-y-auto flex-1 h-[600px]">
          {menuItems.map((item) => {
            
            if (item.children) {
              return (
                <div key={item.name}>
                  
                  <button
                    onClick={() => toggleMenu(item.childrenKey)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-left text-gray-700 hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{item.icon}</span>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </div>
                    </div>
                    <span>{openMenus[item.childrenKey] ? '▼' : '▶'}</span>
                  </button>

                  {/* FIX: Reduced ml-10 → ml-6 */}
                  {openMenus[item.childrenKey] && (
                    <div className="ml-6 mt-2 space-y-2">
                      {item.children.map((child) => (
                        <button
                          key={child.path}
                          onClick={() => navigate(child.path)}
                          className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-left transition ${
                            location.pathname === child.path
                              ? 'bg-primary text-gray-900'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <span>{child.icon}</span>
                          <span>{child.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
                  location.pathname === item.path
                    ? 'bg-primary text-gray-900'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-gray-500">{item.description}</div>
                </div>
              </button>
            )
          })}
        </nav>

        { <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
          >
            <span className="text-xl">🚪</span>
            <div>
              <div className="font-medium">Logout</div>
              <div className="text-xs text-gray-500">Sign out of admin</div>
            </div>
          </button>
        </div> }
      </div>

      <div
        className={`transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'ml-64' : 'ml-0'
        }`}
      >
        
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
                {
                  menuItems
                    .flatMap((i) => (i.children ? [...i.children] : [i]))
                    .find((i) => i.path === location.pathname)?.name || 'Admin Panel'
                }
              </h2>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                  }`}
                ></div>
                <span className="text-xs text-gray-600">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              {admin && (
                <div className="relative">
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 focus:outline-none transition-colors duration-200"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-gray-900">
                        {admin.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="text-left hidden sm:block">
                      <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                      <div className="text-xs text-gray-500">{admin.email}</div>
                    </div>
                    <svg
                      className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                        isUserMenuOpen ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isUserMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />

                      <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                        <div className="py-1">
                          <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-sm font-semibold text-gray-900">{admin.name}</p>
                            <p className="text-xs text-gray-500 truncate">{admin.email}</p>
                            {admin.role && (
                              <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                                {admin.role}
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false)
                              navigate('/admin/profile')
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            <span>Profile Settings</span>
                          </button>

                          <div className="border-t border-gray-100 my-1" />

                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false)
                              handleLogout()
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                              />
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

        <main className="p-6">
          <Outlet />
        </main>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default AdminLayout
