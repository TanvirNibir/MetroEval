# MetroEval - AI-Powered Feedback & Peer Review System

> **An intelligent educational platform for Metropolia University of Applied Sciences**  
> Automated feedback generation, peer review matching, and performance analytics powered by Google Gemini AI

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb.svg)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0.0-black.svg)](https://flask.palletsprojects.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47a248.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Implementation Status](#implementation-status)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [Roadmap & Future Enhancements](#roadmap--future-enhancements)

---

## 🎯 Overview

**MetroEval** (AFPRS - Automated Feedback and Peer Review System) is a comprehensive full-stack web application designed to revolutionize the feedback and assessment process at Metropolia University of Applied Sciences. The platform leverages cutting-edge AI technology to provide instant, detailed feedback on student submissions while facilitating meaningful peer-to-peer learning experiences.

### Key Capabilities

- **AI-Powered Feedback**: Instant, multi-dimensional feedback using Google Gemini AI ✅
- **Intelligent Peer Matching**: Algorithm-based peer review assignment 🚧
- **Performance Analytics**: Data-driven insights and progress tracking ✅
- **Multi-Department Support**: Adaptable to various academic departments ✅
- **Academic Integrity**: Built-in plagiarism detection and semantic analysis ✅
- **Learning Tools**: Flashcards, resources, and AI tutor chat ✅

**Legend**: ✅ Fully Implemented | 🚧 In Progress | 📋 Planned

---

## 📊 Implementation Status

### Current Version: v1.0.0 (Development)

This project is actively under development. Below is the current implementation status:

#### ✅ Fully Implemented Features

- **Authentication & User Management**
  - User registration and login
  - Session-based authentication
  - Profile management
  - Department selection
  - Avatar upload

- **AI-Powered Feedback System**
  - Google Gemini AI integration
  - Multi-dimensional feedback generation
  - Code quality analysis
  - Structured feedback format
  - Feedback history and retrieval

- **Submission Management**
  - File upload support (multiple formats)
  - Submission versioning
  - Submission history
  - Content-based submissions
  - Department-based organization

- **Learning Tools**
  - Interactive flashcards
  - AI-generated flashcards
  - Flashcard review system
  - AI Tutor chat (rate-limited)
  - Study resources management

- **Student Dashboard**
  - Personal performance tracking
  - Submission statistics
  - Quick stats overview
  - Progress visualization

- **Core Infrastructure**
  - RESTful API architecture
  - MongoDB database integration
  - Security middleware (CORS, rate limiting, headers)
  - Error handling and validation
  - Notification system (basic)

#### 🚧 In Progress / Partially Implemented

- **Peer Review System** 🚧
  - Basic peer review models and routes exist
  - Peer matching service implemented (basic algorithm)
  - Review submission endpoints functional
  - **Missing/Incomplete**:
    - Advanced matching algorithm refinement
    - Comprehensive review workflow
    - Review quality assessment
    - Peer review analytics
    - Review moderation tools
    - Automated review assignment workflows

- **Teacher Dashboard & Features** 🚧
  - Basic teacher routes and authentication exist
  - Teacher dashboard UI components created
  - Department progress endpoints implemented
  - **Missing/Incomplete**:
    - Complete teacher analytics dashboard
    - Comprehensive student management interface
    - Advanced performance prediction UI
    - Feedback moderation interface
    - Peer review oversight tools
    - Bulk operations and management tools
    - Advanced reporting and export features

#### 📋 Planned for Future Implementation

- **Enhanced Peer Review System**
  - Advanced matching algorithms (skill-based, history-based)
  - Review quality scoring
  - Peer review analytics and insights
  - Automated review reminders
  - Review conflict resolution
  - Multi-stage review workflows

- **Complete Teacher Portal**
  - Full-featured analytics dashboard
  - Student performance tracking and comparison
  - Advanced plagiarism detection interface
  - Feedback moderation and approval workflows
  - Course and assignment management
  - Bulk grading and feedback tools
  - Export and reporting capabilities
  - Student communication tools

- **Additional Features**
  - WebSocket support for real-time updates
  - Advanced ML models for performance prediction
  - Mobile app support
  - LMS integration
  - Multi-language support
  - Video submission support
  - Collaborative editing features

---

## ⚠️ Known Limitations & Current Status

### Important Notes for Users

This project is in **active development**. While core features are functional, some areas require additional work:

1. **Teacher Portal** 🚧
   - Basic API endpoints exist and are functional
   - Teacher dashboard UI components are created but incomplete
   - Full analytics, student management, and oversight features are planned
   - **Current State**: Teachers can access basic endpoints but full UI/UX experience is in development

2. **Peer Review System** 🚧
   - Basic peer review functionality is implemented (create, submit, view)
   - Simple matching algorithm exists (department-based)
   - **Missing**: Advanced matching algorithms, quality assessment, comprehensive analytics, review moderation tools
   - **Current State**: Basic peer review workflow works, but advanced features need development

3. **Real-time Features**
   - Notifications use polling/SSE (Server-Sent Events), not WebSocket
   - Real-time collaboration features are not yet implemented

4. **Mobile Support**
   - Responsive design exists but not optimized for mobile
   - Native mobile apps are not available

### What Works Well ✅

- AI feedback generation is fully functional
- Student submission and management works end-to-end
- Authentication and user management is complete
- Learning tools (flashcards, tutor) are functional
- Basic analytics and dashboards for students

### Development Focus

The development team is currently prioritizing:
1. Completing the teacher portal with full features
2. Enhancing the peer review system with advanced capabilities
3. Improving overall user experience and UI polish

---

## ✨ Features

### For Students

- ✅ 🤖 **AI Feedback Generation**: Get instant, detailed feedback on code quality, structure, correctness, and best practices
- 🚧 👥 **Peer Review System**: Review and be reviewed by peers with intelligent matching *(Basic functionality available, advanced features in progress)*
- ✅ 📊 **Performance Dashboard**: Track your progress with visual analytics and trends
- ✅ 📝 **Submission Management**: Version control, file uploads, and submission history
- ✅ 🎯 **Learning Tools**: Interactive flashcards, study resources, and AI tutor chat
- ✅ 🔔 **Real-time Notifications**: Stay updated on feedback, reviews, and deadlines
- ✅ 📚 **Bookmarks**: Save important feedback and resources for later

### For Teachers

- 🚧 📈 **Analytics Dashboard**: Comprehensive student performance metrics and trends *(Basic implementation, full features in progress)*
- 🚧 🎓 **Student Management**: View all students, their submissions, and progress *(In progress)*
- ✅ 🔍 **Plagiarism Detection**: AI-powered similarity analysis *(API available, UI in progress)*
- 🚧 📊 **Performance Prediction**: ML-based risk assessment for at-risk students *(Backend ready, UI in progress)*
- 🚧 💬 **Feedback Management**: Review and moderate AI-generated feedback *(Planned)*
- 🚧 📋 **Peer Review Oversight**: Monitor and manage peer review assignments *(Planned)*

### Core Features

- **Multi-Department Support**: Engineering, Business, Design, Health Sciences, Social Sciences, and more
- **Role-Based Access Control**: Separate interfaces for students and teachers
- **Secure Authentication**: Session-based authentication with Flask-Login
- **File Upload Support**: Multiple file types with size validation
- **Version Control**: Track submission versions and changes over time
- **Rate Limiting**: API protection against abuse
- **CORS Support**: Configurable cross-origin resource sharing

---

## 🛠 Tech Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.11+ | Core language |
| **Flask** | 3.0.0 | Web framework |
| **MongoDB** | 7 | NoSQL database |
| **MongoEngine** | 0.27.0 | ODM (Object Document Mapper) |
| **Google Gemini AI** | Latest | AI feedback generation |
| **scikit-learn** | 1.3.2 | ML performance prediction |
| **sentence-transformers** | 2.2.2 | Semantic similarity analysis |
| **Flask-Login** | 0.6.3 | Authentication |
| **Flask-Limiter** | 3.5.0 | Rate limiting |
| **Flask-Talisman** | 1.1.0 | Security headers |
| **Gunicorn** | Latest | Production WSGI server |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | UI framework |
| **React Router** | 6.20.0 | Client-side routing |
| **Vite** | 5.0.8 | Build tool & dev server |
| **Axios** | 1.6.2 | HTTP client |
| **Chart.js** | 4.4.0 | Data visualization |
| **React Markdown** | 10.1.0 | Markdown rendering |
| **Vitest** | 1.0.4 | Testing framework |

### Infrastructure

- **Docker** & **Docker Compose**: Containerization
- **Nginx**: Frontend web server (production)
- **MongoDB**: Database server

---

## 🏗 Architecture

### System Architecture

```
┌─────────────────┐
│   React SPA     │  (Frontend - Port 3000)
│   (Vite)        │
└────────┬────────┘
         │ HTTP/REST
         │
┌────────▼────────┐
│  Flask API      │  (Backend - Port 5001)
│  (Gunicorn)     │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼──────┐
│MongoDB│ │Gemini AI│
│  7    │ │  API    │
└───────┘ └─────────┘
```

### Application Structure

- **RESTful API**: Backend exposes `/api/v1/*` endpoints
- **Component-Based Frontend**: Feature-based React component organization
- **Service Layer**: Business logic separated into service modules
- **Middleware**: Authentication, CORS, rate limiting, security headers
- **ODM Pattern**: MongoEngine for database abstraction

### Key Design Patterns

- **Factory Pattern**: Flask app factory (`create_app()`)
- **Blueprint Pattern**: Modular route organization
- **Service Layer**: Business logic separation
- **Repository Pattern**: Database access abstraction
- **Context API**: React state management

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Python** 3.11 or higher
- **Node.js** 18+ and npm
- **MongoDB** 7+ (or Docker for containerized setup)
- **Docker** & **Docker Compose** (optional, for containerized deployment)
- **Google Gemini API Key** (for AI features)

### System Requirements

- **RAM**: Minimum 4GB (8GB recommended)
- **Disk Space**: 2GB+ for dependencies
- **Network**: Internet connection for AI API calls

---

## 🚀 Installation

### Option 1: Docker Compose (Recommended)

The easiest way to get started is using Docker Compose:

```bash
# Clone the repository
git clone <repository-url>
cd vtk

# Create .env file (see Configuration section)
cp .env.example .env
# Edit .env with your configuration

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **MongoDB**: localhost:27017

### Option 2: Local Development Setup

#### Backend Setup

```bash
# Navigate to project root
cd vtk

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables (see Configuration section)
export SECRET_KEY="your-secret-key"
export MONGODB_URI="mongodb://localhost:27017/afprs"
export GOOGLE_API_KEY="your-gemini-api-key"

# Run the application
PYTHONPATH=. python3 backend/app/main.py
```

#### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the project root or set the following environment variables:

#### Backend Configuration

```bash
# Flask Configuration
SECRET_KEY=your-secret-key-here  # Required: Use a strong random key in production
FLASK_ENV=development  # Options: development, production, testing
PORT=5001  # Backend port

# Database Configuration
MONGODB_URI=mongodb://admin:password@localhost:27017/afprs?authSource=admin
# OR separate variables:
MONGODB_HOST=localhost
MONGODB_PORT=27017
MONGODB_DB=afprs
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=changeme-in-production

# AI Service Configuration
GOOGLE_API_KEY=your-google-gemini-api-key  # Required for AI features

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Security Configuration
ALLOW_SELF_REVIEW=false  # Allow students to review their own submissions (testing only)
```

#### Frontend Configuration

The frontend connects to the backend API. Update the API base URL in:
- `frontend/src/services/api.js` (if needed)

### MongoDB Setup

#### Using Docker (Recommended)

```bash
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=changeme \
  -e MONGO_INITDB_DATABASE=afprs \
  mongo:7
```

#### Local MongoDB Installation

1. Install MongoDB 7 from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service
3. Create database and user (if using authentication)

### Google Gemini API Setup

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add the key to your `.env` file as `GOOGLE_API_KEY`

---

## 🏃 Running the Application

### Development Mode

#### Backend

```bash
# From project root
cd backend
PYTHONPATH=.. python3 -m app.main

# Or using Flask CLI
export FLASK_APP=app.main
export FLASK_ENV=development
flask run --port 5001
```

#### Frontend

```bash
cd frontend
npm run dev
```

### Production Mode

#### Using Docker Compose

```bash
# Build and start
docker-compose up -d --build

# Stop
docker-compose down

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

#### Manual Production Deployment

**Backend:**
```bash
# Install Gunicorn
pip install gunicorn

# Run with Gunicorn
gunicorn --bind 0.0.0.0:5001 --workers 4 --timeout 120 backend.app.wsgi:app
```

**Frontend:**
```bash
cd frontend
npm run build
# Serve the dist/ directory with nginx or any static file server
```

---

## 📚 API Documentation

### Base URL

- **Development**: `http://localhost:5001/api/v1`
- **Production**: `https://your-domain.com/api/v1`

### Authentication

Most endpoints require authentication. Include session cookies or use the login endpoint to establish a session.

### Endpoints Overview

#### Authentication (`/api/v1/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/login` | User login | No |
| POST | `/register` | User registration | No |
| GET | `/logout` | User logout | Yes |

#### Submissions (`/api/v1/submissions`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/submit` | Submit assignment | Yes |
| GET | `/submissions` | List user submissions | Yes |
| GET | `/submission/<id>` | Get submission details | Yes |
| GET | `/submission/<id>/versions` | Get submission versions | Yes |
| POST | `/submission/<id>/save-version` | Save submission version | Yes |

#### Feedback (`/api/v1/feedback`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/feedback` | List feedback | Yes |
| POST | `/generate-feedback` | Generate AI feedback | Yes |

#### Peer Reviews (`/api/v1/peer-reviews`) 🚧

> **Status**: Basic functionality implemented. Advanced features in progress.

| Method | Endpoint | Description | Auth Required | Status |
|--------|----------|-------------|---------------|--------|
| GET | `/peer-reviews` | List peer reviews | Yes | ✅ Basic |
| POST | `/peer-review/<id>/submit` | Submit peer review | Yes | ✅ Basic |
| DELETE | `/peer-review/<id>/delete` | Delete peer review | Yes | ✅ Basic |
| GET | `/submission/<id>/peer-reviews` | Get reviews for submission | Yes | ✅ Basic |
| POST | `/submissions/peer-reviews/batch` | Batch create peer reviews | Yes | ✅ Basic |

**Note**: Peer review system has basic CRUD operations working. Advanced matching algorithms, quality assessment, and analytics are planned for future implementation.

#### AI Tutor (`/api/v1/tutor`)

| Method | Endpoint | Description | Auth Required | Rate Limit |
|--------|----------|-------------|---------------|------------|
| POST | `/tutor/chat` | Chat with AI tutor | Yes | 20/hour |

#### Flashcards (`/api/v1/flashcards`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/flashcards` | List flashcards | Yes |
| POST | `/flashcards` | Create flashcard | Yes |
| POST | `/flashcards/generate` | Generate flashcards from content | Yes |
| POST | `/flashcard/<id>/review` | Review flashcard | Yes |
| POST | `/flashcard/<id>/verify-answer` | Verify answer | Yes |
| DELETE | `/flashcards/<id>` | Delete flashcard | Yes |

#### User Management (`/api/v1/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/user/profile` | Get user profile | Yes |
| PUT | `/user/profile` | Update user profile | Yes |
| POST | `/user/department` | Update department | Yes |
| POST | `/user/avatar` | Upload avatar | Yes |

#### Teacher Endpoints (`/api/v1/teacher`) 🚧

> **Status**: Basic endpoints implemented. Full teacher portal features in progress.

| Method | Endpoint | Description | Auth Required | Role Required | Status |
|--------|----------|-------------|---------------|---------------|--------|
| GET | `/teacher/progress/<department>` | Department progress | Yes | teacher | ✅ Basic |
| GET | `/performance-prediction` | Performance predictions | Yes | teacher | ✅ Basic |
| POST | `/plagiarism-check` | Check plagiarism | Yes | teacher | ✅ Basic |

**Note**: Teacher endpoints provide basic functionality. Comprehensive teacher dashboard, student management interface, and advanced analytics are planned for future implementation.

#### Notifications (`/api/v1/notifications`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/notifications` | List notifications | Yes |
| POST | `/notification/<id>/read` | Mark as read | Yes |
| POST | `/notifications/read-all` | Mark all as read | Yes |
| GET | `/notifications/stream` | SSE notification stream | Yes |

#### Bookmarks (`/api/v1/bookmarks`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/bookmarks` | List bookmarks | Yes |
| POST | `/bookmarks` | Create bookmark | Yes |
| POST | `/bookmark/<id>/delete` | Delete bookmark | Yes |

### Example API Request

```bash
# Login
curl -X POST http://localhost:5001/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email": "student@metropolia.fi", "password": "password123"}' \
  -c cookies.txt

# Submit assignment
curl -X POST http://localhost:5001/api/v1/submit \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "content": "My assignment content",
    "files": [{"filename": "code.py", "content": "print(\"Hello\")"}],
    "department": "Engineering & Computer Science"
  }'
```

---

## 🧪 Testing

### Backend Testing

```bash
# Run all tests
cd backend
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/backend/test_auth.py

# Run with verbose output
pytest -v
```

### Frontend Testing

```bash
# Run all tests
cd frontend
npm test

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

### Test Structure

```
tests/
├── backend/
│   ├── conftest.py          # Pytest configuration
│   ├── test_auth.py         # Authentication tests
│   ├── test_api_endpoints.py # API endpoint tests
│   ├── test_models.py       # Model tests
│   └── test_submissions.py  # Submission tests
└── frontend/
    ├── components/          # Component tests
    ├── hooks/              # Hook tests
    ├── pages/              # Page tests
    └── services/           # Service tests
```

---

## 🚢 Deployment

### Production Checklist

- [ ] Set `FLASK_ENV=production`
- [ ] Use strong `SECRET_KEY`
- [ ] Configure MongoDB authentication
- [ ] Set up HTTPS/SSL
- [ ] Configure CORS for production domain
- [ ] Set up proper logging
- [ ] Configure Gunicorn workers (4-8 for production)
- [ ] Set up monitoring and error tracking
- [ ] Configure backup strategy for MongoDB
- [ ] Set up environment variable management

### Docker Production Deployment

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Environment-Specific Configuration

Create separate `.env` files:
- `.env.development` - Local development
- `.env.staging` - Staging environment
- `.env.production` - Production environment

---

## 📁 Project Structure

```
vtk/
├── backend/
│   └── app/
│       ├── __init__.py              # Flask app factory
│       ├── main.py                  # Application entry point
│       ├── config.py                # Configuration constants
│       ├── wsgi.py                  # WSGI entry point
│       ├── api/
│       │   ├── v1/                  # API v1 routes
│       │   │   ├── auth.py          # Authentication endpoints
│       │   │   ├── submissions.py  # Submission endpoints
│       │   │   ├── feedback.py     # Feedback endpoints
│       │   │   ├── peer_reviews.py # Peer review endpoints
│       │   │   ├── tutor.py        # AI tutor endpoints
│       │   │   ├── flashcards.py   # Flashcard endpoints
│       │   │   ├── users.py        # User management
│       │   │   ├── teacher.py      # Teacher endpoints
│       │   │   ├── bookmarks.py    # Bookmark endpoints
│       │   │   └── notifications.py # Notification endpoints
│       │   └── static.py            # Static file serving
│       ├── core/
│       │   └── database.py          # Database initialization
│       ├── models/                  # MongoEngine models
│       │   ├── user.py
│       │   ├── submission.py
│       │   ├── feedback.py
│       │   ├── peer_review.py
│       │   └── ...
│       ├── services/                # Business logic
│       │   ├── ai_service.py        # AI feedback generation
│       │   ├── peer_matching_service.py # Peer matching algorithm
│       │   └── performance_predictor_service.py # ML predictions
│       ├── middleware/              # Flask middleware
│       │   ├── auth_middleware.py
│       │   ├── cors_middleware.py
│       │   ├── error_handler.py
│       │   └── security_middleware.py
│       ├── utils/                   # Utility functions
│       │   ├── auth_utils.py
│       │   ├── db_utils.py
│       │   ├── response_utils.py
│       │   ├── validation.py
│       │   └── ...
│       └── exceptions/               # Custom exceptions
│           └── api_exceptions.py
├── frontend/
│   ├── src/
│   │   ├── App.jsx                  # Main app component
│   │   ├── main.jsx                 # React entry point
│   │   ├── components/              # Reusable components
│   │   │   ├── Layout.jsx
│   │   │   ├── PrivateRoute.jsx
│   │   │   ├── NotificationBell.jsx
│   │   │   └── ...
│   │   ├── features/                # Feature modules
│   │   │   ├── auth/                # Authentication
│   │   │   ├── dashboard/           # Dashboards
│   │   │   ├── submissions/         # Submissions
│   │   │   ├── learning/            # Learning tools
│   │   │   └── profile/             # User profile
│   │   ├── context/                 # React contexts
│   │   │   ├── AuthContext.jsx
│   │   │   └── NotificationContext.jsx
│   │   ├── hooks/                   # Custom hooks
│   │   ├── services/                # API services
│   │   │   └── api.js
│   │   └── styles/                  # CSS files
│   ├── package.json
│   ├── vite.config.js
│   └── vitest.config.js
├── tests/                           # Test suites
│   ├── backend/
│   └── frontend/
├── docker-compose.yml               # Docker Compose config
├── Dockerfile.backend               # Backend Dockerfile
├── Dockerfile.frontend              # Frontend Dockerfile
├── requirements.txt                 # Python dependencies
├── pyproject.toml                   # Python project config
└── README.md                        # This file
```

---

## 🔒 Security Considerations

### Implemented Security Features

- **Session-based Authentication**: Secure session management with Flask-Login
- **Password Hashing**: Werkzeug password hashing
- **Rate Limiting**: API protection against abuse
- **CORS Configuration**: Controlled cross-origin access
- **Security Headers**: Flask-Talisman for security headers
- **Input Validation**: Comprehensive input sanitization
- **File Upload Restrictions**: Size and type validation
- **SQL Injection Prevention**: Using ODM (MongoEngine) with parameterized queries
- **XSS Protection**: Input sanitization and output escaping

### Security Best Practices

1. **Never commit secrets**: Use environment variables
2. **Use HTTPS in production**: Configure SSL/TLS
3. **Regular dependency updates**: Keep packages updated
4. **Database authentication**: Enable MongoDB auth
5. **Strong SECRET_KEY**: Use cryptographically random keys
6. **Rate limiting**: Configure appropriate limits
7. **Input validation**: Validate all user inputs
8. **Error handling**: Don't expose sensitive information in errors

---

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**: Follow code style guidelines
4. **Write tests**: Ensure new features are tested
5. **Run tests**: `pytest` (backend) and `npm test` (frontend)
6. **Commit changes**: Use descriptive commit messages
7. **Push to branch**: `git push origin feature/amazing-feature`
8. **Open a Pull Request**: Provide clear description

### Code Style

- **Python**: Follow PEP 8, use Black formatter (line length: 100)
- **JavaScript/React**: Follow ESLint rules, use consistent formatting
- **Documentation**: Update README and docstrings for new features

### Testing Requirements

- New features must include tests
- Maintain or improve test coverage
- All tests must pass before PR submission

---

## 📝 License

This project is proprietary software developed for Metropolia University of Applied Sciences. All rights reserved.

---

## 👥 Authors & Acknowledgments

**Developed for Metropolia University of Applied Sciences**

### Technologies & Libraries

- **Google Gemini AI**: Advanced AI feedback generation
- **Flask**: Python web framework
- **React**: UI framework
- **MongoDB**: Database
- **MongoEngine**: ODM
- **Vite**: Build tool
- And all the amazing open-source contributors

---

## 📞 Support & Contact

For issues, questions, or contributions:

1. **Check existing issues**: Search GitHub issues
2. **Create new issue**: Provide detailed description
3. **Contact**: Reach out to the development team

---

## 🎯 Roadmap & Future Enhancements

### High Priority (Next Phase)

#### 1. Complete Peer Review System 🚧
- [ ] Refine peer matching algorithm (skill-based, history-based matching)
- [ ] Implement comprehensive review workflow
- [ ] Add review quality assessment and scoring
- [ ] Build peer review analytics dashboard
- [ ] Create review moderation and oversight tools
- [ ] Implement automated review assignment workflows
- [ ] Add review conflict resolution mechanisms
- [ ] Build multi-stage review processes

#### 2. Complete Teacher Portal 🚧
- [ ] Finish teacher analytics dashboard with comprehensive metrics
- [ ] Build complete student management interface
- [ ] Implement advanced performance prediction UI
- [ ] Create feedback moderation and approval workflows
- [ ] Add peer review oversight and management tools
- [ ] Build bulk operations (grading, feedback, assignments)
- [ ] Implement export and reporting capabilities
- [ ] Add student communication and messaging tools
- [ ] Create course and assignment management system

### Medium Priority

- [ ] WebSocket support for real-time updates
- [ ] Advanced ML models for performance prediction
- [ ] Enhanced plagiarism detection interface
- [ ] Advanced analytics and reporting
- [ ] Video submission support
- [ ] Collaborative editing features

### Low Priority / Future Considerations

- [ ] Mobile app support (React Native)
- [ ] Integration with LMS systems (Moodle, Canvas, etc.)
- [ ] Multi-language support (i18n)
- [ ] Advanced notification preferences
- [ ] Customizable feedback templates
- [ ] Integration with version control systems (Git)
- [ ] Advanced file preview and editing
- [ ] Team/group submission support

---

## 📊 Performance Metrics

- **API Response Time**: < 200ms (average)
- **AI Feedback Generation**: 5-15 seconds (depending on content size)
- **Frontend Load Time**: < 2 seconds (first load)
- **Database Query Performance**: Optimized with indexes

---

## 🔄 Version History

### v1.0.0 (Current - Development)

**Core Features Implemented:**
- ✅ AI-powered feedback generation (Google Gemini AI)
- ✅ User authentication and management
- ✅ Submission management with versioning
- ✅ Learning tools (flashcards, AI tutor)
- ✅ Student dashboard and analytics
- ✅ Notification system
- ✅ Bookmarks system
- ✅ Multi-department support
- ✅ Security middleware and rate limiting

**In Progress:**
- 🚧 Peer review system (basic functionality complete, advanced features in development)
- 🚧 Teacher portal (basic endpoints available, full UI and features in development)

**Planned for v1.1.0:**
- 📋 Complete peer review system with advanced matching
- 📋 Full-featured teacher dashboard and analytics
- 📋 Comprehensive student management interface
- 📋 Advanced performance prediction UI
- 📋 Feedback moderation tools
- 📋 Peer review oversight and management

**Planned for v1.2.0:**
- 📋 WebSocket support for real-time updates
- 📋 Enhanced analytics and reporting
- 📋 Video submission support
- 📋 Advanced ML models

---

**Built with ❤️ for Metropolia University of Applied Sciences**

