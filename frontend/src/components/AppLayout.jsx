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
        <div className="sidenav__brand">Services Profiling</div>
        <div className="sidenav__userWrap" ref={menuRef}>
          <button className="sidenav__user" onClick={() => setMenuOpen((v) => !v)} type="button">
            <div>
              <div className="sidenav__userName">{user?.name}</div>
              <div className="sidenav__userEmail">{user?.email}</div>
            </div>
            <span className="sidenav__userCaret">▾</span>
          </button>

          {menuOpen ? (
            <div className="sidenav__menu">
              <button
                className="sidenav__menuBtn"
                onClick={() => {
                  setMenuOpen(false)
                  navigate('/settings')
                }}
                type="button"
              >
                Settings
              </button>
              <button className="sidenav__menuBtn" onClick={toggleTheme} type="button">
                {theme === 'dark' ? '☀️ Light mode' : '🌙 Dark mode'}
              </button>
              <button 
                className="sidenav__menuBtn sidenav__menuBtn--danger" 
                onClick={() => {
                  setMenuOpen(false)
                  onLogout()
                }} 
                type="button"
              >
                Logout
              </button>
            </div>
          ) : null}
        </div>

        <nav className="sidenav__nav">
          <SideLink to="/dashboard" end>
            Dashboard
          </SideLink>
          <SideLink to="/profiling" end>
            Profiling
          </SideLink>
          <SideLink to="/profiling/archive">
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

