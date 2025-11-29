# AI-Powered Feedback & Peer Review System (AFPRS)
## Comprehensive Project Report

---

## 1. PROJECT OVERVIEW

### 1.1 Project Title
**AI-Powered Feedback & Peer Review System (AFPRS) / MetroEval**

### 1.2 Project Description
AFPRS is a comprehensive web-based educational platform designed for Metropolia University of Applied Sciences. The system provides AI-powered automated feedback generation, peer review management, and learning tools to enhance the educational experience for both students and teachers.

### 1.3 Project Objectives
- Provide automated AI-powered feedback on student submissions (code, essays, reports)
- Facilitate peer review assignments and management
- Enable intelligent peer matching based on skill levels and departments
- Offer learning tools including flashcards, resources, and AI tutor chat
- Provide analytics and performance prediction for teachers
- Support multiple submission types (code, essays, reports, etc.)
- Implement plagiarism detection capabilities
- Track student progress and time spent on assignments

### 1.4 Target Users
- **Students**: Submit assignments, receive AI and peer feedback, review peers' work, use learning tools
- **Teachers**: Create assignments, monitor student progress, view analytics, manage courses

### 1.5 Institution
Metropolia University of Applied Sciences, Finland

---

## 2. TECHNICAL ARCHITECTURE

### 2.1 System Architecture
**Architecture Type**: Full-stack web application with microservices-ready structure

**Architecture Pattern**: 
- **Backend**: RESTful API with Flask (Python)
- **Frontend**: Single Page Application (SPA) with React
- **Database**: MongoDB (NoSQL document database)
- **Deployment**: Docker containerization with docker-compose

### 2.2 Technology Stack

#### Backend Technologies
- **Framework**: Flask 3.0.0 (Python web framework)
- **Database**: MongoDB 7.0 with MongoEngine 0.27.0 (ODM)
- **Authentication**: Flask-Login 0.6.3
- **AI Services**: 
  - Google Generative AI (Gemini 2.0 Flash) for feedback generation
  - Sentence Transformers for semantic similarity
- **Machine Learning**: 
  - scikit-learn 1.3.2 for performance prediction
  - NumPy 1.24.3 for numerical operations
  - Pandas 2.1.3 for data analysis
- **Natural Language Processing**: NLTK 3.8.1
- **Testing**: pytest 7.4.3, pytest-cov, pytest-flask, pytest-mock
- **Code Quality**: black, flake8, isort, mypy

#### Frontend Technologies
- **Framework**: React 18.2.0
- **Build Tool**: Vite 5.0.8
- **Routing**: React Router DOM 6.20.0
- **HTTP Client**: Axios 1.6.2
- **UI Components**: Custom React components
- **Charts**: Chart.js 4.4.0 with react-chartjs-2 5.2.0
- **Markdown Rendering**: react-markdown 10.1.0
- **Syntax Highlighting**: react-syntax-highlighter 16.1.0
- **Testing**: Vitest 1.0.4, @testing-library/react, @testing-library/jest-dom

#### Infrastructure
- **Containerization**: Docker with docker-compose
- **Web Server**: Flask development server (backend), Nginx (frontend production)
- **Database**: MongoDB 7.0 container

### 2.3 System Components

#### Backend Components
1. **API Layer** (`backend/app/api/`)
   - Authentication endpoints (`auth.py`)
   - User management (`users.py`)
   - Submission management (`submissions.py`)
   - Feedback generation (`feedback.py`)
   - Peer review management (`peer_reviews.py`)
   - Teacher analytics (`teacher.py`)
   - Flashcard system (`flashcards.py`)
   - AI Tutor chat (`tutor.py`)
   - Bookmarks (`bookmarks.py`)
   - Notifications (`notifications.py`)

2. **Service Layer** (`backend/app/services/`)
   - AI Service: Feedback generation, plagiarism detection, flashcard generation, tutor chat
   - Peer Matching Service: Intelligent peer review assignment
   - Performance Predictor Service: Student performance prediction using ML

3. **Data Models** (`backend/app/models/`)
   - User, Course, Submission, Feedback, PeerReview
   - Flashcard, Bookmark, Notification, Resource
   - SubmissionTemplate, SubmissionVersion, Draft
   - TimeTracking, WeeklyChallenge, Quiz, Deadline, Announcement

