import { useState } from 'react'

export default function Avatar({ 
  url, 
  name, 
  size = 'md', 
  showStatus = false, 
  status = 'online',
  onClick,
  className = '',
  showDetails = false 
}) {
  const [imageError, setImageError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const sizeClasses = {
    xs: 'w-8 h-8 text-xs',
    sm: 'w-10 h-10 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-20 h-20 text-xl',
    '2xl': 'w-24 h-24 text-2xl'
  }

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    busy: 'bg-red-500',
    away: 'bg-yellow-500'
  }

  const initials = (name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')

  const handleImageError = () => {
    setImageError(true)
  }


  const avatarContent = url && !imageError ? (
    <img
      className="w-full h-full object-cover"
      src={url.startsWith('http') ? url : `http://127.0.0.1:8000${url}`}
      alt={name || 'User avatar'}
      onError={handleImageError}
    />
  ) : (
    <div className="w-full h-full flex items-center justify-center font-semibold text-white bg-gradient-to-br from-blue-500 to-purple-600">
      {initials || '?'}
    </div>
  )

  return (
    <div className={`relative inline-block ${className}`}>
      {onClick ? (
        <button
          type="button"
          className={`
            ${sizeClasses[size]} 
            rounded-full 
            overflow-hidden 
            shadow-lg 
            transition-all duration-300 
            ${isHovered ? 'scale-105 shadow-xl' : 'scale-100'}
            cursor-pointer hover:ring-4 hover:ring-blue-100 focus:ring-4 focus:ring-blue-100 focus:outline-none
            border-2 border-white
            p-0
          `}
          onClick={onClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          aria-label={`User avatar for ${name || 'user'}`}
        >
          {avatarContent}
        </button>
      ) : (
        <div
          className={`
            ${sizeClasses[size]} 
            rounded-full 
            overflow-hidden 
            shadow-lg 
            border-2 border-white
          `}
        >
          {avatarContent}
        </div>
      )}
      
      {showStatus && (
        <div
          className={`
            absolute bottom-0 right-0 
            w-3 h-3 
            rounded-full 
            border-2 border-white 
            ${statusColors[status]}
          `}
        />
      )}

      {showDetails && isHovered && name && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap z-50">
          <div className="font-medium">{name}</div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  )
}
