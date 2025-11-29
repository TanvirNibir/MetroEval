import React from 'react'
import { useAuth } from '../../../context/AuthContext'

const DepartmentSelector = ({ currentDepartment, departments, onDepartmentChange, userRole }) => {
  const { user } = useAuth()
  // Check if user is a student - students cannot change their department
  const isStudent = userRole === 'student' || (!userRole && user && (!user.role || user.role === 'student'))

  return (
    <div className="card department-card glass-card">
      <div className="card-header-with-actions">
        <h3>
          <i className="fas fa-globe-americas"></i> Department
        </h3>
      </div>
      {isStudent ? (
        <>
          <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
            <i className="fas fa-info-circle" style={{ marginRight: '0.5rem' }}></i>
            Your department was set during registration and cannot be changed.
          </p>
          <div className="form-group">
            <label htmlFor="departmentDisplay">Your Department</label>
            <div className="department-display-readonly">
              <div className="department-badge-large">
                <i className="fas fa-graduation-cap"></i>
                <span>{currentDepartment}</span>
                <i className="fas fa-lock" style={{ marginLeft: '0.5rem', fontSize: '0.875rem', opacity: 0.6 }}></i>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <p className="text-muted">
            Switch departments to surface templates, resources, and challenges tailored to that area of study.
          </p>
          <div className="form-group">
            <label htmlFor="departmentSelect">Choose department</label>
            <select
              id="departmentSelect"
              className="form-control"
              value={currentDepartment}
              onChange={(e) => onDepartmentChange(e.target.value)}
            >
              {departments.map((dept) => (
                <option key={dept.value} value={dept.value}>
                  {dept.label}
                </option>
              ))}
            </select>
          </div>
          <div className="department-tags">
            {departments.map((dept) => (
              <span
                key={dept.value}
                className={`filter-chip ${dept.value === currentDepartment ? 'active' : ''}`}
                onClick={() => onDepartmentChange(dept.value)}
                style={{ cursor: 'pointer' }}
              >
                {dept.label}
              </span>
            ))}
          </div>
        </>
      )}
      <div className="department-spotlight" data-department={currentDepartment}>
        <div className="department-spotlight-text">
          <h4>{currentDepartment}</h4>
          <p>MetroEval will highlight resources, templates, and challenges that match this discipline.</p>
        </div>
      </div>
    </div>
  )
}

export default DepartmentSelector