4. **Middleware** (`backend/app/middleware/`)
   - CORS handling
   - Authentication middleware
   - Error handling

5. **Utilities** (`backend/app/utils/`)
   - Authentication utilities
   - Database utilities
   - Response formatting
   - Validation helpers
   - Department utilities
   - Model utilities

#### Frontend Components
1. **Pages** (`frontend/src/features/`)
   - Authentication: Login, Register
   - Dashboard: Student Dashboard, Teacher Dashboard, Teacher Analytics
   - Submissions: Submissions list, Feedback view, Peer Reviews
   - Learning: Flashcards, Resources, Templates, Tutor Chat
   - Profile: User Profile, Bookmarks

2. **Components** (`frontend/src/components/`)
   - Layout, Navigation, Footer
   - SubmissionForm, SubmissionsList, FeedbackSection
   - PeerReviewModal, SubmissionDetailModal
   - ProgressOverview, QuickStats, TimeTracking
   - NotificationBell, MarkdownRenderer

3. **Context Providers** (`frontend/src/context/`)
   - AuthContext: User authentication state
   - NotificationContext: Real-time notifications

4. **Hooks** (`frontend/src/hooks/`)
   - useApi: API request handling
   - useForm: Form state management
   - useLogin, useRegister: Authentication hooks
   - useUserDepartment: Department management

### 2.4 Database Schema

#### Core Collections
- **users**: User accounts (email, password_hash, name, role, skill_level, department)
- **courses**: Course information (name, code, department)
- **submissions**: Student submissions (user_id, course_id, content, files, submission_type)
- **feedbacks**: Feedback records (submission_id, reviewer_id, feedback_text, scores, feedback_type)
- **peer_reviews**: Peer review assignments (submission_id, reviewer_id, status, feedback_text)
- **flashcards**: Learning flashcards (user_id, front, back, category, mastery_level)
- **bookmarks**: Saved items (user_id, item_type, item_id)
- **notifications**: User notifications (user_id, message, type, read)

---

## 3. KEY FEATURES AND FUNCTIONALITY

### 3.1 Authentication & Authorization
- User registration with email validation (@metropolia.fi domain)
- Secure password hashing
- Session-based authentication with Flask-Login
- Role-based access control (student/teacher)
- Department-based filtering

### 3.2 Submission Management
- **Multiple Submission Types**: Code, essays, reports, reflections, research papers, case studies
- **File Upload Support**: Multiple files per submission (code files, documents, images)
- **Submission Versions**: Version history tracking
- **Draft Saving**: Auto-save drafts
- **Practice Mode**: Students can submit practice assignments
- **Status Tracking**: submitted, reviewed, graded, practice

### 3.3 AI-Powered Feedback Generation
- **Automated Feedback**: Uses Google Gemini 2.0 Flash AI model
- **Submission Type Detection**: Different feedback templates for code vs. essays
- **Structured Feedback Format**:
  - Executive Summary with grade
  - Strengths identification
  - Critical failures and bugs
  - Requirements verification
  - Code quality violations
  - Immediate fixes required
  - Next steps checklist
- **Scoring System**: 
  - Correctness score (0.0-1.0)
  - Quality score (0.0-1.0)
  - Completeness score (0.0-1.0)
- **Plagiarism Detection**: Pattern-based and semantic similarity checking

### 3.4 Peer Review System
- **Intelligent Peer Matching**: 
  - Department-based matching (preferred)
  - Skill level consideration
  - Prevents duplicate assignments
  - Configurable peers per submission (default: 2)
- **Review Management**:
  - Assignment tracking
  - Review submission interface
  - Status tracking (pending, completed, skipped)
  - Review history

### 3.5 Learning Tools

#### Flashcards
- **AI-Generated Flashcards**: Topic-based flashcard generation using AI
- **Custom Flashcards**: User-created flashcards
- **Spaced Repetition**: Mastery level tracking (0.0-1.0)
- **Answer Verification**: AI-powered answer checking
- **Categories**: Organized by topic/subject
- **Review System**: Track review count and last reviewed date

