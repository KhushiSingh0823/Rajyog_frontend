import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

let socket = null;

/**
 * Initialize Socket.IO connection with JWT token
 * @param {string} token - JWT authentication token
 * @returns {Socket} Socket.IO instance
 */
export const initializeSocket = (token) => {
  console.log('🔧 Initializing Socket.IO...');
  console.log('📡 Socket URL:', SOCKET_URL);
  console.log('🔑 Token provided:', token ? 'Yes ✓' : 'No ✗');

  if (socket) {
    console.log('⚠️ Socket already exists, disconnecting old socket...');
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    auth: {
      token: token,
    },
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  console.log('✅ Socket instance created (not connected yet)');

  // Setup connection event listeners
  socket.on('connect', () => {
    console.log('✅ Socket connected successfully!');
    console.log('🆔 Socket ID:', socket.id);
    console.log('🔗 Connection status:', socket.connected ? 'CONNECTED' : 'DISCONNECTED');
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected');
    console.log('📋 Reason:', reason);
    console.log('🔗 Connection status:', socket.connected ? 'CONNECTED' : 'DISCONNECTED');
  });

  socket.on('connect_error', (error) => {
    console.error('🔴 Socket connection error!');
    console.error('📋 Error:', error.message);
    console.error('🔗 Connection status:', socket?.connected ? 'CONNECTED' : 'DISCONNECTED');
  });

  socket.on('reconnect_attempt', (attemptNumber) => {
    console.log('🔄 Reconnection attempt #', attemptNumber);
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log('✅ Reconnected after', attemptNumber, 'attempts');
  });

  socket.on('reconnect_error', (error) => {
    console.error('🔴 Reconnection error:', error.message);
  });

  socket.on('reconnect_failed', () => {
    console.error('🔴 Reconnection failed after all attempts');
  });

  return socket;
};

/**
 * Connect socket manually
 */
export const connectSocket = () => {
  console.log('🔌 Attempting to connect socket...');
  if (socket && !socket.connected) {
    socket.connect();
    console.log('📤 Socket connect() called');
  } else if (!socket) {
    console.error('❌ Cannot connect: Socket not initialized');
  } else if (socket.connected) {
    console.log('ℹ️ Socket already connected');
  }
};

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
  console.log('🔌 Disconnecting socket...');
  if (socket) {
    socket.disconnect();
    console.log('✅ Socket disconnected');
  } else {
    console.log('ℹ️ No socket to disconnect');
  }
};

/**
 * Get current socket instance
 * @returns {Socket|null}
 */
export const getSocket = () => {
  if (!socket) {
    console.warn('⚠️ getSocket() called but socket is null');
  }
  return socket;
};

/**
 * Check if socket is connected
 * @returns {boolean}
 */
export const isSocketConnected = () => {
  const connected = socket && socket.connected;
  console.log('🔍 Socket connection check:', connected ? 'CONNECTED ✓' : 'DISCONNECTED ✗');
  return connected;
};

/**
 * Join a conversation room
 * @param {string} userId - User ID to chat with
 * @param {Function} callback - Callback function
 */
export const joinConversation = (userId, callback) => {
  console.log('🚪 Joining conversation with user:', userId);
  if (socket) {
    if (socket.connected) {
      socket.emit('conversation:join', { userId }, (response) => {
        console.log('✅ conversation:join response:', response);
        if (callback) callback(response);
      });
      console.log('📤 Event emitted: conversation:join');
    } else {
      console.error('❌ Cannot join conversation: Socket not connected');
    }
  } else {
    console.error('❌ Cannot join conversation: Socket not initialized');
  }
};

/**
 * Leave a conversation room
 * @param {string} userId - User ID to leave chat with
 */
export const leaveConversation = (userId) => {
  console.log('🚪 Leaving conversation with user:', userId);
  if (socket) {
    if (socket.connected) {
      socket.emit('conversation:leave', { userId });
      console.log('📤 Event emitted: conversation:leave');
    } else {
      console.warn('⚠️ Cannot leave conversation: Socket not connected');
    }
  } else {
    console.warn('⚠️ Cannot leave conversation: Socket not initialized');
  }
};

/**
 * Send a message via Socket.IO
 * @param {string} receiverId - Receiver user ID
 * @param {string} message - Message content
 * @param {Function} callback - Callback function
 */
export const sendMessage = (receiverId, message, callback) => {
  console.log('💬 Sending message to:', receiverId);
  console.log('📝 Message content:', message.substring(0, 50) + (message.length > 50 ? '...' : ''));

  if (socket) {
    if (socket.connected) {
      socket.emit('message:send', { receiverId, message }, (response) => {
        console.log('✅ message:send response:', response);
        if (callback) callback(response);
      });
      console.log('📤 Event emitted: message:send');
    } else {
      console.error('❌ Cannot send message: Socket not connected');
      if (callback) callback({ success: false, message: 'Socket not connected' });
    }
  } else {
    console.error('❌ Cannot send message: Socket not initialized');
    if (callback) callback({ success: false, message: 'Socket not initialized' });
  }
};

/**
 * Send typing start indicator
 * @param {string} receiverId - Receiver user ID
 */
export const sendTypingStart = (receiverId) => {
  console.log('⌨️ Sending typing start to:', receiverId);
  if (socket) {
    if (socket.connected) {
      socket.emit('typing:start', { receiverId });
      console.log('📤 Event emitted: typing:start');
    } else {
      console.warn('⚠️ Cannot send typing start: Socket not connected');
    }
  }
};

/**
 * Send typing stop indicator
 * @param {string} receiverId - Receiver user ID
 */
export const sendTypingStop = (receiverId) => {
  console.log('⌨️ Sending typing stop to:', receiverId);
  if (socket) {
    if (socket.connected) {
      socket.emit('typing:stop', { receiverId });
      console.log('📤 Event emitted: typing:stop');
    } else {
      console.warn('⚠️ Cannot send typing stop: Socket not connected');
    }
  }
};

/**
 * Mark messages as read
 * @param {string} senderId - Sender user ID
 */
export const markMessagesRead = (senderId) => {
  console.log('✓✓ Marking messages as read from:', senderId);
  if (socket) {
    if (socket.connected) {
      socket.emit('message:read', { senderId });
      console.log('📤 Event emitted: message:read');
    } else {
      console.warn('⚠️ Cannot mark as read: Socket not connected');
    }
  }
};

/**
 * Complete/end a consultation
 * @param {string} requestId - Consultation request ID
 * @param {Function} callback - Callback function
 */
export const completeConsultation = (requestId, callback) => {
  console.log('🏁 Ending consultation:', requestId);
  if (socket) {
    if (socket.connected) {
      socket.emit('consultation:complete', { requestId }, (response) => {
        console.log('✅ consultation:complete response:', response);
        if (callback) callback(response);
      });
      console.log('📤 Event emitted: consultation:complete');
    } else {
      console.error('❌ Cannot end consultation: Socket not connected');
      if (callback) callback({ success: false, error: 'Socket not connected' });
    }
  } else {
    console.error('❌ Cannot end consultation: Socket not initialized');
    if (callback) callback({ success: false, error: 'Socket not initialized' });
  }
};

export default {
  initializeSocket,
  connectSocket,
  disconnectSocket,
  getSocket,
  isSocketConnected,
  joinConversation,
  leaveConversation,
  sendMessage,
  sendTypingStart,
  sendTypingStop,
  markMessagesRead,
  completeConsultation,
};
