import { useEffect, useMemo, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { http } from '../../services/http'
import { useAuth } from '../../context/AuthContext'
import ConfirmationDialog from '../../components/ui/ConfirmationDialog'
import '../../styles/pages/Dashboard.css'

import { useTheme } from '../../context/ThemeContext'

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      <div className="theme-toggle__track">
        <div className={`theme-toggle__thumb ${isDark ? 'dark' : 'light'}`}>
          {isDark ? (
            <svg className="theme-toggle__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          ) : (
            <svg className="theme-toggle__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          )}
        </div>
      </div>
    </button>
  )
}

function UserProfile() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [logoutConfirm, setLogoutConfirm] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const profileRef = useRef(null)

  useEffect(() => {
    function onClickOutside(e) {
      if (!profileRef.current?.contains(e.target)) setIsOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  async function onLogout() {
    setLogoutConfirm(true)
    setIsOpen(false)
  }

  async function confirmLogout() {
    setIsLoggingOut(true)
    try {
      await logout()
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('Logout failed:', error)
      setIsLoggingOut(false)
      setLogoutConfirm(false)
    }
  }

  return (
    <>
      <div className="user-profile" ref={profileRef}>
        <button 
          type="button"
          className="user-profile__button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="User menu"
        >
          <svg className="user-profile__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <title>User profile</title>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </button>
        
        {isOpen && (
          <div className="user-profile__dropdown">
            <div className="user-profile__dropdown-header">
              <div className="user-profile__name">{user?.name || 'User'}</div>
              <div className="user-profile__email">{user?.email || ''}</div>
            </div>
            <div className="user-profile__dropdown-divider"></div>
            <div className="user-profile__dropdown-item">Profile</div>
            <div className="user-profile__dropdown-item">Settings</div>
            <div className="user-profile__dropdown-divider"></div>
            <button
              type="button"
              className="user-profile__dropdown-item user-profile__dropdown-item--danger"
              onClick={onLogout}
            >
              Logout
            </button>
          </div>
        )}
      </div>

      <ConfirmationDialog
        isOpen={logoutConfirm}
        title="Logout"
        message="Are you sure you want to logout?"
        type="warning"
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={confirmLogout}
        onCancel={() => setLogoutConfirm(false)}
        isLoading={isLoggingOut}
      />
    </>
  )
}

function MetricCard({ title, value, subtitle, trend }) {
  return (
    <div className="metric-card">
      <div className="metric-card__header">
        <h3 className="metric-card__title">{title}</h3>
        {trend && (
          <span className={`metric-card__trend ${trend > 0 ? 'positive' : trend < 0 ? 'negative' : 'neutral'}`}>
            {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="metric-card__value">{value}</div>
      {subtitle && <div className="metric-card__subtitle">{subtitle}</div>}
    </div>
  )
}

function StatusBarChart({ data }) {
  const total = data.permanent + data.casual
  if (total === 0) return <div className="empty-state">No employment status data</div>

  const permanentPct = (data.permanent / total) * 100
  const casualPct = (data.casual / total) * 100

  return (
    <div className="status-chart">
      <div className="status-chart__legend">
        <div className="status-chart__legend-item">
          <span className="status-chart__color status-chart__color--permanent"></span>
          <span>Permanent ({data.permanent})</span>
        </div>
        <div className="status-chart__legend-item">
          <span className="status-chart__color status-chart__color--casual"></span>
          <span>Casual ({data.casual})</span>
        </div>
      </div>
      <div className="status-chart__bar">
        <div
          className="status-chart__segment status-chart__segment--permanent"
          style={{ width: `${permanentPct}%` }}
          title={`Permanent: ${data.permanent} (${permanentPct.toFixed(1)}%)`}
        />
        <div
          className="status-chart__segment status-chart__segment--casual"
          style={{ width: `${casualPct}%` }}
          title={`Casual: ${data.casual} (${casualPct.toFixed(1)}%)`}
        />
      </div>
      <div className="status-chart__labels">
        <span>{permanentPct.toFixed(1)}%</span>
        <span>{casualPct.toFixed(1)}%</span>
      </div>
    </div>
  )
}

function ServicePieChart({ data }) {
  const entries = Object.entries(data).filter(([_, v]) => v > 0)
  if (entries.length === 0) return <div className="empty-state">No service data available</div>

  const total = entries.reduce((sum, [_, v]) => sum + v, 0)
  const labels = {
    under_5: '< 5 years',
    under_10: '< 10 years',
    under_15: '< 15 years',
    under_20: '< 20 years',
    over_20: '20+ years',
  }
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  let currentAngle = 0

  return (
    <div className="pie-chart">
      <svg viewBox="0 0 100 100" className="pie-chart__svg">
        {entries.map(([key, value], i) => {
          const angle = (value / total) * 360
          const startAngle = currentAngle
          const endAngle = currentAngle + angle
          currentAngle += angle

          const startRad = (startAngle * Math.PI) / 180
          const endRad = (endAngle * Math.PI) / 180
          const x1 = 50 + 40 * Math.cos(startRad)
          const y1 = 50 + 40 * Math.sin(startRad)
          const x2 = 50 + 40 * Math.cos(endRad)
          const y2 = 50 + 40 * Math.sin(endRad)
          const largeArc = angle > 180 ? 1 : 0

          return (
            <path
              key={key}
              d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
              fill={colors[i % colors.length]}
              stroke="white"
              strokeWidth="1"
            />
          )
        })}
      </svg>
      <div className="pie-chart__legend">
        {entries.map(([key, value], i) => (
          <div key={key} className="pie-chart__legend-item">
            <span className="pie-chart__color" style={{ background: colors[i % colors.length] }}></span>
            <span>{labels[key]}: {value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}


export default function Dashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let ignore = false

    async function run() {
      setError(null)
      try {
        const res = await http.get('/analytics/dashboard')
        if (!ignore) setData(res.data)
      } catch (e) {
        if (!ignore) setError(e)
      }
    }
    run()
    return () => {
      ignore = true
    }
  }, [])

  const cards = useMemo(() => data?.cards || {}, [data])
  const employmentStatus = useMemo(() => data?.employment_status || { permanent: 0, casual: 0 }, [data])
  const yearsOfService = useMemo(() => data?.years_of_service || {}, [data])

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div className="dashboard__header-content">
          <h1 className="dashboard__title">Dashboard</h1>
          <p className="dashboard__subtitle">Employee overview and workforce analytics</p>
        </div>
        <div className="dashboard__header-actions">
          <ThemeToggle />
          <UserProfile />
        </div>
      </header>
      <main className={`dashboard__main ${data ? 'dashboard__main--loaded' : ''}`}>
        {error && (
          <div className="dashboard__error">
            <div className="error-icon">!</div>
            <span>Failed to load analytics data</span>
          </div>
        )}

        {(
          <div className="dashboard__content">
            <section className="metrics-grid">
              <MetricCard
                title="Total Employees"
                value={cards.total_employees ?? 0}
                subtitle="All registered employees"
              />
              <MetricCard
                title="Active Employees"
                value={cards.active_employees ?? 0}
                subtitle="Currently employed"
              />
              <MetricCard
                title="Inactive Employees"
                value={cards.inactive_employees ?? 0}
                subtitle="Separated/Resigned"
              />
            </section>

            <section className="dashboard-grid">
              <div className="card chart-card">
                <div className="card__header">
                  <h2 className="card__title">Employment Status</h2>
                  <p className="card__description">Permanent vs Casual employees</p>
                </div>
                <div className="card__content">
                  <StatusBarChart data={employmentStatus} />
                </div>
              </div>

              <div className="card chart-card">
                <div className="card__header">
                  <h2 className="card__title">Years of Service</h2>
                  <p className="card__description">Employee tenure distribution</p>
                </div>
                <div className="card__content">
                  <ServicePieChart data={yearsOfService} />
                </div>
              </div>
            </section>

          </div>
        )}
      </main>
    </div>
  )
}