#### AI Tutor Chat
- **Interactive Chat**: Real-time AI tutor assistance
- **Context Awareness**: Uses submission history and course context
- **Conversation History**: Maintains chat context
- **Code Support**: Syntax-highlighted code snippets in responses

#### Resources & Templates
- **Learning Resources**: Course materials and references
- **Submission Templates**: Pre-defined templates for assignments

### 3.6 Teacher Features

#### Analytics Dashboard
- **Student Progress Tracking**: Department-wise and individual student progress
- **Performance Prediction**: ML-based risk assessment
  - High/Medium/Low risk classification
  - Predicted scores
  - Risk factors identification
  - Recommendations generation
- **Submission Analytics**: 
  - Submission counts
  - Average scores
  - Completion rates
  - Improvement trends

#### Student Management
- **Student List**: View all students by department
- **Individual Student View**: Detailed progress for each student
- **Feedback Management**: Review and manage all feedback

### 3.7 Additional Features
- **Bookmarks**: Save submissions, feedback, or resources
- **Notifications**: Real-time notifications for reviews, feedback, deadlines
- **Time Tracking**: Track time spent on assignments
- **Deadlines**: Assignment deadline management
- **Announcements**: Course announcements
- **Weekly Challenges**: Challenge-based learning
- **Feedback Reactions**: Emoji reactions on feedback
- **Progress Visualization**: Charts and graphs for progress tracking

---

## 4. AI/ML COMPONENTS

### 4.1 AI Feedback Generation
- **Model**: Google Gemini 2.0 Flash
- **Functionality**:
  - Code evaluation with strict professional standards
  - Essay/writing feedback with supportive tone
  - Multi-file submission handling
  - Structured feedback formatting
  - Grade assignment (A-F)
- **Configuration**: Temperature 0.3 for consistency, max 3000 tokens

### 4.2 Plagiarism Detection
- **Methods**:
  - Pattern-based detection (regex patterns)
  - Semantic similarity (sentence transformers)
  - Threshold-based classification (default: 0.7)
- **Output**: Similarity score, confidence level, suggestions

### 4.3 Performance Prediction
- **Model**: Linear Regression (scikit-learn)
- **Features**:
  - Student skill level
  - Submission count
  - Average scores
  - Improvement trend
  - Peer feedback quality
  - Completion rate
- **Output**: 
  - Predicted score (0.0-1.0)
  - Risk level (high/medium/low)
  - Risk factors
  - Recommendations

### 4.4 Flashcard Generation
- **AI Model**: Google Gemini 2.0 Flash
- **Features**:
  - Topic-based generation
  - Configurable count (default: 25, max: 100)
  - Coding vs. conceptual differentiation
  - JSON-structured output
  - Fallback generation on errors

### 4.5 Answer Verification
- **AI-Powered Verification**: Uses Gemini for answer checking
- **Features**:
  - Coding question support
  - Conceptual question support
  - Confidence scoring
  - Similarity scoring
  - Constructive feedback generation

---

## 5. API ENDPOINTS

### 5.1 Authentication Endpoints
- `POST /api/v1/login` - User login
- `POST /api/v1/register` - User registration
- `GET /api/v1/logout` - User logout

### 5.2 User Endpoints
- `GET /api/v1/user/profile` - Get user profile
- `PUT /api/v1/user/profile` - Update user profile
- `POST /api/v1/user/department` - Update department
- `POST /api/v1/user/avatar` - Upload avatar

### 5.3 Submission Endpoints
- `POST /api/v1/submit` - Submit assignment
- `GET /api/v1/submissions` - List submissions
- `GET /api/v1/submission/<id>` - Get submission details
- `GET /api/v1/submission/<id>/versions` - Get version history
- `POST /api/v1/submission/<id>/save-version` - Save version

### 5.4 Feedback Endpoints
- `GET /api/v1/feedback` - List feedback
- `POST /api/v1/generate-feedback` - Generate AI feedback

