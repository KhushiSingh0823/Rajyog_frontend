import { useState, useEffect } from 'react'
import { getAllConversations } from '../../services/chatApi'
import { getSocket } from '../../services/socket'
import { formatMessageTime } from '../../utils/formatTime'

const ConversationList = ({ selectedUserId, onSelectConversation }) => {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadConversations()
  }, [])

  // Socket.IO listener for real-time conversation updates
  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    const handleMessageReceive = (data) => {
      // Update conversation list with new message
      setConversations(prev => {
        const updated = prev.map(conv => {
          if (conv.user._id === data.message.sender._id) {
            return {
              ...conv,
              lastMessage: data.message.message,
              lastMessageTime: data.message.createdAt,
              unreadCount: selectedUserId === data.message.sender._id ? conv.unreadCount : conv.unreadCount + 1,
              isSentByUser: false
            }
          }
          return conv
        })

        // Sort by last message time
        return updated.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime))
      })
    }

    const handleReadReceipt = (data) => {
      // Update unread count when messages are read
      setConversations(prev =>
        prev.map(conv =>
          conv.user._id === data.userId
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      )
    }

    socket.on('message:receive', handleMessageReceive)
    socket.on('message:read-receipt', handleReadReceipt)

    return () => {
      socket.off('message:receive', handleMessageReceive)
      socket.off('message:read-receipt', handleReadReceipt)
    }
  }, [selectedUserId])

  const loadConversations = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await getAllConversations()

      if (response.success) {
        setConversations(response.data.conversations || [])
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load conversations')
      console.error('Error loading conversations:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelectConversation = (conversation) => {
    onSelectConversation(conversation.user)

    // Mark conversation as read locally (will be updated by Socket.IO)
    setConversations(prev =>
      prev.map(conv =>
        conv.user._id === conversation.user._id
          ? { ...conv, unreadCount: 0 }
          : conv
      )
    )
  }

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Messages</h2>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
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

      {/* Conversations List */}
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

        {!loading && !error && filteredConversations.length === 0 && (
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
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-center">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
            <p className="text-sm text-center mt-1">
              {searchQuery ? 'Try a different search' : 'Start a new chat with an astrologer'}
            </p>
          </div>
        )}

        {!loading && !error && filteredConversations.map((conversation) => (
          <button
            key={conversation.user._id}
            onClick={() => handleSelectConversation(conversation)}
            className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 text-left ${
              selectedUserId === conversation.user._id ? 'bg-yellow-50 border-l-4 border-l-primary' : ''
            }`}
          >
            <div className="flex items-start space-x-3">
              {/* Avatar */}
              <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                conversation.user.role === 'admin'
                  ? 'bg-gradient-to-r from-red-400 to-red-500'
                  : conversation.user.role === 'astrologer'
                  ? 'bg-gradient-to-r from-purple-400 to-purple-500'
                  : 'bg-gradient-to-r from-blue-400 to-blue-500'
              }`}>
                <span className="text-lg font-semibold text-white">
                  {conversation.user.name?.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Conversation Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`text-sm font-semibold truncate ${
                    conversation.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'
                  }`}>
                    {conversation.user.name}
                  </h3>
                  <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                    {formatMessageTime(conversation.lastMessageTime)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <p className={`text-sm truncate ${
                    conversation.unreadCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-600'
                  }`}>
                    {conversation.isSentByUser && (
                      <span className="text-gray-500 mr-1">You:</span>
                    )}
                    {conversation.lastMessage}
                  </p>

                  {conversation.unreadCount > 0 && (
                    <span className="ml-2 flex-shrink-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary rounded-full">
                      {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                    </span>
                  )}
                </div>

                {/* Role Badge */}
                <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded-full ${
                  conversation.user.role === 'admin'
                    ? 'bg-red-100 text-red-800'
                    : conversation.user.role === 'astrologer'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {conversation.user.role}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Refresh Button */}
      <div className="p-3 border-t border-gray-200">
        <button
          onClick={loadConversations}
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

export default ConversationList
