from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from database import get_db
import models, schemas
from auth import get_current_user, require_admin

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

@router.post("/", response_model=schemas.TaskOut)
def create_task(data: schemas.TaskCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    project = db.query(models.Project).filter(models.Project.id == data.project_id).first()
    if not project: raise HTTPException(status_code=404, detail="Project not found")
    if data.assignee_id:
        assignee = db.query(models.User).filter(models.User.id == data.assignee_id).first()
        if not assignee: raise HTTPException(status_code=404, detail="Assignee not found")
    task = models.Task(**data.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@router.get("/", response_model=List[schemas.TaskOut])
def list_tasks(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    project_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    q = db.query(models.Task)
    if current_user.role != "admin":
        q = q.filter(models.Task.assignee_id == current_user.id)
    if status: q = q.filter(models.Task.status == status)
    if priority: q = q.filter(models.Task.priority == priority)
    if project_id: q = q.filter(models.Task.project_id == project_id)
    return q.all()

@router.get("/overdue", response_model=List[schemas.TaskOut])
def overdue_tasks(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    q = db.query(models.Task).filter(
        models.Task.deadline < datetime.utcnow(),
        models.Task.status != models.TaskStatusEnum.done
    )
    if current_user.role != "admin":
        q = q.filter(models.Task.assignee_id == current_user.id)
    return q.all()

@router.get("/{task_id}", response_model=schemas.TaskOut)
def get_task(task_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task: raise HTTPException(status_code=404, detail="Task not found")
    if current_user.role != "admin" and task.assignee_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return task

@router.put("/{task_id}", response_model=schemas.TaskOut)
def update_task(task_id: int, data: schemas.TaskUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task: raise HTTPException(status_code=404, detail="Task not found")
    # Users can only update status of their own tasks
    if current_user.role != "admin":
        if task.assignee_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
        if data.status: task.status = data.status
        db.commit(); db.refresh(task); return task
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(task, k, v)
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task: raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"message": "Task deleted"}
