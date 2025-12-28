import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { getAllConversations } from '../../services/chatApi'
import ChatModal from '../../components/admin/ChatModal'
import { selectAstrologer } from '../../store/astrologerAuthSlice'
import { useAstrologerSocket } from '../../hooks/useAstrologerSocket'
import ConsultationRequestPopup from '../../components/consultation/ConsultationRequestPopup'

const AstrologerUsers = () => {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [searchTerm, setSearchTerm] = useState('')

  // Get current astrologer user
  const currentAstrologer = useSelector(selectAstrologer)

  // Initialize socket connection (same pattern as ChatWithAstrologer)
  const { socket, isConnected } = useAstrologerSocket()

  // Chat state
  const [isChatModalOpen, setIsChatModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [activeRequestId, setActiveRequestId] = useState(null)

  // Consultation request state
  const [incomingRequest, setIncomingRequest] = useState(null)

  // Track active consultations per user
  // Map of userId -> requestId
  const [activeConsultations, setActiveConsultations] = useState({})

  // Fetch conversations from API
  const loadConversations = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔮 Astrologer fetching conversations...')

      const response = await getAllConversations()

      if (response.success && response.data) {
        setConversations(response.data.conversations || [])
        console.log('✅ Loaded', response.data.conversations?.length || 0, 'conversations')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch conversations')
      console.error('Error loading conversations:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch conversations on mount
  useEffect(() => {
    loadConversations()
  }, [])

  // Socket.IO event listeners for consultation requests and new messages
  useEffect(() => {
    if (!socket) {
      console.log('⚠️ AstrologerUsers useEffect: No socket, skipping listener setup')
      return
    }

    console.log('========================================')
    console.log('👂 AstrologerUsers: Setting up consultation event listeners')
    console.log('🔗 Socket ID:', socket.id)
    console.log('📡 Socket Connected:', socket.connected)
    console.log('========================================')

    // Listen for incoming consultation requests
    const handleIncomingRequest = (data) => {
      console.log('========================================')
      console.log('🔔 HANDLER CALLED: Incoming consultation request')
      console.log('🔔 Data:', data)
      console.log('========================================')

      // Play notification sound (optional)
      try {
        const audio = new Audio('/notification.mp3')
        audio.play().catch(err => console.log('Could not play sound:', err))
      } catch (err) {
        console.log('Audio not available')
      }

      setIncomingRequest(data)
    }

    console.log('📡 Registering listener for: consultation:incoming')
    socket.on('consultation:incoming', handleIncomingRequest)
    console.log('✅ Listener registered')

    // Test the listener immediately
    console.log('🧪 Testing if listener works...')
    socket.emit('consultation:incoming', {
      requestId: 'test-local',
      user: { _id: 'test', name: 'Local Test', email: 'test@test.com', role: 'user' },
      message: 'Local test',
      requestedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 300000).toISOString()
    })
    setTimeout(() => {
      console.log('🧪 Local emit completed, check if handler was called above')
    }, 100)

    // Listen for request cancellation
    const handleRequestCancelled = (data) => {
      console.log('🚫 Consultation request cancelled:', data)
      if (incomingRequest && incomingRequest.requestId === data.requestId) {
        setIncomingRequest(null)
        alert(`${data.userName} cancelled their request`)
      }

      // Remove from active consultations
      if (data.userId) {
        setActiveConsultations(prev => {
          const updated = { ...prev }
          delete updated[data.userId]
          return updated
        })
      }
    }

    // Listen for new messages to refresh conversation list
    const handleNewMessage = () => {
      console.log('💬 New message received, refreshing conversations')
      loadConversations()
    }

    // Listen for consultation completed
    const handleConsultationCompleted = (data) => {
      console.log('🏁 Consultation completed:', data)

      // Remove from active consultations
      if (data.userId) {
        setActiveConsultations(prev => {
          const updated = { ...prev }
          delete updated[data.userId]
          return updated
        })

        // If chat modal is open with this user, close it
        if (selectedUser && selectedUser._id === data.userId) {
          setIsChatModalOpen(false)
          setSelectedUser(null)
          setActiveRequestId(null)
        }
      }

      // Show notification
      const message = data.message || `${data.completedByName || 'User'} ended the consultation`
      alert(message)

      // Refresh conversations
      loadConversations()
    }

    socket.on('consultation:cancelled', handleRequestCancelled)
    socket.on('message:new', handleNewMessage)
    socket.on('consultation:completed', handleConsultationCompleted)

    return () => {
      console.log('🧹 AstrologerUsers: Cleaning up socket listeners')
      socket.off('consultation:incoming', handleIncomingRequest)
      socket.off('consultation:cancelled', handleRequestCancelled)
      socket.off('message:new', handleNewMessage)
      socket.off('consultation:completed', handleConsultationCompleted)
    }
  }, [socket, incomingRequest, selectedUser])

  const handleOpenChat = (user) => {
    console.log('🔮 Astrologer opening chat with:', user.name)
    setSelectedUser(user)
    // Get active request ID for this user if exists
    const requestId = activeConsultations[user._id] || null
    setActiveRequestId(requestId)
    setIsChatModalOpen(true)
  }

  const handleCloseChat = () => {
    setIsChatModalOpen(false)
    setSelectedUser(null)
    setActiveRequestId(null)
    // Refresh conversations when chat closes to update unread count
    loadConversations()
  }

  const handleRequestClose = (user, requestId) => {
    setIncomingRequest(null)
    // If request was accepted (user is passed), open chat with that user
    if (user) {
      // Track this as an active consultation
      if (requestId) {
        setActiveConsultations(prev => ({
          ...prev,
          [user._id]: requestId
        }))
        setActiveRequestId(requestId)
      }

      setSelectedUser(user)
      setIsChatModalOpen(true)
      // Refresh conversations to show the new conversation
      loadConversations()
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Filter conversations based on search
  const filteredConversations = conversations.filter((conv) => {
    if (!searchTerm) return true
    const userName = conv.user?.name?.toLowerCase() || ''
    const userEmail = conv.user?.email?.toLowerCase() || ''
    const search = searchTerm.toLowerCase()
    return userName.includes(search) || userEmail.includes(search)
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Active Conversations</h1>
          <p className="text-gray-600">Your ongoing consultations with users</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Connection Status */}
          <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border ${
            isConnected
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`}></div>
            <span className={`text-xs font-medium ${
              isConnected ? 'text-green-700' : 'text-red-700'
            }`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {/* Conversation Count */}
          <div className="flex items-center space-x-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg">
            <span className="text-purple-700 font-medium">💬</span>
            <span className="text-sm text-purple-900 font-medium">
              {filteredConversations.length} Conversation{filteredConversations.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search Conversations</label>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
          />
        </div>
      </div>

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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            <p className="mt-4 text-gray-600">Loading users...</p>
          </div>
        </div>
      )}

      {/* Conversations Grid */}
      {!loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.user._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
              >
                <div className="p-6">
                  {/* User Avatar and Info */}
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-semibold text-white">
                          {conversation.user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      {/* Unread Badge */}
                      {conversation.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-white">{conversation.unreadCount}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{conversation.user.name}</h3>
                      <p className="text-sm text-gray-500">{conversation.user.email}</p>
                    </div>
                  </div>

                  {/* Last Message */}
                  <div className="mb-4">
                    <div className="flex items-start text-sm text-gray-600">
                      <span className="mr-2">💬</span>
                      <p className="line-clamp-2 flex-1">
                        {conversation.isSentByUser ? '' : 'You: '}
                        {conversation.lastMessage || 'No messages yet'}
                      </p>
                    </div>
                    {conversation.lastMessageTime && (
                      <p className="text-xs text-gray-400 mt-1 ml-6">
                        {formatDate(conversation.lastMessageTime)}
                      </p>
                    )}
                  </div>

                  {/* Chat Button */}
                  <button
                    onClick={() => handleOpenChat(conversation.user)}
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>Continue Chat</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredConversations.length === 0 && !loading && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
              <div className="text-center">
                <span className="text-6xl">💬</span>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  {searchTerm ? 'No conversations found' : 'No active conversations'}
                </h3>
                <p className="mt-2 text-gray-500">
                  {searchTerm
                    ? 'Try adjusting your search'
                    : 'Conversations will appear here when users send you messages'
                  }
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Chat Modal */}
      {selectedUser && (
        <ChatModal
          isOpen={isChatModalOpen}
          onClose={handleCloseChat}
          user={selectedUser}
          currentUser={currentAstrologer}
          activeRequestId={activeRequestId}
        />
      )}

      {/* Consultation Request Popup */}
      {incomingRequest && (
        <ConsultationRequestPopup
          request={incomingRequest}
          onClose={handleRequestClose}
        />
      )}
    </div>
  )
}

export default AstrologerUsers
