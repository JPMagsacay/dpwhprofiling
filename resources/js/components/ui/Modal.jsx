import { useEffect, useState } from 'react'

export default function Modal({ isOpen, onClose, title, children, size = 'medium' }) {
  // Ensure theme system has time to initialize before any modal operations
  const [isReady, setIsReady] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 500)
    return () => clearTimeout(timer)
  }, [])
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleEscapeKey = (e) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  const sizeClasses = {
    small: 'modal--small',
    medium: 'modal--medium',
    large: 'modal--large',
    fullscreen: 'modal--fullscreen'
  }

  // Removed body manipulation to prevent theme system interference

  useEffect(() => {
    const handleKeyDown = (e) => handleEscapeKey(e)
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open')
    } else {
      document.body.classList.remove('modal-open')
    }
    return () => document.body.classList.remove('modal-open')
  }, [isOpen])

  if (!isOpen || !isReady) return null

  return (
    <div className="modal__backdrop" onClick={handleBackdropClick}>
      <div className={`modal__content ${sizeClasses[size]}`}>
        <div className="modal__header">
          <h2 className="modal__title">{title}</h2>
          <button className="modal__close" onClick={onClose} aria-label="Close modal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="modal__body">
          {children}
        </div>
      </div>
    </div>
  )
}
