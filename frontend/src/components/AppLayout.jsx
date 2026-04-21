import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useTheme } from '../theme/ThemeContext'
import ConfirmationDialog from './ConfirmationDialog'
import Avatar from './Avatar'
import './AppLayout.css'

function SideLink({ to, children, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => (isActive ? 'sidenav__link sidenav__link--active' : 'sidenav__link')}
    >
      {children}
    </NavLink>
  )
}

export default function AppLayout() {
  const { logout, user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [logoutConfirm, setLogoutConfirm] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  async function onLogout() {
    setLogoutConfirm(true)
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
    <div className="shell">
      <aside className={`sidenav ${isSidebarCollapsed ? 'sidenav--collapsed' : ''}`}>
        <button
          type="button"
          className="sidenav__toggle"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg className="sidenav__toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            {isSidebarCollapsed ? (
              <>
                <polyline points="9 18 15 12 9 6"></polyline>
              </>
            ) : (
              <>
                <polyline points="15 18 9 12 15 6"></polyline>
              </>
            )}
          </svg>
        </button>
        <div className="sidenav__logo">
          <img src="/dpwh-logo.png" alt="DPWH Logo" className="sidenav__logo-img" />
        </div>
        <div className="sidenav__brand">SERVICE PROFILING</div>

        <div className="sidenav__divider"></div>

        <nav className="sidenav__nav">
          <div className="sidenav__nav-section">
            <div className="sidenav__nav-title">Main</div>
            <SideLink to="/dashboard" end>
              <div className="sidenav__link-content">
                <svg className="sidenav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <title>Dashboard</title>
                  <rect x="3" y="3" width="7" height="7" rx="1"></rect>
                  <rect x="14" y="3" width="7" height="7" rx="1"></rect>
                  <rect x="14" y="14" width="7" height="7" rx="1"></rect>
                  <rect x="3" y="14" width="7" height="7" rx="1"></rect>
                </svg>
                <span className="sidenav__link-text">Dashboard</span>
              </div>
            </SideLink>
            <SideLink to="/profiling" end>
              <div className="sidenav__link-content">
                <svg className="sidenav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <title>Profiling</title>
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span className="sidenav__link-text">Profiling</span>
              </div>
            </SideLink>
          </div>

          <div className="sidenav__nav-section">
            <div className="sidenav__nav-title">Management</div>
            <SideLink to="/profiling/archive">
              <div className="sidenav__link-content">
                <svg className="sidenav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <title>Archive</title>
                  <path d="M21 8v13H3V8"></path>
                  <path d="M3 8V3h18v5"></path>
                  <path d="M8 12h8"></path>
                </svg>
                <span className="sidenav__link-text">Archive</span>
              </div>
            </SideLink>
          </div>
        </nav>

        <div className="sidenav__footer">
          <div className="sidenav__user-profile">
            <button type="button" className="sidenav__logout" onClick={onLogout} title="Logout">
              <svg className="sidenav__logout-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span className="sidenav__logout-text">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <main className={`shell__main ${isSidebarCollapsed ? 'shell__main--collapsed' : ''}`}>
        <Outlet />
      </main>

      <ConfirmationDialog
        isOpen={logoutConfirm}
        title="Logout Confirmation"
        message={`Are you sure you want to logout, ${user?.name || 'user'}?\n\nYou will need to sign in again to access your account.`}
        type="warning"
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={confirmLogout}
        onCancel={() => setLogoutConfirm(false)}
        isLoading={isLoggingOut}
      />
    </div>
  )
}

