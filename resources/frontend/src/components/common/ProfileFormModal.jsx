import { useEffect, useState } from 'react'
import { http } from '../../services/http'

function toInputDate(val) {
  if (!val) return ''
  return String(val).slice(0, 10)
}

export default function ProfileFormModal({ isOpen, onClose, onSuccess, editId = null }) {
  const isEdit = Boolean(editId)

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
  const [isDragging, setIsDragging] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(null)

  useEffect(() => {
    if (!isOpen) return

    let ignore = false
    async function run() {
      setLoading(true)
      setError(null)
      
      // Reset form for new profile
      if (!isEdit) {
        if (ignore) return
        setSurname('')
        setGivenName('')
        setMiddleName('')
        setPosition('')
        setDesignation('')
        setEmploymentStatus('')
        setStationPlaceOfAssignment('')
        setBranch('')
        setSeparationDate('')
        setSeparationCause('')
        setBirthDate('')
        setAddress('')
        setBaseSalary('0')
        setPhoto(null)
        setRemovePhoto(false)
        setCurrentPhotoUrl(null)
        setPhotoError(null)
        setPhotoPreview(null)
        setIsDragging(false)
        setLoading(false)
        return
      }

      // Load existing profile for edit
      try {
        const res = await http.get(`/employee-profiles/${editId}`)
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
        setPhotoPreview(null)
      } catch (e) {
        if (!ignore) setError(e)
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    run()
    return () => { ignore = true }
  }, [editId, isEdit, isOpen])

  function handleFileSelect(file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setPhotoError('Please select a valid image file (JPG, PNG, GIF, etc.)')
      return
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      setPhotoError('File size must be less than 5MB')
      return
    }

    // Clear any previous errors
    setPhotoError(null)
    setPhoto(file)
    setRemovePhoto(false)
    setPhotoPreview(URL.createObjectURL(file))
  }

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
        res = await http.post(`/employee-profiles/${editId}?_method=PUT`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      } else {
        res = await http.post('/employee-profiles', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }

      onSuccess(res.data.profile)
      onClose()

    } catch (e2) {
      console.error(e2)

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

  if (!isOpen) return null

  return (
    <div className="form2">
      <form onSubmit={onSubmit}>
        <div className="form2__grid">
          {/* Personal Information */}
          <div className="form2__section">
            <h3 className="form2__sectionTitle">Personal Information</h3>
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

          {/* Birth Date and Address - 2 columns */}
          <div className="form2__row form2__row--2col field2--full">
            <label className="field2">
              <span className="field2__label">Birth Date</span>
              <input className="input" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
            </label>

            <label className="field2">
              <span className="field2__label">Address</span>
              <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter complete address" />
            </label>
          </div>

          {/* Employment Information */}
          <div className="form2__section">
            <h3 className="form2__sectionTitle">Employment Information</h3>
          </div>

          {/* Position, Designation, Status - 3 columns */}
          <div className="form2__row form2__row--3col field2--full">
            <label className="field2">
              <span className="field2__label">Position</span>
              <input className="input" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="e.g. Engineer, Admin" />
            </label>

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
          </div>

          <label className="field2 field2--full">
            <span className="field2__label">Station / Place of Assignment</span>
            <input
              className="input"
              value={stationPlaceOfAssignment}
              onChange={(e) => setStationPlaceOfAssignment(e.target.value)}
              placeholder="Enter assigned station or office location"
            />
          </label>

          {/* Branch and Base Salary - 2 columns */}
          <div className="form2__row form2__row--2col field2--full">
            <label className="field2">
              <span className="field2__label">Branch</span>
              <input className="input" value={branch} onChange={(e) => setBranch(e.target.value)} placeholder="Enter branch" />
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
          </div>

          {/* Separation Details */}
          <div className="form2__section">
            <h3 className="form2__sectionTitle">Separation Details</h3>
          </div>

          {/* Separation Date and Cause - 2 columns */}
          <div className="form2__row form2__row--2col field2--full">
            <label className="field2">
              <span className="field2__label">Separation Date</span>
              <input
                className="input"
                type="date"
                value={separationDate}
                onChange={(e) => setSeparationDate(e.target.value)}
              />
            </label>

            <label className="field2">
              <span className="field2__label">Separation Cause</span>
              <input
                className="input"
                value={separationCause}
                onChange={(e) => setSeparationCause(e.target.value)}
                placeholder="Reason for separation (if applicable)"
              />
            </label>
          </div>

          {/* Profile Photo */}
          <div className="form2__section">
            <h3 className="form2__sectionTitle">Profile Photo</h3>
          </div>

          <div className="field2 field2--full">
            <span className="field2__label">Photo</span>
            <button
              type="button"
              aria-label="Photo upload area. Drag and drop an image, or press Enter to open file selector."
              className={`upload-area ${isDragging ? 'upload-area--dragging' : ''} ${photo || currentPhotoUrl ? 'upload-area--has-photo' : ''}`}
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={(e) => {
                e.preventDefault()
                setIsDragging(false)
              }}
              onDrop={(e) => {
                e.preventDefault()
                setIsDragging(false)

                const files = e.dataTransfer.files
                if (files.length > 0) {
                  handleFileSelect(files[0])
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  e.currentTarget.querySelector('input[type="file"]')?.click()
                }
              }}
            >
              <input
                className="upload-input"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    handleFileSelect(file)
                  }
                }}
              />
              
              {(photo || currentPhotoUrl) ? (
                <div className="upload-preview">
                  <div className="upload-preview__image">
                    <img 
                      src={photo ? URL.createObjectURL(photo) : (currentPhotoUrl.startsWith('http') ? currentPhotoUrl : `http://127.0.0.1:8000${currentPhotoUrl}`)} 
                      alt="Preview" 
                    />
                  </div>
                  <div className="upload-preview__overlay">
                    <div className="upload-preview__actions">
                      <label className="btn btn--sm btn--outline">
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              handleFileSelect(file)
                            }
                          }}
                        />
                        Change Photo
                      </label>
                      {currentPhotoUrl && !photo && (
                        <label className="btn btn--sm btn--danger">
                          <input
                            type="checkbox"
                            checked={removePhoto}
                            onChange={(e) => setRemovePhoto(e.target.checked)}
                            style={{ display: 'none' }}
                          />
                          {removePhoto ? 'Keep Photo' : 'Remove Photo'}
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <div className="upload-placeholder__icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <title>Upload photo icon</title>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <div className="upload-placeholder__text">
                    <p className="upload-placeholder__title">Drop photo here or click to browse</p>
                    <p className="upload-placeholder__subtitle">Supports: JPG, PNG, GIF, WebP (Max 5MB)</p>
                  </div>
                  <span className="btn btn--outline">
                    Choose Photo
                  </span>
                </div>
              )}
            </button>

            {/* Show photo error */}
            {photoError && (
              <div className="upload-error">
                <div className="upload-error__content">
                  <span className="upload-error__icon">⚠️</span>
                  <span className="upload-error__message">{photoError}</span>
                </div>
                <button 
                  type="button"
                  className="upload-error__dismiss" 
                  onClick={() => setPhotoError(null)}
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Show error */}
        {error && (
          <div className="alert">
            {error.response?.data?.message || error.message || 'Could not save. Check required fields.'}
          </div>
        )}

        <div className="actions">
          <button type="button" className="btn" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  )
}
