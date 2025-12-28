import { useState, useEffect, useRef } from 'react'
import Modal from '../Modal'
import MessageBubble from '../chat/MessageBubble'
import MessageInput from '../chat/MessageInput'
import TypingIndicator from '../chat/TypingIndicator'
import { fetchUserChat, markMessagesAsRead } from '../../services/admin/chatApi'
import { getSocket, joinConversation, leaveConversation, sendMessage, completeConsultation } from '../../services/socket'

const ChatModal = ({ isOpen, onClose, user, currentUser, activeRequestId }) => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [markingAsRead, setMarkingAsRead] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [endingConsultation, setEndingConsultation] = useState(false)

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Load chat messages and join conversation
  useEffect(() => {
    if (isOpen && user) {
      loadMessages();

      // Join conversation room via Socket.IO
      const socket = getSocket()
      if (socket) {
        joinConversation(user._id, (response) => {
          console.log('Joined conversation:', response)
        })
      }

      // Cleanup: leave conversation on modal close
      return () => {
        const socket = getSocket()
        if (socket) {
          leaveConversation(user._id)
        }
      }
    }
  }, [isOpen, user])

  // Socket.IO event listeners
  useEffect(() => {
    const socket = getSocket()
    if (!socket || !user) {
      console.log('⚠️ ChatModal: Socket or user not available');
      return;
    }

    console.log('👂 ChatModal: Setting up Socket.IO event listeners for user:', user.name);

    // Handle incoming messages
    const handleMessageReceive = (data) => {
      try {
        console.log('📨 Received message:receive event');

        // Backend might send message in data.data or data.message
        const msg = data?.message || data?.data;

        // Validate message structure
        if (!msg || !msg.sender || !msg._id) {
          console.error('❌ Invalid message structure received');
          return;
        }

        if (msg.sender._id === user._id) {
          console.log('✅ Message is from current chat user, adding to messages');
          setMessages(prev => [...prev, msg])
          scrollToBottom()

          // Auto mark as read
          markAsRead()
        } else {
          console.log('ℹ️ Message is from different user, ignoring');
        }
      } catch (err) {
        console.error('❌ Error handling message:receive:', err?.message || 'Unknown error');
      }
    }

    // Handle typing indicator
    const handleTypingStart = (data) => {
      console.log('⌨️ Received typing:user event:', data);
      if (data.userId === user._id) {
        console.log('✅ User is typing:', user.name);
        setIsTyping(true)
      }
    }

    const handleTypingStop = (data) => {
      console.log('⌨️ Received typing:stop event:', data);
      if (data.userId === user._id) {
        console.log('✅ User stopped typing:', user.name);
        setIsTyping(false)
      }
    }

    // Handle read receipts
    const handleReadReceipt = (data) => {
      console.log('✓✓ Received message:read-receipt event:', data);
      if (data.userId === user._id) {
        console.log('✅ Updating read status for messages from:', user.name);
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

    console.log('✅ ChatModal: Event listeners registered');

    return () => {
      console.log('🧹 ChatModal: Cleaning up Socket.IO event listeners');
      socket.off('message:receive', handleMessageReceive)
      socket.off('typing:user', handleTypingStart)
      socket.off('typing:stop', handleTypingStop)
      socket.off('message:read-receipt', handleReadReceipt)
    }
  }, [user, currentUser])

  // Auto scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('📥 Loading messages for user:', user._id)
      const response = await fetchUserChat(user._id, { limit: 100 })

      console.log('📨 Received chat response (success):', response?.success)

      if (response && response.success) {
        const messages = response.data?.messages || []
        console.log('💬 Total messages received:', messages.length)

        // Validate and log invalid messages
        const invalidMessages = messages.filter(msg => !msg || !msg._id || !msg.sender)
        if (invalidMessages.length > 0) {
          console.warn('⚠️ Found', invalidMessages.length, 'invalid messages (will be filtered out)')
        }

        setMessages(messages)
        setPagination(response.data?.pagination)
        const unreadCountValue = response.data?.unreadCount || 0
        setUnreadCount(unreadCountValue)

        console.log('✅ Messages loaded successfully')

        // Mark messages as read if there are unread messages
        if (unreadCountValue > 0) {
          markAsRead()
        }
      } else {
        console.error('❌ Invalid response from fetchUserChat')
      }
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to load messages'
      setError(errorMessage)
      console.error('❌ Error loading messages:', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async () => {
    try {
      setMarkingAsRead(true)

      // senderId is the user who sent messages to admin (the user admin is chatting with)
      const response = await markMessagesAsRead(user._id)

      if (response.success) {
        console.log(`Marked ${response.data.messagesMarked} message(s) as read`)

        // Update unread count to 0 after marking as read
        setUnreadCount(0)

        // Update message status in local state
        setMessages(prevMessages =>
          prevMessages.map(msg => {
            // Mark messages from user to admin as read
            if (msg.sender._id === user._id && !msg.isRead) {
              return { ...msg, isRead: true }
            }
            return msg
          })
        )
      }
    } catch (err) {
      console.error('Error marking messages as read:', err)
      // Don't show error to user, just log it
    } finally {
      setMarkingAsRead(false)
    }
  }

  const handleSendMessage = (messageText) => {
    if (!messageText.trim()) return

    sendMessage(user._id, messageText.trim(), (response) => {
      try {
        console.log('📤 Send message response received');
        console.log('   - response.success:', response?.success);
        console.log('   - response.data exists:', !!response?.data);
        console.log('   - response.message exists:', !!response?.message);

        if (response && response.success) {
          // Backend returns message in response.data, not response.message
          const msg = response.data || response.message;

          // Log message structure
          console.log('   - message._id:', msg?._id);
          console.log('   - message.sender exists:', !!msg?.sender);
          console.log('   - message.sender._id:', msg?.sender?._id);
          console.log('   - message.receiver exists:', !!msg?.receiver);
          console.log('   - message.message:', msg?.message);

          // Validate message structure before adding
          if (msg && msg._id && msg.sender && msg.sender._id) {
            console.log('✅ Valid message structure, adding to state');
            setMessages(prev => [...prev, msg])
            scrollToBottom()
          } else {
            console.error('❌ Invalid message structure:');
            console.error('   - Missing _id?', !msg?._id);
            console.error('   - Missing sender?', !msg?.sender);
            console.error('   - Missing sender._id?', !msg?.sender?._id);
            setError('Message sent but structure is invalid')
          }
        } else {
          const errorMsg = response?.message || 'Failed to send message'
          setError(errorMsg)
          console.error('❌ Failed to send message:', errorMsg)
        }
      } catch (err) {
        console.error('❌ Error handling send message response');
        console.error('Error name:', err?.name);
        console.error('Error message:', err?.message);
        setError('Failed to send message')
      }
    })
  }

  const handleEndConsultation = () => {
    if (!activeRequestId) {
      console.warn('⚠️ No active consultation to end')
      return
    }

    if (!window.confirm('Are you sure you want to end this consultation?')) {
      return
    }

    setEndingConsultation(true)

    completeConsultation(activeRequestId, (response) => {
      setEndingConsultation(false)

      if (response && response.success) {
        console.log('✅ Consultation ended successfully')
        alert('Consultation ended successfully')
        onClose()
      } else {
        console.error('❌ Failed to end consultation:', response?.error)
        setError(response?.error || 'Failed to end consultation')
      }
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="max-w-2xl">
      <div className="flex flex-col h-[600px]">
        {/* Chat Header */}
        <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
            <span className="text-lg font-semibold text-gray-900">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{user?.name}</h3>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
          <div className="flex items-center space-x-2">
            {/* End Consultation Button */}
            {activeRequestId && (
              <button
                onClick={handleEndConsultation}
                disabled={endingConsultation}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                title="End consultation"
              >
                {endingConsultation ? (
                  <>
                    <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Ending...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>End Consultation</span>
                  </>
                )}
              </button>
            )}
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
              user?.role === 'admin' ? 'bg-red-100 text-red-800' :
              user?.role === 'astrologer' ? 'bg-purple-100 text-purple-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {user?.role}
            </span>
            {markingAsRead && (
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 flex items-center space-x-1">
                <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Marking as read...</span>
              </span>
            )}
            {!markingAsRead && unreadCount > 0 && (
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 animate-pulse">
                {unreadCount} unread
              </span>
            )}
            {!markingAsRead && unreadCount === 0 && pagination?.totalMessages > 0 && (
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 flex items-center space-x-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>All read</span>
              </span>
            )}
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
              <p className="text-sm">Start a conversation with {user?.name}</p>
            </div>
          )}

          {!loading && messages.filter(msg => msg && msg._id && msg.sender).map((message) => (
            <MessageBubble
              key={message._id}
              message={message}
              isOwnMessage={message.sender?._id === currentUser?._id}
            />
          ))}

          {isTyping && <TypingIndicator userName={user?.name} />}

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
          receiverId={user?._id}
        />
      </div>
    </Modal>
  )
}

export default ChatModal
