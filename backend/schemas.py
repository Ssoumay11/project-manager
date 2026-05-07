from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from models import RoleEnum, TaskStatusEnum, TaskPriorityEnum

# ── Auth ──────────────────────────────────────────────
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: int
    name: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# ── User ──────────────────────────────────────────────
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: RoleEnum = RoleEnum.user

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: RoleEnum
    is_active: bool
    created_at: datetime
    class Config: from_attributes = True

class UserShort(BaseModel):
    id: int
    name: str
    email: str
    class Config: from_attributes = True

# ── Project ───────────────────────────────────────────
class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    member_ids: Optional[List[int]] = []

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    is_active: Optional[bool] = None
    member_ids: Optional[List[int]] = None

class ProjectOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    deadline: Optional[datetime]
    is_active: bool
    created_at: datetime
    creator: UserShort
    members: List[UserShort]
    task_count: Optional[int] = 0
    class Config: from_attributes = True

class ProjectShort(BaseModel):
    id: int
    name: str
    class Config: from_attributes = True

# ── Task ──────────────────────────────────────────────
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: TaskStatusEnum = TaskStatusEnum.todo
    priority: TaskPriorityEnum = TaskPriorityEnum.medium
    deadline: Optional[datetime] = None
    project_id: int
    assignee_id: Optional[int] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatusEnum] = None
    priority: Optional[TaskPriorityEnum] = None
    deadline: Optional[datetime] = None
    assignee_id: Optional[int] = None

class TaskOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: TaskStatusEnum
    priority: TaskPriorityEnum
    deadline: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]
    project_id: int
    project: Optional[ProjectShort] = None
    assignee: Optional[UserShort] = None
    class Config: from_attributes = True

# ── Dashboard ─────────────────────────────────────────
class DashboardStats(BaseModel):
    total_projects: int
    active_projects: int
    total_tasks: int
    todo_tasks: int
    in_progress_tasks: int
    done_tasks: int
    overdue_tasks: int
    total_users: int
