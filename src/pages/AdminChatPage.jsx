import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useSocket } from '../hooks/useSocket'
import AdminList from '../components/chat/AdminList'
import ChatWindow from '../components/chat/ChatWindow'
import { selectUser } from '../store/authSlice'

const AdminChatPage = () => {
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const { isConnected } = useSocket()
  const currentUser = useSelector(selectUser)

  const handleSelectAdmin = (admin) => {
    setSelectedAdmin(admin)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-screen-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Chat with Admin</h1>
              <p className="text-sm text-gray-500 mt-1">
                Get help and support from our admin team
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
            {/* Admin List Sidebar */}
            <div className="col-span-12 md:col-span-4 lg:col-span-3 border-r border-gray-200 h-full">
              <AdminList
                selectedAdminId={selectedAdmin?._id}
                onSelectAdmin={handleSelectAdmin}
              />
            </div>

            {/* Chat Window */}
            <div className="col-span-12 md:col-span-8 lg:col-span-9 h-full">
              <ChatWindow selectedUser={selectedAdmin} currentUser={currentUser} />
            </div>
          </div>
        </div>
      </div>

      {/* Help Text */}
      {!selectedAdmin && (
        <div className="max-w-screen-2xl mx-auto px-4 mt-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <svg
                className="w-5 h-5 text-blue-600 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Need Help?</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Select an admin from the list to start a conversation. Our admin team is here to help you with any questions or concerns.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminChatPage
