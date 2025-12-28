import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectUser, selectIsAuthenticated } from '../store/authSlice'

const ChatScreen = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const astrologer = location.state?.astrologer
  const user = useSelector(selectUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  // Redirect if not authenticated or no astrologer data
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/chat-with-astrologer')
    }
    if (!astrologer) {
      navigate('/chat-with-astrologer')
    }
  }, [isAuthenticated, astrologer, navigate])

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initial welcome message
  useEffect(() => {
    if (astrologer) {
      setMessages([
        {
          id: 1,
          sender: 'astrologer',
          text: `Hello ${user?.name || 'there'}! I'm ${astrologer.name}. How can I help you today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    }
  }, [astrologer, user])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (message.trim() === '') return

    const newMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages([...messages, newMessage])
    setMessage('')

    // Simulate astrologer typing
    setIsTyping(true)
    setTimeout(() => {
      const astrologerResponse = {
        id: messages.length + 2,
        sender: 'astrologer',
        text: 'Thank you for your message. Let me analyze your query...',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, astrologerResponse])
      setIsTyping(false)
    }, 2000)
  }

  if (!astrologer) {
    return null
  }

  return (
    <div className="flex flex-col bg-gray-50 px-4 sm:px-6 lg:px-8" style={{ minHeight: 'calc(100vh - 12rem)' }}>
      <div className="max-w-4xl mx-auto w-full flex flex-col" style={{ minHeight: 'calc(100vh - 12rem)' }}>
        {/* Astrologer Info Card - Top */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 my-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/chat-with-astrologer')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="relative">
                <img
                  src={astrologer.image}
                  alt={astrologer.name}
                  className="w-16 h-16 rounded-full border-2 border-yellow-100"
                />
                {astrologer.isOnline && (
                  <div className="absolute top-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900">{astrologer.name}</h3>
                <p className="text-sm text-gray-600 mb-1">
                  {astrologer.experience} experience • {astrologer.languages.join(', ')}
                </p>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-700">{astrologer.rating}</span>
                  </div>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm text-gray-600">{astrologer.consultations.toLocaleString()} consultations</span>
                  <span className="text-gray-300">•</span>
                  <span className={`text-sm font-medium ${astrologer.isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                    {astrologer.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">₹{astrologer.pricePerMin}</p>
              <p className="text-sm text-gray-500">per minute</p>
            </div>
          </div>

          {/* Specializations */}
          <div className="flex flex-wrap gap-2 mt-4">
            {astrologer.specialization.map((spec, index) => (
              <span
                key={index}
                className="px-3 py-1 text-sm font-medium bg-yellow-50 text-gray-700 rounded-full border border-yellow-100"
              >
                {spec}
              </span>
            ))}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-y-auto px-4 py-6 space-y-4 mb-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.sender === 'user'
                    ? 'bg-yellow-400 text-gray-900'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <p
                  className={`text-xs mt-1 ${
                    msg.sender === 'user' ? 'text-gray-700' : 'text-gray-500'
                  }`}
                >
                  {msg.timestamp}
                </p>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3 mb-6">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <button
              type="button"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
            </button>

            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
            />

            <button
              type="submit"
              disabled={message.trim() === ''}
              className="p-2 bg-yellow-400 hover:bg-yellow-500 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ChatScreen
