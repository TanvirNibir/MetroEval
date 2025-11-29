# AI-Powered Feedback & Peer Review System (AFPRS) - Project Summary

## PROJECT INFORMATION

**Project Name**: AI-Powered Feedback & Peer Review System (AFPRS) / MetroEval  
**Institution**: Metropolia University of Applied Sciences, Finland  
**Project Type**: Full-Stack Web Application  
**Development Period**: [To be filled]  
**Team Size**: [To be filled]  

## EXECUTIVE SUMMARY

AFPRS is a comprehensive educational platform that leverages AI technology to automate feedback generation and facilitate peer review processes. The system serves both students and teachers at Metropolia University, providing automated AI feedback, peer review management, learning tools (flashcards, AI tutor), and analytics dashboards.

## TECHNOLOGIES USED

**Backend**: Python 3.x, Flask 3.0.0, MongoDB 7.0, MongoEngine 0.27.0, Google Gemini AI, scikit-learn, NumPy, Pandas, NLTK  
**Frontend**: React 18.2.0, Vite 5.0.8, React Router DOM 6.20.0, Axios, Chart.js, react-markdown  
**Database**: MongoDB (NoSQL)  
**Deployment**: Docker, docker-compose  
**Testing**: pytest (backend), Vitest (frontend)  
**AI/ML**: Google Gemini 2.0 Flash, scikit-learn Linear Regression, Sentence Transformers  

## MAIN FEATURES

1. **AI-Powered Feedback Generation**: Automated feedback on code and written assignments using Google Gemini AI
2. **Peer Review System**: Intelligent peer matching and review management
3. **Performance Prediction**: ML-based student performance prediction and risk assessment
4. **Learning Tools**: AI-generated flashcards, AI tutor chat, resources, templates
5. **Teacher Analytics**: Progress tracking, performance predictions, student management
6. **Submission Management**: Multi-file uploads, version control, draft saving
7. **Plagiarism Detection**: Pattern-based and semantic similarity checking
8. **Notifications**: Real-time notifications for reviews and feedback

## SYSTEM ARCHITECTURE

- **Architecture Pattern**: RESTful API (Backend) + SPA (Frontend)
- **Backend**: Flask REST API with service layer architecture
- **Frontend**: React SPA with component-based architecture
- **Database**: MongoDB document database
- **Deployment**: Docker containerization with 3 services (MongoDB, Backend, Frontend)

## KEY COMPONENTS

**Backend Modules**: API endpoints (10 modules), Services (3: AI, Peer Matching, Performance Predictor), Models (20+), Middleware (CORS, Auth, Error Handling)  
**Frontend Modules**: Pages (15+), Components (30+), Context Providers (2), Custom Hooks (5+)  
**API Endpoints**: 40+ REST endpoints covering authentication, submissions, feedback, peer reviews, analytics, flashcards, tutor chat  

## DATA MODELS

Core Models: User, Course, Submission, Feedback, PeerReview, Flashcard, Bookmark, Notification, Resource, SubmissionTemplate, TimeTracking, Quiz, Deadline, Announcement

## AI/ML IMPLEMENTATION

1. **AI Feedback Service**: Google Gemini 2.0 Flash for automated code and essay evaluation
2. **Plagiarism Detection**: Pattern matching + semantic similarity (Sentence Transformers)
3. **Performance Prediction**: Linear Regression model using scikit-learn
4. **Flashcard Generation**: AI-powered topic-based flashcard creation
5. **Answer Verification**: AI-powered answer checking for flashcards

## SECURITY FEATURES

- Password hashing (Werkzeug)
- Session-based authentication (Flask-Login)
- Role-based access control (Student/Teacher)
- Input validation and sanitization
- File upload restrictions (size, type)
- Environment variable configuration
- CORS middleware

## TESTING

**Backend**: pytest with coverage reporting (test_api_endpoints, test_auth, test_models, test_submissions)  
**Frontend**: Vitest with React Testing Library (component tests, hook tests, page tests)  
**Coverage**: Code coverage reports for both frontend and backend  

## DEPLOYMENT

- Docker Compose configuration
- 3-container setup: MongoDB, Backend (Flask), Frontend (React/Nginx)
- Environment-based configuration
- Persistent data volumes
- Network isolation

## PROJECT STATISTICS

- **Total Source Files**: 100+
- **Backend Modules**: 15+ Python modules
- **Frontend Components**: 30+ React components
- **API Endpoints**: 40+
- **Data Models**: 20+
- **Dependencies**: 19 Python packages, 22 npm packages

## DEPARTMENTS SUPPORTED

General Studies, Engineering & Computer Science, Business & Economics, Design & Creative Arts, Health & Life Sciences, Social Sciences & Humanities

## KEY ACHIEVEMENTS

1. Successfully integrated Google Gemini AI for automated feedback generation
2. Implemented intelligent peer matching algorithm
3. Built ML-based performance prediction system
4. Created comprehensive teacher analytics dashboard
5. Developed full-stack application with modern technologies
6. Implemented comprehensive testing suite
7. Dockerized application for easy deployment

## TECHNICAL CHALLENGES SOLVED

1. **AI Feedback Quality**: Solved through structured templates and prompt engineering
2. **Peer Matching**: Implemented department-based matching with skill level consideration
3. **Real-time Notifications**: Implemented using Server-Sent Events (SSE)
4. **File Upload Handling**: Base64 encoding with validation
5. **Performance Prediction**: Feature engineering and multi-metric analysis

## FUTURE SCOPE

- Advanced ML models for better predictions
- Mobile application (React Native)
- LMS integration (Moodle, Canvas)
- Multi-language support
- Video submission support
- Gamification features
- Group collaboration features

## LEARNING OUTCOMES

- Full-stack web development (Python Flask + React)
- AI/ML integration in web applications
- NoSQL database design (MongoDB)
- RESTful API design and implementation
- Modern frontend development (React, Vite)
- Testing strategies (unit, integration)
- Docker containerization
- DevOps practices

## CONCLUSION

The AFPRS project successfully demonstrates the integration of AI technology in educational systems, providing automated feedback, peer review management, and learning analytics. The system is production-ready with comprehensive testing, security measures, and scalable architecture.

---

**Note**: This summary can be used to fill out project work document templates. For detailed information, refer to PROJECT_REPORT.md.

