import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { initializeSocket, connectSocket, disconnectSocket } from '../services/socket'
import { selectIsAdminAuthenticated, selectAdminToken } from '../store/adminAuthSlice'

/**
 * Custom hook to manage Socket.IO connection for admin users
 * Automatically connects when admin is authenticated
 * Returns socket instance and connection status
 */
export const useAdminSocket = () => {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [activeUsers, setActiveUsers] = useState([])

  const isAuthenticated = useSelector(selectIsAdminAuthenticated)
  const token = useSelector(selectAdminToken)

  useEffect(() => {
    console.log('🎣 useAdminSocket hook: Checking admin authentication...');
    console.log('🔐 isAuthenticated:', isAuthenticated);
    console.log('🔑 token exists:', token ? 'Yes ✓' : 'No ✗');

    if (!isAuthenticated || !token) {
      console.log('❌ useAdminSocket: Not authenticated or no token, disconnecting...');
      // Disconnect if not authenticated
      if (socket) {
        disconnectSocket()
        setSocket(null)
        setIsConnected(false)
      }
      return
    }

    console.log('✅ useAdminSocket: Admin authenticated, initializing socket...');

    // Initialize socket
    const socketInstance = initializeSocket(token)
    setSocket(socketInstance)

    // Connect
    connectSocket()

    // Connection event listeners
    socketInstance.on('connect', () => {
      console.log('✅ useAdminSocket: Socket connected successfully')
      setIsConnected(true)
    })

    socketInstance.on('disconnect', (reason) => {
      console.log('❌ useAdminSocket: Socket disconnected:', reason)
      setIsConnected(false)
    })

    socketInstance.on('connect_error', (error) => {
      console.error('🔴 useAdminSocket: Socket connection error:', error.message)
      setIsConnected(false)

      // If authentication error, admin needs to re-login
      if (error.message === 'Authentication error') {
        console.error('🚨 Admin token expired, needs to re-login')
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

    console.log('✅ useAdminSocket: All event listeners set up');

    // Cleanup on unmount
    return () => {
      console.log('🧹 useAdminSocket: Cleaning up socket connection...');
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
 * Hook to check if a specific user is online (for admin)
 */
export const useAdminUserOnlineStatus = (userId) => {
  const { activeUsers } = useAdminSocket()
  return activeUsers.includes(userId)
}

export default useAdminSocket
