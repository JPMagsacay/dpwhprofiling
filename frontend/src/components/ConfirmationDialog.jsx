import { useEffect } from 'react'
import './ConfirmationDialog.css'

export default function ConfirmationDialog({
  isOpen,
  title,
  message,
  type = 'warning', // 'warning', 'danger', 'info'
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false,
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onCancel()
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return '🚨'
      case 'warning':
        return '⚠️'
      case 'info':
        return 'ℹ️'
      default:
        return '⚠️'
    }
  }

  return (
    <div className="confirmationDialog-overlay" onClick={handleBackdropClick}>
      <div className="confirmationDialog">
        <div className="confirmationDialog__header">
          <div className="confirmationDialog__icon">
            {getIcon()}
          </div>
          <h3 className="confirmationDialog__title">{title}</h3>
        </div>
        
        <div className="confirmationDialog__body">
          <div className="confirmationDialog__message">
            {message}
          </div>
        </div>

        <div className="confirmationDialog__actions">
          <button
            className="btn btn--secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            className={`btn btn--${type === 'danger' ? 'danger' : 'primary'}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
