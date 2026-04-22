import { useCallback, useEffect, useState } from 'react'
import { http } from '../services/http'

/**
 * Hook for fetching data with loading and error states
 * @param {string} url
 * @param {object} options
 * @returns {object}
 */
export function useFetch(url, options = {}) {
  const { immediate = true, transform = (data) => data } = options
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const execute = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await http.get(url)
      const transformed = transform(response.data)
      setData(transformed)
      return transformed
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [url, transform])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [immediate, execute])

  return { data, loading, error, execute, setData }
}

/**
 * Hook for API mutations (POST, PUT, DELETE)
 * @returns {object}
 */
export function useMutation() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const mutate = useCallback(async (method, url, data = null) => {
    setLoading(true)
    setError(null)
    try {
      const response = await http[method](url, data)
      return response.data
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { mutate, loading, error }
}
