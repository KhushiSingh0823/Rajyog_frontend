import apiClient from '../../store/api/apiConfig'

/**
 * Fetch conversation between admin and a user
 *
 * @param {string} userId - User ID
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Messages per page (default: 50)
 * @returns {Promise} Response with messages, user details, and pagination
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
 *       createdAt: string,
 *       updatedAt: string
 *     }>,
 *     user: { _id, name, email, role },
 *     pagination: { currentPage, totalPages, totalMessages, messagesPerPage },
 *     unreadCount: number
 *   }
 * }
 */
export const fetchUserChat = async (userId, params = {}) => {
  try {
    const { page = 1, limit = 50 } = params

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })

    const response = await apiClient.get(`/admin/chat/conversation/${userId}?${queryParams.toString()}`)
    return response.data
  } catch (error) {
    console.error('Error fetching user chat:', error)
    throw error
  }
}

/**
 * Send a message to a user
 *
 * @param {string} userId - User ID
 * @param {string} message - Message content
 * @returns {Promise} Response with sent message
 */
export const sendMessageToUser = async (userId, message) => {
  try {
    const response = await apiClient.post(`/admin/chat/${userId}`, { message })
    return response.data
  } catch (error) {
    console.error('Error sending message:', error)
    throw error
  }
}

/**
 * Get unread message count for a user
 *
 * @param {string} userId - User ID
 * @returns {Promise} Response with unread count
 */
export const getUnreadCount = async (userId) => {
  try {
    const response = await apiClient.get(`/admin/chat/${userId}/unread`)
    return response.data
  } catch (error) {
    console.error('Error fetching unread count:', error)
    throw error
  }
}

/**
 * Mark messages from a sender as read
 * Marks all unread messages from the specified sender to the current user (admin) as read
 *
 * @param {string} senderId - The ID of the user who sent the messages (the user admin is chatting with)
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
 * Get all admin conversations
 * Fetches list of all users admin has chatted with
 *
 * @returns {Promise} Response with conversations list
 *
 * Response structure:
 * {
 *   success: true,
 *   message: "All user conversations fetched successfully",
 *   data: {
 *     conversations: Array<{
 *       user: { _id, name, email, role },
 *       lastMessage: string,
 *       lastMessageTime: string,
 *       unreadCount: number,
 *       isSentByAdmin: boolean
 *     }>,
 *     totalConversations: number
 *   }
 * }
 */
export const getAdminConversations = async () => {
  try {
    const response = await apiClient.get('/admin/chat/conversations')
    return response.data
  } catch (error) {
    console.error('Error fetching admin conversations:', error)
    throw error
  }
}

/**
 * Get all users with unread message counts
 *
 * @returns {Promise} Response with users and unread counts
 */
export const getAllUnreadCounts = async () => {
  try {
    const response = await apiClient.get('/admin/chat/unread-counts')
    return response.data
  } catch (error) {
    console.error('Error fetching all unread counts:', error)
    throw error
  }
}
