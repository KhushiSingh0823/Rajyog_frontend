import { useState, useEffect } from 'react'
import { getSocket } from '../../services/socket'

const WaitingForAcceptance = ({ astrologer, requestId, onCancel }) => {
  const [timeElapsed, setTimeElapsed] = useState(0)

  useEffect(() => {
    // Update timer every second
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleCancel = () => {
    const socket = getSocket()
    if (socket && requestId) {
      console.log('🚫 User cancelling consultation request:', requestId)
      socket.emit('consultation:cancel', { requestId }, (response) => {
        if (response && response.success) {
          console.log('✅ Request cancelled successfully')
          onCancel()
        } else {
          console.error('❌ Failed to cancel request:', response?.error)
          // Still close the modal even if cancel failed
          onCancel()
        }
      })
    } else {
      // No socket or requestId, just close
      onCancel()
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Waiting for {astrologer.name}</h2>
        </div>

        {/* Spinner */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          </div>
        </div>

        {/* Astrologer Preview */}
        <div className="text-center mb-6">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-purple-100">
            <img
              src={astrologer.image}
              alt={astrologer.name}
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{astrologer.name}</h3>
          <p className="text-gray-600">is reviewing your request...</p>
        </div>

        {/* Info */}
        <div className="bg-purple-50 rounded-lg p-4 mb-6 text-center">
          <p className="text-sm text-gray-700 mb-2">
            You'll be notified as soon as {astrologer.name} responds
          </p>
          <p className="text-lg font-semibold text-purple-600 mb-1">
            Time elapsed: {formatTime(timeElapsed)}
          </p>
          <p className="text-xs text-gray-500 italic">Request expires in 5 minutes</p>
        </div>

        {/* Cancel Button */}
        <button
          onClick={handleCancel}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          Cancel Request
        </button>
      </div>
    </div>
  )
}

export default WaitingForAcceptance
