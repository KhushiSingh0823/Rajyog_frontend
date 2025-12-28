import apiClient from '../../store/api/apiConfig'

/**
 * Fetch all astrologers with pagination
 *
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Astrologers per page (default: 10)
 * @param {string} params.search - Search by name or email (optional)
 *
 * @returns {Promise} Response with astrologers and pagination data
 *
 * Response structure:
 * {
 *   success: boolean,
 *   message: string,
 *   data: {
 *     astrologers: Array<{
 *       _id: string,
 *       user: {
 *         _id: string,
 *         name: string,
 *         email: string,
 *         role: string,
 *         createdAt: string
 *       },
 *       name: string,
 *       isBlocked: boolean,
 *       blockedAt: string | null,
 *       createdAt: string,
 *       updatedAt: string
 *     }>,
 *     pagination: {
 *       currentPage: number,
 *       totalPages: number,
 *       totalAstrologers: number,
 *       astrologersPerPage: number,
 *       hasNextPage: boolean,
 *       hasPrevPage: boolean
 *     }
 *   }
 * }
 */
export const fetchAstrologers = async (params = {}) => {
  try {
    const { page = 1, limit = 10, search } = params

    // Build query parameters
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })

    if (search) {
      queryParams.append('search', search)
    }

    const response = await apiClient.get(`/admin/astrologers?${queryParams.toString()}`)
    return response.data
  } catch (error) {
    console.error('Error fetching astrologers:', error)
    throw error
  }
}

/**
 * Get astrologer by ID
 *
 * @param {string} astrologerId - Astrologer ID
 * @returns {Promise} Response with astrologer data
 */
export const fetchAstrologerById = async (astrologerId) => {
  try {
    const response = await apiClient.get(`/admin/astrologers/${astrologerId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching astrologer:', error)
    throw error
  }
}

/**
 * Create new astrologer
 *
 * @param {Object} astrologerData - Astrologer data
 * @returns {Promise} Response with created astrologer
 */
export const createAstrologer = async (astrologerData) => {
  try {
    const response = await apiClient.post('/admin/astrologers', astrologerData)
    return response.data
  } catch (error) {
    console.error('Error creating astrologer:', error)
    throw error
  }
}

/**
 * Update astrologer
 *
 * @param {string} astrologerId - Astrologer ID
 * @param {Object} astrologerData - Updated astrologer data
 * @returns {Promise} Response with updated astrologer
 */
export const updateAstrologer = async (astrologerId, astrologerData) => {
  try {
    const response = await apiClient.put(`/admin/astrologers/${astrologerId}`, astrologerData)
    return response.data
  } catch (error) {
    console.error('Error updating astrologer:', error)
    throw error
  }
}

/**
 * Delete astrologer
 *
 * @param {string} astrologerId - Astrologer ID
 * @returns {Promise} Response with deletion status
 */
export const deleteAstrologer = async (astrologerId) => {
  try {
    const response = await apiClient.delete(`/admin/astrologers/${astrologerId}`)
    return response.data
  } catch (error) {
    console.error('Error deleting astrologer:', error)
    throw error
  }
}

/**
 * Toggle astrologer block status
 * If blocking: provide a reason
 * If unblocking: reason can be omitted or empty
 *
 * @param {string} astrologerId - Astrologer ID
 * @param {string} reason - Reason for blocking (required when blocking, optional when unblocking)
 * @returns {Promise} Response with updated astrologer
 */
export const toggleAstrologerBlock = async (astrologerId, reason = '') => {
  try {
    const body = reason ? { reason } : {}
    const response = await apiClient.put(`/admin/astrologers/${astrologerId}/block`, body)
    return response.data
  } catch (error) {
    console.error('Error toggling astrologer block:', error)
    throw error
  }
}