### 5.5 Peer Review Endpoints
- `GET /api/v1/peer-reviews` - List peer reviews
- `POST /api/v1/peer-review/<id>/submit` - Submit peer review
- `DELETE /api/v1/peer-review/<id>/delete` - Delete peer review
- `GET /api/v1/submission/<id>/peer-reviews` - Get reviews for submission
- `POST /api/v1/submissions/peer-reviews/batch` - Batch create reviews

### 5.6 Teacher Endpoints
- `GET /api/v1/teacher/progress/<department>` - Department progress
- `GET /api/v1/performance-prediction` - Performance predictions
- `POST /api/v1/plagiarism-check` - Check plagiarism

### 5.7 Flashcard Endpoints
- `GET /api/v1/flashcards` - List flashcards
- `POST /api/v1/flashcards` - Create flashcard
- `POST /api/v1/flashcards/generate` - Generate AI flashcards
- `POST /api/v1/flashcard/<id>/review` - Review flashcard
- `POST /api/v1/flashcard/<id>/verify-answer` - Verify answer
- `DELETE /api/v1/flashcards/<id>` - Delete flashcard

### 5.8 Tutor Endpoints
- `POST /api/v1/tutor/chat` - Chat with AI tutor

### 5.9 Bookmark Endpoints
- `GET /api/v1/bookmarks` - List bookmarks
- `POST /api/v1/bookmarks` - Create bookmark
- `POST /api/v1/bookmark/<id>/delete` - Delete bookmark

### 5.10 Notification Endpoints
- `GET /api/v1/notifications` - List notifications
- `POST /api/v1/notification/<id>/read` - Mark as read
- `POST /api/v1/notifications/read-all` - Mark all as read
- `GET /api/v1/notifications/stream` - Stream notifications

---

## 6. DATA MODELS

### 6.1 User Model
- email (String, unique, required)
- password_hash (String, required)
- name (String, max 100, required)
- role (String: 'student'/'teacher', required)
- skill_level (Float: 0.0-1.0, default 0.5)
- department (String, default 'General Studies')
- created_at (DateTime)
- theme_preference (String: 'light'/'dark'/'auto')
- avatar_url (String)

### 6.2 Course Model
- name (String, max 200, required)
- code (String, unique, max 50, required)
- department (String, default 'General Studies')
- created_at (DateTime)

### 6.3 Submission Model
- user_id (Reference: User, required)
- course_id (Reference: Course, required)
- assignment_title (String, max 200, required)
- content (String, required)
- task_description (String)
- submission_type (String, max 50, required)
- status (String: 'submitted'/'reviewed'/'graded'/'practice')
- is_practice (Boolean, default False)
- files (List: SubmissionFile)
- created_at (DateTime)
- updated_at (DateTime)

### 6.4 Feedback Model
- submission_id (Reference: Submission, required)
- reviewer_id (Reference: User, optional)
- feedback_text (String, required)
- scores (Dict: {"correctness": float, "quality": float, ...})
- feedback_type (String: 'ai'/'peer', required)
- created_at (DateTime)

### 6.5 PeerReview Model
- submission_id (Reference: Submission, required)
- reviewer_id (Reference: User, required)
- status (String: 'pending'/'completed'/'skipped')
- feedback_text (String)
- assigned_at (DateTime)
- completed_at (DateTime)

### 6.6 Flashcard Model
- user_id (Reference: User, required)
- front (String, required)
- back (String, required)
- category (String, max 100)
- difficulty (Int: 1-5, default 1)
- last_reviewed (DateTime)
- review_count (Int, default 0)
- mastery_level (Float: 0.0-1.0, default 0.0)
- created_at (DateTime)

---

## 7. SECURITY FEATURES

### 7.1 Authentication Security
- Password hashing (Werkzeug security)
- Session-based authentication
- Secure cookie handling
- CSRF protection (Flask-Login)

### 7.2 Authorization
- Role-based access control (RBAC)
- Route protection (PrivateRoute component)
- API endpoint protection (authentication middleware)
- Teacher-only endpoints

### 7.3 Data Validation
- Input validation on API endpoints
- File upload restrictions (5MB max, allowed extensions)
- Email domain validation (@metropolia.fi)
- SQL injection prevention (MongoDB NoSQL)

### 7.4 Environment Security
- Environment variables for sensitive data
- Secret key management
- API key protection (Gemini API)
- Database connection security

