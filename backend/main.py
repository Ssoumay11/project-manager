from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime
from database import engine, get_db
import models, schemas
from auth import require_admin, get_current_user
from routes import auth, projects, tasks, users

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Project Manager API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(users.router)

@app.get("/api/dashboard", response_model=schemas.DashboardStats)
def dashboard(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    now = datetime.utcnow()
    if current_user.role == "admin":
        total_projects = db.query(models.Project).count()
        active_projects = db.query(models.Project).filter(models.Project.is_active == True).count()
        total_tasks = db.query(models.Task).count()
        todo = db.query(models.Task).filter(models.Task.status == "todo").count()
        in_progress = db.query(models.Task).filter(models.Task.status == "in_progress").count()
        done = db.query(models.Task).filter(models.Task.status == "done").count()
        overdue = db.query(models.Task).filter(models.Task.deadline < now, models.Task.status != "done").count()
        total_users = db.query(models.User).count()
    else:
        my_project_ids = [p.id for p in current_user.projects]
        total_projects = len(my_project_ids)
        active_projects = db.query(models.Project).filter(models.Project.id.in_(my_project_ids), models.Project.is_active == True).count()
        task_q = db.query(models.Task).filter(models.Task.assignee_id == current_user.id)
        total_tasks = task_q.count()
        todo = task_q.filter(models.Task.status == "todo").count()
        in_progress = db.query(models.Task).filter(models.Task.assignee_id == current_user.id, models.Task.status == "in_progress").count()
        done = db.query(models.Task).filter(models.Task.assignee_id == current_user.id, models.Task.status == "done").count()
        overdue = db.query(models.Task).filter(models.Task.assignee_id == current_user.id, models.Task.deadline < now, models.Task.status != "done").count()
        total_users = 0

    return {
        "total_projects": total_projects,
        "active_projects": active_projects,
        "total_tasks": total_tasks,
        "todo_tasks": todo,
        "in_progress_tasks": in_progress,
        "done_tasks": done,
        "overdue_tasks": overdue,
        "total_users": total_users,
    }

@app.get("/")
def root(): return {"message": "Project Manager API running"}
