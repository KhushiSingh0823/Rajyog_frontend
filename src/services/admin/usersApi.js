import apiClient from '../../store/api/apiConfig'

/**
 * Fetch all users with pagination
 *
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Users per page (default: 10)
 * @param {string} params.role - Filter by role (optional)
 * @param {string} params.search - Search by name or email (optional)
 *
 * @returns {Promise} Response with users and pagination data
 *
 * Response structure:
 * {
 *   success: boolean,
 *   message: string,
 *   data: {
 *     users: Array<{
 *       _id: string,
 *       name: string,
 *       email: string,
 *       role: string,
 *       createdAt: string,
 *       updatedAt: string
 *     }>,
 *     pagination: {
 *       currentPage: number,
 *       totalPages: number,
 *       totalUsers: number,
 *       usersPerPage: number,
 *       hasNextPage: boolean,
 *       hasPrevPage: boolean
 *     }
 *   }
 * }
 */
export const fetchUsers = async (params = {}) => {
  try {
    const { page = 1, limit = 10, role, search } = params

    // Build query parameters
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })

    if (role) {
      queryParams.append('role', role)
    }

    if (search) {
      queryParams.append('search', search)
    }

    const response = await apiClient.get(`/admin/users?${queryParams.toString()}`)
    return response.data
  } catch (error) {
    console.error('Error fetching users:', error)
    throw error
  }
}

/**
 * Get user by ID
 *
 * @param {string} userId - User ID
 * @returns {Promise} Response with user data
 */
export const fetchUserById = async (userId) => {
  try {
    const response = await apiClient.get(`/admin/users/${userId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching user:', error)
    throw error
  }
}

/**
 * Create new user
 *
 * @param {Object} userData - User data
 * @param {string} userData.name - User name
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @param {string} userData.role - User role
 * @returns {Promise} Response with created user
 */
export const createUser = async (userData) => {
  try {
    const response = await apiClient.post('/admin/users', userData)
    return response.data
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

/**
 * Update user
 *
 * @param {string} userId - User ID
 * @param {Object} userData - Updated user data
 * @returns {Promise} Response with updated user
 */
export const updateUser = async (userId, userData) => {
  try {
    const response = await apiClient.put(`/admin/users/${userId}`, userData)
    return response.data
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

/**
 * Delete user
 *
 * @param {string} userId - User ID
 * @returns {Promise} Response with deletion status
 */
export const deleteUser = async (userId) => {
  try {
    const response = await apiClient.delete(`/admin/users/${userId}`)
    return response.data
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}

/**
 * Update user role
 *
 * @param {string} userId - User ID
 * @param {string} role - New role (user, admin, astrologer)
 * @returns {Promise} Response with updated user
 */
export const updateUserRole = async (userId, role) => {
  try {
    const response = await apiClient.patch(`/admin/users/${userId}/role`, { role })
    return response.data
  } catch (error) {
    console.error('Error updating user role:', error)
    throw error
  }
}

/**
 * Block/Unblock user
 *
 * @param {string} userId - User ID
 * @param {boolean} blocked - Block status
 * @returns {Promise} Response with updated user
 */
export const toggleUserBlock = async (userId, blocked) => {
  try {
    const response = await apiClient.patch(`/admin/users/${userId}/block`, { blocked })
    return response.data
  } catch (error) {
    console.error('Error toggling user block:', error)
    throw error
  }
}
