"""Seed demo data"""
import sys
sys.path.insert(0, '.')
from database import SessionLocal, engine
import models
from auth import get_password_hash

models.Base.metadata.create_all(bind=engine)
db = SessionLocal()

# Check if already seeded
if db.query(models.User).count() > 0:
    print("Already seeded.")
    db.close()
    exit()

# Create admin
admin = models.User(name="Admin User", email="admin@test.com", hashed_password=get_password_hash("admin123"), role="admin")
user1 = models.User(name="Alice Dev", email="alice@test.com", hashed_password=get_password_hash("user123"), role="user")
user2 = models.User(name="Bob Designer", email="bob@test.com", hashed_password=get_password_hash("user123"), role="user")
user3 = models.User(name="Carol PM", email="carol@test.com", hashed_password=get_password_hash("user123"), role="user")

db.add_all([admin, user1, user2, user3])
db.commit()

# Create projects
from datetime import datetime, timedelta
p1 = models.Project(name="Website Redesign", description="Complete overhaul of company website", deadline=datetime.utcnow() + timedelta(days=30), creator_id=admin.id, members=[user1, user2])
p2 = models.Project(name="Mobile App v2", description="New features for mobile application", deadline=datetime.utcnow() + timedelta(days=60), creator_id=admin.id, members=[user1, user3])
p3 = models.Project(name="API Integration", description="Third-party API integrations", deadline=datetime.utcnow() - timedelta(days=5), creator_id=admin.id, members=[user2, user3])

db.add_all([p1, p2, p3])
db.commit()

# Create tasks
tasks = [
    models.Task(title="Design homepage mockup", status="done", priority="high", project_id=p1.id, assignee_id=user2.id, deadline=datetime.utcnow() - timedelta(days=10)),
    models.Task(title="Implement responsive layout", status="in_progress", priority="high", project_id=p1.id, assignee_id=user1.id, deadline=datetime.utcnow() + timedelta(days=5)),
    models.Task(title="SEO optimization", status="todo", priority="medium", project_id=p1.id, assignee_id=user1.id, deadline=datetime.utcnow() + timedelta(days=15)),
    models.Task(title="Push notifications", status="in_progress", priority="high", project_id=p2.id, assignee_id=user1.id, deadline=datetime.utcnow() + timedelta(days=10)),
    models.Task(title="User onboarding flow", status="todo", priority="medium", project_id=p2.id, assignee_id=user3.id, deadline=datetime.utcnow() + timedelta(days=20)),
    models.Task(title="OAuth setup", status="todo", priority="high", project_id=p3.id, assignee_id=user2.id, deadline=datetime.utcnow() - timedelta(days=3)),  # overdue
    models.Task(title="Webhook handler", status="in_progress", priority="medium", project_id=p3.id, assignee_id=user3.id, deadline=datetime.utcnow() - timedelta(days=1)),  # overdue
]
db.add_all(tasks)
db.commit()
db.close()
print("✅ Seeded: admin@test.com/admin123, alice@test.com/user123, bob@test.com/user123, carol@test.com/user123")
