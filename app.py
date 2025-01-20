from flask import Flask, jsonify, request, render_template, redirect, url_for, flash, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileRequired, FileAllowed
from wtforms import StringField, PasswordField, SubmitField, SelectField, TextAreaField, BooleanField
from wtforms.validators import DataRequired, Email, EqualTo, Length
import os
import bleach
import magic
from PIL import Image
import uuid
from urllib.parse import urlparse
import json
from flask_cors import CORS  # Add this import

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key-please-change')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///education.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Create upload folders
os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'assignments'), exist_ok=True)
os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'submissions'), exist_ok=True)
os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'materials'), exist_ok=True)

db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

# Models
enrollments = db.Table('enrollments',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('course_id', db.Integer, db.ForeignKey('course.id'), primary_key=True)
)

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    enrolled_courses = db.relationship('Course', secondary=enrollments, backref='enrolled_students')
    submissions = db.relationship('Submission', backref='student', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Course(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    instructor_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    assignments = db.relationship('Assignment', backref='course', lazy=True)
    materials = db.relationship('Material', backref='course', lazy=True)
    instructor = db.relationship('User', backref='courses_teaching')

class Assignment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'))
    due_date = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    total_points = db.Column(db.Integer, default=100)
    file_path = db.Column(db.String(255))
    submissions = db.relationship('Submission', backref='assignment', lazy=True)

class Submission(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    assignment_id = db.Column(db.Integer, db.ForeignKey('assignment.id'))
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)
    file_path = db.Column(db.String(255))
    grade = db.Column(db.Integer)
    feedback = db.Column(db.Text)
    status = db.Column(db.String(20), default='submitted')  # submitted, graded

class Material(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'))
    file_path = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    material_type = db.Column(db.String(50))  # lecture, reading, video, etc.

# Forms
class LoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    remember_me = BooleanField('Remember Me')
    submit = SubmitField('Login')

class RegistrationForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=6)])
    confirm_password = PasswordField('Confirm Password', validators=[DataRequired(), EqualTo('password')])
    first_name = StringField('First Name', validators=[DataRequired()])
    last_name = StringField('Last Name', validators=[DataRequired()])
    role = SelectField('Role', choices=[('student', 'Student'), ('staff', 'Staff')])
    submit = SubmitField('Register')

class CourseForm(FlaskForm):
    title = StringField('Title', validators=[DataRequired()])
    description = TextAreaField('Description', validators=[DataRequired()])
    submit = SubmitField('Create Course')

class AssignmentForm(FlaskForm):
    title = StringField('Title', validators=[DataRequired()])
    description = TextAreaField('Description', validators=[DataRequired()])
    due_date = StringField('Due Date', validators=[DataRequired()])
    total_points = StringField('Total Points', validators=[DataRequired()])
    file = FileField('Assignment File', validators=[
        FileAllowed(['pdf', 'doc', 'docx'], 'Only PDF and Word documents are allowed!')
    ])
    submit = SubmitField('Create Assignment')

class SubmissionForm(FlaskForm):
    file = FileField('Submission File', validators=[
        FileRequired(),
        FileAllowed(['pdf', 'doc', 'docx'], 'Only PDF and Word documents are allowed!')
    ])
    submit = SubmitField('Submit Assignment')

class MaterialForm(FlaskForm):
    title = StringField('Title', validators=[DataRequired()])
    description = TextAreaField('Description', validators=[DataRequired()])
    material_type = SelectField('Type', choices=[
        ('lecture', 'Lecture'),
        ('reading', 'Reading'),
        ('video', 'Video'),
        ('other', 'Other')
    ])
    file = FileField('Material File', validators=[FileRequired()])
    submit = SubmitField('Upload Material')

def allowed_file(filename, allowed_extensions):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

def save_file(file, folder):
    if file:
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], folder, unique_filename)
        file.save(file_path)
        return os.path.join(folder, unique_filename)
    return None

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# H5P content settings
H5P_CONTENT_PATH = os.path.join(app.root_path, 'h5p', 'content')
H5P_LIBRARY_PATH = os.path.join(app.root_path, 'h5p')

# H5P content endpoints
@app.route('/h5p/content/<content_id>/<path:filename>')
def h5p_content_files(content_id, filename):
    return send_from_directory(os.path.join(H5P_CONTENT_PATH, content_id), filename)

@app.route('/h5p/<path:filename>')
def h5p_files(filename):
    return send_from_directory(H5P_LIBRARY_PATH, filename)

@app.route('/h5p/libraries/<path:filename>')
def h5p_library_files(filename):
    return send_from_directory(os.path.join(H5P_LIBRARY_PATH), filename)

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/dashboard')
@login_required
def dashboard():
    if current_user.role == 'student':
        enrolled_courses = current_user.enrolled_courses
        submissions = current_user.submissions
        return render_template('student_dashboard.html', 
                             courses=enrolled_courses, 
                             submissions=submissions)
    else:
        teaching_courses = current_user.courses_teaching
        return render_template('staff_dashboard.html', 
                             courses=teaching_courses)

@app.route('/course/<int:course_id>/enroll', methods=['POST'])
@login_required
def enroll_course(course_id):
    if current_user.role != 'student':
        flash('Only students can enroll in courses.', 'danger')
        return redirect(url_for('courses'))
    
    course = Course.query.get_or_404(course_id)
    if course in current_user.enrolled_courses:
        flash('You are already enrolled in this course.', 'info')
    else:
        current_user.enrolled_courses.append(course)
        db.session.commit()
        flash('Successfully enrolled in the course!', 'success')
    return redirect(url_for('course_detail', course_id=course_id))

