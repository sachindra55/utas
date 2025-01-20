# Educational Platform Backend

This is a Flask-based backend for an educational platform designed for students and staff. It provides essential features for managing courses, assignments, and user authentication.

## Features

- User Authentication (Students and Staff)
- Course Management
- Assignment Management
- Database Integration with SQLAlchemy

## Setup Instructions

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set environment variables (optional):
   ```bash
   export SECRET_KEY="your-secret-key"
   export DATABASE_URL="your-database-url"  # Default: SQLite
   ```

4. Run the application:
   ```bash
   python app.py
   ```

## API Endpoints

### Authentication
- POST `/api/register` - Register a new user
  - Required fields: email, password, role (student/staff)

### Courses
- GET `/api/courses` - Get all courses
- POST `/api/courses` - Create a new course (staff only)
  - Required fields: title, description, instructor_id

### Assignments
- GET `/api/assignments` - Get all assignments
  - Optional query param: course_id
- GET `/api/assignments?course_id=<id>` - Get assignments for a specific course

## Database Models

- User (students and staff)
- Course
- Assignment

## Security Features

- Password hashing
- JWT-based authentication
- Role-based access control