---

## 8. TESTING

### 8.1 Backend Testing
- **Framework**: pytest 7.4.3
- **Coverage**: pytest-cov with HTML reports
- **Test Files**:
  - `test_api_endpoints.py` - API endpoint tests
  - `test_auth.py` - Authentication tests
  - `test_models.py` - Model tests
  - `test_submissions.py` - Submission tests
- **Configuration**: Separate test database (test_afprs)
- **Mocking**: pytest-mock for service mocking

### 8.2 Frontend Testing
- **Framework**: Vitest 1.0.4
- **Testing Library**: @testing-library/react
- **Coverage**: v8 coverage provider
- **Test Files**:
  - Component tests (Layout, PrivateRoute, QuickStats, etc.)
  - Hook tests (useLogin, useUserDepartment)
  - Page tests (Login, Register)
  - Service tests (api.js)
- **Environment**: jsdom for DOM simulation

### 8.3 Test Scripts
- `npm test` - Run all tests
- `npm run test:frontend` - Frontend tests only
- `npm run test:backend` - Backend tests only
- `npm run test:watch` - Watch mode
- `npm run test:coverage` - Coverage reports

---

## 9. DEPLOYMENT

### 9.1 Docker Configuration
- **docker-compose.yml**: Multi-container setup
  - MongoDB service (port 27017)
  - Backend service (port 5001)
  - Frontend service (port 3000)
- **Dockerfile.backend**: Python Flask application
- **Dockerfile.frontend**: React application with Nginx

### 9.2 Environment Configuration
- **Backend**: Flask environment variables
  - FLASK_ENV
  - MONGODB_URI
  - SECRET_KEY
  - GEMINI_API_KEY
- **Frontend**: Vite build configuration
- **Database**: MongoDB with persistent volumes

### 9.3 Network Configuration
- Docker bridge network (afprs-network)
- Service dependencies
- Port mappings
- Volume mounts for development

---

## 10. PROJECT STRUCTURE

```
afprs/
├── backend/
│   ├── app/
│   │   ├── api/          # API endpoints
│   │   ├── core/         # Database configuration
│   │   ├── exceptions/   # Custom exceptions
│   │   ├── middleware/   # Middleware (CORS, auth, errors)
│   │   ├── models/       # Data models
│   │   ├── services/     # Business logic services
│   │   └── utils/        # Utility functions
│   ├── tests/            # Backend tests
│   └── requirements.txt  # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── context/      # React contexts
│   │   ├── features/     # Feature-based pages
│   │   ├── hooks/        # Custom React hooks
│   │   ├── services/     # API services
│   │   └── styles/       # CSS files
│   └── package.json      # Frontend dependencies
├── tests/                # Shared tests
├── scripts/              # Utility scripts
├── docker-compose.yml    # Docker configuration
├── Dockerfile.backend    # Backend Dockerfile
└── Dockerfile.frontend   # Frontend Dockerfile
```

---

## 11. DEPARTMENTS SUPPORTED

1. General Studies
2. Engineering & Computer Science
3. Business & Economics
4. Design & Creative Arts
5. Health & Life Sciences
6. Social Sciences & Humanities

---

## 12. CONFIGURATION CONSTANTS

### 12.1 API Configuration
- API Prefix: `/api`
- Default Page Size: 20
- Max Page Size: 100

### 12.2 File Upload
- Max File Size: 5MB
- Allowed Image Extensions: png, jpg, jpeg, gif, webp
- Allowed File Extensions: pdf, doc, docx, txt, md, code files, zip, rar

### 12.3 Peer Review
- Default Peers per Submission: 2
- Min Peers: 1
- Max Peers: 5
- Self-review: Configurable (default: false)

### 12.4 Flashcards
- Default Count: 25
- Max Count: 100

### 12.5 Quiz
- Default Time Limit: 20 minutes
- Default Questions: 25

---

## 13. FUTURE ENHANCEMENTS (Potential)

1. **Advanced Analytics**
   - More sophisticated ML models
   - Predictive analytics for course completion
   - Learning path recommendations

2. **Enhanced AI Features**
   - Multi-language support
   - Voice feedback
   - Video submission support

