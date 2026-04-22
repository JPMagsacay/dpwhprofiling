import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom'
import { http } from '../../services/http'
import ConfirmationDialog from '../../components/ui/ConfirmationDialog'
import '../../styles/pages/ProfileDetails.css'

function calculateWorkingDays(start, end) {
  const startDate = new Date(start)
  const endDate = new Date(end)
  let workingDays = 0

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // 0 = Sunday, 6 = Saturday
      workingDays++
    }
  }

  return workingDays
}

function Tab({ to, children, end, icon }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => (isActive ? 'tab--modern tab--active' : 'tab--modern')}
    >
      {icon && <span className="tab__icon">{icon}</span>}
      {children}
    </NavLink>
  )
}

function Avatar({ url, name }) {
  if (url) {
    const fullUrl = url.startsWith('http') ? url : `http://127.0.0.1:8000${url}`
    return <img className="avatar avatar--lg" src={fullUrl} alt={name || 'photo'} />
  }
  const initials = (name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
  return <div className="avatar avatar--lg avatar--fallback">{initials || '?'}</div>
}

function toInputDate(val) {
  if (!val) return ''
  return String(val).slice(0, 10)
}

function EditProfileModal({ profile, isOpen, onClose, onSave }) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

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

  const [photo, setPhoto] = useState(null)
  const [removePhoto, setRemovePhoto] = useState(false)
  const [photoError, setPhotoError] = useState(null)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    if (profile && isOpen) {
      setSurname(profile.surname || '')
      setGivenName(profile.given_name || '')
      setMiddleName(profile.middle_name || '')
      setPosition(profile.position || '')
      setDesignation(profile.designation || '')
      setEmploymentStatus(profile.employment_status || '')
      setStationPlaceOfAssignment(profile.station_place_of_assignment || '')
      setBranch(profile.branch || '')
      setSeparationDate(toInputDate(profile.separation_date))
      setSeparationCause(profile.separation_cause || '')
      setBirthDate(toInputDate(profile.birth_date))
      setAddress(profile.address || '')
      setBaseSalary(String(profile.base_salary ?? 0))
      setPhoto(null)
      setRemovePhoto(false)
      setPhotoError(null)
      setError(null)
    }
  }, [profile, isOpen])

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

      const res = await http.post(`/employee-profiles/${profile.id}?_method=PUT`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      onSave(res.data.profile)
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
    <div className="modalOverlay" onClick={onClose}>
      <div className="modal modal--lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">Edit Profile</h2>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <form onSubmit={onSubmit} className="modal__body">
          <div className="formGrid">
            {/* Personal Information */}
            <div className="formGrid__section">
              <h3 className="formGrid__sectionTitle">Personal Information</h3>
            </div>

            <div className="formGrid__row formGrid__row--3col">
              <label className="field">
                <span className="field__label">Surname *</span>
                <input
                  className="input"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  required
                  placeholder="Enter surname"
                />
              </label>

              <label className="field">
                <span className="field__label">Given Name *</span>
                <input
                  className="input"
                  value={givenName}
                  onChange={(e) => setGivenName(e.target.value)}
                  required
                  placeholder="Enter given name"
                />
              </label>

              <label className="field">
                <span className="field__label">Middle Name</span>
                <input
                  className="input"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  placeholder="Enter middle name"
                />
              </label>
            </div>

            <div className="formGrid__row formGrid__row--2col">
              <label className="field">
                <span className="field__label">Birth Date</span>
                <input
                  className="input"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </label>

              <label className="field">
                <span className="field__label">Address</span>
                <input
                  className="input"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter complete address"
                />
              </label>
            </div>

            {/* Employment Information */}
            <div className="formGrid__section">
              <h3 className="formGrid__sectionTitle">Employment Information</h3>
            </div>

            <div className="formGrid__row formGrid__row--3col">
              <label className="field">
                <span className="field__label">Position</span>
                <input
                  className="input"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="e.g. Engineer, Admin"
                />
              </label>

              <label className="field">
                <span className="field__label">Designation</span>
                <input
                  className="input"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Senior, Junior"
                />
              </label>

              <label className="field">
                <span className="field__label">Employment Status</span>
                <input
                  className="input"
                  value={employmentStatus}
                  onChange={(e) => setEmploymentStatus(e.target.value)}
                  placeholder="e.g. Permanent, Casual"
                />
              </label>
            </div>

            <label className="field field--full">
              <span className="field__label">Station / Place of Assignment</span>
              <input
                className="input"
                value={stationPlaceOfAssignment}
                onChange={(e) => setStationPlaceOfAssignment(e.target.value)}
                placeholder="Enter assigned station or office location"
              />
            </label>

            <div className="formGrid__row formGrid__row--2col">
              <label className="field">
                <span className="field__label">Branch</span>
                <input
                  className="input"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="Enter branch"
                />
              </label>

              <label className="field">
                <span className="field__label">Base Salary *</span>
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
          <div className="formGrid__section">
            <h3 className="formGrid__sectionTitle">Separation Details</h3>
          </div>

          <div className="formGrid__row formGrid__row--2col">
            <label className="field">
              <span className="field__label">Separation Date</span>
              <input
                className="input"
                type="date"
                value={separationDate}
                onChange={(e) => setSeparationDate(e.target.value)}
              />
            </label>

            <label className="field">
              <span className="field__label">Separation Cause</span>
              <input
                className="input"
                value={separationCause}
                onChange={(e) => setSeparationCause(e.target.value)}
              />
            </label>
          </div>

          {/* Profile Photo */}
          <div className="formGrid__section">
            <h3 className="formGrid__sectionTitle">Profile Photo</h3>
          </div>

          <section className="field field--full">
            <span className="field__label">Photo</span>

            {/* Upload Area with Preview */}
            <section
              aria-label="Photo upload drop zone"
              className={`upload-area ${isDragging ? 'upload-area--dragging' : ''} ${(profile?.photo_url && !removePhoto) || photo ? 'upload-area--has-photo' : ''}`}
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
                  const file = files[0]
                  if (!file.type.startsWith('image/')) {
                    setPhotoError('Please select a valid image file (JPG, PNG, GIF, etc.)')
                    return
                  }
                  setPhotoError(null)
                  setPhoto(file)
                  setRemovePhoto(false)
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

              {/* Show Current or New Photo Preview */}
              {(profile?.photo_url && !photo && !removePhoto) || photo ? (
                <div className="upload-preview">
                  <div className="upload-preview__image">
                    <img
                      src={photo ? URL.createObjectURL(photo) : (profile.photo_url.startsWith('http') ? profile.photo_url : `http://127.0.0.1:8000${profile.photo_url}`)}
                      alt="Photo preview"
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
                              if (!file.type.startsWith('image/')) {
                                setPhotoError('Please select a valid image file (JPG, PNG, GIF, etc.)')
                                return
                              }
                              setPhotoError(null)
                              setPhoto(file)
                              setRemovePhoto(false)
                            }
                          }}
                        />
                        Change Photo
                      </label>
                      {profile?.photo_url && !photo && (
                        <button
                          type="button"
                          className="btn btn--sm btn--danger"
                          onClick={() => setRemovePhoto(true)}
                        >
                          {removePhoto ? 'Keep Photo' : 'Remove Photo'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Upload Placeholder */
                <div className="upload-placeholder">
                  <div className="upload-placeholder__icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <div className="upload-placeholder__text">
                    <p className="upload-placeholder__title">Drop photo here or click to browse</p>
                    <p className="upload-placeholder__subtitle">Supports: JPG, PNG, GIF, WebP (Max 5MB)</p>
                  </div>
                  <button type="button" className="btn btn--outline">
                    Choose Photo
                  </button>
                </div>
              )}
            </section>
          </section>

            {/* Removed Photo Notice */}
            {profile?.photo_url && removePhoto && !photo && (
              <section className="upload-removed-notice">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
                <span>Current photo will be removed. Click "Choose Photo" to add a new one.</span>
                <button
                  type="button" 
                  className="btn btn--sm"
                  onClick={() => setRemovePhoto(false)}
                >
                  Keep Photo
                </button>
              </section>
            )}

            {/* Error Message */}
            {photoError && (
              <section className="upload-error">
                <div className="upload-error__content">
                  <span className="upload-error__icon">⚠️</span>
                  <span className="upload-error__message">{photoError}</span>
                </div>
                <button
                  type="button"
                  className="upload-error__dismiss"
                  onClick={() => setPhotoError(null)}
                  aria-label="Dismiss"
                >
                  ×
                </button>
              </section>
            )}

          {error && (
            <div className="alert" style={{ marginTop: '1rem' }}>
              {error.message || 'Could not save. Check required fields.'}
            </div>
          )}

          </div>

          <div className="modal__footer">
            <button type="button" className="btn btn--secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/** Amount earned for one attendance row (uses rate locked when the day was saved). */
function dayEarnedFromRecord(r, profileBaseSalary) {
  if (!r.present) return 0
  const raw = r.daily_rate != null && r.daily_rate !== '' ? Number(r.daily_rate) : Number(profileBaseSalary || 0)
  return Number.isFinite(raw) ? raw : 0
}

/* =========================
   ATTENDANCE PANEL
========================= */
function AttendancePanel({ profileId, baseSalary }) {
  const [year, setYear] = useState(new Date().getFullYear())
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [present, setPresent] = useState(true)
  const [records, setRecords] = useState([])
  const [allRecords, setAllRecords] = useState([])
  const [reportYear, setReportYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(true)
  const [rangeLoading, setRangeLoading] = useState(false)
  
  // Quick add form states
  const [showAddForm, setShowAddForm] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [newPresent, setNewPresent] = useState(true)
  const [addLoading, setAddLoading] = useState(false)
  
  // Daily records collapse state
  const [dailyRecordsCollapsed, setDailyRecordsCollapsed] = useState(false)
  
  // Month selection state
  const [selectedMonth, setSelectedMonth] = useState('all') // 'all' or 1-12
  
  // Success message state
  const [successMessage, setSuccessMessage] = useState(null)
  
  // Error message state for attendance range
  const [rangeError, setRangeError] = useState(null)
  
  // Bulk selection state
  const [selectedRecords, setSelectedRecords] = useState(new Set())
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)

  // Tab state for switching between Attendance and Salary Report
  const [activeTab, setActiveTab] = useState('attendance') // 'attendance' | 'report'

  const load = useCallback(async () => {
    setLoading(true)
    const [yearRes, allRes] = await Promise.all([
      http.get(`/employee-profiles/${profileId}/attendance`, { params: { year } }),
      http.get(`/employee-profiles/${profileId}/attendance`, { params: { all: true } }),
    ])
    setRecords(yearRes.data.records || [])
    setAllRecords(allRes.data.records || [])
    setLoading(false)
  }, [profileId, year])

  useEffect(() => {
    load()
  }, [load])

  const sortedDailyForYear = useMemo(() => {
    return records
      .filter((r) => {
        if (selectedMonth === 'all') return true
        const recordMonth = new Date(r.date).getMonth() + 1
        return recordMonth === Number(selectedMonth)
      })
      .sort((a, b) => String(a.date).localeCompare(String(b.date)))
  }, [records, selectedMonth])

  const presentCount = useMemo(() => sortedDailyForYear.filter((r) => r.present).length, [sortedDailyForYear])
  const totalCount = sortedDailyForYear.length

  const currentSalary = useMemo(() => {
    return Number(
      sortedDailyForYear.reduce((sum, r) => sum + dayEarnedFromRecord(r, baseSalary), 0).toFixed(2)
    )
  }, [sortedDailyForYear, baseSalary])

  const availableYears = useMemo(() => {
    const years = new Set(
      allRecords
        .map((r) => Number(String(r.date).slice(0, 4)))
        .filter((y) => Number.isFinite(y) && y > 0)
    )
    years.add(new Date().getFullYear())
    years.add(year)
    return Array.from(years).sort((a, b) => b - a)
  }, [allRecords, year])

  useEffect(() => {
    if (!availableYears.length) return
    if (!availableYears.includes(reportYear)) {
      setReportYear(availableYears[0])
    }
  }, [availableYears, reportYear])

  const reportDailyRows = useMemo(() => {
    return allRecords
      .filter((r) => {
        const recordYear = Number(String(r.date).slice(0, 4))
        const recordMonth = new Date(r.date).getMonth() + 1 // 1-12
        
        const yearMatches = recordYear === Number(reportYear)
        const monthMatches = selectedMonth === 'all' || recordMonth === Number(selectedMonth)
        
        return yearMatches && monthMatches
      })
      .sort((a, b) => String(a.date).localeCompare(String(b.date)))
      .map((r) => ({
        ...r,
        dailySalary: dayEarnedFromRecord(r, baseSalary),
      }))
  }, [allRecords, reportYear, selectedMonth, baseSalary])

  const monthlyTotals = useMemo(() => {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ]

    const totals = Array.from({ length: 12 }, (_, i) => ({
      month: monthNames[i],
      total: 0,
    }))

    reportDailyRows.forEach((r) => {
      const m = new Date(r.date).getMonth()
      if (m >= 0 && m < 12) {
        totals[m].total += Number(r.dailySalary || 0)
      }
    })

    return totals.filter((m) => m.total > 0)
  }, [reportDailyRows])

  const yearlyTotals = useMemo(() => {
    const map = new Map()
    allRecords.forEach((r) => {
      const y = Number(String(r.date).slice(0, 4))
      const prev = map.get(y) || 0
      map.set(y, prev + dayEarnedFromRecord(r, baseSalary))
    })

    return Array.from(map.entries())
      .map(([y, total]) => ({ year: y, total }))
      .sort((a, b) => b.year - a.year)
  }, [allRecords, baseSalary])

  const reportYearTotal = useMemo(
    () => reportDailyRows.reduce((sum, r) => sum + Number(r.dailySalary || 0), 0),
    [reportDailyRows]
  )

  async function upsert(e) {
    e.preventDefault()
    if (!startDate || !endDate) return
    
    const today = new Date().toISOString().slice(0, 10)
    if (startDate > today || endDate > today) return
    if (startDate > endDate) return
    
    setRangeLoading(true)
    setRangeError(null)
    try {
      const response = await http.post(`/employee-profiles/${profileId}/attendance/present-range`, {
        start_date: startDate,
        end_date: endDate,
        include_weekends: false // Automatically exclude weekends
      })
      
      // Show success message with salary info
      const data = response.data
      setSuccessMessage({
        totalDays: data.total_days,
        workingDays: data.working_days,
        weekendDays: data.weekend_days,
        salary: data.salary_for_range,
        startDate: data.start_date,
        endDate: data.end_date,
        weekendDates: data.weekend_dates
      })
      
      setStartDate('')
      setEndDate('')
      await load()
    } catch (error) {
      console.error('Error marking attendance range:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Error marking attendance range. Please try again.'
      setRangeError(errorMessage)
    } finally {
      setRangeLoading(false)
    }
  }

  const estimatedSalary = useMemo(() => {
    if (!baseSalary || !startDate || !endDate) return 0
    const workingDays = calculateWorkingDays(startDate, endDate)
    return Number(baseSalary) * workingDays
  }, [baseSalary, startDate, endDate])

  async function addNewRecord() {
    if (!newDate) return
    
    const today = new Date().toISOString().slice(0, 10)
    if (newDate > today) return
    
    setAddLoading(true)
    try {
      await http.post(`/employee-profiles/${profileId}/attendance`, {
        date: newDate,
        present: newPresent
      })
      setNewDate('')
      setNewPresent(true)
      setShowAddForm(false)
      await load()
    } catch (error) {
      console.error('Error adding attendance record:', error)
    } finally {
      setAddLoading(false)
    }
  }

  async function remove(id) {
    await http.delete(`/employee-profiles/${profileId}/attendance/${id}`)
    await load()
  }

  function toggleRecordSelection(recordId) {
    const newSelected = new Set(selectedRecords)
    if (newSelected.has(recordId)) {
      newSelected.delete(recordId)
    } else {
      newSelected.add(recordId)
    }
    setSelectedRecords(newSelected)
  }

  function toggleSelectAll() {
    if (selectedRecords.size === sortedDailyForYear.length && sortedDailyForYear.length > 0) {
      setSelectedRecords(new Set())
    } else {
      setSelectedRecords(new Set(sortedDailyForYear.map(r => r.id)))
    }
  }

  async function confirmBulkDelete() {
    setIsBulkDeleting(true)
    try {
      const deletePromises = Array.from(selectedRecords).map(id => 
        http.delete(`/employee-profiles/${profileId}/attendance/${id}`)
      )
      await Promise.all(deletePromises)
      setSelectedRecords(new Set())
      setBulkDeleteConfirm(false)
      await load()
    } catch (error) {
      console.error('Bulk delete failed:', error)
    } finally {
      setIsBulkDeleting(false)
    }
  }

  return (
    <>
      {/* Pill Tab Navigation */}
      <div className="attendancePanel__tabs">
        <button
          type="button"
          className={`attendancePanel__tab ${activeTab === 'attendance' ? 'attendancePanel__tab--active' : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          Attendance
        </button>
        <button
          type="button"
          className={`attendancePanel__tab ${activeTab === 'report' ? 'attendancePanel__tab--active' : ''}`}
          onClick={() => setActiveTab('report')}
        >
          Attendance Salary Report
        </button>
      </div>

      {activeTab === 'attendance' && (
      <div className="card2">
      {/* Minimal Header */}
      <div className="attendancePanel__headerMinimal">
        <div className="attendancePanel__statsMinimal">
          <span className="attendancePanel__statItem">{presentCount}/{totalCount} days</span>
          <span className="attendancePanel__statItem">₱{Number(currentSalary).toLocaleString()}</span>
        </div>
        <div className="attendancePanel__filtersMinimal">
          <select
            className="input input--compact"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {availableYears.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select
            className="input input--compact"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="all">All Months</option>
            <option value="1">January</option>
            <option value="2">February</option>
            <option value="3">March</option>
            <option value="4">April</option>
            <option value="5">May</option>
            <option value="6">June</option>
            <option value="7">July</option>
            <option value="8">August</option>
            <option value="9">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
          </select>
        </div>
      </div>

      {/* Compact Range Form with Add Day button */}
      <form className="attendancePanel__quickAdd" onSubmit={upsert}>
        <div className="attendancePanel__dateRow">
          <div className="attendancePanel__dateInputs">
            <input
              className="input input--compact"
              type="date"
              value={startDate}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => {
                const nextDate = e.target.value
                setStartDate(nextDate)
                if (nextDate) setYear(new Date(nextDate).getFullYear())
              }}
              required
            />
            <span className="attendancePanel__dateTo">→</span>
            <input
              className="input input--compact"
              type="date"
              value={endDate}
              min={startDate}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => {
                const nextDate = e.target.value
                setEndDate(nextDate)
                if (nextDate) setYear(new Date(nextDate).getFullYear())
              }}
              required
            />
            <button
              type="submit"
              className="btn btn--primary btn--sm"
              disabled={rangeLoading || !startDate || !endDate}
            >
              {rangeLoading ? '...' : 'Mark'}
            </button>
          </div>
          <button
            type="button"
            className="btn btn--sm btn--primary attendancePanel__addDayBtn"
            onClick={() => setShowAddForm(true)}
          >
            + Add day
          </button>
        </div>
        {startDate && endDate && (
          <div className="attendancePanel__preview">
            {calculateWorkingDays(startDate, endDate)} days · ₱{Number(estimatedSalary).toLocaleString()}
          </div>
        )}
      </form>

      {/* Add Day Modal */}
      {showAddForm && (
        <div className="modalOverlay" onClick={() => {
          setShowAddForm(false)
          setNewDate('')
          setNewPresent(true)
        }}>
          <div className="modal modal--sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">Add Attendance Day</h2>
              <button
                type="button"
                className="modal__close"
                onClick={() => {
                  setShowAddForm(false)
                  setNewDate('')
                  setNewPresent(true)
                }}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="modal__body">
              <div className="addDayForm">
                <div className="addDayForm__field">
                  <label className="addDayForm__label">Date</label>
                  <input
                    className="addDayForm__input"
                    type="date"
                    value={newDate}
                    max={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setNewDate(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="addDayForm__field">
                  <label className="addDayForm__label">Attendance Status</label>
                  <div className="addDayForm__checkboxWrap">
                    <input
                      type="checkbox"
                      className="addDayForm__checkbox"
                      id="presentCheck"
                      checked={newPresent}
                      onChange={(e) => setNewPresent(e.target.checked)}
                    />
                    <label htmlFor="presentCheck" style={{ cursor: 'pointer', fontSize: '15px', color: 'var(--text)' }}>
                      Mark as Present
                    </label>
                  </div>
                </div>

                <div style={{ fontSize: '13px', color: 'var(--text)', opacity: 0.7, marginTop: '8px' }}>
                  Employment status and salary will be recorded from profile settings.
                </div>
              </div>
            </div>

            <div className="modal__footer">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => {
                  setShowAddForm(false)
                  setNewDate('')
                  setNewPresent(true)
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={addNewRecord}
                disabled={!newDate || addLoading}
              >
                {addLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {rangeError && (
        <div className="alert" style={{ marginBottom: '1rem', maxWidth: '800px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#dc2626', fontSize: '1.2rem' }}>⚠️</span>
            <div>
              <strong>Error:</strong> {rangeError}
            </div>
          </div>
          <button 
            type="button"
            className="btn btn--sm" 
            onClick={() => setRangeError(null)}
            style={{ marginTop: '0.5rem' }}
          >
            Dismiss
          </button>
        </div>
      )}
      
      {successMessage && (
        <div
          className="swalModal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="swalTitle"
          onClick={(e) => e.target === e.currentTarget && setSuccessMessage(null)}
          onKeyDown={(e) => e.key === 'Escape' && setSuccessMessage(null)}
          tabIndex={-1}
        >
          <div className="swalModal__content">
            <div className="swalModal__icon">
              <div className="swalModal__successRing">
                <svg viewBox="0 0 52 52" aria-label="Success">
                  <title>Success checkmark</title>
                  <circle cx="26" cy="26" r="25" fill="none" />
                  <path fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                </svg>
              </div>
            </div>
            <h2 id="swalTitle" className="swalModal__title">Success!</h2>
            <p className="swalModal__text">Attendance range has been marked successfully.</p>

            <div className="swalModal__details">
              <div className="swalModal__detailRow">
                <span className="swalModal__detailLabel">Date Range (yyyy/mm/dd)</span>
                <span className="swalModal__detailValue">{successMessage.startDate} to {successMessage.endDate}</span>
              </div>
              <div className="swalModal__detailRow">
                <span className="swalModal__detailLabel">Working Days</span>
                <span className="swalModal__detailValue swalModal__detailValue--highlight">{successMessage.workingDays} days</span>
              </div>
              {successMessage.weekendDays > 0 && (
                <div className="swalModal__detailRow">
                  <span className="swalModal__detailLabel">Weekends</span>
                  <span className="swalModal__detailValue swalModal__detailValue--muted">{successMessage.weekendDays} days (no salary)</span>
                </div>
              )}
              <div className="swalModal__detailRow swalModal__detailRow--total">
                <span className="swalModal__detailLabel">Amount</span>
                <span className="swalModal__detailValue swalModal__detailValue--amount">₱{Number(successMessage.salary).toLocaleString()}</span>
              </div>
            </div>

            <p className="swalModal__footerText"> Not saved to yearly records until you use the Salary tab.</p>

            <div className="swalModal__actions">
              <button type="button" className="swalModal__btn swalModal__btn--confirm" onClick={() => setSuccessMessage(null)}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Daily Records - Minimal Header */}
      <div className="attendancePanel__recordsHeader">
        <span className="attendancePanel__recordsTitle">
          {year} {selectedMonth !== 'all' && `- ${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][selectedMonth - 1]}`} Records
        </span>
        <button 
          type="button"
          className="btn btn--sm btn--ghost" 
          onClick={() => setDailyRecordsCollapsed(!dailyRecordsCollapsed)}
        >
          {dailyRecordsCollapsed ? 'Show' : 'Hide'}
        </button>
      </div>
        
        {!dailyRecordsCollapsed && (
          <div className="attendancePanel__tableWrap">
            <div className="table table--salary">
              <div className="table__head">
                <div>Date (yyyy/mm/dd)</div>
                <div>Presence</div>
                <div>Emp. status (recorded)</div>
                <div>Daily ₱</div>
                <div className="table__actions">
                  {selectedRecords.size > 0 && (
                    <>
                      <span className="table__bulkCount">
                        {selectedRecords.size} selected
                      </span>
                      <button
                        type="button"
                        className="btn btn--sm btn--danger"
                        onClick={() => setBulkDeleteConfirm(true)}
                      >
                        Delete Selected
                      </button>
                    </>
                  )}
                  <label className="check check--sm" title="Select all">
                    <input
                      type="checkbox"
                      checked={sortedDailyForYear.length > 0 && selectedRecords.size === sortedDailyForYear.length}
                      onChange={toggleSelectAll}
                      indeterminate={selectedRecords.size > 0 && selectedRecords.size < sortedDailyForYear.length ? true : undefined}
                    />
                  </label>
                </div>
              </div>

              {sortedDailyForYear.map((r) => (
                <div key={r.id} className={`table__row ${selectedRecords.has(r.id) ? 'table__row--selected' : ''}`}>
                  <div>{String(r.date).slice(0, 10)}</div>
                  <div>
                    <span className={r.present ? 'attendancePanel__badge attendancePanel__badge--present' : 'attendancePanel__badge attendancePanel__badge--absent'}>
                      {r.present ? 'Present' : 'Absent'}
                    </span>
                  </div>
                  <div title="Status stored on this attendance row">{r.employment_status_snapshot || '—'}</div>
                  <div>₱{Number(dayEarnedFromRecord(r, baseSalary)).toLocaleString()}</div>
                  <div className="table__actions">
                    <button type="button" className="btn btn--sm" onClick={() => remove(r.id)}>
                      Delete
                    </button>
                    <label className="check check--sm">
                      <input
                        type="checkbox"
                        checked={selectedRecords.has(r.id)}
                        onChange={() => toggleRecordSelection(r.id)}
                      />
                    </label>
                  </div>
                </div>
              ))}
              {!sortedDailyForYear.length && !showAddForm ? (
                <div className="attendancePanel__empty">No attendance rows for {year}. Add a day or use a date range above.</div>
              ) : null}
            </div>
          </div>
        )}
      </div>
      )}

      {activeTab === 'report' && (
      <div className="card2 attendanceReportPrint">
        <div className="row no-print">
          <div className="row__left">
            <div className="h2">Attendance Salary Report</div>
            <div className="p">
              Each day uses the daily rate from when it was recorded. Editing the profile rate does not change past days;
              new attendance uses the latest rate.
            </div>
          </div>
          <div className="row__right inlineForm">
            <select
              className="input"
              value={reportYear}
              onChange={(e) => setReportYear(Number(e.target.value))}
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <select
              className="input"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="all">All Months</option>
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
            <button type="button" className="btn btn--primary" onClick={() => window.print()}>
              Print Attendance Report
            </button>
          </div>
        </div>

        <div className="attendanceReport__title">
        Attendance Salary Report - {reportYear} 
        {selectedMonth !== 'all' && ` - ${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][selectedMonth - 1]}`}
      </div>

        <table className="attendanceReport__table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Presence</th>
              <th>Emp. status (recorded)</th>
              <th>Daily salary</th>
            </tr>
          </thead>
          <tbody>
            {reportDailyRows.map((r) => (
              <tr key={r.id}>
                <td>{String(r.date).slice(0, 10)}</td>
                <td>{r.present ? 'Present' : 'Absent'}</td>
                <td>{r.employment_status_snapshot || '—'}</td>
                <td>₱{Number(r.dailySalary).toLocaleString()}</td>
              </tr>
            ))}
            {!reportDailyRows.length ? (
              <tr>
                <td colSpan="4">No attendance records for {reportYear}.</td>
              </tr>
            ) : null}
          </tbody>
        </table>

        <div className="attendanceReport__summary">
          <div className="h2">Monthly Totals ({reportYear})</div>
          <table className="attendanceReport__table attendanceReport__table--compact">
            <thead>
              <tr>
                <th>Month</th>
                <th>Total Salary</th>
              </tr>
            </thead>
            <tbody>
              {monthlyTotals.map((m) => (
                <tr key={m.month}>
                  <td>{m.month}</td>
                  <td>₱{Number(m.total).toLocaleString()}</td>
                </tr>
              ))}
              <tr>
                <th>Year Total</th>
                <th>₱{Number(reportYearTotal).toLocaleString()}</th>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="attendanceReport__summary">
          <div className="h2">Yearly Totals</div>
          <table className="attendanceReport__table attendanceReport__table--compact">
            <thead>
              <tr>
                <th>Year</th>
                <th>Total Salary</th>
              </tr>
            </thead>
            <tbody>
              {yearlyTotals.map((y) => (
                <tr key={y.year}>
                  <td>{y.year}</td>
                  <td>₱{Number(y.total).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      <ConfirmationDialog
        isOpen={bulkDeleteConfirm}
        title="🗑️ Delete Selected Records"
        message={`Are you sure you want to delete ${selectedRecords.size} selected attendance record(s)?\n\nThis action will permanently remove:\n• ${selectedRecords.size} attendance record(s)\n• Associated salary calculations for these dates\n\nThis action CANNOT be undone.\n\nDo you want to continue with deletion?`}
        type="danger"
        confirmText={`Delete ${selectedRecords.size} Record(s)`}
        cancelText="Cancel"
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteConfirm(false)}
        isLoading={isBulkDeleting}
      />
    </>
  )
}

/* =========================
   SALARY PANEL
========================= */
function SalaryPanel({ profileId, baseSalary, currentStatus }) {
  const [year, setYear] = useState(new Date().getFullYear())
  const [salary, setSalary] = useState(String(baseSalary ?? 0))
  const [records, setRecords] = useState([])
  const [attendanceBasedMin, setAttendanceBasedMin] = useState(null)
  const [salaryError, setSalaryError] = useState('')
  const [recordedStatus, setRecordedStatus] = useState(() => String(currentStatus || ''))
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [useDateRange, setUseDateRange] = useState(false)
  const salarySegmentRef = useRef(`${year}|${String(currentStatus || '').trim()}`)

  useEffect(() => {
    setRecordedStatus(String(currentStatus || ''))
  }, [currentStatus])

  const effectiveEmploymentStatus = useMemo(() => {
    const typed = String(recordedStatus || '').trim()
    return typed !== '' ? typed : String(currentStatus || '').trim()
  }, [recordedStatus, currentStatus])

  const statusSuggestions = useMemo(() => {
    const s = new Set()
    if (currentStatus) s.add(String(currentStatus))
    records.forEach((r) => {
      const v = r.employment_status_snapshot
      if (v) s.add(String(v))
    })
    return Array.from(s).sort((a, b) => a.localeCompare(b))
  }, [records, currentStatus])

  const load = useCallback(async () => {
    const res = await http.get(`/employee-profiles/${profileId}/yearly-salary`)
    const loaded = res.data.records || []


    setRecords(loaded)
  }, [profileId])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    async function syncSalaryInputFromAttendance() {
      setSalaryError('')
      const existing = records.find(
        (r) =>
          Number(r.year) === Number(year) &&
          String(r.employment_status_snapshot || '') === effectiveEmploymentStatus
      )

      const res = await http.get(`/employee-profiles/${profileId}/attendance`, { params: { year } })
      const rows = res.data.records || []
      const attendanceTotal = Number(
        rows
          .filter((r) => {
            if (!r.present) return false
            return String(r.employment_status_snapshot ?? '') === effectiveEmploymentStatus
          })
          .reduce((sum, r) => sum + dayEarnedFromRecord(r, baseSalary), 0)
          .toFixed(2)
      )
      const presentCount = rows.filter(
        (r) => r.present && String(r.employment_status_snapshot ?? '') === effectiveEmploymentStatus
      ).length
      const hasPresent = presentCount > 0
      setAttendanceBasedMin(hasPresent ? attendanceTotal : null)

      const saved = existing ? Number(existing.salary ?? 0) : 0
      const floor = Math.max(attendanceTotal, saved)
      const segmentKey = `${year}|${effectiveEmploymentStatus}`
      const segmentChanged = salarySegmentRef.current !== segmentKey
      salarySegmentRef.current = segmentKey

      // Calculate actual working days for casual employees
      const workingDays = effectiveEmploymentStatus.toLowerCase().trim() === 'casual' 
        ? rows.filter(r => r.present && String(r.employment_status_snapshot ?? '') === effectiveEmploymentStatus).length || 1
        : 1

      if (segmentChanged) {
        const displaySalary = effectiveEmploymentStatus.toLowerCase().trim() === 'casual' 
          ? floor / workingDays 
          : floor
        setSalary(String(displaySalary.toFixed(2)))
        return
      }

      setSalary((prev) => {
        const prevNum = Number(prev || 0)
        const next = Math.max(prevNum, floor)
        const displaySalary = effectiveEmploymentStatus.toLowerCase().trim() === 'casual' 
          ? next / workingDays 
          : next
        return String(displaySalary.toFixed(2))
      })
    }

    syncSalaryInputFromAttendance()
  }, [year, profileId, baseSalary, records, effectiveEmploymentStatus])

  async function upsert(e) {
    e.preventDefault()
    const salaryNumber = Number(salary || 0)
    
    // Validate based on mode
    if (useDateRange) {
      if (!startDate || !endDate) {
        setSalaryError('Please select both start date and end date for the salary record.')
        return
      }
      
      if (startDate > endDate) {
        setSalaryError('Start date cannot be after end date.')
        return
      }
    } else {
      if (!year) {
        setSalaryError('Please enter a year for the salary record.')
        return
      }
    }
    
    const isPermanent = effectiveEmploymentStatus.toLowerCase().trim() === 'permanent'
    
    if (
      isPermanent &&
      attendanceBasedMin !== null &&
      Number.isFinite(salaryNumber) &&
      salaryNumber < attendanceBasedMin
    ) {
      setSalaryError(
        `For ${year} (${effectiveEmploymentStatus || 'status'}), minimum allowed is ${attendanceBasedMin.toLocaleString()}`
      )
      return
    }

    if (!effectiveEmploymentStatus) {
      setSalaryError('Enter employment status for this salary record (or set it on the profile).')
      return
    }

    try {
      setSalaryError('')
      const payload = {
        year,
        salary,
        employment_status: recordedStatus.trim(),
      }
      
      // Only include date fields if using date range mode
      if (useDateRange) {
        payload.start_date = startDate
        payload.end_date = endDate
      }
      
      await http.post(`/employee-profiles/${profileId}/yearly-salary`, payload)
      await load()
      // Reset form fields after successful save
      setStartDate('')
      setEndDate('')
    } catch (err) {
      const msg = err?.response?.data?.errors?.salary?.[0] || err?.response?.data?.message
      if (msg) setSalaryError(String(msg))
      else throw err
    }
  }

  async function remove(id) {
    await http.delete(`/employee-profiles/${profileId}/yearly-salary/${id}`)
    await load()
  }

  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => {
      if (Number(b.year) !== Number(a.year)) return Number(b.year) - Number(a.year)
      return String(a.employment_status_snapshot || '').localeCompare(String(b.employment_status_snapshot || ''))
    })
  }, [records])

  return (
    <div className="card2">
      <div className="card2__header">
        <div className="card2__icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <div className="card2__title">Yearly salary records</div>
      </div>

      <form className="salaryPanelForm" onSubmit={upsert}>
        {/* Add New Record Section */}
        <div className="card2__section">
          <div className="card2__sectionTitle">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add New Record
          </div>

          {/* Period Type - Top Row */}
          <label className="salaryPanelForm__periodTypeRow">
            <span className="salaryPanelForm__caption">Period Type</span>
            <div className="modeToggleGroup">
              <label className={`modeToggleOption ${!useDateRange ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="dateMode"
                  checked={!useDateRange}
                  onChange={() => {
                    setUseDateRange(false)
                    setYear(new Date().getFullYear())
                  }}
                />
                <span>Full Year</span>
              </label>
              <label className={`modeToggleOption ${useDateRange ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="dateMode"
                  checked={useDateRange}
                  onChange={() => {
                    setUseDateRange(true)
                    setStartDate('')
                    setEndDate('')
                  }}
                />
                <span>Date Range</span>
              </label>
            </div>
          </label>

          {/* Three Column Row: Employment Status | Year | Salary Amount */}
          <div className={`salaryPanelForm__threeColumn ${useDateRange ? 'salaryPanelForm__threeColumn--dateRange' : ''}`}>
            {/* Employment Status */}
            <label className="salaryPanelForm__label">
              <span className="salaryPanelForm__caption">Employment Status</span>
              <input
                className="input"
                list={`salary-status-${profileId}`}
                value={recordedStatus}
                onChange={(e) => setRecordedStatus(e.target.value)}
                placeholder="Casual"
                autoComplete="off"
              />
              <datalist id={`salary-status-${profileId}`}>
                {statusSuggestions.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </label>

            {/* Year or Date Range */}
            {useDateRange ? (
              <label className="salaryPanelForm__label salaryPanelForm__label--dates">
                <span className="salaryPanelForm__caption">Period</span>
                <div className="dateRangeInputs dateRangeInputs--compact">
                  <input
                    className="input"
                    type="date"
                    value={startDate}
                    max={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => {
                      const newDate = e.target.value
                      setStartDate(newDate)
                      if (newDate) setYear(new Date(newDate).getFullYear())
                    }}
                  />
                  <span className="dateRangeSeparator">→</span>
                  <input
                    className="input"
                    type="date"
                    value={endDate}
                    min={startDate}
                    max={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </label>
            ) : (
              <label className="salaryPanelForm__label">
                <span className="salaryPanelForm__caption">Year</span>
                <input
                  className="input"
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  placeholder="2026"
                  min="1970"
                  max="2100"
                />
              </label>
            )}

            {/* Salary Amount */}
            <label className="salaryPanelForm__label">
              <span className="salaryPanelForm__caption">
                Salary Amount
                {effectiveEmploymentStatus.toLowerCase().trim() === 'permanent' && attendanceBasedMin !== null && (
                  <span className="salaryPanelForm__minTag">Min: ₱{attendanceBasedMin.toLocaleString()}</span>
                )}
              </span>
              <div className="salaryInputWrapper">
                <span className="salaryInputWrapper__currency">₱</span>
                <input
                  className="input salaryInputWrapper__input"
                  type="number"
                  min={effectiveEmploymentStatus.toLowerCase().trim() === 'permanent' ? (attendanceBasedMin ?? 0) : 0}
                  step="0.01"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </label>

            {/* Save Button */}
            <button type="submit" className="btn btn--primary salaryPanelForm__saveBtnThreeCol">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8" />
              </svg>
              Save
            </button>
          </div>
        </div>
      </form>
      {salaryError ? <div className="alert alert--error">{salaryError}</div> : null}

      {/* Saved Records Table */}
      {sortedRecords.length > 0 && (
        <div className="card2__section">
          <div className="card2__sectionTitle">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
            </svg>
            Saved Records ({sortedRecords.length})
          </div>

          <div className="table table--modern table--yearly-salary">
            <div className="table__header--modern">
              <div className="table__cell">Year</div>
              <div className="table__cell">Status</div>
              <div className="table__cell table__cell--amount">Salary</div>
              <div className="table__cell table__cell--actions" />
            </div>

            {sortedRecords.map((r) => (
              <div key={r.id} className="table__row--modern">
                <div className="table__cell">{r.year}</div>
                <div className="table__cell">
                  <span className={`badge badge--${(r.employment_status_snapshot || '').toLowerCase() === 'permanent' ? 'success' : 'warning'}`}>
                    {r.employment_status_snapshot || '—'}
                  </span>
                </div>
                <div className="table__cell table__cell--amount">₱{Number(r.salary).toLocaleString()}</div>
                <div className="table__cell table__cell--actions">
                  <button type="button" className="btn btn--modern btn--modernDanger btn--modernIcon" onClick={() => remove(r.id)} title="Delete">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* =========================
   PRINT PANEL
========================= */
function PrintPanel({ profile }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    const date = new Date(dateStr)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const year = date.getFullYear()
    return `${month}/${day}/${year}`
  }

  const [records, setRecords] = useState([])

  // Fetch salary records from API
  useEffect(() => {
    async function loadSalaryRecords() {
      if (profile?.id) {
        try {
          const res = await http.get(`/employee-profiles/${profile.id}/yearly-salary`)
          setRecords(res.data.records || [])
        } catch (error) {
          console.error('Error loading salary records:', error)
          setRecords([])
        }
      }
    }

    loadSalaryRecords()
  }, [profile?.id])

  const yearlyRecords = useMemo(() => {
    return [...records].sort((a, b) => {
      // Sort by start_date first (descending), then by employment status
      const dateA = a.start_date ? new Date(a.start_date) : new Date(`${a.year}-01-01`)
      const dateB = b.start_date ? new Date(b.start_date) : new Date(`${b.year}-01-01`)
      
      if (dateB.getTime() !== dateA.getTime()) return dateB.getTime() - dateA.getTime()
      return String(a.employment_status_snapshot || '').localeCompare(String(b.employment_status_snapshot || ''))
    })
  }, [records])

  const profileDesignationLabel = useMemo(() => {
    const d = String(profile?.designation || '').trim()
    const p = String(profile?.position || '').trim()
    return d || p || ''
  }, [profile])

  if (!profile) return null

  return (
    <div className="print-area">
      <div className="sr-container">

        {/* HEADER */}
        <div className="sr-header">
          <img src="/dpwh-logo.png" alt="logo" className="logo" />
          <div className="header-text">
            <div className="header-text__small">Republic of the Philippines</div>
            <div className="header-text__dept">DEPARTMENT OF PUBLIC WORKS AND HIGHWAYS</div>
            <div className="header-text__dept">OFFICE OF THE DISTRICT ENGINEER</div>
            <div className="header-text__line">Cagayan de Oro 1st District Engineering Office</div>
            <div className="header-text__line">10th Regional Equipment Services Compound</div>
            <div className="header-text__line">Bulua, Cagayan de Oro City</div>
          </div>
        </div>

        <div className="sr-title-block">
          <div className="title">SERVICE RECORD</div>
          <div className="subtitle">(To Be Accomplished By Employer)</div>
        </div>

        {/* NAME + BIRTH */}
        <table className="sr-info">
          <tbody>
            <tr>
              <td className="label">NAME</td>
              <td className="line">{profile.surname || 'N/A'}</td>
              <td className="line">{profile.given_name || 'N/A'}</td>
              <td className="line">{profile.middle_name || 'N/A'}</td>
              <td className="note">(If married woman, give also full maiden name)</td>
            </tr>
            <tr className="sub">
              <td></td>
              <td>(Surname)</td>
              <td>(Given Name)</td>
              <td>(Middle Name)</td>
              <td></td>
            </tr>
            <tr>
              <td className="label">BIRTH</td>
              <td className="line">{formatDate(profile.birth_date)}</td>
              <td className="line" colSpan="2">{profile.address || 'N/A'}</td>
              <td className="note">
                (Data herein should be checked from birth or baptismal certificate or other reliable documents)
              </td>
            </tr>
            <tr className="sub">
              <td></td>
              <td>(Date)</td>
              <td colSpan="2">(Place)</td>
              <td></td>
            </tr>
          </tbody>
        </table>

        <p className="sr-desc">
          The employee named above actually rendered services in this Office as shown by the
          service records and other papers actually issued by this Office and approved by
          authorities concerned.
        </p>

        {/* MAIN TABLE */}
        <table className="sr-table">
          <colgroup>
            <col style={{ width: '10%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '13%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '8.5%' }} />
            <col style={{ width: '8.5%' }} />
          </colgroup>
          <thead>
            <tr>
              <th colSpan="2">SERVICE<br /><span>(Inclusive Dates)</span></th>
              <th colSpan="3">RECORD OF APPOINTMENT</th>
              <th colSpan="2">OFFICE ENTITY/DIVISION</th>
              <th>Leave Absence w/o Pay</th>
              <th colSpan="2">SEPARATION</th>
            </tr>
            <tr>
              <th>FROM</th>
              <th>TO</th>
              <th>Designation</th>
              <th>Status</th>
              <th>Salary</th>
              <th>Station/Place of Assignment</th>
              <th>Branch</th>
              <th></th>
              <th>Date</th>
              <th>Cause</th>
            </tr>
          </thead>

          <tbody>
            {yearlyRecords.map((r) => (
              <tr key={r.id}>
                <td>
                  {r.record_type === 'date_range' 
                    ? formatDate(r.start_date) 
                    : (r.start_date ? formatDate(r.start_date) : (r.year ? `01/01/${r.year}` : 'N/A'))
                  }
                </td>
                <td>
                  {r.record_type === 'date_range' 
                    ? formatDate(r.end_date) 
                    : (r.end_date ? formatDate(r.end_date) : (r.year ? `12/31/${r.year}` : 'N/A'))
                  }
                </td>
                <td>
                  {String(r.designation_snapshot || '').trim() || profileDesignationLabel || 'N/A'}
                </td>
                <td>{r.employment_status_snapshot || 'N/A'}</td>
                <td>
                  {r.salary ? (
                    (() => {
                      const status = String(r.employment_status_snapshot || '').toLowerCase().trim()
                      const salaryAmount = Number(r.salary).toLocaleString()
                      
                      if (status === 'permanent') {
                        return `${salaryAmount}/annum`
                      } else if (status === 'casual') {
                        return `${Number(r.salary).toLocaleString(undefined, { maximumFractionDigits: 2 })}/day`
                      } else {
                        return salaryAmount
                      }
                    })()
                  ) : 'N/A'}
                </td>
                <td>{r.station_place_of_assignment_snapshot || 'N/A'}</td>
                <td>{r.branch_snapshot || 'N/A'}</td>
                <td>None</td>
                <td>{r.separation_date_snapshot ? formatDate(r.separation_date_snapshot) : ''}</td>
                <td>{r.separation_cause_snapshot || ''}</td>
              </tr>
            ))}
            {!yearlyRecords.length && (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center' }}>
                  No yearly salary records yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* FOOTER */}
        <div className="sr-footer">
          <p>
            Issued in compliance with Executive Order No. 54 dated August 10, 1954 and in
            accordance with Circular No. 58 dated August 10, 1954 of the system.
          </p>
          <div className="signature-row">
            <div className="signature-left">
              <div>{new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              <div>Date</div>
            </div>
            <div className="signature">
              <p>CERTIFIED CORRECT:</p>
              <strong>LEAH E. NALIPONGUIT</strong>
              <div>Administrative Officer V</div>
            </div>
          </div>
        </div>

        {/* PRINT BUTTON */}
        <button type="button" onClick={() => window.print()} className="btn btn--primary no-print">
          Print
        </button>
      </div>
    </div>
  )
}

/* =========================
   MAIN PROFILE DETAILS COMPONENT
========================= */
export default function ProfileDetails() {
  const { id, tab } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [archiveConfirm, setArchiveConfirm] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)

  const activeTab = tab || 'attendance'

  useEffect(() => {
    async function load() {
      const res = await http.get(`/employee-profiles/${id}`)
      setProfile(res.data.profile)
    }
    load()
  }, [id])

  async function onArchive() {
    setArchiveConfirm(true)
  }

  async function confirmArchive() {
    setIsArchiving(true)
    try {
      await http.post(`/employee-profiles/${id}/archive`)
      navigate('/profiling', { replace: true })
    } catch (error) {
      console.error('Archive failed:', error)
      setIsArchiving(false)
      setArchiveConfirm(false)
    }
  }

  const getStatusBadgeClass = (status) => {
    const normalizedStatus = (status || '').toLowerCase().trim()
    return normalizedStatus === 'permanent' 
      ? 'profileHeader__statusBadge--permanent' 
      : 'profileHeader__statusBadge--casual'
  }

  const formatCurrency = (amount) => {
    if (!amount || Number.isNaN(Number(amount))) return '₱0'
    return `₱${Number(amount).toLocaleString()}`
  }

  return (
    <div className="page2">
      {/* Profile Header - Flat Style */}
      <div className={`profileHeader--flat ${profile ? 'profileHeader--loaded' : 'profileHeader--loading'}`}>
        <Link className="profileHeader__backBtn" to="/profiling" aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </Link>
        <div className="profileHeader__content">
          <div className="profileHeader__avatar">
            {profile?.photo_url ? (
              <img 
                className="profileHeader__avatarImg" 
                src={profile.photo_url.startsWith('http') ? profile.photo_url : `http://127.0.0.1:8000${profile.photo_url}`}
                alt={profile?.full_name || 'Profile'} 
              />
            ) : (
              <div className="profileHeader__avatarFallback">
                {(profile?.full_name || '?')
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((p) => p[0]?.toUpperCase())
                  .join('') || '?'}
              </div>
            )}
          </div>
          
          <div className="profileHeader__info">
            <h1 className="profileHeader__name">{profile?.surname || ''}{profile?.surname && profile?.given_name ? ', ' : ''}{profile?.given_name || ''}</h1>
            <div className="profileHeader__meta">
              <span className="profileHeader__metaItem">
                <svg className="profileHeader__metaIcon" viewBox="0 0 20 20" fill="currentColor" aria-label="Designation">
                  <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                </svg>
                {profile?.designation || '-'}
              </span>
              <span className="profileHeader__metaItem">
                <svg className="profileHeader__metaIcon" viewBox="0 0 20 20" fill="currentColor" aria-label="Station">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.238A9.22 9.22 0 013.478 17.64 1 1 0 002 16.93V10.12l1.71.73a1 1 0 00.657.122 11.115 11.115 0 003.746-1.025 1 1 0 00.651-1.178 1 1 0 00-1.178-.651 9.22 9.22 0 01-3.46 1.052 1 1 0 00-.788.867l-.001.076v6.093a1 1 0 00.55.9 7.22 7.22 0 005.2 1.26 1 1 0 00.89-1.078 1 1 0 00-1.078-.89 5.22 5.22 0 01-3.76-.91 1 1 0 00-.9-.55z" />
                </svg>
                {profile?.station_place_of_assignment || '-'}
              </span>
              <span className="profileHeader__metaItem">
                <svg className="profileHeader__metaIcon" viewBox="0 0 20 20" fill="currentColor" aria-label="Status">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                {profile?.employment_status || '-'}
              </span>
            </div>
            <div className="profileHeader__meta" style={{ marginTop: '8px' }}>
              
                Salary: {profile ? formatCurrency(profile.base_salary) : '-'}
            </div>
          </div>
          
          <div className="profileHeader__actions no-print">
            <button 
              className="btn btn--modern btn--modernPrimary" 
              onClick={() => setEditModalOpen(true)}
              type="button"
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-label="Edit">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit Profile
            </button>
            <button 
              className="btn btn--modern btn--modernDanger" 
              onClick={onArchive}
              type="button"
              disabled={!profile}
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-label="Archive">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Archive
            </button>
          </div>
        </div>
      </div>

      {/* Toggle Switch Tabs - Right Aligned */}
      <div className={`tabs--toggle ${profile ? 'tabs--toggle--loaded' : 'tabs--toggle--loading'}`}>
        <Tab to={`/profiling/${id}`} end icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        }>
          Attendance
        </Tab>
        <Tab to={`/profiling/${id}/salary`} icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        }>
          Salary
        </Tab>
        <Tab to={`/profiling/${id}/print`} icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"></polyline>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
        }>
          Print
        </Tab>
      </div>

      <div className={`tabContent ${profile ? 'tabContent--loaded' : 'tabContent--loading'}`}>
        {activeTab === 'attendance' && profile && (
          <div className="tabPanel tabPanel--enter">
            <AttendancePanel profileId={id} baseSalary={profile.base_salary} />
          </div>
        )}

        {activeTab === 'salary' && profile && (
          <div className="tabPanel tabPanel--enter">
            <SalaryPanel
              profileId={id}
              baseSalary={profile.base_salary}
              currentStatus={profile.employment_status}
            />
          </div>
        )}

        {activeTab === 'print' && profile && (
          <div className="tabPanel tabPanel--enter">
            <PrintPanel profile={profile} />
          </div>
        )}
      </div>

      <ConfirmationDialog
        isOpen={archiveConfirm}
        title="📁 Archive Profile"
        message={`You are about to archive the profile for: ${profile?.full_name || 'Unknown'}\n\nWhat happens when archived:\n• Profile will be removed from active listings\n• Profile will appear in the "Archived Profiles" section\n• All attendance and salary records will be preserved\n• You can restore the profile later if needed\n\nCurrent data that will be preserved:\n• ${profile?.attendance_records?.length > 0 ? '✓ Attendance records' : '• No attendance records'}\n• ${profile?.yearly_salary_records?.length > 0 ? '✓ Salary records' : '• No salary records'}\n• Profile information and photo\n\nThe profile will NOT be permanently deleted.\n\nDo you want to continue with archiving this profile?`}
        type="warning"
        confirmText="Archive Profile"
        cancelText="Cancel"
        onConfirm={confirmArchive}
        onCancel={() => setArchiveConfirm(false)}
        isLoading={isArchiving}
      />

      <EditProfileModal
        profile={profile}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={(updatedProfile) => setProfile(updatedProfile)}
      />
    </div>
  )
}