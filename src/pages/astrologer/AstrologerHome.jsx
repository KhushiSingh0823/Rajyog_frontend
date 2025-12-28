import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSocket } from '../../services/socket'
import ConsultationRequestPopup from '../../components/consultation/ConsultationRequestPopup'

const AstrologerHome = () => {
  const navigate = useNavigate()
  const [incomingRequest, setIncomingRequest] = useState(null)

  // Listen for incoming consultation requests
  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    console.log('🎧 Astrologer listening for consultation requests')

    const handleIncomingRequest = (data) => {
      console.log('🔔 Incoming consultation request:', data)

      // Play notification sound (optional)
      try {
        const audio = new Audio('/notification.mp3')
        audio.play().catch(err => console.log('Could not play sound:', err))
      } catch (err) {
        console.log('Audio not available')
      }

      // Show popup
      setIncomingRequest(data)
    }

    const handleRequestCancelled = (data) => {
      console.log('🚫 Request cancelled by user:', data)

      // If this is the current popup, close it
      if (incomingRequest && incomingRequest.requestId === data.requestId) {
        setIncomingRequest(null)
        alert(`${data.userName} cancelled their request`)
      }
    }

    socket.on('consultation:incoming', handleIncomingRequest)
    socket.on('consultation:cancelled', handleRequestCancelled)

    return () => {
      console.log('🧹 Cleaning up consultation listeners')
      socket.off('consultation:incoming', handleIncomingRequest)
      socket.off('consultation:cancelled', handleRequestCancelled)
    }
  }, [incomingRequest])

  const handlePopupClose = (userData) => {
    setIncomingRequest(null)

    if (userData) {
      // Request was accepted, open chat
      alert(`Chat started with ${userData.name}`)
      navigate('/astrologer/users')
    }
  }

  const stats = [
    {
      title: 'Total Consultations',
      value: '342',
      change: '+18%',
      icon: '🔮',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'Active Chats',
      value: '23',
      change: '+5%',
      icon: '💬',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Earnings',
      value: '$8,947',
      change: '+27%',
      icon: '💰',
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'User Rating',
      value: '4.8/5',
      change: '+0.3',
      icon: '⭐',
      color: 'bg-yellow-100 text-yellow-600'
    }
  ]

  const recentConsultations = [
    {
      user: 'Priya Sharma',
      topic: 'Career & Finance Reading',
      time: '5 minutes ago',
      avatar: '👩',
      status: 'completed'
    },
    {
      user: 'Rahul Verma',
      topic: 'Birth Chart Analysis',
      time: '1 hour ago',
      avatar: '👨',
      status: 'completed'
    },
    {
      user: 'Anjali Patel',
      topic: 'Relationship Guidance',
      time: '2 hours ago',
      avatar: '👩‍🦱',
      status: 'in-progress'
    },
    {
      user: 'Amit Kumar',
      topic: 'Health & Wellness',
      time: '3 hours ago',
      avatar: '👨‍💼',
      status: 'completed'
    }
  ]

  const upcomingAppointments = [
    {
      user: 'Neha Singh',
      time: '11:00 AM',
      duration: '30 min',
      type: 'Horoscope Reading'
    },
    {
      user: 'Sanjay Mehta',
      time: '2:30 PM',
      duration: '45 min',
      type: 'Kundli Matching'
    },
    {
      user: 'Kavita Reddy',
      time: '5:00 PM',
      duration: '30 min',
      type: 'Gemstone Consultation'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg shadow-sm p-6 border border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, Astrologer!</h1>
            <p className="text-gray-700">Ready to guide your clients through cosmic wisdom today.</p>
          </div>
          <div className="text-6xl">🔮</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-sm text-green-600 mt-1">{stat.change} from last month</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.color}`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Consultations */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Consultations</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentConsultations.map((consultation, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-lg">{consultation.avatar}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{consultation.user}</p>
                    <p className="text-sm text-gray-600">{consultation.topic}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{consultation.time}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                      consultation.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {consultation.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 text-sm text-purple-600 hover:text-purple-700 font-medium">
              View all consultations →
            </button>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {upcomingAppointments.map((appointment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{appointment.user}</p>
                    <p className="text-xs text-gray-600">{appointment.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-purple-700">{appointment.time}</p>
                    <p className="text-xs text-gray-600">{appointment.duration}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 text-sm text-purple-600 hover:text-purple-700 font-medium">
              Manage schedule →
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-colors duration-200">
            <span className="text-2xl mb-2">💬</span>
            <span className="text-sm font-medium text-gray-700">View Chats</span>
          </button>
          <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-colors duration-200">
            <span className="text-2xl mb-2">📅</span>
            <span className="text-sm font-medium text-gray-700">Appointments</span>
          </button>
          <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-colors duration-200">
            <span className="text-2xl mb-2">📊</span>
            <span className="text-sm font-medium text-gray-700">View Reports</span>
          </button>
          <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-colors duration-200">
            <span className="text-2xl mb-2">⚙️</span>
            <span className="text-sm font-medium text-gray-700">Settings</span>
          </button>
        </div>
      </div>

      {/* Tips & Insights */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-sm p-6 text-white">
        <div className="flex items-start space-x-4">
          <div className="text-4xl">💡</div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">Today's Cosmic Insight</h3>
            <p className="text-purple-100">
              Mercury is in retrograde today. Advise your clients to be cautious with communication
              and avoid making major decisions. Focus on introspection and review of past situations.
            </p>
          </div>
        </div>
      </div>

      {/* Consultation Request Popup */}
      {incomingRequest && (
        <ConsultationRequestPopup
          request={incomingRequest}
          onClose={handlePopupClose}
        />
      )}
    </div>
  )
}

export default AstrologerHome
