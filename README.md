# ProjectFlow — Full Stack Project Manager

**FastAPI + SQLite + JWT + React + Tailwind**

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
python seed.py          # seeds demo users + data
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev             # http://localhost:5173
```

API Docs → http://localhost:8000/docs

---

## Demo Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@test.com | admin123 | Admin |
| alice@test.com | user123 | User |
| bob@test.com | user123 | User |
| carol@test.com | user123 | User |

---

## Features

### Admin
- Full dashboard with stats (tasks, projects, overdue, team)
- Create / edit / delete projects + assign team members
- Create / edit / delete tasks with assignees
- User management (activate/deactivate/delete)

### User
- Personal dashboard
- View assigned projects only
- View assigned tasks with filters
- Update task status

---

## API Endpoints

### Auth
- `POST /api/auth/register` — register
- `POST /api/auth/login` — login → JWT token
- `GET /api/auth/me` — current user

### Projects
- `GET /api/projects` — list (admin = all, user = mine)
- `POST /api/projects` — create (admin only)
- `PUT /api/projects/{id}` — update (admin only)
- `DELETE /api/projects/{id}` — delete (admin only)
- `GET /api/projects/{id}/tasks` — project tasks

### Tasks
- `GET /api/tasks` — list with filters
- `POST /api/tasks` — create (admin only)
- `PUT /api/tasks/{id}` — update (admin = all, user = status only)
- `DELETE /api/tasks/{id}` — delete (admin only)
- `GET /api/tasks/overdue` — overdue tasks

### Users
- `GET /api/users` — list (admin only)
- `PUT /api/users/{id}` — update (admin only)
- `DELETE /api/users/{id}` — delete (admin only)

### Dashboard
- `GET /api/dashboard` — stats (role-filtered)

---

## Tech Stack
- **Backend**: FastAPI, SQLAlchemy, SQLite, python-jose (JWT), passlib (bcrypt)
- **Frontend**: React 18, React Router 6, Axios, Tailwind CSS, Lucide Icons
- **Auth**: JWT Bearer tokens, bcrypt password hashing
- **RBAC**: Admin / User roles enforced on every endpoint
