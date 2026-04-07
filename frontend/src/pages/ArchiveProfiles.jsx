import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { http } from '../api/http'
import ConfirmationDialog from '../components/ConfirmationDialog'

function Avatar({ url, name }) {
  if (url) return <img className="avatar" src={url} alt={name || 'photo'} />
  const initials = (name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
  return <div className="avatar avatar--fallback">{initials || '?'}</div>
}

export default function ArchiveProfiles() {
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pageData, setPageData] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, profileId: null, profileName: '' })
  const [isDeleting, setIsDeleting] = useState(false)

  const query = useMemo(() => q.trim(), [q])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await http.get('/employee-profiles', {
        params: query ? { archived: true, q: query } : { archived: true },
      })
      setPageData(res.data)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [query])

  async function onDelete(id) {
    const profile = pageData?.data?.find(p => p.id === id)
    const profileName = profile?.full_name || 'Unknown'
    
    setDeleteConfirm({
      isOpen: true,
      profileId: id,
      profileName: profileName
    })
  }

  async function confirmDelete() {
    const { profileId } = deleteConfirm
    setIsDeleting(true)
    
    try {
      await http.delete(`/employee-profiles/${profileId}`)
      await load()
      setDeleteConfirm({ isOpen: false, profileId: null, profileName: '' })
    } catch (error) {
      console.error('Failed to delete profile:', error)
      // You could add an error state here if needed
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="page2">
      <div className="page2__header">
        <div>
          <h1 className="h1">Archived Profiles</h1>
          <p className="p">Delete archived profiles permanently with warning confirmation.</p>
        </div>
        <Link className="btn" to="/profiling">
          ← Back to Active Profiles
        </Link>
      </div>

      <div className="toolbar">
        <input
          className="input"
          placeholder="Search archived profile…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {loading ? <div className="card2">Loading…</div> : null}
      {error ? <div className="card2 card2--error">Failed to load archived profiles.</div> : null}
      {!loading && pageData?.data?.length === 0 ? <div className="card2">No archived profiles.</div> : null}

      <div className="grid">
        {(pageData?.data || []).map((p) => (
          <div key={p.id} className="profileCard">
            <Avatar url={p.photo_url} name={p.full_name} />
            <div className="profileCard__body">
              <div className="profileCard__name">{p.full_name}</div>
              <div className="profileCard__meta">
                {p.position || '—'} · Salary: {Number(p.base_salary || 0).toLocaleString()}
              </div>
              <div className="actions">
                <button className="btn btn--danger" onClick={() => onDelete(p.id)}>
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmationDialog
        isOpen={deleteConfirm.isOpen}
        title="⚠️ PERMANENT DELETION WARNING"
        message={`You are about to permanently delete:\n• Profile: ${deleteConfirm.profileName}\n• All associated attendance records\n• All salary records\n• All related data\n\nThis action CANNOT be undone and will permanently remove all traces of this employee from the system.\n\nDo you want to continue with permanent deletion?`}
        type="danger"
        confirmText="Delete Permanently"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, profileId: null, profileName: '' })}
        isLoading={isDeleting}
      />
    </div>
  )
}

