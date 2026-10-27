import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'

// Mock credentials
const MOCK_USERNAME = 'test'
const MOCK_PASSWORD = 'test1234'

// Simulate an API call with a 3-second delay
const fakeLoginApi = (username, password) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (username === MOCK_USERNAME && password === MOCK_PASSWORD) {
        resolve({ success: true })
      } else {
        resolve({ success: false, message: 'Invalid username or password. Please try again.' })
      }
    }, 3000) // 3 second delay to simulate network latency
  })
}

function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const validate = () => {
    const newErrors = {}

    if (!username.trim()) {
      newErrors.username = 'Username is required'
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required'
    }

    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const validationErrors = validate()

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    // Show loading state while "API" responds
    setIsLoading(true)
    setErrors({})

    const result = await fakeLoginApi(username, password)

    setIsLoading(false)

    if (result.success) {
      navigate('/dashboard')
    } else {
      setErrors({ form: result.message })
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Login</h1>

        {errors.form && <div className="error-banner">{errors.form}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                if (errors.username) {
                  setErrors((prev) => ({ ...prev, username: '' }))
                }
              }}
            />
            {errors.username && <span className="field-error">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) {
                  setErrors((prev) => ({ ...prev, password: '' }))
                }
              }}
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
