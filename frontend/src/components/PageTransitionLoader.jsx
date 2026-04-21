import { useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function PageTransitionLoader() {
  const [isLoading, setIsLoading] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 50)

    return () => clearTimeout(timer)
  }, [location.pathname])

  if (!isLoading) return null

  return (
    <div className="page-transition-loading" />
  )
}
