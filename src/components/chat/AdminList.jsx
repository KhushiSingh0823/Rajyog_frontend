import { useState, useEffect } from 'react'
import { getAdmins } from '../../services/chatApi'

const AdminList = ({ selectedAdminId, onSelectAdmin }) => {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadAdmins()
  }, [])

  const loadAdmins = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('📞 Fetching admins list from /chat/admins...')
      const response = await getAdmins()

      console.log('📨 Admins response:', response)

      if (response && response.success) {
        // API returns admins nested in data.admins
        const adminsList = response.data?.admins || []
        console.log('✅ Admins loaded:', adminsList.length, 'admins found')
        setAdmins(adminsList)
      } else {
        console.error('❌ Invalid response from getAdmins API')
        setError('Invalid response from server')
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load admins'
      setError(errorMessage)
      console.error('❌ Error loading admins:', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const filteredAdmins = admins.filter(admin =>
    admin.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Chat with Admin</h2>
        <p className="text-sm text-gray-600 mb-3">Select an admin to start chatting</p>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search admins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
          />
          <svg
            className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Admin List */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {error && (
          <div className="p-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && filteredAdmins.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 px-4">
            <svg
              className="w-16 h-16 mb-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <p className="text-center">
              {searchQuery ? 'No admins found' : 'No admins available'}
            </p>
            <p className="text-sm text-center mt-1">
              {searchQuery ? 'Try a different search' : 'Please check back later'}
            </p>
          </div>
        )}

        {!loading && !error && filteredAdmins.map((admin) => (
          <button
            key={admin._id}
            onClick={() => onSelectAdmin(admin)}
            className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 text-left ${
              selectedAdminId === admin._id ? 'bg-yellow-50 border-l-4 border-l-primary' : ''
            }`}
          >
            <div className="flex items-center space-x-3">
              {/* Avatar */}
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-red-400 to-red-500 rounded-full flex items-center justify-center">
                <span className="text-lg font-semibold text-white">
                  {admin.name?.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Admin Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                    {admin.name}
                  </h3>
                </div>

                <p className="text-sm text-gray-600 truncate">{admin.email}</p>

                {/* Admin Badge */}
                <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                  Admin
                </span>
              </div>

              {/* Arrow Icon */}
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {/* Refresh Button */}
      <div className="p-3 border-t border-gray-200">
        <button
          onClick={loadAdmins}
          disabled={loading}
          className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <svg
            className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>Refresh</span>
        </button>
      </div>
    </div>
  )
}

export default AdminList
