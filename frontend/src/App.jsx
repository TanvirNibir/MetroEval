import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import PrivateRoute from './components/PrivateRoute'
import PublicRoute from './components/PublicRoute'
import NotFound from './components/NotFound'
// Common
import Index from './features/common/pages/Index'
import About from './features/common/pages/About'

// Auth
import Login from './features/auth/pages/Login'
import Register from './features/auth/pages/Register'

// Dashboard
import Dashboard from './features/dashboard/pages/Dashboard'
import StudentDashboard from './features/dashboard/pages/StudentDashboard'
import TeacherDashboard from './features/dashboard/pages/TeacherDashboard'
import TeacherAnalytics from './features/dashboard/pages/TeacherAnalytics'

// Submissions
import Submissions from './features/submissions/pages/Submissions'
import Feedback from './features/submissions/pages/Feedback'
import PeerReviews from './features/submissions/pages/PeerReviews'
import TeacherSubmissions from './features/submissions/pages/TeacherSubmissions'
import TeacherFeedback from './features/submissions/pages/TeacherFeedback'
import TeacherPeerReviews from './features/submissions/pages/TeacherPeerReviews'
import TeacherStudents from './features/submissions/pages/TeacherStudents'

// Profile
import Profile from './features/profile/pages/Profile'
import Bookmarks from './features/profile/pages/Bookmarks'

// Learning
import Flashcards from './features/learning/pages/Flashcards'
import Resources from './features/learning/pages/Resources'
import Templates from './features/learning/pages/Templates'
import TutorChat from './features/learning/pages/TutorChat'
import Layout from './components/Layout'

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
          <Route path="/" element={<PublicRoute><Index /></PublicRoute>} />
          <Route path="/about" element={<PublicRoute><About /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/submissions"
            element={
              <PrivateRoute>
                <Layout>
                  <Submissions />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/feedback"
            element={
              <PrivateRoute>
                <Layout>
                  <Feedback />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/peer-reviews"
            element={
              <PrivateRoute>
                <Layout>
                  <PeerReviews />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/flashcards"
            element={
              <PrivateRoute>
                <Layout>
                  <Flashcards />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/bookmarks"
            element={
              <PrivateRoute>
                <Layout>
                  <Bookmarks />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/templates"
            element={
              <PrivateRoute>
                <Layout>
                  <Templates />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/resources"
            element={
              <PrivateRoute>
                <Layout>
                  <Resources />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/tutor"
            element={
              <PrivateRoute>
                <Layout>
                  <TutorChat />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Layout>
                  <Profile />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/teacher-dashboard"
            element={
              <PrivateRoute requiredRole="teacher">
                <Layout>
                  <TeacherDashboard />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/teacher-submissions"
            element={
              <PrivateRoute requiredRole="teacher">
                <Layout>
                  <TeacherSubmissions />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/teacher-feedback"
            element={
              <PrivateRoute requiredRole="teacher">
                <Layout>
                  <TeacherFeedback />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/teacher-analytics"
            element={
              <PrivateRoute requiredRole="teacher">
                <Layout>
                  <TeacherAnalytics />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/teacher-students"
            element={
              <PrivateRoute requiredRole="teacher">
                <Layout>
                  <TeacherStudents />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/teacher-peer-reviews"
            element={
              <PrivateRoute requiredRole="teacher">
                <Layout>
                  <TeacherPeerReviews />
                </Layout>
              </PrivateRoute>
            }
          />
          {/* Catch-all route - redirect based on auth status */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  )
}

export default App

