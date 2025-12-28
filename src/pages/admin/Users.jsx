import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { fetchUsers } from '../../services/admin/usersApi'
import { getAllUnreadCounts } from '../../services/admin/chatApi'
import ChatModal from '../../components/admin/ChatModal'
import { selectAdmin } from '../../store/adminAuthSlice'

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

  // Get current admin user
  const currentAdmin = useSelector(selectAdmin)

  // Chat state
  const [isChatModalOpen, setIsChatModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [unreadCounts, setUnreadCounts] = useState({})

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setCurrentPage(1) // Reset to first page on search
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch users from API
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = {
        page: currentPage,
        limit: 10,
      }

      if (roleFilter && roleFilter !== 'all') {
        params.role = roleFilter
      }

      if (debouncedSearchTerm && debouncedSearchTerm.trim()) {
        params.search = debouncedSearchTerm.trim()
      }

      console.log('Fetching users with params:', params) // Debug log

      const response = await fetchUsers(params)

      if (response.success) {
        setUsers(response.data.users)
        setPagination(response.data.pagination)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users')
      console.error('Error loading users:', err)
    } finally {
      setLoading(false)
    }
  }, [currentPage, roleFilter, debouncedSearchTerm])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  // Load unread message counts
  const loadUnreadCounts = useCallback(async () => {
    try {
      const response = await getAllUnreadCounts()
      if (response.success) {
        // Convert array to object with userId as key
        const countsMap = {}
        response.data.unreadCounts?.forEach(item => {
          countsMap[item.userId] = item.count
        })
        setUnreadCounts(countsMap)
      }
    } catch (err) {
      console.error('Error loading unread counts:', err)
    }
  }, [])

  // useEffect(() => {
  //   loadUnreadCounts()
  //   const interval = setInterval(loadUnreadCounts, 30000)
  //   return () => clearInterval(interval)
  // }, [loadUnreadCounts])

  const handleOpenChat = (user) => {
    setSelectedUser(user)
    setIsChatModalOpen(true)
  }

  const handleCloseChat = () => {
    setIsChatModalOpen(false)
    setSelectedUser(null)
    // Reload unread counts after closing chat
    // loadUnreadCounts()
  }

  const getRoleBadge = (role) => {
    const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full"
    switch (role) {
      case 'admin':
        return `${baseClasses} bg-red-100 text-red-800`
      case 'astrologer':
        return `${baseClasses} bg-purple-100 text-purple-800`
      case 'user':
        return `${baseClasses} bg-blue-100 text-blue-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination?.totalPages) {
      setCurrentPage(newPage)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600">Manage your platform users and their accounts</p>
        </div>
        <button className="bg-primary hover:bg-yellow-400 text-gray-900 font-semibold px-4 py-2 rounded-lg transition-colors duration-200">
          + Add New User
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200"
            />
            {searchTerm && searchTerm !== debouncedSearchTerm && (
              <p className="text-xs text-gray-500 mt-1">Searching...</p>
            )}
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Role</label>
            <select
              value={roleFilter}
              onChange={(e) => {
                console.log('Role filter changed to:', e.target.value)
                setRoleFilter(e.target.value)
                setCurrentPage(1) // Reset to first page on filter change
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200"
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="astrologer">Astrologer</option>
            </select>
            {roleFilter !== 'all' && (
              <p className="text-xs text-gray-500 mt-1">Active filter: {roleFilter}</p>
            )}
          </div>
        </div>
      </div>

      {/* User Statistics */}
      {pagination && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{pagination.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <span className="text-2xl">👤</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(user => user.role === 'user').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <span className="text-2xl">🔮</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Astrologers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(user => user.role === 'astrologer').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100">
                <span className="text-2xl">👨‍💼</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Admins</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(user => user.role === 'admin').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">Loading users...</p>
          </div>
        </div>
      )}

      {/* Users Table */}
      {!loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-gray-900">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getRoleBadge(user.role)}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleOpenChat(user)}
                        className="relative inline-flex items-center justify-center p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-full transition-colors duration-200"
                        title="Open chat"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {unreadCounts[user._id] > 0 && (
                          <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
                            {unreadCounts[user._id] > 9 ? '9+' : unreadCounts[user._id]}
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(user.updatedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 transition-colors duration-200">
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-900 transition-colors duration-200">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && !loading && (
            <div className="text-center py-12">
              <span className="text-6xl">👤</span>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No users found</h3>
              <p className="mt-2 text-gray-500">
                {searchTerm || roleFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by adding your first user'
                }
              </p>
            </div>
          )}

          {/* Pagination - Always show if pagination data exists */}
          {pagination && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                {/* Results Info */}
                <div className="flex-1">
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * pagination.usersPerPage + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * pagination.usersPerPage, pagination.totalUsers)}
                    </span>{' '}
                    of <span className="font-medium">{pagination.totalUsers}</span> results
                  </p>
                </div>

                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center space-x-2">
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!pagination.hasPrevPage}
                      className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      title="Previous page"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    {/* Page Number Box */}
                    <div className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-md">
                      <span className="text-sm text-gray-700">Page</span>
                      <span className="text-sm font-semibold text-gray-900">{currentPage}</span>
                      <span className="text-sm text-gray-500">of</span>
                      <span className="text-sm font-semibold text-gray-900">{pagination.totalPages}</span>
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                      className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      title="Next page"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chat Modal */}
      {selectedUser && (
        <ChatModal
          isOpen={isChatModalOpen}
          onClose={handleCloseChat}
          user={selectedUser}
          currentUser={currentAdmin}
        />
      )}
    </div>
  )
}

export default Users
