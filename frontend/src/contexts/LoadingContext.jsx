import { createContext, useContext, useState, useRef } from 'react'

const LoadingContext = createContext()

export function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const loadingTimeout = useRef(null)

  const showLoading = (message = 'Loading...') => {
    setLoadingMessage(message)
    setIsLoading(true)
    
    // Clear any existing timeout
    if (loadingTimeout.current) {
      clearTimeout(loadingTimeout.current)
    }
  }

  const hideLoading = () => {
    // Add a small delay to prevent flickering for fast loads
    loadingTimeout.current = setTimeout(() => {
      setIsLoading(false)
      setLoadingMessage('')
    }, 300)
  }

  const value = {
    isLoading,
    loadingMessage,
    showLoading,
    hideLoading
  }

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}
