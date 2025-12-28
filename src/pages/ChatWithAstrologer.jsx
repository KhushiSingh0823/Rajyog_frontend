import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated } from '../store/authSlice'
import { useSocket } from '../hooks/useSocket'
import { getAstrologersList, checkConsultationStatus } from '../services/chatApi'
import WaitingForAcceptance from '../components/consultation/WaitingForAcceptance'

const ChatWithAstrologer = () => {
  const navigate = useNavigate()
  const isAuthenticated = useSelector(selectIsAuthenticated)

  // Initialize socket connection
  const { socket, isConnected } = useSocket()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Consultation request state
  const [selectedAstrologer, setSelectedAstrologer] = useState(null)
  const [waitingForAcceptance, setWaitingForAcceptance] = useState(false)
  const [currentRequestId, setCurrentRequestId] = useState(null)

  // Astrologers data state
  const [astrologers, setAstrologers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Consultation status tracking
  // Map of astrologerId -> { canRequest, hasPending, hasActive, activeRequestId }
  const [consultationStatuses, setConsultationStatuses] = useState({})

  // Categories for the dropdown
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'career', label: 'Career' },
    { value: 'job', label: 'Job' },
    { value: 'marital-life', label: 'Marital Life' },
    { value: 'love-relationship', label: 'Love & Relationship' },
    { value: 'health', label: 'Health' },
    { value: 'finance', label: 'Finance' },
    { value: 'business', label: 'Business' },
    { value: 'education', label: 'Education' },
    { value: 'family', label: 'Family' },
  ]

  // Check consultation status for a specific astrologer
  const checkAstrologerStatus = async (astrologerId) => {
    if (!isAuthenticated) return

    try {
      console.log('🔍 Checking consultation status for astrologer:', astrologerId)
      const response = await checkConsultationStatus(astrologerId)

      if (response.success && response.data) {
        setConsultationStatuses(prev => ({
          ...prev,
          [astrologerId]: response.data
        }))
        console.log('✅ Status for astrologer', astrologerId, ':', response.data)
      }
    } catch (err) {
      console.error('❌ Error checking consultation status:', err)
    }
  }

  // Check consultation status for all astrologers
  const checkAllAstrologersStatus = async (astrologersList) => {
    if (!isAuthenticated) return

    console.log('🔍 Checking consultation status for all astrologers...')
    const statusPromises = astrologersList.map(astrologer =>
      checkAstrologerStatus(astrologer.userId)
    )
    await Promise.all(statusPromises)
  }

  // Fetch astrologers from API
  const fetchAstrologers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      console.log('🔄 Fetching astrologers list from API...')

      const response = await getAstrologersList()

      if (response.success && response.data && response.data.astrologers) {
        // Map API response to component format
        const mappedAstrologers = response.data.astrologers.map((astrologer) => ({
          id: astrologer._id, // Astrologer profile ID
          userId: astrologer.user._id, // User account ID (for Socket.IO)
          name: astrologer.user.name || astrologer.name,
          email: astrologer.user.email,
          experience: astrologer.experience || 'N/A',
          specialization: astrologer.specialization || [],
          rating: astrologer.rating || 0,
          consultations: astrologer.consultations || 0,
          languages: astrologer.languages || ['Hindi', 'English'],
          pricePerMin: astrologer.pricePerMin || 20,
          isOnline: astrologer.user.isAvailable || false,
          image: `https://ui-avatars.com/api/?name=${encodeURIComponent(astrologer.user.name || astrologer.name)}&background=f9e885&color=000`,
        }))

        setAstrologers(mappedAstrologers)
        console.log('✅ Fetched', mappedAstrologers.length, 'astrologers')

        // Check consultation status for all astrologers
        await checkAllAstrologersStatus(mappedAstrologers)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (err) {
      console.error('❌ Error fetching astrologers:', err)
      setError(err.message || 'Failed to load astrologers')
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch astrologers on mount
  useEffect(() => {
    fetchAstrologers()
  }, [])

  // Filter astrologers based on search and category
  const filteredAstrologers = astrologers.filter((astrologer) => {
    const matchesSearch = astrologer.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategory === 'all' ||
      astrologer.specialization.some((spec) =>
        spec.toLowerCase().replace('&', '').replace(/\s+/g, '-').includes(selectedCategory)
      )
    return matchesSearch && matchesCategory
  })

  // Listen for consultation responses
  useEffect(() => {
    if (!socket) return

    console.log('👂 Setting up consultation event listeners')

    // Request accepted
    const handleAccepted = (data) => {
      console.log('✅ Consultation accepted:', data)

      setWaitingForAcceptance(false)
      setCurrentRequestId(null)

      // Update consultation status
      if (data.astrologerId) {
        setConsultationStatuses(prev => ({
          ...prev,
          [data.astrologerId]: {
            canRequest: false,
            hasPending: false,
            hasActive: true,
            activeRequestId: data.requestId
          }
        }))
      }

      // Show success notification (you can use a toast library here)
      alert(`${data.astrologerName} accepted your request!`)

      // Navigate to chat page
      setTimeout(() => {
        navigate('/messages')
      }, 500)
    }

    // Request declined
    const handleDeclined = (data) => {
      console.log('❌ Consultation declined:', data)

      setWaitingForAcceptance(false)
      setCurrentRequestId(null)
      setSelectedAstrologer(null)

      // Update consultation status - can request again
      if (data.astrologerId) {
        setConsultationStatuses(prev => ({
          ...prev,
          [data.astrologerId]: {
            canRequest: true,
            hasPending: false,
            hasActive: false,
            activeRequestId: null
          }
        }))
      }

      // Show error notification
      alert(data.message || 'Astrologer is currently unavailable')
    }

    // Consultation completed by either party
    const handleCompleted = (data) => {
      console.log('🏁 Consultation completed:', data)

      // Update consultation status - can request again
      if (data.astrologerId) {
        setConsultationStatuses(prev => ({
          ...prev,
          [data.astrologerId]: {
            canRequest: true,
            hasPending: false,
            hasActive: false,
            activeRequestId: null
          }
        }))
      }

      // Show notification
      const message = data.message || `${data.completedByName || 'Consultation'} ended the consultation`
      alert(message)

      // If currently in waiting state, reset it
      if (waitingForAcceptance && selectedAstrologer?.userId === data.astrologerId) {
        setWaitingForAcceptance(false)
        setCurrentRequestId(null)
        setSelectedAstrologer(null)
      }
    }

    socket.on('consultation:accepted', handleAccepted)
    socket.on('consultation:declined', handleDeclined)
    socket.on('consultation:completed', handleCompleted)

    return () => {
      console.log('🧹 Cleaning up consultation event listeners')
      socket.off('consultation:accepted', handleAccepted)
      socket.off('consultation:declined', handleDeclined)
      socket.off('consultation:completed', handleCompleted)
    }
  }, [socket, navigate, waitingForAcceptance, selectedAstrologer])

  // Listen for astrologer availability and online/offline changes
  useEffect(() => {
    if (!socket) return

    console.log('👂 Setting up astrologer availability and online/offline listeners')

    // Listen for availability changes
    const handleAvailabilityChange = (data) => {
      console.log('📡 Astrologer availability changed:', data)

      // Update the astrologer's online status in the list
      setAstrologers(prevAstrologers =>
        prevAstrologers.map(astrologer =>
          astrologer.userId === data.astrologerId
            ? { ...astrologer, isOnline: data.isAvailable }
            : astrologer
        )
      )
    }

    // Listen for user online (astrologers coming online)
    const handleUserOnline = (data) => {
      console.log('👤 User came online:', data)
      if (data.role === 'astrologer') {
        // An astrologer came online, refresh list
        console.log('🔄 Astrologer came online, refreshing list...')
        fetchAstrologers()
      }
    }

    // Listen for user offline
    const handleUserOffline = (data) => {
      console.log('👤 User went offline:', data)
      // Someone went offline, refresh list
      console.log('🔄 User went offline, refreshing list...')
      fetchAstrologers()
    }

    socket.on('astrologer:availability', handleAvailabilityChange)
    socket.on('user:online', handleUserOnline)
    socket.on('user:offline', handleUserOffline)

    return () => {
      console.log('🧹 Cleaning up availability and online/offline listeners')
      socket.off('astrologer:availability', handleAvailabilityChange)
      socket.off('user:online', handleUserOnline)
      socket.off('user:offline', handleUserOffline)
    }
  }, [socket, fetchAstrologers])

  const handleChatClick = (astrologer) => {
    if (!isAuthenticated) {
      // Navigate to home to open login modal from Layout
      navigate('/home', { state: { openSignIn: true } })
      return
    }

    if (!astrologer.isOnline) {
      alert('This astrologer is currently offline')
      return
    }

    if (!socket || !isConnected) {
      alert('Connection error. Please wait for connection or refresh the page.')
      return
    }

    // Check consultation status
    const status = consultationStatuses[astrologer.userId]

    if (status?.hasActive) {
      // Already has active consultation, navigate to chat
      console.log('✅ Active consultation found, navigating to chat')
      navigate('/messages')
      return
    }

    if (status?.hasPending) {
      alert('You already have a pending request with this astrologer')
      return
    }

    if (status && !status.canRequest) {
      alert('Cannot send request at this time. Please try again later.')
      return
    }

    setSelectedAstrologer(astrologer)

    console.log('📤 Sending consultation request to astrologer:', astrologer.name)

    // Send consultation request
    socket.emit('consultation:request',
      {
        astrologerId: astrologer.userId, // Using the user account ID for Socket.IO
        message: `Hi ${astrologer.name}, I would like to consult with you.`,
      },
      (response) => {
        console.log('📥 Consultation request response:', response)

        if (response && response.success) {
          setCurrentRequestId(response.requestId)
          setWaitingForAcceptance(true)

          // Update consultation status to pending
          setConsultationStatuses(prev => ({
            ...prev,
            [astrologer.userId]: {
              canRequest: false,
              hasPending: true,
              hasActive: false,
              activeRequestId: response.requestId
            }
          }))
        } else {
          console.error('❌ Request failed:', response?.error)
          alert(response?.error || 'Failed to send request. Please try again.')
          setSelectedAstrologer(null)
        }
      }
    )
  }

  const handleCancelRequest = () => {
    setWaitingForAcceptance(false)
    setCurrentRequestId(null)
    setSelectedAstrologer(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Chat with Astrologer</h1>
              <p className="text-gray-600">Connect with experienced astrologers for instant guidance</p>
            </div>
            {/* Connection Status Indicator */}
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-xs text-gray-600">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Field */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Astrologer
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-colors duration-200"
                  placeholder="Search by name..."
                />
                <svg
                  className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"
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

            {/* Category Dropdown */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-colors duration-200 bg-white"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Loading astrologers...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <svg
              className="w-12 h-12 text-red-500 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-red-900 mb-2">Failed to load astrologers</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={fetchAstrologers}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Results Count */}
        {!isLoading && !error && (
          <div className="mb-4">
            <p className="text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filteredAstrologers.length}</span>{' '}
              astrologer{filteredAstrologers.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Astrologers Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredAstrologers.map((astrologer) => (
            <div
              key={astrologer.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
            >
              <div className="relative p-3 flex gap-3">
                {/* Left Side - Profile Image */}
                <div className="flex-shrink-0 relative">
                  <img
                    src={astrologer.image}
                    alt={astrologer.name}
                    className="w-16 h-16 rounded-full border-2 border-yellow-100"
                  />
                  {/* Online Status Dot */}
                  {astrologer.isOnline && (
                    <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>

                {/* Right Side - Content */}
                <div className="flex-1 min-w-0">

                  {/* Name and Experience */}
                  <div className="mb-1">
                    <h3 className="text-sm font-bold text-gray-900 truncate">{astrologer.name}</h3>
                    <p className="text-xs text-gray-600">{astrologer.experience} exp</p>
                  </div>

                  {/* Rating and Consultations */}
                  <div className="flex items-center space-x-2 mb-1.5">
                    <div className="flex items-center space-x-0.5">
                      <svg className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                      <span className="text-xs font-semibold text-gray-700">{astrologer.rating}</span>
                    </div>
                    <span className="text-gray-300">•</span>
                    <div className="text-xs text-gray-600">
                      {astrologer.consultations.toLocaleString()}
                    </div>
                  </div>

                  {/* Specialization Tags */}
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {astrologer.specialization.slice(0, 2).map((spec, index) => (
                      <span
                        key={index}
                        className="px-1.5 py-0.5 text-xs font-medium bg-yellow-50 text-gray-700 rounded"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>

                  {/* Languages and Price */}
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-500 truncate">
                      {astrologer.languages.slice(0, 2).join(', ')}
                    </p>
                    <p className="text-sm font-bold text-gray-900 ml-2">
                      ₹{astrologer.pricePerMin}
                      <span className="text-xs font-normal text-gray-600">/min</span>
                    </p>
                  </div>

                  {/* Request Consultation Button */}
                  {(() => {
                    const status = consultationStatuses[astrologer.userId]

                    // Determine button state
                    let buttonText = 'Request Consultation'
                    let buttonClass = 'bg-purple-500 hover:bg-purple-600 text-white'
                    let isDisabled = !astrologer.isOnline

                    if (!astrologer.isOnline) {
                      buttonText = 'Offline'
                      buttonClass = 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    } else if (status?.hasActive) {
                      buttonText = 'Continue Chat'
                      buttonClass = 'bg-green-500 hover:bg-green-600 text-white'
                      isDisabled = false
                    } else if (status?.hasPending) {
                      buttonText = 'Waiting for Response...'
                      buttonClass = 'bg-yellow-500 text-white cursor-wait'
                      isDisabled = true
                    } else if (status && !status.canRequest) {
                      buttonText = 'Unavailable'
                      buttonClass = 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      isDisabled = true
                    }

                    return (
                      <button
                        onClick={() => handleChatClick(astrologer)}
                        disabled={isDisabled}
                        className={`w-full flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all duration-200 ${buttonClass}`}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        <span>{buttonText}</span>
                      </button>
                    )
                  })()}
                </div>
              </div>
            </div>
          ))}

            {/* No Results Message */}
            {filteredAstrologers.length === 0 && (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No astrologers found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Waiting for Acceptance Modal */}
      {waitingForAcceptance && selectedAstrologer && (
        <WaitingForAcceptance
          astrologer={selectedAstrologer}
          requestId={currentRequestId}
          onCancel={handleCancelRequest}
        />
      )}
    </div>
  )
}

export default ChatWithAstrologer
