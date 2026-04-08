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

  const query = useMemo(() => q.trim(), [q])

  useEffect(() => {
    let ignore = false
    async function run() {
      setLoading(true)
      setError(null)
      try {
        const res = await http.get('/employee-profiles', { params: query ? { q: query } : {} })
        if (!ignore) setPageData(res.data)
      } catch (e) {
        if (!ignore) setError(e)
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    run()
    return () => {
      ignore = true
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

      {loading ? <div className="card2">Loading…</div> : null}
      {error ? <div className="card2 card2--error">Failed to load profiles.</div> : null}

      {!loading && pageData?.data?.length === 0 ? <div className="card2">No profiles yet.</div> : null}

      <div className="grid">
        {(pageData?.data || []).map((p) => (
          <Link key={p.id} className="profileCard" to={`/profiling/${p.id}`}>
            <Avatar url={p.photo_url} name={p.full_name} />
            <div className="profileCard__body">
              <div className="profileCard__name">{p.full_name}</div>
              <div className="profileCard__meta">
                {p.position || '—'} · Salary: {Number(p.base_salary || 0).toLocaleString()}
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

