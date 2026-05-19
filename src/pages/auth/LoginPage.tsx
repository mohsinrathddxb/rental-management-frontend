import { LockOutlined, MailOutlined } from '@ant-design/icons'
import { AxiosError } from 'axios'
import { Alert, Button, Card, Form, Input, Space, Typography } from 'antd'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth-context'

type LoginFormValues = {
  identifier: string
  password: string
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const successMessage =
    typeof location.state === 'object' &&
    location.state &&
    'successMessage' in location.state &&
    typeof location.state.successMessage === 'string'
      ? location.state.successMessage
      : ''

  const handleFinish = async (values: LoginFormValues) => {
    setSubmitting(true)
    setErrorMessage('')

    try {
      await login(values)
      navigate('/dashboard', { replace: true })
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>
      setErrorMessage(
        axiosError.response?.data?.message ??
          'Login failed. Please check your credentials and try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <div className="auth-copy">
          <Typography.Text className="eyebrow">Rental Manager</Typography.Text>
          <Typography.Title>
            Sign in to the React rental frontend
          </Typography.Title>
          <Typography.Paragraph>
            Admins and tenants both use the local Node backend backed by your
            MySQL rental database.
          </Typography.Paragraph>
        </div>

        <Card className="auth-card">
          <Typography.Title level={3}>Account Login</Typography.Title>
          {errorMessage ? (
            <Alert
              type="error"
              showIcon
              message={errorMessage}
              style={{ marginBottom: 16 }}
            />
          ) : null}
          {successMessage ? (
            <Alert
              type="success"
              showIcon
              message={successMessage}
              style={{ marginBottom: 16 }}
            />
          ) : null}
          <Form<LoginFormValues> layout="vertical" onFinish={handleFinish}>
            <Form.Item
              label="Email or Username"
              name="identifier"
              rules={[{ required: true, message: 'Please enter your email or username.' }]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="you@example.com or your username"
                size="large"
              />
            </Form.Item>
            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Please enter your password.' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Your password"
                size="large"
              />
            </Form.Item>
            <Button
              block
              htmlType="submit"
              loading={submitting}
              size="large"
              type="primary"
            >
              Sign In
            </Button>
            <Space className="auth-links" direction="vertical" size={6}>
              <Link to="/forgot-password">Forgot Password?</Link>
              <Link to="/signup">Create Tenant Account</Link>
            </Space>
          </Form>
        </Card>
      </div>
    </div>
  )
}
