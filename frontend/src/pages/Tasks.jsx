import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { Plus, Pencil, Trash2, X, Filter } from 'lucide-react'

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
      <div className="card animate-in" style={{ width: '100%', maxWidth: 480, padding: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontFamily: 'Syne', fontWeight: 700, color: '#e8eaf0', margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

function TaskForm({ initial, projects, users, isAdmin, onSubmit, onClose }) {
  const [form, setForm] = useState(initial || { title: '', description: '', status: 'todo', priority: 'medium', deadline: '', project_id: '', assignee_id: '' })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form) }} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      <div>
        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>TITLE *</label>
        <input className="input" value={form.title} onChange={e => set('title', e.target.value)} required placeholder="Task title" />
      </div>
      <div>
        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>DESCRIPTION</label>
        <textarea className="input" value={form.description} onChange={e => set('description', e.target.value)} rows={2} placeholder="Task details..." style={{ resize: 'vertical' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>STATUS</label>
          <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>PRIORITY</label>
          <select className="input" value={form.priority} onChange={e => set('priority', e.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
      {isAdmin && (
        <>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>PROJECT *</label>
            <select className="input" value={form.project_id} onChange={e => set('project_id', e.target.value)}>
              <option value="">Select project</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {!form.project_id && <span style={{ fontSize: '0.75rem', color: '#e63946', marginTop: 4 }}>Required</span>}
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>ASSIGNEE</label>
            <select className="input" value={form.assignee_id} onChange={e => set('assignee_id', e.target.value)}>
              <option value="">Unassigned</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
        </>
      )}
      <div>
        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>DEADLINE</label>
        <input className="input" type="datetime-local" value={form.deadline} onChange={e => set('deadline', e.target.value)} />
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: '0.5rem' }}>
        <button className="btn-primary" type="submit" style={{ flex: 1 }}>Save Task</button>
        <button type="button" onClick={onClose} style={{ flex: 1, background: 'rgba(100,116,139,0.1)', border: '1px solid rgba(100,116,139,0.2)', borderRadius: 8, color: '#94a3b8', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
      </div>
    </form>
  )
}

export default function Tasks() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [filter, setFilter] = useState({ status: '', priority: '' })
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')

  const load = () => {
    const params = new URLSearchParams()
    if (filter.status) params.set('status', filter.status)
    if (filter.priority) params.set('priority', filter.priority)
    api.get(`/api/tasks?${params}`).then(r => {
      console.log('Tasks loaded:', r.data)
      setTasks(r.data)
    }).catch(e => {
      console.error('Failed to load tasks:', e)
      setError(e.response?.data?.detail || 'Failed to load tasks')
    })
  }

  useEffect(() => {
    load()
  }, [filter])

  useEffect(() => {
    api.get('/api/projects').then(r => setProjects(r.data)).catch(e => setError(e.response?.data?.detail || 'Failed to load projects'))
    if (isAdmin) api.get('/api/users').then(r => setUsers(r.data)).catch(e => setError(e.response?.data?.detail || 'Failed to load users'))
  }, [])

  const create = async form => {
    try {
      setError('')
      if (!form.project_id) {
        setError('Please select a project')
        return
      }
      const payload = {
        title: form.title,
        description: form.description || null,
        status: form.status,
        priority: form.priority,
        project_id: Number(form.project_id),
        assignee_id: form.assignee_id ? Number(form.assignee_id) : null,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : null
      }
      console.log('Creating task with payload:', payload)
      await api.post('/api/tasks', payload)
      load(); setShowForm(false)
    } catch (e) {
      console.error('Task creation error:', e)
      setError(e.response?.data?.detail || e.message || 'Failed to create task')
    }
  }

  const update = async form => {
    try {
      setError('')
      const payload = isAdmin
        ? { ...form, assignee_id: form.assignee_id ? Number(form.assignee_id) : null }
        : { status: form.status }
      await api.put(`/api/tasks/${editing.id}`, payload)
      load(); setEditing(null)
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to update task')
    }
  }

  const del = async id => {
    if (!confirm('Delete task?')) return
    try {
      setError('')
      await api.delete(`/api/tasks/${id}`)
      load()
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to delete task')
    }
  }

  const isOverdue = t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'done'

  return (
    <div className="animate-in">
      {error && (
        <div style={{ background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.3)', color: '#e63946', padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{error}</span>
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#e63946', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.8rem', color: '#e8eaf0', margin: 0 }}>Tasks</h1>
          <p style={{ color: '#64748b', marginTop: 4, fontSize: '0.875rem' }}>{tasks.length} tasks</p>
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={16} /> New Task
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Filter size={14} color="#64748b" />
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Filter:</span>
        </div>
        <select className="input" value={filter.status} onChange={e => setFilter(p => ({ ...p, status: e.target.value }))} style={{ width: 'auto', padding: '0.35rem 0.75rem' }}>
          <option value="">All Status</option>
          <option value="todo">Todo</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <select className="input" value={filter.priority} onChange={e => setFilter(p => ({ ...p, priority: e.target.value }))} style={{ width: 'auto', padding: '0.35rem 0.75rem' }}>
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {/* Task table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(67,97,238,0.12)' }}>
              {['Task', 'Status', 'Priority', 'Assignee', 'Deadline', 'Actions'].map(h => (
                <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tasks.map(t => (
              <tr key={t.id} style={{ borderBottom: '1px solid rgba(67,97,238,0.06)', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(67,97,238,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <div style={{ fontWeight: 500, color: '#e8eaf0', fontSize: '0.9rem' }}>{t.title}</div>
                  {t.description && <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>{t.description.slice(0, 60)}...</div>}
                  {isOverdue(t) && <span className="badge badge-overdue" style={{ marginTop: 4 }}>Overdue</span>}
                </td>
                <td style={{ padding: '0.875rem 1rem' }}><span className={`badge badge-${t.status}`}>{t.status.replace('_', ' ')}</span></td>
                <td style={{ padding: '0.875rem 1rem' }}><span className={`badge badge-${t.priority}`}>{t.priority}</span></td>
                <td style={{ padding: '0.875rem 1rem', color: '#94a3b8', fontSize: '0.85rem' }}>{t.assignee?.name || '—'}</td>
                <td style={{ padding: '0.875rem 1rem', color: isOverdue(t) ? '#e63946' : '#94a3b8', fontSize: '0.85rem' }}>
                  {t.deadline ? new Date(t.deadline).toLocaleDateString() : '—'}
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => setEditing({ ...t, deadline: t.deadline ? t.deadline.slice(0, 16) : '', assignee_id: t.assignee?.id || '' })}
                      style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4 }}><Pencil size={15} /></button>
                    {isAdmin && (
                      <button onClick={() => del(t.id)} style={{ background: 'none', border: 'none', color: '#e63946', cursor: 'pointer', padding: 4 }}><Trash2 size={15} /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tasks.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>No tasks found</div>
        )}
      </div>

      {showForm && (
        <Modal title="New Task" onClose={() => setShowForm(false)}>
          <TaskForm projects={projects} users={users} isAdmin={isAdmin} onSubmit={create} onClose={() => setShowForm(false)} />
        </Modal>
      )}
      {editing && (
        <Modal title="Edit Task" onClose={() => setEditing(null)}>
          <TaskForm initial={editing} projects={projects} users={users} isAdmin={isAdmin} onSubmit={update} onClose={() => setEditing(null)} />
        </Modal>
      )}
    </div>
  )
}
