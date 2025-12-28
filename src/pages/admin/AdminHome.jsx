const AdminHome = () => {
  const stats = [
    {
      title: 'Total Users',
      value: '2,543',
      change: '+12%',
      icon: '👥',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Active Sessions',
      value: '156',
      change: '+8%',
      icon: '🧘‍♀️',
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Revenue',
      value: '$12,847',
      change: '+23%',
      icon: '💰',
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      title: 'Products Sold',
      value: '489',
      change: '+15%',
      icon: '🛍️',
      color: 'bg-purple-100 text-purple-600'
    }
  ]

  const recentActivities = [
    {
      user: 'Sarah Johnson',
      action: 'Completed Hatha Yoga session',
      time: '2 minutes ago',
      avatar: '👩‍🦰'
    },
    {
      user: 'Mike Chen',
      action: 'Purchased Meditation Bundle',
      time: '15 minutes ago',
      avatar: '👨‍💼'
    },
    {
      user: 'Emma Wilson',
      action: 'Joined Wellness Premium Pack',
      time: '1 hour ago',
      avatar: '👩‍🎓'
    },
    {
      user: 'David Brown',
      action: 'Booked consultation session',
      time: '2 hours ago',
      avatar: '👨‍🔬'
    }
  ]

  const upcomingEvents = [
    {
      title: 'Morning Yoga Class',
      time: '9:00 AM',
      participants: 25,
      instructor: 'Lisa Patel'
    },
    {
      title: 'Meditation Workshop',
      time: '2:00 PM',
      participants: 15,
      instructor: 'John Smith'
    },
    {
      title: 'Wellness Consultation',
      time: '4:30 PM',
      participants: 8,
      instructor: 'Dr. Maria Rodriguez'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, Admin!</h1>
            <p className="text-gray-600">Here's what's happening with your yoga platform today.</p>
          </div>
          <div className="text-6xl">🧘‍♀️</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
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
        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-lg">{activity.avatar}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                    <p className="text-sm text-gray-600">{activity.action}</p>
                  </div>
                  <div className="text-xs text-gray-500">{activity.time}</div>
                </div>
              ))}
            </div>
            <button className="mt-4 text-sm text-primary hover:underline">
              View all activities →
            </button>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{event.title}</p>
                    <p className="text-xs text-gray-600">Instructor: {event.instructor}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{event.time}</p>
                    <p className="text-xs text-gray-600">{event.participants} participants</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 text-sm text-primary hover:underline">
              Manage schedule →
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-primary hover:bg-gray-50 transition-colors duration-200">
            <span className="text-2xl mb-2">➕</span>
            <span className="text-sm font-medium text-gray-700">Add User</span>
          </button>
          <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-primary hover:bg-gray-50 transition-colors duration-200">
            <span className="text-2xl mb-2">🧘‍♀️</span>
            <span className="text-sm font-medium text-gray-700">New Service</span>
          </button>
          <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-primary hover:bg-gray-50 transition-colors duration-200">
            <span className="text-2xl mb-2">📊</span>
            <span className="text-sm font-medium text-gray-700">View Reports</span>
          </button>
          <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-primary hover:bg-gray-50 transition-colors duration-200">
            <span className="text-2xl mb-2">⚙️</span>
            <span className="text-sm font-medium text-gray-700">Settings</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminHome