<div align="center">

# 🎓 MetroEval

### **AI-Powered Feedback & Peer Review System**

**Built for Metropolia University of Applied Sciences**

[![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.4+-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini%20AI-2.0-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://gemini.google.com/)

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [API Reference](#-api-documentation)

---

<img src="assets/images/project-image.png" alt="MetroEval Project" width="600" />

</div>

## 📖 About

**MetroEval** is a production-grade, full-stack educational platform that revolutionizes the feedback and peer review process. Leveraging **Google Gemini AI**, it provides instant, comprehensive feedback on student submissions while facilitating intelligent peer matching and performance analytics.

### ✨ What Makes MetroEval Special?

<div align="center">

| 🚀 **Instant AI Feedback** | 👥 **Smart Peer Matching** | 📊 **Advanced Analytics** |
|:---:|:---:|:---:|
| Get detailed feedback in seconds | Intelligent algorithm-based pairing | Track progress with insights |
| Multi-dimensional analysis | Department & skill-based matching | Identify at-risk students |

</div>

---

## 🎯 Key Features

### 🎓 For Students

<table>
<tr>
<td width="50%">

#### 📝 **Submission Management**
- ✅ Multi-file upload support
- ✅ Version history tracking
- ✅ Practice mode submissions
- ✅ Code, essays, and reports

</td>
<td width="50%">

#### 🤖 **AI-Powered Feedback**
- ⚡ Instant feedback generation
- 📊 Multi-dimensional scoring
- 🎯 Detailed improvement suggestions
- 📋 Submission-type-specific templates

</td>
</tr>
<tr>
<td width="50%">

#### 👥 **Peer Reviews**
- 🔄 Receive & provide feedback
- 📋 Structured feedback forms
- 💬 Feedback reactions & discussions
- ⚖️ Fair workload distribution

</td>
<td width="50%">

#### 📚 **Learning Tools**
- 🃏 AI-generated flashcards
- 💬 Interactive tutor chat
- 📖 Learning resources
- 📄 Submission templates

</td>
</tr>
</table>

### 👨‍🏫 For Teachers

<table>
<tr>
<td width="50%">

#### 📊 **Dashboard & Analytics**
- 📈 Student performance overview
- ⚠️ At-risk student identification
- 🎯 Department-wide analytics
- 🔮 Performance prediction models

</td>
<td width="50%">

#### 📋 **Management Tools**
- 👥 Student management
- 📝 Submission review & grading
- 🔍 Peer review oversight
- 📢 Announcements & deadlines

</td>
</tr>
</table>

---

## 🏗️ Architecture

### Tech Stack

<div align="center">

#### **Backend** 🐍

| Component | Technology | Version |
|:---------:|:----------:|:-------:|
| **Framework** | Flask | 3.0.0 |
| **Database** | MongoDB (MongoEngine) | 0.27.0 |
| **AI Service** | Google Gemini | 2.0 Flash |
| **ML/Analytics** | scikit-learn, numpy, pandas | Latest |
| **Security** | Flask-Login, Flask-Limiter | Latest |
| **Testing** | pytest, pytest-cov | Latest |

#### **Frontend** ⚛️

| Component | Technology | Version |
|:---------:|:----------:|:-------:|
| **Framework** | React | 18.2.0 |
| **Build Tool** | Vite | 5.0.8 |
| **Routing** | React Router DOM | 6.20.0 |
| **HTTP Client** | Axios | 1.6.2 |
| **Charts** | Chart.js | 4.4.0 |
| **Testing** | Vitest, RTL | Latest |

</div>

### System Architecture

```mermaid
graph TB
    A[React Frontend<br/>Port 3000] -->|HTTP/REST API| B[Flask Backend<br/>Port 5001]
    B --> C[(MongoDB<br/>Database)]
    B --> D[Google Gemini AI<br/>API]
    
    style A fill:#61DAFB,stroke:#333,stroke-width:2px
    style B fill:#000000,stroke:#333,stroke-width:2px,color:#fff
    style C fill:#47A248,stroke:#333,stroke-width:2px,color:#fff
    style D fill:#4285F4,stroke:#333,stroke-width:2px,color:#fff
```

**Text Representation:**

```
┌─────────────────────────────────┐
│   React Frontend (Port 3000)   │
│   ⚛️ Vite + React + Router      │
└──────────────┬──────────────────┘
               │ HTTP/REST API
               │ (withCredentials)
┌──────────────▼──────────────────┐
│   Flask Backend (Port 5001)     │
│   🐍 Python + Flask + MongoEngine│
└──────┬──────────────────┬───────┘
       │                  │
┌──────▼──────┐  ┌────────▼────────┐
│   MongoDB   │  │  Gemini AI API │
│   🍃 NoSQL  │  │  🤖 AI Service  │
└─────────────┘  └─────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

Make sure you have the following installed:

- 🐍 **Python** 3.8+ (3.10+ recommended)
- 📦 **Node.js** 16+ (18+ recommended)
- 🍃 **MongoDB** 4.4+ (local or remote)
- 🔑 **Google Gemini API Key** ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

#### 1️⃣ Clone the Repository

```bash
git clone <repository-url>
cd MetroEval
```

#### 2️⃣ Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

#### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
```

#### 4️⃣ Environment Configuration

**Backend `.env` file** (`backend/.env`):

```env
# Security
SECRET_KEY=your-super-secret-key-change-in-production

# Database
MONGODB_URI=mongodb://localhost:27017/afprs
# Alternative:
# MONGODB_HOST=localhost
# MONGODB_PORT=27017
# MONGODB_DB=afprs

# AI Configuration
GEMINI_API_KEY=your-gemini-api-key-here

# Server
FLASK_ENV=development
PORT=5001
```

**Frontend `.env` file** (`frontend/.env`) - *Optional*:

```env
VITE_API_URL=http://localhost:5001/api
```

### 🏃 Running the Application

#### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
PYTHONPATH=. python3 app/main.py
```
🌐 Backend: `http://localhost:5001`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
🌐 Frontend: `http://localhost:3000`

---

## 🚀 Deployment Guide

### 📋 Pre-Deployment Checklist

Before deploying to production, ensure:

- ✅ All environment variables are configured
- ✅ MongoDB is accessible and secured
- ✅ Gemini API key is valid and has sufficient quota
- ✅ SSL/TLS certificates are configured
- ✅ Domain names are configured
- ✅ Firewall rules allow necessary ports
- ✅ Backups are configured
- ✅ Monitoring and logging are set up

### 🔧 Production Environment Configuration

#### Backend `.env` (Production)

```env
# Security (CRITICAL: Use strong, unique keys)
SECRET_KEY=your-production-secret-key-min-32-chars-random
FLASK_ENV=production

# Database (Use connection string with authentication)
MONGODB_URI=mongodb://username:password@host:27017/afprs?authSource=admin
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/afprs?retryWrites=true&w=majority

# AI Configuration
GEMINI_API_KEY=your-production-gemini-api-key

# Server Configuration
PORT=5001
HOST=0.0.0.0

# CORS (Add your production frontend URL)
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Optional: Logging
LOG_LEVEL=INFO
```

#### Frontend `.env.production`

```env
VITE_API_URL=https://api.yourdomain.com/api
```

### 🐍 Backend Deployment

#### Option 1: Gunicorn with Systemd (Recommended for Linux)

**1. Install Gunicorn:**
```bash
cd backend
pip install gunicorn
```

**2. Create Gunicorn Configuration** (`backend/gunicorn_config.py`):
```python
import multiprocessing
import os

bind = f"0.0.0.0:{os.getenv('PORT', '5001')}"
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"
worker_connections = 1000
timeout = 30
keepalive = 2
max_requests = 1000
max_requests_jitter = 50
preload_app = True
accesslog = "-"
errorlog = "-"
loglevel = "info"
```

**3. Create Systemd Service** (`/etc/systemd/system/metroeval-backend.service`):
```ini
[Unit]
Description=MetroEval Backend Gunicorn Service
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/path/to/MetroEval/backend
Environment="PATH=/path/to/MetroEval/backend/venv/bin"
EnvironmentFile=/path/to/MetroEval/backend/.env
ExecStart=/path/to/MetroEval/backend/venv/bin/gunicorn \
    --config gunicorn_config.py \
    app.wsgi:app

Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

**4. Enable and Start Service:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable metroeval-backend
sudo systemctl start metroeval-backend
sudo systemctl status metroeval-backend
```

#### Option 2: Docker Deployment

**1. Create `backend/Dockerfile`:**
```dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn

# Copy application code
COPY . .

# Expose port
EXPOSE 5001

# Run with Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5001", "--workers", "4", "--timeout", "30", "app.wsgi:app"]
```

**2. Create `backend/.dockerignore`:**
```
venv/
__pycache__/
*.pyc
*.pyo
*.pyd
.Python
htmlcov/
.pytest_cache/
.env
```

**3. Build and Run:**
```bash
cd backend
docker build -t metroeval-backend .
docker run -d \
  --name metroeval-backend \
  -p 5001:5001 \
  --env-file .env \
  metroeval-backend
```

#### Option 3: Cloud Platform Deployment

**Heroku:**
```bash
# Install Heroku CLI
heroku create metroeval-backend
heroku config:set SECRET_KEY=your-secret-key
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set GEMINI_API_KEY=your-api-key
git push heroku main
```

**Render:**
- Connect your GitHub repository
- Set environment variables in dashboard
- Use build command: `pip install -r requirements.txt && pip install gunicorn`
- Use start command: `gunicorn --bind 0.0.0.0:$PORT app.wsgi:app`

**AWS Elastic Beanstalk:**
- Create `.ebextensions/python.config`:
```yaml
option_settings:
  aws:elasticbeanstalk:container:python:
    WSGIPath: app.wsgi:application
```

### ⚛️ Frontend Deployment

#### Option 1: Nginx (Recommended)

**1. Build the Frontend:**
```bash
cd frontend
npm install
npm run build
```

**2. Configure Nginx** (`/etc/nginx/sites-available/metroeval`):
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Root directory
    root /path/to/MetroEval/frontend/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Serve static files
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Proxy API requests to backend
    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
```

**3. Enable Site:**
```bash
sudo ln -s /etc/nginx/sites-available/metroeval /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### Option 2: Docker Deployment

**1. Create `frontend/Dockerfile`:**
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**2. Create `frontend/nginx.conf`:**
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**3. Build and Run:**
```bash
cd frontend
docker build -t metroeval-frontend .
docker run -d --name metroeval-frontend -p 80:80 metroeval-frontend
```

#### Option 3: Cloud Platform Deployment

**Vercel:**
```bash
npm install -g vercel
cd frontend
vercel --prod
```

**Netlify:**
- Connect GitHub repository
- Build command: `npm run build`
- Publish directory: `dist`
- Add environment variable: `VITE_API_URL`

**AWS S3 + CloudFront:**
```bash
cd frontend
npm run build
aws s3 sync dist/ s3://your-bucket-name --delete
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

### 🗄️ Database Setup

#### MongoDB Production Configuration

**1. Enable Authentication:**
```javascript
use admin
db.createUser({
  user: "admin",
  pwd: "strong-password",
  roles: ["root"]
})
```

**2. Create Application User:**
```javascript
use afprs
db.createUser({
  user: "metroeval",
  pwd: "app-password",
  roles: [{ role: "readWrite", db: "afprs" }]
})
```

**3. Enable Replica Set (for production):**
```yaml
# mongod.conf
replication:
  replSetName: "rs0"
```

**4. MongoDB Atlas (Cloud):**
- Create cluster on MongoDB Atlas
- Whitelist your server IP addresses
- Get connection string and update `MONGODB_URI`

### 🔒 Security Hardening

**1. Firewall Configuration:**
```bash
# Allow only necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

**2. SSL/TLS Certificates:**
```bash
# Using Let's Encrypt (Certbot)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

**3. Environment Variables Security:**
- Never commit `.env` files
- Use secrets management (AWS Secrets Manager, HashiCorp Vault)
- Rotate keys regularly
- Use different keys for dev/staging/production

**4. Application Security:**
- Enable HTTPS only
- Set secure cookie flags
- Implement rate limiting
- Regular security updates
- Monitor for vulnerabilities

### 📊 Monitoring & Logging

**1. Application Logs:**
```bash
# View backend logs
sudo journalctl -u metroeval-backend -f

# View nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

**2. Health Checks:**
- Backend: `GET /api/v1/health`
- Monitor response times
- Set up alerts for downtime

**3. Recommended Tools:**
- **Monitoring**: Prometheus + Grafana, Datadog, New Relic
- **Logging**: ELK Stack, CloudWatch, Papertrail
- **Error Tracking**: Sentry, Rollbar

### 🔄 CI/CD Pipeline

**Example GitHub Actions** (`.github/workflows/deploy.yml`):
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /path/to/MetroEval
            git pull origin main
            cd backend
            source venv/bin/activate
            pip install -r requirements.txt
            sudo systemctl restart metroeval-backend

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Build and Deploy
        run: |
          cd frontend
          npm install
          npm run build
          # Deploy to your hosting platform
```

### 🐳 Docker Compose (Full Stack)

Create `docker-compose.yml` at project root:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7
    container_name: metroeval-mongodb
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    volumes:
      - mongodb_data:/data/db
    ports:
      - "27017:27017"
    networks:
      - metroeval-network

  backend:
    build: ./backend
    container_name: metroeval-backend
    environment:
      - MONGODB_URI=mongodb://admin:password@mongodb:27017/afprs?authSource=admin
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - SECRET_KEY=${SECRET_KEY}
    ports:
      - "5001:5001"
    depends_on:
      - mongodb
    networks:
      - metroeval-network
    restart: unless-stopped

  frontend:
    build: ./frontend
    container_name: metroeval-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - metroeval-network
    restart: unless-stopped

volumes:
  mongodb_data:

networks:
  metroeval-network:
    driver: bridge
```

**Deploy:**
```bash
docker-compose up -d
```

### 📝 Post-Deployment Checklist

- ✅ Verify all endpoints are accessible
- ✅ Test authentication flow
- ✅ Verify database connections
- ✅ Check SSL certificate validity
- ✅ Test file uploads
- ✅ Verify AI service integration
- ✅ Monitor error logs
- ✅ Set up automated backups
- ✅ Configure monitoring alerts
- ✅ Document deployment process

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest
# With coverage report
pytest --cov=app --cov-report=html
```

### Frontend Tests

```bash
cd frontend
npm test
# Interactive UI
npm run test:ui
# Coverage report
npm run test:coverage
```

### Run All Tests

```bash
./scripts/run-tests.sh
```

---

## 📁 Project Structure

```
MetroEval/
│
├── 📂 backend/
│   ├── 📂 app/
│   │   ├── __init__.py          # Application factory
│   │   ├── main.py              # Entry point
│   │   ├── config.py            # Configuration
│   │   ├── wsgi.py              # Production WSGI
│   │   │
│   │   ├── 📂 api/
│   │   │   ├── 📂 v1/           # API v1 endpoints
│   │   │   │   ├── auth.py
│   │   │   │   ├── submissions.py
│   │   │   │   ├── feedback.py
│   │   │   │   ├── peer_reviews.py
│   │   │   │   ├── flashcards.py
│   │   │   │   ├── tutor.py
│   │   │   │   └── teacher.py
│   │   │   └── static.py
│   │   │
│   │   ├── 📂 core/
│   │   │   └── database.py      # MongoDB setup
│   │   │
│   │   ├── 📂 models/           # MongoEngine models
│   │   │   ├── user.py
│   │   │   ├── submission.py
│   │   │   ├── feedback.py
│   │   │   └── ...
│   │   │
│   │   ├── 📂 services/         # Business logic
│   │   │   ├── ai_service.py
│   │   │   ├── peer_matching_service.py
│   │   │   └── performance_predictor_service.py
│   │   │
│   │   ├── 📂 middleware/       # Flask middleware
│   │   │   ├── auth_middleware.py
│   │   │   ├── cors_middleware.py
│   │   │   ├── error_handler.py
│   │   │   └── security_middleware.py
│   │   │
│   │   ├── 📂 utils/            # Utilities
│   │   └── 📂 exceptions/      # Custom exceptions
│   │
│   ├── requirements.txt
│   └── pytest.ini
│
├── 📂 frontend/
│   ├── 📂 src/
│   │   ├── App.jsx              # Main component
│   │   ├── main.jsx             # React entry
│   │   │
│   │   ├── 📂 components/       # Shared components
│   │   ├── 📂 features/         # Feature modules
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── submissions/
│   │   │   ├── learning/
│   │   │   └── profile/
│   │   │
│   │   ├── 📂 context/          # React Context
│   │   ├── 📂 services/         # API services
│   │   ├── 📂 hooks/            # Custom hooks
│   │   └── 📂 styles/           # CSS files
│   │
│   ├── package.json
│   └── vite.config.js
│
├── 📂 tests/
│   ├── 📂 backend/
│   └── 📂 frontend/
│
└── 📂 scripts/
    └── run-tests.sh
```

---

## 🔌 API Documentation

### Base URLs

| Environment | URL |
|:-----------:|:---:|
| **Development** | `http://localhost:5001/api/v1` |
| **Production** | `https://your-domain.com/api/v1` |

### Authentication

All protected endpoints require authentication via **Flask-Login session cookies**. The frontend automatically handles this with `withCredentials: true`.

### Key Endpoints

<details>
<summary><b>🔐 Authentication Endpoints</b></summary>

| Method | Endpoint | Description |
|:------:|:--------:|:-----------|
| `POST` | `/api/v1/auth/register` | Register new user |
| `POST` | `/api/v1/auth/login` | User login |
| `POST` | `/api/v1/auth/logout` | User logout |
| `GET` | `/api/v1/auth/me` | Get current user |

</details>

<details>
<summary><b>📝 Submission Endpoints</b></summary>

| Method | Endpoint | Description |
|:------:|:--------:|:-----------|
| `POST` | `/api/v1/submit` | Submit assignment |
| `GET` | `/api/v1/submissions` | List submissions |
| `GET` | `/api/v1/submissions/<id>` | Get submission details |
| `PUT` | `/api/v1/submissions/<id>` | Update submission |

</details>

<details>
<summary><b>💬 Feedback Endpoints</b></summary>

| Method | Endpoint | Description |
|:------:|:--------:|:-----------|
| `GET` | `/api/v1/feedback/<submission_id>` | Get feedback |
| `POST` | `/api/v1/feedback` | Create feedback |
| `PUT` | `/api/v1/feedback/<id>` | Update feedback |

</details>

<details>
<summary><b>👥 Peer Review Endpoints</b></summary>

| Method | Endpoint | Description |
|:------:|:--------:|:-----------|
| `GET` | `/api/v1/peer-reviews` | List peer reviews |
| `POST` | `/api/v1/peer-reviews` | Create peer review |
| `PUT` | `/api/v1/peer-reviews/<id>` | Complete review |

</details>

<details>
<summary><b>📚 Learning Tools Endpoints</b></summary>

| Method | Endpoint | Description |
|:------:|:--------:|:-----------|
| `POST` | `/api/v1/flashcards/generate` | Generate flashcards |
| `POST` | `/api/v1/tutor/chat` | Chat with AI tutor |

</details>

<details>
<summary><b>👨‍🏫 Teacher Endpoints</b></summary>

| Method | Endpoint | Description |
|:------:|:--------:|:-----------|
| `GET` | `/api/v1/teacher/students` | List all students |
| `GET` | `/api/v1/teacher/analytics` | Get analytics |
| `GET` | `/api/v1/teacher/predictions` | Performance predictions |

</details>

### Response Format

**Success Response:**
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Optional success message"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

---

## 🔐 Security Features

<div align="center">

| 🔒 **Authentication** | 🛡️ **API Security** | 🔐 **Data Protection** | ✅ **Academic Integrity** |
|:---------------------:|:-------------------:|:---------------------:|:------------------------:|
| Flask-Login sessions | Rate limiting | Secure cookies | Plagiarism detection |
| Role-based access | CORS protection | File upload limits | Semantic analysis |
| Password hashing | Security headers | Input sanitization | Version tracking |

</div>

---

## ⚠️ Security Considerations & Known Risks

### Security Risks Identified

The following security issues have been identified and should be addressed:

#### 1. Default SECRET_KEY in Development ✅ **FIXED**

**Previous Risk:** The application used a hardcoded default secret key (`dev-secret-key-change-in-production`) when `SECRET_KEY` environment variable was not set.

**Solution Implemented:** 
- The application now generates a secure random key using `secrets.token_urlsafe(32)` in development/testing mode if `SECRET_KEY` is not set
- Production mode still requires `SECRET_KEY` to be explicitly set (raises error if missing)
- Each development instance gets a unique, cryptographically secure key

**For Production:** Always set a strong, unique `SECRET_KEY` in production. Generate one with:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

#### 2. Inconsistent Error Logging

**Risk:** Some code uses `print()` statements instead of proper logging, which may expose sensitive information in production logs. There's no centralized logging configuration, so logs might contain sensitive data like user IDs, partial content, or stack traces.

**Fix:** 
- Implement structured logging with proper log levels
- Sanitize all log outputs to remove sensitive data
- Use specific exception types instead of broad `except Exception` catches
- Configure log rotation and secure log storage

#### 3. Production Configuration

**Risk:** No integration with secrets management systems (AWS Secrets Manager, HashiCorp Vault, etc.) for production deployments.

**Fix:**
- Use secrets management services for production
- Rotate keys regularly
- Use different keys for dev/staging/production environments

---

## 🎓 Department Support

MetroEval supports **6 departments** across Metropolia:

<div align="center">

| 🎓 General Studies | ⚙️ Engineering & CS | 💼 Business & Economics |
|:-----------------:|:------------------:|:---------------------:|
| 🎨 Design & Creative Arts | 🏥 Health & Life Sciences | 📚 Social Sciences & Humanities |

</div>

Each department features:
- ✅ Custom courses
- ✅ Department-specific analytics
- ✅ Filtered peer review matching
- ✅ Resource organization

---

## 🤖 AI Integration

### Google Gemini AI

MetroEval leverages **Google Gemini 2.0 Flash** for:

<div align="center">

| 🎯 **Feedback Generation** | 🃏 **Flashcard Creation** | 💬 **Tutor Chat** |
|:-------------------------:|:----------------------:|:----------------:|
| Multi-dimensional analysis | Topic-based generation | Interactive Q&A |
| Code & essay templates | Adaptive difficulty | Context-aware responses |
| Detailed suggestions | Coding & conceptual | Code explanations |

</div>

### Configuration

Set `GEMINI_API_KEY` in your backend `.env` file. The system gracefully degrades if the API key is not configured.

---

## 📊 Performance & Scalability

### Backend Optimizations

- 🗄️ **Database Indexing**: MongoDB indexes on frequently queried fields
- ⚡ **Query Optimization**: Efficient MongoEngine queries with limits
- 💾 **Caching**: Session-based caching for user data
- 🔗 **Connection Pooling**: MongoDB connection management

### Frontend Optimizations

- 📦 **Code Splitting**: Vite automatic code splitting
- 🚀 **Lazy Loading**: Route-based lazy loading
- 🎨 **Asset Optimization**: Vite build optimizations
- 🔄 **API Caching**: Axios response caching

### Scalability

- ↔️ **Horizontal Scaling**: Stateless backend design
- 🗄️ **Database Sharding**: MongoDB sharding support
- 🌐 **CDN Integration**: Static asset delivery
- ⚖️ **Load Balancing**: Gunicorn multi-worker support

---

## 🐛 Troubleshooting

<details>
<summary><b>❌ MongoDB Connection Failed</b></summary>

**Solutions:**
- Verify MongoDB is running: `mongod --version`
- Check `MONGODB_URI` in `.env`
- Ensure MongoDB is accessible on configured host/port
- Check firewall settings

</details>

<details>
<summary><b>🤖 Gemini API Errors</b></summary>

**Solutions:**
- Verify `GEMINI_API_KEY` is set correctly
- Check API quota limits
- Review error logs in backend console
- Ensure API key has proper permissions

</details>

<details>
<summary><b>🌐 CORS Issues</b></summary>

**Solutions:**
- Ensure frontend URL is in CORS allowed origins
- Check `withCredentials` is set in Axios config
- Verify backend CORS middleware configuration

</details>

<details>
<summary><b>🍪 Session Not Persisting</b></summary>

**Solutions:**
- Verify cookies are enabled in browser
- Check `SECRET_KEY` is set consistently
- Ensure same-site cookie settings
- Check browser privacy settings

</details>

---

## 📝 Development Guidelines

### Code Style

- **Python**: Follow PEP 8, use type hints where appropriate
- **JavaScript**: Follow ESLint configuration, use modern ES6+
- **React**: Functional components with hooks, feature-based organization

### Git Workflow

1. 🌿 Create feature branch from `main`
2. ✏️ Make changes with descriptive commits
3. ✅ Run tests before committing
4. 🔄 Submit pull request with description

### Testing Requirements

- ✅ New features must include tests
- 📊 Maintain >80% code coverage
- 🧪 Test both success and error paths

---

## ⚙️ Configuration

### Backend Configuration

Key settings in `backend/app/config.py`:

| Setting | Default | Description |
|:-------:|:-------:|:-----------|
| **Departments** | 6 | Predefined departments |
| **File Upload** | 5MB | Max file size |
| **Peer Review** | 2 | Peers per submission (1-5) |
| **Page Size** | 20 | Default API pagination (max 100) |
| **Flashcards** | 25 | Default count (max 100) |
| **Quiz Time** | 20 min | Default quiz duration |

### Security Settings

- 🔒 **Session Security**: HTTP-only cookies, SameSite=Lax, 24-hour lifetime
- ⏱️ **Rate Limiting**: Configured via Flask-Limiter
- 🌐 **CORS**: Configured for frontend origin
- 🛡️ **Security Headers**: Flask-Talisman protection

---

## 📄 License

[Specify your license here]

---

## 👥 Contributors

[Add contributors here]

---

## 🙏 Acknowledgments

<div align="center">

| 🎓 Metropolia University | 🤖 Google Gemini AI | 🐍 Flask & React Communities |
|:----------------------:|:------------------:|:---------------------------:|
| For the vision | For AI capabilities | For amazing frameworks |

</div>

---

## 📞 Support

<div align="center">

**Need help?** We're here for you!

- 🐛 [Open an issue](https://github.com/your-repo/issues) on GitHub
- 📧 Contact the development team
- 📚 Review the documentation

</div>

---

<div align="center">

### **Built with ❤️ for Metropolia University of Applied Sciences**

**Made with** ⚛️ React • 🐍 Flask • 🤖 Gemini AI • 🍃 MongoDB

[⬆ Back to Top](#-metroeval)

</div>
