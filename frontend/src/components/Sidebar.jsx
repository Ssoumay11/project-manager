import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, FolderKanban, CheckSquare,
  Users, LogOut, Zap
} from 'lucide-react'

const navAdmin = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/users', icon: Users, label: 'Team' },
]
const navUser = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'My Projects' },
  { to: '/tasks', icon: CheckSquare, label: 'My Tasks' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const nav = user?.role === 'admin' ? navAdmin : navUser

  return (
    <aside style={{ width: 220, minHeight: '100vh', background: '#1a1d27', borderRight: '1px solid rgba(67,97,238,0.12)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '1.5rem 1.25rem 1rem', borderBottom: '1px solid rgba(67,97,238,0.12)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ background: '#4361ee', borderRadius: 8, padding: '4px 6px', display: 'flex' }}>
            <Zap size={16} color="white" />
          </div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: '#e8eaf0' }}>
            ProjectFlow
          </span>
        </div>
        <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.75rem', background: 'rgba(67,97,238,0.08)', borderRadius: 8 }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Signed in as</div>
          <div style={{ fontSize: '0.9rem', color: '#e8eaf0', fontWeight: 600 }}>{user?.name}</div>
          <div style={{ fontSize: '0.75rem', color: user?.role === 'admin' ? '#f72585' : '#4361ee', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{user?.role}</div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '0.6rem 0.75rem', borderRadius: 8,
            color: isActive ? '#fff' : '#94a3b8',
            background: isActive ? 'rgba(67,97,238,0.2)' : 'transparent',
            fontWeight: isActive ? 600 : 400,
            textDecoration: 'none', fontSize: '0.9rem',
            transition: 'all 0.15s',
            borderLeft: isActive ? '3px solid #4361ee' : '3px solid transparent',
          })}>
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid rgba(67,97,238,0.12)' }}>
        <button onClick={() => { logout(); navigate('/login') }}
          style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '0.6rem 0.75rem', borderRadius: 8, background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.9rem' }}>
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </aside>
  )
}