3. **Collaboration Features**
   - Group submissions
   - Team peer reviews
   - Collaborative editing

4. **Mobile Application**
   - React Native mobile app
   - Push notifications
   - Offline support

5. **Integration**
   - LMS integration (Moodle, Canvas)
   - GitHub integration for code submissions
   - Calendar integration

6. **Gamification**
   - Achievement badges
   - Leaderboards
   - Points system

---

## 14. TECHNICAL CHALLENGES AND SOLUTIONS

### 14.1 Challenges
1. **AI Feedback Quality**: Ensuring consistent, helpful feedback
   - **Solution**: Structured templates, temperature tuning, prompt engineering

2. **Peer Matching Algorithm**: Fair and effective peer assignment
   - **Solution**: Department-based matching with skill level consideration

3. **Real-time Notifications**: Efficient notification delivery
   - **Solution**: Server-sent events (SSE) for streaming

4. **File Upload Handling**: Managing multiple file types and sizes
   - **Solution**: Base64 encoding, size limits, type validation

5. **Performance Prediction Accuracy**: Reliable ML predictions
   - **Solution**: Feature engineering, multiple metrics, risk classification

### 14.2 Best Practices Implemented
- RESTful API design
- Separation of concerns (MVC-like architecture)
- Error handling and logging
- Code quality tools (black, flake8, mypy)
- Comprehensive testing
- Docker containerization
- Environment-based configuration

---

## 15. PROJECT STATISTICS

### 15.1 Codebase Size
- **Backend**: ~15+ Python modules, 20+ models, 10+ API endpoints
- **Frontend**: ~30+ React components, 15+ pages, 10+ hooks
- **Total Files**: 100+ source files

### 15.2 Dependencies
- **Backend**: 19 Python packages
- **Frontend**: 22 npm packages (dependencies + devDependencies)

### 15.3 Features Count
- **API Endpoints**: 40+ endpoints
- **Data Models**: 20+ models
- **Frontend Pages**: 15+ pages
- **React Components**: 30+ components

---

## 16. CONCLUSION

The AI-Powered Feedback & Peer Review System (AFPRS) is a comprehensive educational platform that successfully integrates AI technology with traditional peer review processes. The system provides:

- **Automated Feedback**: AI-powered evaluation reduces teacher workload
- **Peer Learning**: Structured peer review enhances student learning
- **Analytics**: Data-driven insights help identify at-risk students
- **Learning Tools**: Flashcards and AI tutor support student learning
- **Scalability**: Docker-based deployment supports easy scaling
- **User Experience**: Modern React UI with responsive design

The project demonstrates proficiency in:
- Full-stack web development
- AI/ML integration
- Database design (NoSQL)
- RESTful API design
- Modern frontend frameworks
- Testing and quality assurance
- DevOps and containerization

---

## APPENDIX A: KEY FILES REFERENCE

### Backend Key Files
- `backend/app/main.py` - Application entry point
- `backend/app/__init__.py` - Application factory
- `backend/app/config.py` - Configuration constants
- `backend/app/core/database.py` - Database initialization
- `backend/app/services/ai_service.py` - AI service implementation
- `backend/app/services/peer_matching_service.py` - Peer matching logic
- `backend/app/services/performance_predictor_service.py` - ML prediction

### Frontend Key Files
- `frontend/src/App.jsx` - Main application component
- `frontend/src/main.jsx` - Application entry point
- `frontend/src/services/api.js` - API client configuration
- `frontend/src/context/AuthContext.jsx` - Authentication context
- `frontend/src/context/NotificationContext.jsx` - Notification context

---

## APPENDIX B: ENVIRONMENT VARIABLES

### Required Environment Variables
- `SECRET_KEY` - Flask secret key (required in production)
- `MONGODB_URI` - MongoDB connection string
- `GEMINI_API_KEY` - Google Gemini API key (for AI features)
- `FLASK_ENV` - Flask environment (development/production/testing)
- `PORT` - Backend port (default: 5001)

---

## APPENDIX C: API RESPONSE FORMATS

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

---

**Report Generated**: Comprehensive analysis of AFPRS project
**Version**: 1.0
**Date**: 2024

