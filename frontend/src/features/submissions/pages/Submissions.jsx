import React, { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import api from '../../../services/api'
import { useUserDepartment } from '../../dashboard/hooks/useUserDepartment'
import SubmissionForm from '../components/SubmissionForm'
import SubmissionsList from '../components/SubmissionsList'
import QuickStats from '../../../components/QuickStats'
import DepartmentSelector from '../../dashboard/components/DepartmentSelector'
import '../../../styles/features/submissions/Submissions.css'

const DEPARTMENT_OPTIONS = [
  { value: 'General Studies', label: 'General Studies' },
  { value: 'Engineering & Computer Science', label: 'Engineering & Computer Science' },
  { value: 'Business & Economics', label: 'Business & Economics' },
  { value: 'Design & Creative Arts', label: 'Design & Creative Arts' },
  { value: 'Health & Life Sciences', label: 'Health & Life Sciences' },
  { value: 'Social Sciences & Humanities', label: 'Social Sciences & Humanities' },
]

const Submissions = () => {
  const { user } = useAuth()
  const { department: currentDepartment, setDepartment: setCurrentDepartment } = useUserDepartment()
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState('student')
  const [stats, setStats] = useState({
    submissions: 0,
    feedbacks: 0,
    peerReviews: 0,
  })

  useEffect(() => {
    loadData()
  }, [currentDepartment])

  const normalizeToArray = (payload) => {
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.data)) return payload.data
    if (Array.isArray(payload?.data?.data)) return payload.data.data
    return []
  }

  const loadData = async () => {
    setLoading(true)
    try {
      // Get user role
      let role = 'student'
      try {
        const profileData = await api.get('/v1/user/profile')
        role = profileData.role || 'student'
        setUserRole(role)
        
        if (profileData.department && profileData.department !== currentDepartment) {
          // Update without syncing since this is coming from server
          setCurrentDepartment(profileData.department, true)
        }
      } catch (e) {
        // Keep current role
        role = userRole // Use existing role if API call fails
      }

      // For teachers, filter by department. For students, get their own submissions
      // Use the role variable instead of userRole state to avoid race condition
      const params = role === 'teacher' && currentDepartment ? { department: currentDepartment } : {}
      const submissionsResponse = await api.get('/v1/submissions', { params })
      const submissionsData = normalizeToArray(submissionsResponse)
      setSubmissions(submissionsData)
      
      // Calculate stats
      let feedbackCount = 0
      if (Array.isArray(submissionsData)) {
        for (const sub of submissionsData) {
          try {
            const subResponse = await api.get(`/v1/submission/${sub.id}`)
            const feedbacks = subResponse?.data?.feedbacks || subResponse?.feedbacks || []
            if (Array.isArray(feedbacks)) {
              feedbackCount += feedbacks.length
            }
          } catch (e) {
            // Skip errors
          }
        }
      }

      setStats({
        submissions: submissionsData.length,
        feedbacks: feedbackCount,
        peerReviews: 0,
      })
    } catch (error) {
      // Error already handled by API interceptor
    } finally {
      setLoading(false)
    }
  }

  const handleDepartmentChange = async (department) => {
    try {
      await setCurrentDepartment(department)
      loadData()
    } catch (error) {
      // Error already handled by API interceptor
    }
  }

  const handleSubmissionSuccess = () => {
    loadData()
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect teachers to teacher dashboard
  if (userRole === 'teacher') {
    return <Navigate to="/teacher-dashboard" replace />
  }

  return (
    <div className="dashboard submissions-page">
      <div className="dashboard-header">
        <div className="header-content">
          <div>
            <h2>My Submissions 📝</h2>
            <p className="dashboard-subtitle">
              Create and manage your assignments. Currently personalized for{' '}
              <span className="badge badge-primary">{currentDepartment}</span>.
            </p>
          </div>
          <QuickStats stats={stats} />
        </div>
      </div>

      <DepartmentSelector
        currentDepartment={currentDepartment}
        departments={DEPARTMENT_OPTIONS}
        onDepartmentChange={handleDepartmentChange}
        userRole="student"
      />

      <div className="dashboard-grid">
        <SubmissionForm onSuccess={handleSubmissionSuccess} currentDepartment={currentDepartment} />
        <SubmissionsList submissions={submissions} onRefresh={loadData} />
      </div>
    </div>
  )
}

export default Submissions

