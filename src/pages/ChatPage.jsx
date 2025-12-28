import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useSocket } from '../hooks/useSocket'
import ConversationList from '../components/chat/ConversationList'
import ChatWindow from '../components/chat/ChatWindow'
import { selectUser } from '../store/authSlice'

const ChatPage = () => {
  const [selectedUser, setSelectedUser] = useState(null)
  const { isConnected, activeUsers } = useSocket()
  const currentUser = useSelector(selectUser)

  const handleSelectConversation = (user) => {
    setSelectedUser(user)
  }

  const isUserOnline = (userId) => {
    return activeUsers.includes(userId)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-screen-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              <p className="text-sm text-gray-500 mt-1">
                Chat with astrologers and support
              </p>
            </div>

            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Layout */}
      <div className="max-w-screen-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
          <div className="grid grid-cols-12 h-full">
            {/* Conversations Sidebar */}
            <div className="col-span-12 md:col-span-4 lg:col-span-3 border-r border-gray-200 h-full">
              <ConversationList
                selectedUserId={selectedUser?._id}
                onSelectConversation={handleSelectConversation}
              />
            </div>

            {/* Chat Window */}
            <div className="col-span-12 md:col-span-8 lg:col-span-9 h-full">
              <ChatWindow selectedUser={selectedUser} currentUser={currentUser} />
            </div>
          </div>
        </div>
      </div>

      {/* Active Users Count (Optional) */}
      {activeUsers.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg px-4 py-2 border border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm text-gray-700">
              {activeUsers.length} user{activeUsers.length !== 1 ? 's' : ''} online
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatPage
