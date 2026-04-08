import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { http } from '../api/http'
import Modal from '../components/Modal'
import ProfileFormModal from '../components/ProfileFormModal'

function Avatar({ url, name }) {
  if (url) {
    // Construct full URL if it's a relative path
    const fullUrl = url.startsWith('http') ? url : `http://127.0.0.1:8000${url}`
    return <img className="avatar" src={fullUrl} alt={name || 'photo'} />
  }
  const initials = (name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
  return <div className="avatar avatar--fallback">{initials || '?'}</div>
}

export default function ProfilingList() {
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pageData, setPageData] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [previousDataCount, setPreviousDataCount] = useState(3) // Track previous count

  const query = useMemo(() => q.trim(), [q])

  // Calculate skeleton count - use previous data count or default
  const getSkeletonCount = useMemo(() => {
    if (loading) {
      return previousDataCount // Use previous count while loading
    }
    return 3 // Default fallback
  }, [loading, previousDataCount])

  useEffect(() => {
    let ignore = false
    let loadingTimeout = null
    
    async function run() {
      setLoading(true)
      setError(null)
      
      // Set timeout to force stop loading after 3 seconds
      loadingTimeout = setTimeout(() => {
        if (!ignore) {
          setLoading(false)
        }
      }, 3000)
      
      try {
        const res = await http.get('/employee-profiles', { params: query ? { q: query } : {} })
        if (!ignore) {
          setPageData(res.data)
          // Update previous count for next loading
          setPreviousDataCount(res.data.data?.length || 3)
        }
      } catch (e) {
        if (!ignore) setError(e)
      } finally {
        if (!ignore) {
          setLoading(false)
          if (loadingTimeout) {
            clearTimeout(loadingTimeout)
          }
        }
      }
    }
    run()
    return () => {
      ignore = true
      if (loadingTimeout) {
        clearTimeout(loadingTimeout)
      }
    }
  }, [query])

  const handleModalSuccess = (newProfile) => {
    // Refresh the list to show the new profile
    setPageData(prev => ({
      ...prev,
      data: [newProfile, ...(prev?.data || [])]
    }))
  }

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div className="dashboard__header-content">
          <h1 className="dashboard__title">Profiling</h1>
          <p className="dashboard__subtitle">Add and manage employee profiles (with photo, details, salary).</p>
        </div>
        <div className="dashboard__header-actions">
          <div className="dashboard__header-actions-column">
            <button className="btn btn--primary btn--add-profile" onClick={() => setIsModalOpen(true)}>
              <svg className="btn__icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Profile
            </button>
            <input
              className="input input--compact"
              placeholder="Search…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="dashboard__main">

      {loading && (
        <div className="grid">
          {[...Array(getSkeletonCount)].map((_, index) => (
            <div key={index} className="profileCard profileCard--skeleton">
              <div className="profileCard__header">
                <div className="avatar avatar--skeleton"></div>
                <div className="profileCard__status profileCard__status--skeleton"></div>
              </div>
              <div className="profileCard__body">
                <div className="profileCard__name profileCard__name--skeleton"></div>
                <div className="profileCard__position profileCard__position--skeleton"></div>
                <div className="profileCard__details">
                  <div className="profileCard__detail">
                    <div className="profileCard__detail-label profileCard__detail-label--skeleton"></div>
                    <div className="profileCard__detail-value profileCard__detail-value--skeleton"></div>
                  </div>
                  <div className="profileCard__detail">
                    <div className="profileCard__detail-label profileCard__detail-label--skeleton"></div>
                    <div className="profileCard__detail-value profileCard__detail-value--skeleton"></div>
                  </div>
                </div>
              </div>
              <div className="profileCard__footer">
                <div className="profileCard__action profileCard__action--skeleton"></div>
              </div>
            </div>
          ))}
        </div>
      )}
      {error ? <div className="card2 card2--error">Failed to load profiles.</div> : null}

      {!loading && pageData?.data?.length === 0 ? <div className="card2">No profiles yet.</div> : null}

      <div className="grid">
        {(pageData?.data || []).map((p) => (
          <Link key={p.id} className="profileCard" to={`/profiling/${p.id}`}>
            <div className="profileCard__header">
              <Avatar url={p.photo_url} name={p.full_name} />
              {p.employment_status && (
                <div className={`profileCard__status profileCard__status--${p.employment_status.toLowerCase()}`}>
                  {p.employment_status}
                </div>
              )}
            </div>
            <div className="profileCard__body">
              <h3 className="profileCard__name">{p.full_name}</h3>
              <div className="profileCard__position">{p.position || 'Position not specified'}</div>
              <div className="profileCard__details">
                <div className="profileCard__detail">
                  <span className="profileCard__detail-label">Salary</span>
                  <span className="profileCard__detail-value">₱{Number(p.base_salary || 0).toLocaleString()}</span>
                </div>
                {p.branch && (
                  <div className="profileCard__detail">
                    <span className="profileCard__detail-label">Branch</span>
                    <span className="profileCard__detail-value">{p.branch}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="profileCard__footer">
              <div className="profileCard__action">
                <span>View Details</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Profile"
        size="large"
      >
        <ProfileFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleModalSuccess}
        />
      </Modal>
    </div>
  )
}

