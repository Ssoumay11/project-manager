import { useEffect, useState } from 'react'
import api from '../api/axios'
import { Trash2, UserCheck, UserX } from 'lucide-react'

export default function Users() {
  const [users, setUsers] = useState([])

  const load = () => api.get('/api/users').then(r => setUsers(r.data))
  useEffect(() => { load() }, [])

  const toggle = async u => {
    await api.put(`/api/users/${u.id}`, { is_active: !u.is_active })
    load()
  }

  const del = async u => {
    if (!confirm(`Delete user ${u.name}?`)) return
    await api.delete(`/api/users/${u.id}`)
    load()
  }

  return (
    <div className="animate-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.8rem', color: '#e8eaf0', margin: 0 }}>Team</h1>
        <p style={{ color: '#64748b', marginTop: 4, fontSize: '0.875rem' }}>{users.length} members</p>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(67,97,238,0.12)' }}>
              {['Member', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid rgba(67,97,238,0.06)' }}>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: u.role === 'admin' ? '#f72585' : '#4361ee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', color: 'white' }}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 500, color: '#e8eaf0', fontSize: '0.9rem' }}>{u.name}</span>
                  </div>
                </td>
                <td style={{ padding: '0.875rem 1rem', color: '#94a3b8', fontSize: '0.85rem' }}>{u.email}</td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: u.role === 'admin' ? '#f72585' : '#818cf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{u.role}</span>
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: u.is_active ? '#2ec4b6' : '#e63946' }}>
                    {u.is_active ? '● Active' : '○ Inactive'}
                  </span>
                </td>
                <td style={{ padding: '0.875rem 1rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => toggle(u)} title={u.is_active ? 'Deactivate' : 'Activate'}
                      style={{ background: 'none', border: 'none', color: u.is_active ? '#ff9f1c' : '#2ec4b6', cursor: 'pointer', padding: 4 }}>
                      {u.is_active ? <UserX size={16} /> : <UserCheck size={16} />}
                    </button>
                    <button onClick={() => del(u)} style={{ background: 'none', border: 'none', color: '#e63946', cursor: 'pointer', padding: 4 }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
