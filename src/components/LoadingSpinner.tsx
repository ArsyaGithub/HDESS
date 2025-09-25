import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
  progress?: number
  showProgress?: boolean
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  message = 'Loading...', 
  progress,
  showProgress = false 
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  }

  const containerClasses = {
    sm: 'p-4',
    md: 'p-8',
    lg: 'p-12'
  }

  return (
    <div className={`flex flex-col items-center justify-center ${containerClasses[size]}`}>
      {/* Spinner */}
      <div className="relative">
        <div className={`${sizeClasses[size]} border-4 border-gray-200 rounded-full animate-spin`}>
          <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full"></div>
        </div>
        
        {/* Progress ring overlay */}
        {showProgress && typeof progress === 'number' && (
          <svg 
            className={`absolute inset-0 ${sizeClasses[size]} transform -rotate-90`}
            viewBox="0 0 36 36"
          >
            <path
              className="text-gray-200"
              stroke="currentColor"
              strokeWidth="3"
              fill="transparent"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-blue-500"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${progress}, 100`}
              strokeLinecap="round"
              fill="transparent"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
        )}
      </div>

      {/* Message */}
      {message && (
        <p className="mt-4 text-gray-600 text-center font-medium">
          {message}
        </p>
      )}

      {/* Progress percentage */}
      {showProgress && typeof progress === 'number' && (
        <p className="mt-2 text-sm text-gray-500">
          {Math.round(progress)}%
        </p>
      )}
    </div>
  )
}

export default LoadingSpinner
