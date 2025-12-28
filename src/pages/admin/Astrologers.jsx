import { useState, useEffect, useCallback } from 'react'
import { fetchAstrologers, toggleAstrologerBlock } from '../../services/admin/astrologersApi'
import Modal from '../../components/Modal'

const Astrologers = () => {
  const [astrologers, setAstrologers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState(null)
  const [togglingId, setTogglingId] = useState(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Block modal state
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false)
  const [selectedAstrologer, setSelectedAstrologer] = useState(null)
  const [blockReason, setBlockReason] = useState('')

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setCurrentPage(1) // Reset to first page on search
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch astrologers from API
  const loadAstrologers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = {
        page: currentPage,
        limit: 10,
      }

      if (debouncedSearchTerm && debouncedSearchTerm.trim()) {
        params.search = debouncedSearchTerm.trim()
      }

      console.log('Fetching astrologers with params:', params) // Debug log

      const response = await fetchAstrologers(params)

      if (response.success) {
        setAstrologers(response.data.astrologers)
        setPagination(response.data.pagination)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch astrologers')
      console.error('Error loading astrologers:', err)
    } finally {
      setLoading(false)
    }
  }, [currentPage, debouncedSearchTerm])

  useEffect(() => {
    loadAstrologers()
  }, [loadAstrologers])

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

  const handleToggleBlockClick = async (astrologer, currentBlockedStatus) => {
    if (currentBlockedStatus) {
      // If blocked, unblock directly (no reason needed)
      handleUnblock(astrologer._id)
    } else {
      // If not blocked, open modal to get reason
      setSelectedAstrologer(astrologer)
      setIsBlockModalOpen(true)
    }
  }

  const handleUnblock = async (astrologerId) => {
    try {
      setTogglingId(astrologerId)
      setError(null)

      // Call API without reason to unblock
      const response = await toggleAstrologerBlock(astrologerId)

      if (response.success) {
        // Update the astrologer in the local state
        setAstrologers(prevAstrologers =>
          prevAstrologers.map(astrologer =>
            astrologer._id === astrologerId
              ? { ...astrologer, isBlocked: false, blockedAt: null }
              : astrologer
          )
        )
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to unblock astrologer')
      console.error('Error unblocking astrologer:', err)
    } finally {
      setTogglingId(null)
    }
  }

  const handleBlockSubmit = async (e) => {
    e.preventDefault()

    if (!blockReason.trim()) {
      setError('Please provide a reason for blocking')
      return
    }

    try {
      setTogglingId(selectedAstrologer._id)
      setError(null)

      // Call API with reason to block
      const response = await toggleAstrologerBlock(selectedAstrologer._id, blockReason.trim())

      if (response.success) {
        // Update the astrologer in the local state
        setAstrologers(prevAstrologers =>
          prevAstrologers.map(astrologer =>
            astrologer._id === selectedAstrologer._id
              ? { ...astrologer, isBlocked: true, blockedAt: new Date().toISOString() }
              : astrologer
          )
        )

        // Close modal and reset state
        setIsBlockModalOpen(false)
        setSelectedAstrologer(null)
        setBlockReason('')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to block astrologer')
      console.error('Error blocking astrologer:', err)
    } finally {
      setTogglingId(null)
    }
  }

  const closeBlockModal = () => {
    setIsBlockModalOpen(false)
    setSelectedAstrologer(null)
    setBlockReason('')
    setError(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Astrologers Management</h1>
          <p className="text-gray-600">Manage your platform astrologers and their profiles</p>
        </div>
        <button className="bg-primary hover:bg-yellow-400 text-gray-900 font-semibold px-4 py-2 rounded-lg transition-colors duration-200">
          + Add New Astrologer
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search Astrologers</label>
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
      </div>

      {/* Astrologer Statistics */}
      {pagination && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <span className="text-2xl">🔮</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Astrologers</p>
                <p className="text-2xl font-bold text-gray-900">{pagination.totalAstrologers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Astrologers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {astrologers.filter(astrologer => !astrologer.isBlocked).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100">
                <span className="text-2xl">🚫</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Blocked Astrologers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {astrologers.filter(astrologer => astrologer.isBlocked).length}
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
            <p className="mt-4 text-gray-600">Loading astrologers...</p>
          </div>
        </div>
      )}

      {/* Astrologers Table */}
      {!loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Astrologer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Blocked
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
                {astrologers.map((astrologer) => (
                  <tr key={astrologer._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-white">
                            {astrologer.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{astrologer.name}</div>
                          <div className="text-xs text-gray-500">ID: {astrologer._id.slice(-8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{astrologer.user.email}</div>
                      <div className="text-xs text-gray-500">Role: {astrologer.user.role}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <button
                          onClick={() => handleToggleBlockClick(astrologer, astrologer.isBlocked)}
                          disabled={togglingId === astrologer._id}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            astrologer.isBlocked
                              ? 'bg-red-500 focus:ring-red-500'
                              : 'bg-green-500 focus:ring-green-500'
                          } ${togglingId === astrologer._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title={astrologer.isBlocked ? 'Click to unblock' : 'Click to block'}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                              astrologer.isBlocked ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <span className={`ml-3 text-sm font-medium ${astrologer.isBlocked ? 'text-red-700' : 'text-green-700'}`}>
                          {astrologer.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </div>
                      {astrologer.isBlocked && astrologer.blockedAt && (
                        <div className="text-xs text-gray-500 mt-1">
                          Since: {formatDate(astrologer.blockedAt)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(astrologer.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(astrologer.updatedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 transition-colors duration-200">
                        View Details
                      </button>
                      <button className="text-purple-600 hover:text-purple-900 transition-colors duration-200">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {astrologers.length === 0 && !loading && (
            <div className="text-center py-12">
              <span className="text-6xl">🔮</span>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No astrologers found</h3>
              <p className="mt-2 text-gray-500">
                {searchTerm
                  ? 'Try adjusting your search'
                  : 'Get started by adding your first astrologer'
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
                    Showing <span className="font-medium">{(currentPage - 1) * pagination.astrologersPerPage + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * pagination.astrologersPerPage, pagination.totalAstrologers)}
                    </span>{' '}
                    of <span className="font-medium">{pagination.totalAstrologers}</span> results
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

      {/* Block Reason Modal */}
      <Modal
        isOpen={isBlockModalOpen}
        onClose={closeBlockModal}
        title="Block Astrologer"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleBlockSubmit} className="space-y-6">
          {/* Astrologer Info */}
          {selectedAstrologer && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-lg font-semibold text-white">
                    {selectedAstrologer.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{selectedAstrologer.name}</p>
                  <p className="text-xs text-gray-600">{selectedAstrologer.user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Warning Message */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Warning</h3>
                <p className="mt-1 text-xs text-yellow-700">
                  Blocking this astrologer will prevent them from accessing their account and providing services.
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Reason Field */}
          <div>
            <label htmlFor="block-reason" className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Blocking <span className="text-red-500">*</span>
            </label>
            <textarea
              id="block-reason"
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Please provide a detailed reason for blocking this astrologer (e.g., Violating policies, Inappropriate behavior, etc.)"
              required
              disabled={togglingId !== null}
            />
            <p className="mt-1 text-xs text-gray-500">
              This reason will be recorded and may be shared with the astrologer.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={closeBlockModal}
              disabled={togglingId !== null}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={togglingId !== null || !blockReason.trim()}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {togglingId !== null ? 'Blocking...' : 'Block Astrologer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Astrologers
