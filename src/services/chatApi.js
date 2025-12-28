import apiClient from '../store/api/apiConfig'

/**
 * Get all conversations for the current user
 * Fetches list of all conversations with other users/astrologers/admin
 *
 * @returns {Promise} Response with conversations list
 *
 * Response structure:
 * {
 *   success: true,
 *   message: "Conversations fetched successfully",
 *   data: {
 *     conversations: Array<{
 *       user: { _id, name, email, role },
 *       lastMessage: string,
 *       lastMessageTime: string,
 *       unreadCount: number,
 *       isSentByUser: boolean
 *     }>,
 *     totalConversations: number
 *   }
 * }
 */
export const getAllConversations = async () => {
  try {
    const response = await apiClient.get('/chat/conversations')
    return response.data
  } catch (error) {
    console.error('Error fetching conversations:', error)
    throw error
  }
}

/**
 * Fetch conversation with a specific user
 *
 * @param {string} userId - User ID to chat with
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Messages per page (default: 50)
 * @returns {Promise} Response with messages and pagination
 *
 * Response structure:
 * {
 *   success: true,
 *   message: "Conversation fetched successfully",
 *   data: {
 *     messages: Array<{
 *       _id: string,
 *       sender: { _id, name, email, role },
 *       receiver: { _id, name, email, role },
 *       message: string,
 *       isRead: boolean,
 *       readAt: string | null,
 *       createdAt: string,
 *       updatedAt: string
 *     }>,
 *     user: { _id, name, email, role },
 *     pagination: { currentPage, totalPages, totalMessages, messagesPerPage },
 *     unreadCount: number
 *   }
 * }
 */
export const getConversation = async (userId, params = {}) => {
  try {
    const { page = 1, limit = 50 } = params

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })

    const response = await apiClient.get(`/chat/conversation/${userId}?${queryParams.toString()}`)
    return response.data
  } catch (error) {
    console.error('Error fetching conversation:', error)
    throw error
  }
}

/**
 * Send a message to a user (via REST API)
 * Note: In real-time chat, prefer using Socket.IO sendMessage() from socket service
 *
 * @param {string} receiverId - Receiver user ID
 * @param {string} message - Message content
 * @returns {Promise} Response with sent message
 */
export const sendMessage = async (receiverId, message) => {
  try {
    const response = await apiClient.post(`/chat/${receiverId}`, { message })
    return response.data
  } catch (error) {
    console.error('Error sending message:', error)
    throw error
  }
}

/**
 * Get total unread message count across all conversations
 *
 * @returns {Promise} Response with unread count
 *
 * Response structure:
 * {
 *   success: true,
 *   data: {
 *     unreadCount: number
 *   }
 * }
 */
export const getUnreadCount = async () => {
  try {
    const response = await apiClient.get('/chat/unread')
    return response.data
  } catch (error) {
    console.error('Error fetching unread count:', error)
    throw error
  }
}

/**
 * Mark messages from a sender as read
 * Marks all unread messages from the specified sender to the current user as read
 *
 * @param {string} senderId - The ID of the user who sent the messages
 * @returns {Promise} Response with count of messages marked as read
 *
 * Response structure:
 * {
 *   success: true,
 *   message: "5 message(s) marked as read",
 *   data: {
 *     messagesMarked: 5
 *   }
 * }
 */
export const markMessagesAsRead = async (senderId) => {
  try {
    const response = await apiClient.put(`/chat/read/${senderId}`)
    return response.data
  } catch (error) {
    console.error('Error marking messages as read:', error)
    throw error
  }
}

/**
 * Get list of all astrologers (for initiating chats)
 *
 * @returns {Promise} Response with astrologers list
 */
export const getAstrologers = async () => {
  try {
    const response = await apiClient.get('/astrologers')
    return response.data
  } catch (error) {
    console.error('Error fetching astrologers:', error)
    throw error
  }
}

/**
 * Get list of all available astrologers with availability status
 *
 * @returns {Promise} Response with astrologers list including isAvailable field
 *
 * Response structure:
 * {
 *   success: true,
 *   data: {
 *     astrologers: Array<{
 *       _id: string,
 *       name: string,
 *       user: {
 *         _id: string,
 *         name: string,
 *         email: string,
 *         role: "astrologer",
 *         isAvailable: boolean
 *       },
 *       experience: string,
 *       specialization: string[],
 *       rating: number,
 *       consultations: number
 *     }>
 *   }
 * }
 */
export const getAstrologersList = async () => {
  try {
    const response = await apiClient.get('/astrologer/list')
    return response.data
  } catch (error) {
    console.error('Error fetching astrologers list:', error)
    throw error
  }
}

/**
 * Check consultation status with an astrologer
 * Determines if user can request a new consultation
 *
 * @param {string} astrologerId - Astrologer user ID
 * @returns {Promise} Response with consultation status
 *
 * Response structure:
 * {
 *   success: true,
 *   data: {
 *     canRequest: boolean,      // Can send new request
 *     hasPending: boolean,       // Has pending request
 *     hasActive: boolean,        // Has active consultation
 *     activeRequestId: string    // Active request ID if hasActive is true
 *   }
 * }
 */
export const checkConsultationStatus = async (astrologerId) => {
  try {
    const response = await apiClient.get(`/consultation/status/${astrologerId}`)
    return response.data
  } catch (error) {
    console.error('Error checking consultation status:', error)
    throw error
  }
}

/**
 * Get list of all admins (for initiating chats)
 *
 * @returns {Promise} Response with admins list
 *
 * Response structure:
 * {
 *   success: true,
 *   message: "Admins fetched successfully",
 *   data: {
 *     admins: Array<{
 *       _id: string,
 *       name: string,
 *       email: string,
 *       role: "admin",
 *       createdAt: string
 *     }>,
 *     pagination: {
 *       currentPage: number,
 *       totalPages: number,
 *       totalAdmins: number,
 *       adminsPerPage: number,
 *       hasNextPage: boolean,
 *       hasPrevPage: boolean
 *     }
 *   }
 * }
 */
export const getAdmins = async () => {
  try {
    const response = await apiClient.get('/chat/admins')
    return response.data
  } catch (error) {
    console.error('Error fetching admins:', error)
    throw error
  }
}
