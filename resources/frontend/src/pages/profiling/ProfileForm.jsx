import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { http } from '../../services/http'

function toInputDate(val) {
  if (!val) return ''
  return String(val).slice(0, 10)
}

export default function ProfileForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // Profile fields
  const [surname, setSurname] = useState('')
  const [givenName, setGivenName] = useState('')
  const [middleName, setMiddleName] = useState('')
  const [position, setPosition] = useState('')
  const [designation, setDesignation] = useState('')
  const [employmentStatus, setEmploymentStatus] = useState('')
  const [stationPlaceOfAssignment, setStationPlaceOfAssignment] = useState('')
  const [branch, setBranch] = useState('')
  const [separationDate, setSeparationDate] = useState('')
  const [separationCause, setSeparationCause] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [address, setAddress] = useState('')
  const [baseSalary, setBaseSalary] = useState('0')

  // Photo handling
  const [photo, setPhoto] = useState(null)
  const [removePhoto, setRemovePhoto] = useState(false)
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState(null)
  const [photoError, setPhotoError] = useState(null)

  useEffect(() => {
    let ignore = false
    async function run() {
      setLoading(true)
      setError(null)
      try {
        if (!isEdit) return
        const res = await http.get(`/employee-profiles/${id}`)
        const p = res.data.profile
        if (ignore) return
        setSurname(p.surname || '')
        setGivenName(p.given_name || '')
        setMiddleName(p.middle_name || '')
        setPosition(p.position || '')
        setDesignation(p.designation || '')
        setEmploymentStatus(p.employment_status || '')
        setStationPlaceOfAssignment(p.station_place_of_assignment || '')
        setBranch(p.branch || '')
        setSeparationDate(toInputDate(p.separation_date))
        setSeparationCause(p.separation_cause || '')
        setBirthDate(toInputDate(p.birth_date))
        setAddress(p.address || '')
        setBaseSalary(String(p.base_salary ?? 0))
        setCurrentPhotoUrl(p.photo_url || null)
      } catch (e) {
        if (!ignore) setError(e)
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    run()
    return () => { ignore = true }
  }, [id, isEdit])

async function onSubmit(e) {
  e.preventDefault()
  setSubmitting(true)
  setError(null)

  if (!surname.trim() || !givenName.trim()) {
    setError({ message: 'Surname and Given Name are required.' })
    setSubmitting(false)
    return
  }

  try {
    const fd = new FormData()

    // ✅ FIXED FIELD NAMES
    fd.set('surname', surname)
    fd.set('given_name', givenName)
    fd.set('middle_name', middleName)

    fd.set('position', position)
    fd.set('designation', designation)
    fd.set('employment_status', employmentStatus)
    fd.set('station_place_of_assignment', stationPlaceOfAssignment)
    fd.set('branch', branch)
    fd.set('separation_date', separationDate || '')
    fd.set('separation_cause', separationCause)
    fd.set('birth_date', birthDate || '')
    fd.set('address', address)
    fd.set('base_salary', baseSalary)

    if (photo) fd.set('photo', photo)
    if (removePhoto) fd.set('remove_photo', '1')

    let res
    if (isEdit) {
      res = await http.post(`/employee-profiles/${id}?_method=PUT`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    } else {
      res = await http.post('/employee-profiles', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }

    const pid = res.data.profile.id
    navigate(`/profiling/${pid}`, { replace: true })

  } catch (e2) {
    console.error(e2)

    // ✅ Better error display
    if (e2.response?.data?.errors) {
      const errors = e2.response.data.errors
      const firstError = Object.values(errors)[0][0]
      setError({ message: firstError })
    } else {
      setError(e2)
    }

  } finally {
    setSubmitting(false)
  }
}

  if (loading) return <div className="page2"><div className="card2">Loading…</div></div>

  return (
    <div className="page2">
      <div className="page2__header">
        <div>
          <h1 className="h1">{isEdit ? 'Edit profile' : 'Add profile'}</h1>
          <p className="p">Save the employee’s details and picture.</p>
        </div>
        <Link className="btn" to="/profiling">Back</Link>
      </div>

      <form className="card2 form2" onSubmit={onSubmit}>
        <div className="form2__grid">
          {/* Section: Personal Information */}
          <div className="form2__section form2__section--full">
            <h3 className="form2__section-title">Personal Information</h3>
          </div>

          {/* Full Name - 3 columns */}
          <div className="form2__row form2__row--3col field2--full">
            <label className="field2">
              <span className="field2__label">Surname *</span>
              <input
                className="input"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                required
                placeholder="Enter surname"
              />
            </label>

            <label className="field2">
              <span className="field2__label">Given Name *</span>
              <input
                className="input"
                value={givenName}
                onChange={(e) => setGivenName(e.target.value)}
                required
                placeholder="Enter given name"
              />
            </label>

            <label className="field2">
              <span className="field2__label">Middle Name</span>
              <input
                className="input"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                placeholder="Enter middle name"
              />
            </label>
          </div>

          <label className="field2">
            <span className="field2__label">Birth Date</span>
            <input
              className="input"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </label>

          <label className="field2 field2--full">
            <span className="field2__label">Address</span>
            <input
              className="input"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter complete address"
            />
          </label>

          <label className="field2">
            <span className="field2__label">Position</span>
            <input
              className="input"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="e.g. Engineer, Admin"
            />
          </label>

          {/* Section: Employment Information */}
          <div className="form2__section form2__section--full">
            <h3 className="form2__section-title">Employment Information</h3>
          </div>

          <label className="field2">
            <span className="field2__label">Designation</span>
            <input
              className="input"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              placeholder="e.g. Senior, Junior"
            />
          </label>

          <label className="field2">
            <span className="field2__label">Employment Status</span>
            <select
              className="input"
              value={employmentStatus}
              onChange={(e) => setEmploymentStatus(e.target.value)}
            >
              <option value="">Select status</option>
              <option value="Permanent">Permanent</option>
              <option value="Casual">Casual</option>
            </select>
          </label>

          <label className="field2 field2--full">
            <span className="field2__label">Station / Place of Assignment</span>
            <input
              className="input"
              value={stationPlaceOfAssignment}
              onChange={(e) => setStationPlaceOfAssignment(e.target.value)}
              placeholder="Enter assigned station or office location"
            />
          </label>

          <label className="field2">
            <span className="field2__label">Branch</span>
            <input
              className="input"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="Enter branch"
            />
          </label>

          <label className="field2">
            <span className="field2__label">Base Salary *</span>
            <input
              className="input"
              type="number"
              min="0"
              step="0.01"
              value={baseSalary}
              onChange={(e) => setBaseSalary(e.target.value)}
              required
              placeholder="0.00"
            />
          </label>

          {/* Section: Separation Details */}
          <div className="form2__section form2__section--full">
            <h3 className="form2__section-title">Separation Details</h3>
          </div>

          <label className="field2">
            <span className="field2__label">Separation Date</span>
            <input
              className="input"
              type="date"
              value={separationDate}
              onChange={(e) => setSeparationDate(e.target.value)}
            />
          </label>

          <label className="field2 field2--full">
            <span className="field2__label">Separation Cause</span>
            <input
              className="input"
              value={separationCause}
              onChange={(e) => setSeparationCause(e.target.value)}
              placeholder="Reason for separation (if applicable)"
            />
          </label>

          {/* Section: Photo */}
          <div className="form2__section form2__section--full">
            <h3 className="form2__section-title">Profile Photo</h3>
          </div>

          <label className="field2 field2--full">
            <span className="field2__label">Photo</span>
            <input
              className="input"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  if (!file.type.startsWith('image/')) {
                    setPhotoError('Please select a valid image file (JPG, PNG, GIF, etc.)')
                    e.target.value = null
                    return
                  }
                  setPhotoError(null)
                  setPhoto(file)
                  setRemovePhoto(false)
                } else {
                  setPhoto(null)
                  setPhotoError(null)
                }
              }}
            />

            {currentPhotoUrl && !photo && (
              <div className="photoRow">
                <img className="photoRow__img" src={currentPhotoUrl.startsWith('http') ? currentPhotoUrl : `http://127.0.0.1:8000${currentPhotoUrl}`} alt="Current" />
                <label className="check">
                  <input
                    type="checkbox"
                    checked={removePhoto}
                    onChange={(e) => setRemovePhoto(e.target.checked)}
                  /> Remove current photo
                </label>
              </div>
            )}

            {photo && (
              <div className="photoRow">
                <img className="photoRow__img" src={URL.createObjectURL(photo)} alt="Preview" />
              </div>
            )}

            {photoError && (
              <div className="alert" style={{ marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#dc2626', fontSize: '1rem' }}>⚠️</span>
                  <span>{photoError}</span>
                </div>
                <button
                  type="button"
                  className="btn btn--sm"
                  onClick={() => setPhotoError(null)}
                  style={{ marginTop: '0.25rem' }}
                >
                  Dismiss
                </button>
              </div>
            )}
          </label>
        </div>

        {/* Show error */}
        {error && (
          <div className="alert">
            {error.response?.data?.message || error.message || 'Could not save. Check required fields.'}
          </div>
        )}

        <div className="actions">
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  )
}