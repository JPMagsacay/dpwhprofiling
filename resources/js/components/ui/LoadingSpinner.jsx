import '../../styles/components/LoadingSpinner.css'

export default function LoadingSpinner({ message = 'Loading...', size = 'medium', overlay = false }) {
  return (
    <div className={`loading-spinner ${overlay ? 'loading-spinner--overlay' : ''}`}>
      <div className={`loading-spinner__container loading-spinner__container--${size}`}>
        <div className="loading-spinner__dots">
          <div className="loading-spinner__dot"></div>
          <div className="loading-spinner__dot"></div>
          <div className="loading-spinner__dot"></div>
        </div>
        {message && (
          <div className="loading-spinner__message">
            {message}
          </div>
        )}
      </div>
    </div>
  )
}