@app.route('/course/<int:course_id>/material/add', methods=['GET', 'POST'])
@login_required
def add_material(course_id):
    if current_user.role != 'staff':
        flash('Only staff members can add materials.', 'danger')
        return redirect(url_for('course_detail', course_id=course_id))
    
    course = Course.query.get_or_404(course_id)
    form = MaterialForm()
    
    if form.validate_on_submit():
        file_path = save_file(form.file.data, 'materials')
        material = Material(
            title=form.title.data,
            description=form.description.data,
            material_type=form.material_type.data,
            file_path=file_path,
            course_id=course_id
        )
        db.session.add(material)
        db.session.commit()
        flash('Material added successfully!', 'success')
        return redirect(url_for('course_detail', course_id=course_id))
    
    return render_template('add_material.html', form=form, course=course)

@app.route('/assignment/<int:assignment_id>/submit', methods=['GET', 'POST'])
@login_required
def submit_assignment(assignment_id):
    if current_user.role != 'student':
        flash('Only students can submit assignments.', 'danger')
        return redirect(url_for('index'))
    
    assignment = Assignment.query.get_or_404(assignment_id)
    form = SubmissionForm()
    
    if form.validate_on_submit():
        file_path = save_file(form.file.data, 'submissions')
        submission = Submission(
            student_id=current_user.id,
            assignment_id=assignment_id,
            file_path=file_path
        )
        db.session.add(submission)
        db.session.commit()
        flash('Assignment submitted successfully!', 'success')
        return redirect(url_for('course_detail', course_id=assignment.course_id))
    
    return render_template('submit_assignment.html', form=form, assignment=assignment)

@app.route('/submission/<int:submission_id>/grade', methods=['POST'])
@login_required
def grade_submission(submission_id):
    if current_user.role != 'staff':
        return jsonify({'error': 'Unauthorized'}), 403
    
    submission = Submission.query.get_or_404(submission_id)
    data = request.get_json()
    
    submission.grade = data.get('grade')
    submission.feedback = data.get('feedback')
    submission.status = 'graded'
    db.session.commit()
    
    return jsonify({'message': 'Submission graded successfully'})

@app.route('/uploads/<path:filename>')
@login_required
def download_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data.lower()).first()
        
        if user is None:
            flash('No account found with this email address.', 'danger')
            return render_template('login.html', form=form)
        
        if not user.check_password(form.password.data):
            flash('Incorrect password. Please try again.', 'danger')
            return render_template('login.html', form=form)
        
        login_user(user, remember=form.remember_me.data)
        flash(f'Welcome back, {user.first_name}!', 'success')
        
        # Get the next page from the URL parameters, defaulting to dashboard
        next_page = request.args.get('next')
        if not next_page or urlparse(next_page).netloc != '':
            next_page = url_for('dashboard')
        
        return redirect(next_page)
    
    return render_template('login.html', form=form)

@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    form = RegistrationForm()
    if form.validate_on_submit():
        if User.query.filter_by(email=form.email.data).first():
            flash('Email already registered', 'danger')
            return render_template('register.html', form=form)
        
        user = User(
            email=form.email.data,
            role=form.role.data,
            first_name=form.first_name.data,
            last_name=form.last_name.data
        )
        user.set_password(form.password.data)
        db.session.add(user)
        db.session.commit()
        flash('Registration successful! Please login.', 'success')
        return redirect(url_for('login'))
    return render_template('register.html', form=form)

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

@app.route('/courses')
def courses():
    courses = Course.query.all()
    return render_template('courses.html', courses=courses)

@app.route('/courses/create', methods=['GET', 'POST'])
@login_required
def create_course():
    if current_user.role != 'staff':
        flash('Only staff members can create courses.', 'danger')
        return redirect(url_for('courses'))
    
    form = CourseForm()
    if form.validate_on_submit():
        course = Course(
            title=form.title.data,
            description=form.description.data,
            instructor_id=current_user.id
        )
        db.session.add(course)
        db.session.commit()
        flash('Course created successfully!', 'success')
        return redirect(url_for('courses'))
    return render_template('create_course.html', form=form)

@app.route('/courses/<int:course_id>')
def course_detail(course_id):
    course = Course.query.get_or_404(course_id)
    return render_template('course_detail.html', course=course)

@app.route('/api/register', methods=['POST'])
def api_register():
    data = request.get_json()
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    user = User(
        email=data['email'],
        role=data['role'],
        first_name=data['first_name'],
        last_name=data['last_name']
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/api/courses', methods=['GET'])
def get_courses():
    courses = Course.query.all()
    return jsonify([{
        'id': course.id,
        'title': course.title,
        'description': course.description
    } for course in courses])

@app.route('/api/courses', methods=['POST'])
def create_course_api():
    data = request.get_json()
    course = Course(
        title=data['title'],
        description=data['description'],
        instructor_id=data['instructor_id']
    )
    db.session.add(course)
    db.session.commit()
    return jsonify({'message': 'Course created successfully'}), 201

@app.route('/api/assignments', methods=['GET'])
def get_assignments():
    course_id = request.args.get('course_id')
    query = Assignment.query
    if course_id:
        query = query.filter_by(course_id=course_id)
    assignments = query.all()
    return jsonify([{
        'id': assignment.id,
        'title': assignment.title,
        'description': assignment.description,
        'due_date': assignment.due_date.isoformat() if assignment.due_date else None
    } for assignment in assignments])

if __name__ == '__main__':
    with app.app_context():
        try:
            db.create_all()
        except Exception as e:
            print(f"Database initialization error: {e}")
    app.run(debug=True, port=5001)
