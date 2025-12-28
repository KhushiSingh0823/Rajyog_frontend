import { formatMessageTime } from '../../utils/formatTime'

const MessageBubble = ({ message, isOwnMessage }) => {
  return (
    <div className={`flex mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
        {/* Sender Name (only for received messages) */}
        {!isOwnMessage && (
          <div className="text-xs text-gray-600 mb-1 ml-1">
            {message.sender?.name || 'Unknown'}
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={`rounded-lg px-4 py-2 ${
            isOwnMessage
              ? 'bg-primary text-gray-900'
              : 'bg-white text-gray-900 border border-gray-200'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.message}
          </p>
        </div>

        {/* Message Info (Time + Read Status) */}
        <div
          className={`flex items-center mt-1 space-x-2 text-xs text-gray-500 ${
            isOwnMessage ? 'justify-end' : 'justify-start'
          } ml-1 mr-1`}
        >
          <span>{formatMessageTime(message.createdAt)}</span>

          {/* Read Status (only for own messages) */}
          {isOwnMessage && (
            <>
              {message.isRead ? (
                <span className="text-blue-500" title="Read">
                  ✓✓
                </span>
              ) : (
                <span className="text-gray-400" title="Sent">
                  ✓
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default MessageBubble
