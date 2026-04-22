import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { http } from '../../services/http'
import Modal from '../../components/ui/Modal'
import ProfileFormModal from '../../components/common/ProfileFormModal'

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
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pageData, setPageData] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [previousDataCount, setPreviousDataCount] = useState(3) // Track previous count

  const query = useMemo(() => q.trim(), [q])
  const statusQuery = useMemo(() => statusFilter.trim(), [statusFilter])

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
        const params = {}
        if (query) params.q = query
        if (statusQuery) params.employment_status = statusQuery
        const res = await http.get('/employee-profiles', { params: Object.keys(params).length > 0 ? params : {} })
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
  }, [query, statusQuery])

  const handleModalSuccess = (newProfile) => {
    // Refresh the list to show the new profile
    setPageData(prev => ({
      ...prev,
      data: [newProfile, ...(prev?.data || [])]
    }))
  }

  const handleClearFilters = () => {
    setQ('')
    setStatusFilter('')
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
            <button type="button" className="btn btn--primary btn--add-profile" onClick={() => setIsModalOpen(true)}>
              <svg className="btn__icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <title>Add Profile</title>
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Profile
            </button>
            <div className="filter-row">
              <input
                className="input input--compact"
                placeholder="Search by surname or given name…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <select
                className="input input--compact"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="Permanent">Permanent</option>
                <option value="Casual">Casual</option>
              </select>
              <button
                type="button"
                className="btn btn--sm btn--warning"
                onClick={handleClearFilters}
                title="Clear filters"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className={`dashboard__main ${pageData ? 'dashboard__main--loaded' : 'dashboard__main--loading'}`}>
      {error ? <div className="card2 card2--error">Failed to load profiles.</div> : null}

      {!loading && pageData?.data?.length === 0 ? (
        <div className="emptyState">
          <div className="emptyState__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-labelledby="emptyStateTitle">
              <title id="emptyStateTitle">No profiles icon</title>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <h3 className="emptyState__title">No profiles yet</h3>
          <p className="emptyState__description">Get started by adding your first employee profile using the button above.</p>
        </div>
      ) : null}

      <div className="profileTableContainer">
        <table className="profileTable">
          <thead>
            <tr>
              <th>Photo</th>
              <th>Name</th>
              <th>Status</th>
              <th>Branch</th>
              <th>Salary</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(pageData?.data || []).map((p) => (
              <tr key={p.id} className="profileTable__row">
                <td className="profileTable__cell profileTable__cell--photo">
                  <Avatar url={p.photo_url} name={p.full_name} />
                </td>
                <td className="profileTable__cell profileTable__cell--name">
                  <Link to={`/profiling/${p.id}`} className="profileTable__nameLink">
                    {p.full_name}
                  </Link>
                </td>
                <td className="profileTable__cell profileTable__cell--status">
                  {p.employment_status && (
                    <span className={`profileTable__status profileTable__status--${p.employment_status.toLowerCase()}`}>
                      {p.employment_status}
                    </span>
                  )}
                </td>
                <td className="profileTable__cell profileTable__cell--branch">
                  {p.branch || '-'}
                </td>
                <td className="profileTable__cell profileTable__cell--salary">
                  ₱{Number(p.base_salary || 0).toLocaleString()}
                </td>
                <td className="profileTable__cell profileTable__cell--actions">
                  <Link to={`/profiling/${p.id}`} className="btn btn--sm btn--primary">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

