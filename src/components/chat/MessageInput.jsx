import { useState, useRef, useEffect } from 'react'
import { sendTypingStart, sendTypingStop } from '../../services/socket'

const MessageInput = ({ onSendMessage, receiverId, disabled = false }) => {
  const [message, setMessage] = useState('')
  const typingTimeoutRef = useRef(null)

  const handleInputChange = (e) => {
    setMessage(e.target.value)

    // Send typing indicator
    if (receiverId) {
      sendTypingStart(receiverId)

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingStop(receiverId)
      }, 2000)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (message.trim()) {
      onSendMessage(message.trim())
      setMessage('')

      // Stop typing indicator
      if (receiverId) {
        sendTypingStop(receiverId)
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      if (receiverId) {
        sendTypingStop(receiverId)
      }
    }
  }, [receiverId])

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2 p-4 border-t border-gray-200 bg-white">
      <input
        type="text"
        value={message}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder="Type a message..."
        disabled={disabled}
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
      <button
        type="submit"
        disabled={disabled || !message.trim()}
        className="px-6 py-2 bg-primary text-gray-900 rounded-lg font-medium hover:bg-yellow-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
        <span>Send</span>
      </button>
    </form>
  )
}

export default MessageInput
