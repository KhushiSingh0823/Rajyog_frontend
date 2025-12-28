import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { initializeSocket, connectSocket, disconnectSocket } from '../services/socket'
import { selectIsAstrologerAuthenticated, selectAstrologerToken } from '../store/astrologerAuthSlice'

/**
 * Custom hook to manage Socket.IO connection for astrologer users
 * Automatically connects when astrologer is authenticated
 * Returns socket instance and connection status
 */
export const useAstrologerSocket = () => {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [activeUsers, setActiveUsers] = useState([])

  const isAuthenticated = useSelector(selectIsAstrologerAuthenticated)
  const token = useSelector(selectAstrologerToken)

  useEffect(() => {
    console.log('🎣 useAstrologerSocket hook: Checking astrologer authentication...');
    console.log('🔐 isAuthenticated:', isAuthenticated);
    console.log('🔑 token exists:', token ? 'Yes ✓' : 'No ✗');

    if (!isAuthenticated || !token) {
      console.log('❌ useAstrologerSocket: Not authenticated or no token, disconnecting...');
      // Disconnect if not authenticated
      if (socket) {
        disconnectSocket()
        setSocket(null)
        setIsConnected(false)
      }
      return
    }

    console.log('✅ useAstrologerSocket: Astrologer authenticated, initializing socket...');

    // Initialize socket
    const socketInstance = initializeSocket(token)
    setSocket(socketInstance)

    // Connect
    connectSocket()

    // Connection event listeners
    socketInstance.on('connect', () => {
      console.log('✅ useAstrologerSocket: Socket connected successfully')
      setIsConnected(true)
    })

    socketInstance.on('disconnect', (reason) => {
      console.log('❌ useAstrologerSocket: Socket disconnected:', reason)
      setIsConnected(false)
    })

    socketInstance.on('connect_error', (error) => {
      console.error('🔴 useAstrologerSocket: Socket connection error:', error.message)
      setIsConnected(false)

      // If authentication error, astrologer needs to re-login
      if (error.message === 'Authentication error') {
        console.error('🚨 Astrologer token expired, needs to re-login')
      }
    })

    // User presence events
    socketInstance.on('user:online', (data) => {
      console.log('👤 User came online:', data.userId)
      setActiveUsers((prev) => {
        const prevArray = Array.isArray(prev) ? prev : []
        return [...new Set([...prevArray, data.userId])]
      })
    })

    socketInstance.on('user:offline', (data) => {
      console.log('👤 User went offline:', data.userId)
      setActiveUsers((prev) => {
        const prevArray = Array.isArray(prev) ? prev : []
        return prevArray.filter((id) => id !== data.userId)
      })
    })

    socketInstance.on('users:active', (data) => {
      console.log('👥 Active users list received:', data.activeUsers)
      setActiveUsers(Array.isArray(data.activeUsers) ? data.activeUsers : [])
    })

    console.log('✅ useAstrologerSocket: All event listeners set up');

    // Cleanup on unmount
    return () => {
      console.log('🧹 useAstrologerSocket: Cleaning up socket connection...');
      disconnectSocket()
      setSocket(null)
      setIsConnected(false)
    }
  }, [isAuthenticated, token])

  return {
    socket,
    isConnected,
    activeUsers,
  }
}

/**
 * Hook to check if a specific user is online (for astrologer)
 */
export const useAstrologerUserOnlineStatus = (userId) => {
  const { activeUsers } = useAstrologerSocket()
  return activeUsers.includes(userId)
}

export default useAstrologerSocket
