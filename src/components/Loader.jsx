import React from 'react'

const Loader = ({ fullScreen = true, size = 'large' }) => {
  const sizeClasses = {
    small: { logo: 'h-8 w-auto', ring: 'w-16 h-16' },
    medium: { logo: 'h-16 w-auto', ring: 'w-24 h-24' },
    large: { logo: 'h-40 w-auto', ring: 'w-48 h-48' },
    xlarge: { logo: 'h-48 w-auto', ring: 'w-56 h-56' }
  }

  const containerClasses = fullScreen
    ? "fixed inset-0 flex items-center justify-center z-50"
    : "flex items-center justify-center p-8"

  return (
    <div className={containerClasses}>
      <div className="text-center">
        {/* Animated Logo with Spinning Ring */}
        <div className="relative inline-block">
          {/* Logo */}
          <img
            src="/Logo.png"
            alt="RajYog Logo"
            className={`${sizeClasses[size].logo} animate-pulse mx-auto relative z-10 bg-transparent`}
          />

          {/* Spinning ring around logo */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className={`${sizeClasses[size].ring} border-4 border-primary/30 border-t-primary rounded-full animate-spin`}></div>
          </div>
        </div>

        {/* Loading text */}
        <div className="mt-6">
          <p className="text-gray-900 text-lg font-medium animate-pulse drop-shadow-sm">
            Loading...
          </p>
          <div className="flex justify-center mt-3">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce drop-shadow-sm"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce drop-shadow-sm" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce drop-shadow-sm" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Loader