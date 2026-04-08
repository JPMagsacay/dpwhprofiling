import { useEffect, useMemo, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { http } from '../api/http'
import { useAuth } from '../auth/AuthContext'
import ConfirmationDialog from '../components/ConfirmationDialog'
import { DashboardSkeleton } from '../components/Skeleton'
import './Dashboard.css'

import { useTheme } from '../theme/ThemeContext'

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  
  return (
    <button 
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      <div className="theme-toggle__track">
        <div className={`theme-toggle__thumb ${isDark ? 'dark' : 'light'}`}>
          {isDark ? (
            <svg className="theme-toggle__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          ) : (
            <svg className="theme-toggle__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
          className="user-profile__button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="User menu"
        >
          <svg className="user-profile__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

function ChartBar({ items }) {
  const max = Math.max(1, ...items.map((x) => Number(x.total_salary || 0)))
  return (
    <div className="chart-bars">
      {items.map((x) => {
        const v = Number(x.total_salary || 0)
        const h = Math.round((v / max) * 100)
        return (
          <div key={x.year} className="chart-bar" title={`${x.year}: ₱${v.toLocaleString()}`}>
            <div className="chart-bar__fill" style={{ height: `${h}%` }} />
            <div className="chart-bar__value">₱{v.toLocaleString()}</div>
            <div className="chart-bar__label">{x.year}</div>
          </div>
        )
      })}
    </div>
  )
}

function InsightItem({ label, value, change }) {
  return (
    <div className="insight-item">
      <div className="insight-item__label">{label}</div>
      <div className={`insight-item__value ${change >= 0 ? 'positive' : 'negative'}`}>
        {value}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

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
        const res = await http.get('/analytics/dashboard')
        if (!ignore) setData(res.data)
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
  }, [])

  const cards = useMemo(() => data?.cards || {}, [data])
  const salaryByYear = data?.salary_by_year || []
  const latestSalary = salaryByYear.length ? Number(salaryByYear[0]?.total_salary || 0) : 0
  const previousSalary = salaryByYear.length > 1 ? Number(salaryByYear[1]?.total_salary || 0) : 0
  const salaryDelta = latestSalary - previousSalary
  const salaryDeltaPct = previousSalary > 0 ? (salaryDelta / previousSalary) * 100 : 0

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div className="dashboard__header-content">
          <h1 className="dashboard__title">Dashboard</h1>
          <p className="dashboard__subtitle">Analytics overview for the system</p>
        </div>
        <div className="dashboard__header-actions">
          <ThemeToggle />
          <UserProfile />
        </div>
      </header>

      <main className="dashboard__main">
        {loading && <DashboardSkeleton />}
        
        {error && (
          <div className="dashboard__error">
            <div className="error-icon">!</div>
            <span>Failed to load analytics data</span>
          </div>
        )}

        {!loading && data && (
          <div className="dashboard__content">
            <section className="metrics-grid">
              <MetricCard 
                title="Profiles" 
                value={cards.profiles ?? 0}
                subtitle="Total registered profiles"
              />
              <MetricCard 
                title="Present Days" 
                value={cards.present_days_year ?? 0}
                subtitle={`For ${data.year}`}
              />
              <MetricCard 
                title="Presence Coverage" 
                value={`${cards.presence_coverage_year ?? 0}%`}
                subtitle={`For ${data.year}`}
                trend={cards.presence_coverage_year ? cards.presence_coverage_year - 85 : 0}
              />
            </section>

            <section className="dashboard-grid">
              <div className="card chart-card">
                <div className="card__header">
                  <h2 className="card__title">Total Salary by Year</h2>
                  <p className="card__description">Based on saved yearly salary records</p>
                </div>
                <div className="card__content">
                  {salaryByYear.length ? (
                    <ChartBar items={salaryByYear} />
                  ) : (
                    <div className="empty-state">
                      <div className="empty-state__icon">—</div>
                      <div className="empty-state__text">No yearly salary data available</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="card insights-card">
                <div className="card__header">
                  <h2 className="card__title">Quick Insights</h2>
                </div>
                <div className="card__content">
                  <div className="insights-list">
                    <InsightItem 
                      label="Latest yearly total" 
                      value={`₱${latestSalary.toLocaleString()}`}
                    />
                    <InsightItem 
                      label="Previous yearly total" 
                      value={`₱${previousSalary.toLocaleString()}`}
                    />
                    <InsightItem 
                      label="Year-over-year change" 
                      value={`${salaryDelta >= 0 ? '+' : '-'}₱${Math.abs(salaryDelta).toLocaleString()}${previousSalary > 0 ? ` (${salaryDeltaPct >= 0 ? '+' : ''}${salaryDeltaPct.toFixed(1)}%)` : ''}`}
                      change={salaryDelta}
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}

