from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas
from auth import get_current_user, require_admin

router = APIRouter(prefix="/api/projects", tags=["projects"])

def project_to_out(project: models.Project) -> dict:
    return {
        **{c.name: getattr(project, c.name) for c in project.__table__.columns},
        "creator": project.creator,
        "members": project.members,
        "task_count": len(project.tasks),
    }

@router.post("/", response_model=schemas.ProjectOut)
def create_project(data: schemas.ProjectCreate, db: Session = Depends(get_db), current_user=Depends(require_admin)):
    project = models.Project(
        name=data.name,
        description=data.description,
        deadline=data.deadline,
        creator_id=current_user.id,
    )
    if data.member_ids:
        members = db.query(models.User).filter(models.User.id.in_(data.member_ids)).all()
        project.members = members
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

@router.get("/", response_model=List[schemas.ProjectOut])
def list_projects(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role == "admin":
        projects = db.query(models.Project).all()
    else:
        projects = current_user.projects
    return projects

@router.get("/{project_id}", response_model=schemas.ProjectOut)
def get_project(project_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project: raise HTTPException(status_code=404, detail="Project not found")
    if current_user.role != "admin" and current_user not in project.members:
        raise HTTPException(status_code=403, detail="Access denied")
    return project

@router.put("/{project_id}", response_model=schemas.ProjectOut)
def update_project(project_id: int, data: schemas.ProjectUpdate, db: Session = Depends(get_db), _=Depends(require_admin)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project: raise HTTPException(status_code=404, detail="Project not found")
    if data.name is not None: project.name = data.name
    if data.description is not None: project.description = data.description
    if data.deadline is not None: project.deadline = data.deadline
    if data.is_active is not None: project.is_active = data.is_active
    if data.member_ids is not None:
        project.members = db.query(models.User).filter(models.User.id.in_(data.member_ids)).all()
    db.commit()
    db.refresh(project)
    return project

@router.delete("/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project: raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()
    return {"message": "Project deleted"}

@router.get("/{project_id}/tasks", response_model=List[schemas.TaskOut])
def project_tasks(project_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project: raise HTTPException(status_code=404, detail="Project not found")
    if current_user.role != "admin" and current_user not in project.members:
        raise HTTPException(status_code=403, detail="Access denied")
    return project.tasks
