import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { FolderKanban, CheckSquare, Clock, Users, AlertTriangle, TrendingUp } from 'lucide-react'

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="card animate-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</div>
          <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2.2rem', color: '#e8eaf0', marginTop: 4 }}>{value}</div>
        </div>
        <div style={{ background: `${color}18`, borderRadius: 10, padding: '10px' }}>
          <Icon size={22} color={color} />
        </div>
      </div>
      {sub && <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{sub}</div>}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])

  useEffect(() => {
    api.get('/api/dashboard').then(r => setStats(r.data))
    api.get('/api/tasks').then(r => setTasks(r.data.slice(0, 5)))
    api.get('/api/projects').then(r => setProjects(r.data.slice(0, 4)))
  }, [])

  const statusColor = { todo: '#94a3b8', in_progress: '#818cf8', done: '#2ec4b6' }

  return (
    <div className="animate-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.8rem', color: '#e8eaf0', margin: 0 }}>
          Good day, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: '#64748b', marginTop: 4 }}>
          {user?.role === 'admin' ? "Here's your team overview" : "Here's your task overview"}
        </p>
      </div>

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <StatCard icon={FolderKanban} label="Projects" value={stats.total_projects} color="#4361ee" sub={`${stats.active_projects} active`} />
          <StatCard icon={CheckSquare} label="Tasks" value={stats.total_tasks} color="#2ec4b6" sub={`${stats.done_tasks} completed`} />
          <StatCard icon={Clock} label="In Progress" value={stats.in_progress_tasks} color="#ff9f1c" />
          <StatCard icon={AlertTriangle} label="Overdue" value={stats.overdue_tasks} color="#e63946" />
          {user?.role === 'admin' && <StatCard icon={Users} label="Team Members" value={stats.total_users} color="#f72585" />}
          <StatCard icon={TrendingUp} label="Todo" value={stats.todo_tasks} color="#818cf8" />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Recent Tasks */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1rem', color: '#e8eaf0', marginBottom: '1rem' }}>
            {user?.role === 'admin' ? 'Recent Tasks' : 'My Tasks'}
          </h3>
          {tasks.length === 0 && <p style={{ color: '#64748b', fontSize: '0.875rem' }}>No tasks found</p>}
          {tasks.map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid rgba(67,97,238,0.08)' }}>
              <div>
                <div style={{ color: '#e8eaf0', fontSize: '0.9rem', fontWeight: 500 }}>{t.title}</div>
                {t.deadline && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Due {new Date(t.deadline).toLocaleDateString()}</div>}
              </div>
              <span className={`badge badge-${t.status}`}>{t.status.replace('_', ' ')}</span>
            </div>
          ))}
        </div>

        {/* Projects */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1rem', color: '#e8eaf0', marginBottom: '1rem' }}>
            {user?.role === 'admin' ? 'All Projects' : 'My Projects'}
          </h3>
          {projects.length === 0 && <p style={{ color: '#64748b', fontSize: '0.875rem' }}>No projects found</p>}
          {projects.map(p => (
            <div key={p.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid rgba(67,97,238,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: '#e8eaf0', fontSize: '0.9rem', fontWeight: 500 }}>{p.name}</div>
                <span style={{ fontSize: '0.75rem', color: p.is_active ? '#2ec4b6' : '#64748b', fontWeight: 600 }}>
                  {p.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
                {p.task_count} tasks · {p.members?.length} members
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
