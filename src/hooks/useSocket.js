import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { initializeSocket, connectSocket, disconnectSocket, getSocket } from '../services/socket'
import { selectIsAuthenticated, selectToken } from '../store/authSlice'

/**
 * Custom hook to manage Socket.IO connection
 * Automatically connects when user is authenticated
 * Returns socket instance and connection status
 */
export const useSocket = () => {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [activeUsers, setActiveUsers] = useState([])

  const isAuthenticated = useSelector(selectIsAuthenticated)
  const token = useSelector(selectToken)

  useEffect(() => {
    console.log('🎣 useSocket hook: Checking authentication...');
    console.log('🔐 isAuthenticated:', isAuthenticated);
    console.log('🔑 token exists:', token ? 'Yes ✓' : 'No ✗');

    if (!isAuthenticated || !token) {
      console.log('❌ useSocket: Not authenticated or no token, disconnecting...');
      // Disconnect if not authenticated
      if (socket) {
        disconnectSocket()
        setSocket(null)
        setIsConnected(false)
      }
      return
    }

    console.log('✅ useSocket: User authenticated, initializing socket...');

    // Initialize socket
    const socketInstance = initializeSocket(token)
    setSocket(socketInstance)

    // Connect
    connectSocket()

    // Connection event listeners
    socketInstance.on('connect', () => {
      console.log('✅ useSocket: Socket connected successfully')
      setIsConnected(true)
    })

    socketInstance.on('disconnect', (reason) => {
      console.log('❌ useSocket: Socket disconnected:', reason)
      setIsConnected(false)
    })

    socketInstance.on('connect_error', (error) => {
      console.error('🔴 useSocket: Socket connection error:', error.message)
      setIsConnected(false)

      // If authentication error, user needs to re-login
      if (error.message === 'Authentication error') {
        // Handle token expiration
        console.error('🚨 Token expired, user needs to re-login')
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

    console.log('✅ useSocket: All event listeners set up');

    // Cleanup on unmount
    return () => {
      console.log('🧹 useSocket: Cleaning up socket connection...');
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
 * Hook to check if a specific user is online
 */
export const useUserOnlineStatus = (userId) => {
  const { activeUsers } = useSocket()
  return activeUsers.includes(userId)
}

export default useSocket
