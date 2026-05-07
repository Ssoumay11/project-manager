import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { Plus, Pencil, Trash2, Users, Calendar, X, Check, FolderKanban } from 'lucide-react'

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
      <div className="card animate-in" style={{ width: '100%', maxWidth: 500, padding: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontFamily: 'Syne', fontWeight: 700, color: '#e8eaf0', margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

function ProjectForm({ initial, users, onSubmit, onClose }) {
  const [form, setForm] = useState(initial || { name: '', description: '', deadline: '', member_ids: [] })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const toggleMember = id => set('member_ids', form.member_ids.includes(id) ? form.member_ids.filter(x => x !== id) : [...form.member_ids, id])

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form) }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>PROJECT NAME *</label>
        <input className="input" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Project name" />
      </div>
      <div>
        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>DESCRIPTION</label>
        <textarea className="input" value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="Brief description..." style={{ resize: 'vertical' }} />
      </div>
      <div>
        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>DEADLINE</label>
        <input className="input" type="datetime-local" value={form.deadline} onChange={e => set('deadline', e.target.value)} />
      </div>
      <div>
        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 8 }}>TEAM MEMBERS</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {users.map(u => (
            <button type="button" key={u.id} onClick={() => toggleMember(u.id)}
              style={{ padding: '4px 12px', borderRadius: 999, border: '1px solid', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.15s',
                background: form.member_ids.includes(u.id) ? 'rgba(67,97,238,0.2)' : 'transparent',
                borderColor: form.member_ids.includes(u.id) ? '#4361ee' : 'rgba(100,116,139,0.3)',
                color: form.member_ids.includes(u.id) ? '#818cf8' : '#64748b' }}>
              {u.name}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: '0.5rem' }}>
        <button className="btn-primary" type="submit" style={{ flex: 1 }}>Save Project</button>
        <button type="button" onClick={onClose} style={{ flex: 1, background: 'rgba(100,116,139,0.1)', border: '1px solid rgba(100,116,139,0.2)', borderRadius: 8, color: '#94a3b8', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
      </div>
    </form>
  )
}

export default function Projects() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)

  const load = () => api.get('/api/projects').then(r => setProjects(r.data))
  useEffect(() => {
    load()
    if (isAdmin) api.get('/api/users').then(r => setUsers(r.data))
  }, [])

  const create = async form => {
    await api.post('/api/projects', { ...form, member_ids: form.member_ids })
    load(); setShowForm(false)
  }

  const update = async form => {
    await api.put(`/api/projects/${editing.id}`, { ...form, member_ids: form.member_ids })
    load(); setEditing(null)
  }

  const del = async id => {
    if (!confirm('Delete project?')) return
    await api.delete(`/api/projects/${id}`)
    load()
  }

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.8rem', color: '#e8eaf0', margin: 0 }}>Projects</h1>
          <p style={{ color: '#64748b', marginTop: 4, fontSize: '0.875rem' }}>{projects.length} projects total</p>
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={16} /> New Project
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {projects.map(p => (
          <div key={p.id} className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1rem', color: '#e8eaf0' }}>{p.name}</div>
                <span style={{ fontSize: '0.75rem', color: p.is_active ? '#2ec4b6' : '#64748b', fontWeight: 600 }}>{p.is_active ? '● Active' : '○ Inactive'}</span>
              </div>
              {isAdmin && (
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => setEditing({ ...p, member_ids: p.members.map(m => m.id), deadline: p.deadline ? p.deadline.slice(0, 16) : '' })}
                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4 }}><Pencil size={15} /></button>
                  <button onClick={() => del(p.id)} style={{ background: 'none', border: 'none', color: '#e63946', cursor: 'pointer', padding: 4 }}><Trash2 size={15} /></button>
                </div>
              )}
            </div>
            {p.description && <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.75rem', lineHeight: 1.5 }}>{p.description}</p>}
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#64748b' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={13} /> {p.members?.length} members</span>
              {p.deadline && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={13} /> {new Date(p.deadline).toLocaleDateString()}</span>}
            </div>
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: 4 }}>
              {p.members?.slice(0, 5).map(m => (
                <div key={m.id} title={m.name} style={{ width: 28, height: 28, borderRadius: '50%', background: '#4361ee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'white', border: '2px solid #1a1d27' }}>
                  {m.name.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
          <FolderKanban size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
          <p>No projects yet{isAdmin ? '. Create one!' : '.'}</p>
        </div>
      )}

      {showForm && (
        <Modal title="New Project" onClose={() => setShowForm(false)}>
          <ProjectForm users={users} onSubmit={create} onClose={() => setShowForm(false)} />
        </Modal>
      )}
      {editing && (
        <Modal title="Edit Project" onClose={() => setEditing(null)}>
          <ProjectForm initial={editing} users={users} onSubmit={update} onClose={() => setEditing(null)} />
        </Modal>
      )}
    </div>
  )
}
