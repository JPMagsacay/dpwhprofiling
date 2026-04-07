import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useTheme } from '../theme/ThemeContext'
import ConfirmationDialog from './ConfirmationDialog'
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
  const [menuOpen, setMenuOpen] = useState(false)
  const [logoutConfirm, setLogoutConfirm] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function onClickOutside(e) {
      if (!menuRef.current?.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

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
      <aside className="sidenav">
        <div className="sidenav__logo">
          <img src="/dpwh-logo.png" alt="DPWH Logo" className="sidenav__logo-img" />
        </div>
        <div className="sidenav__brand">SYSTEM PROFILING</div>

        <nav className="sidenav__nav">
          <SideLink to="/dashboard" end>
            <svg className="sidenav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="7" height="7" rx="1"></rect>
              <rect x="14" y="3" width="7" height="7" rx="1"></rect>
              <rect x="14" y="14" width="7" height="7" rx="1"></rect>
              <rect x="3" y="14" width="7" height="7" rx="1"></rect>
            </svg>
            Dashboard
          </SideLink>
          <SideLink to="/profiling" end>
            <svg className="sidenav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            Profiling
          </SideLink>
          <SideLink to="/profiling/archive">
            <svg className="sidenav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z"></path>
              <rect x="3" y="4" width="18" height="2" rx="1"></rect>
            </svg>
            Archive
          </SideLink>
        </nav>
      </aside>

      <main className="shell__main">
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

