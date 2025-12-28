import { useState, useEffect } from 'react'
import { getSocket } from '../../services/socket'

const ConsultationRequestPopup = ({ request, onClose }) => {
  const [timeRemaining, setTimeRemaining] = useState(0)

  useEffect(() => {
    // Calculate time remaining until expiry
    const updateTimer = () => {
      const now = new Date()
      const expiresAt = new Date(request.expiresAt)
      const remaining = Math.floor((expiresAt - now) / 1000)
      setTimeRemaining(Math.max(0, remaining))
    }

    updateTimer()
    const timer = setInterval(updateTimer, 1000)

    return () => clearInterval(timer)
  }, [request.expiresAt])

  const handleAccept = () => {
    const socket = getSocket()
    console.log('✅ Astrologer accepting consultation request:', request.requestId)

    socket.emit('consultation:accept',
      { requestId: request.requestId },
      (response) => {
        if (response && response.success) {
          console.log('✅ Request accepted successfully:', response)
          // Pass both user and requestId to track active consultation
          onClose(response.user, request.requestId)
        } else {
          console.error('❌ Failed to accept request:', response?.error)
          alert(response?.error || 'Failed to accept request')
        }
      }
    )
  }

  const handleDecline = () => {
    const socket = getSocket()
    console.log('❌ Astrologer declining consultation request:', request.requestId)

    socket.emit('consultation:decline',
      {
        requestId: request.requestId,
        reason: 'Currently unavailable',
      },
      (response) => {
        if (response && response.success) {
          console.log('✅ Request declined successfully')
          onClose(null) // Just close popup
        } else {
          console.error('❌ Failed to decline request:', response?.error)
          alert(response?.error || 'Failed to decline request')
          onClose(null) // Close anyway
        }
      }
    )
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999] animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full mx-4 shadow-2xl animate-slideUp overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center space-x-2">
              <span>🔔</span>
              <span>New Consultation Request</span>
            </h2>
            <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-semibold">
              Expires in: {formatTime(timeRemaining)}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* User Profile */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-400 to-purple-500 flex items-center justify-center text-white text-2xl font-semibold">
              {request.user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{request.user.name}</h3>
              <p className="text-sm text-gray-600">{request.user.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                {request.user.role}
              </span>
            </div>
          </div>

          {/* Message */}
          {request.message && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Message:</p>
              <p className="text-gray-800 italic">"{request.message}"</p>
            </div>
          )}

          {/* Meta Info */}
          <div className="text-center py-3 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Requested at {new Date(request.requestedAt).toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleDecline}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Accept & Start Chat
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConsultationRequestPopup
