import React, { useState, useEffect } from 'react'
import api from '../../../services/api'
import { useUserDepartment } from '../hooks/useUserDepartment'
import SubmissionForm from '../../submissions/components/SubmissionForm'
import SubmissionsList from '../../submissions/components/SubmissionsList'
import FeedbackSection from '../../submissions/components/FeedbackSection'
import PeerReviewsList from '../components/PeerReviewsList'
import ProgressOverview from '../../../components/ProgressOverview'
import QuickStats from '../../../components/QuickStats'
import DepartmentSelector from '../components/DepartmentSelector'

const DEPARTMENT_OPTIONS = [
  { value: 'General Studies', label: 'General Studies' },
  { value: 'Engineering & Computer Science', label: 'Engineering & Computer Science' },
  { value: 'Business & Economics', label: 'Business & Economics' },
  { value: 'Design & Creative Arts', label: 'Design & Creative Arts' },
  { value: 'Health & Life Sciences', label: 'Health & Life Sciences' },
  { value: 'Social Sciences & Humanities', label: 'Social Sciences & Humanities' },
]

const StudentDashboard = () => {
  const { department: currentDepartment, setDepartment: setCurrentDepartment } = useUserDepartment()
  const [submissions, setSubmissions] = useState([])
  const [peerReviews, setPeerReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    submissions: 0,
    feedbacks: 0,
    peerReviews: 0,
  })

  const normalizeToArray = (payload) => {
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.data)) return payload.data
    if (Array.isArray(payload?.data?.data)) return payload.data.data
    return []
  }

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Department is now managed by useUserDepartment hook via AuthContext
      // No need to fetch it separately here

      const [submissionsRaw, reviewsRaw] = await Promise.all([
        api.get('/v1/submissions'),
        api.get('/v1/peer-reviews'),
      ])
      const submissionsData = normalizeToArray(submissionsRaw)
      const reviewsData = normalizeToArray(reviewsRaw)

      setSubmissions(submissionsData)
      setPeerReviews(reviewsData)
      
      // Calculate stats
      let feedbackCount = 0
      if (Array.isArray(submissionsData)) {
        for (const sub of submissionsData) {
          try {
            const subData = await api.get(`/v1/submission/${sub.id}`)
            const feedbacks = subData?.data?.feedbacks || subData?.feedbacks || []
            if (Array.isArray(feedbacks)) {
              feedbackCount += feedbacks.length
            }
          } catch (e) {
            // Skip errors per submission
          }
        }
      }

      setStats({
        submissions: Array.isArray(submissionsData) ? submissionsData.length : 0,
        feedbacks: feedbackCount,
        peerReviews: Array.isArray(reviewsData) ? reviewsData.length : 0,
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

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div>
            <h2>Welcome! 👋</h2>
            <p className="dashboard-subtitle">
              Create, reflect, and grow across every discipline. Currently personalized for{' '}
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

      <ProgressOverview submissions={submissions} />

      <div className="dashboard-grid">
        <SubmissionForm onSuccess={handleSubmissionSuccess} currentDepartment={currentDepartment} />
        <SubmissionsList submissions={submissions} onRefresh={loadData} />
      </div>

      <FeedbackSection submissions={submissions} onRefresh={loadData} />

      <PeerReviewsList reviews={peerReviews} onRefresh={loadData} />
    </div>
  )
}

export default StudentDashboard

