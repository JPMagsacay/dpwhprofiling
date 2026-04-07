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

  return (
    <div className="minimal-dialog-overlay" onClick={handleBackdropClick}>
      <div className="minimal-dialog">
        <div className="minimal-dialog__content">
          <h2 className="minimal-dialog__title">{title}</h2>
          <p className="minimal-dialog__message">{message}</p>
        </div>
        
        <div className="minimal-dialog__actions">
          <button
            className="minimal-dialog__btn minimal-dialog__btn--cancel"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            className={`minimal-dialog__btn minimal-dialog__btn--${type}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? '...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
