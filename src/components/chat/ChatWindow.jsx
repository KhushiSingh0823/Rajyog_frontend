import { useState, useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'
import TypingIndicator from './TypingIndicator'
import { getConversation, markMessagesAsRead } from '../../services/chatApi'
import { getSocket, joinConversation, leaveConversation, sendMessage } from '../../services/socket'

const ChatWindow = ({ selectedUser, currentUser }) => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState(null)
  const [isTyping, setIsTyping] = useState(false)

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Load messages and join conversation
  useEffect(() => {
    if (selectedUser) {
      loadMessages()

      // Join conversation room via Socket.IO
      const socket = getSocket()
      if (socket) {
        joinConversation(selectedUser._id, (response) => {
          console.log('Joined conversation:', response)
        })
      }

      // Cleanup: leave conversation when user changes
      return () => {
        const socket = getSocket()
        if (socket) {
          leaveConversation(selectedUser._id)
        }
      }
    }
  }, [selectedUser])

  // Socket.IO event listeners
  useEffect(() => {
    const socket = getSocket()
    if (!socket || !selectedUser) return

    // Handle incoming messages
    const handleMessageReceive = (data) => {
      // Backend might send message in data.data or data.message
      const msg = data?.message || data?.data

      if (msg && msg.sender && msg.sender._id === selectedUser._id) {
        setMessages(prev => [...prev, msg])
        scrollToBottom()

        // Auto mark as read
        markAsRead()
      }
    }

    // Handle typing indicator
    const handleTypingStart = (data) => {
      if (data.userId === selectedUser._id) {
        setIsTyping(true)
      }
    }

    const handleTypingStop = (data) => {
      if (data.userId === selectedUser._id) {
        setIsTyping(false)
      }
    }

    // Handle read receipts
    const handleReadReceipt = (data) => {
      if (data.userId === selectedUser._id) {
        setMessages(prev =>
          prev.map(msg =>
            msg.sender._id === currentUser._id
              ? { ...msg, isRead: true, readAt: data.readAt }
              : msg
          )
        )
      }
    }

    socket.on('message:receive', handleMessageReceive)
    socket.on('typing:user', handleTypingStart)
    socket.on('typing:stop', handleTypingStop)
    socket.on('message:read-receipt', handleReadReceipt)

    return () => {
      socket.off('message:receive', handleMessageReceive)
      socket.off('typing:user', handleTypingStart)
      socket.off('typing:stop', handleTypingStop)
      socket.off('message:read-receipt', handleReadReceipt)
    }
  }, [selectedUser, currentUser])

  // Auto scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await getConversation(selectedUser._id, { limit: 100 })

      if (response.success) {
        setMessages(response.data.messages || [])
        setPagination(response.data.pagination)

        // Mark messages as read if there are unread messages
        if (response.data.unreadCount > 0) {
          markAsRead()
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load messages')
      console.error('Error loading messages:', err)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async () => {
    try {
      await markMessagesAsRead(selectedUser._id)

      // Update message status in local state
      setMessages(prevMessages =>
        prevMessages.map(msg => {
          if (msg.sender._id === selectedUser._id && !msg.isRead) {
            return { ...msg, isRead: true }
          }
          return msg
        })
      )
    } catch (err) {
      console.error('Error marking messages as read:', err)
    }
  }

  const handleSendMessage = (messageText) => {
    if (!messageText.trim()) return

    sendMessage(selectedUser._id, messageText.trim(), (response) => {
      if (response.success) {
        // Backend returns message in response.data
        const msg = response.data || response.message
        if (msg && msg._id && msg.sender) {
          setMessages(prev => [...prev, msg])
          scrollToBottom()
        } else {
          console.error('Invalid message structure in response')
        }
      } else {
        setError(response.message || 'Failed to send message')
        console.error('Failed to send message:', response.message)
      }
    })
  }

  if (!selectedUser) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-50 text-gray-500">
        <svg
          className="w-24 h-24 mb-4 text-gray-300"
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
        <p className="text-lg font-medium">Select a conversation</p>
        <p className="text-sm mt-1">Choose a conversation from the list to start chatting</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Chat Header */}
      <div className="flex items-center space-x-3 p-4 border-b border-gray-200 bg-white">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
          selectedUser.role === 'admin'
            ? 'bg-gradient-to-r from-red-400 to-red-500'
            : selectedUser.role === 'astrologer'
            ? 'bg-gradient-to-r from-purple-400 to-purple-500'
            : 'bg-gradient-to-r from-blue-400 to-blue-500'
        }`}>
          <span className="text-lg font-semibold text-white">
            {selectedUser.name?.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{selectedUser.name}</h3>
          <div className="flex items-center space-x-2">
            <p className="text-sm text-gray-500">{selectedUser.email}</p>
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
              selectedUser.role === 'admin'
                ? 'bg-red-100 text-red-800'
                : selectedUser.role === 'astrologer'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {selectedUser.role}
            </span>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>No messages yet</p>
            <p className="text-sm">Start a conversation with {selectedUser.name}</p>
          </div>
        )}

        {!loading && messages.filter(msg => msg && msg._id && msg.sender).map((message) => (
          <MessageBubble
            key={message._id}
            message={message}
            isOwnMessage={message.sender?._id === currentUser?._id}
          />
        ))}

        {isTyping && <TypingIndicator userName={selectedUser.name} />}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Pagination Info */}
      {pagination && pagination.totalMessages > 0 && (
        <div className="px-4 pt-2 pb-1 text-xs text-gray-500 text-center border-t border-gray-100 bg-white">
          Showing {pagination.totalMessages} message{pagination.totalMessages !== 1 ? 's' : ''}
          {pagination.totalPages > 1 && ` (Page ${pagination.currentPage} of ${pagination.totalPages})`}
        </div>
      )}

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        receiverId={selectedUser._id}
      />
    </div>
  )
}

export default ChatWindow
