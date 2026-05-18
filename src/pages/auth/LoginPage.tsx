import { LockOutlined, MailOutlined } from '@ant-design/icons'
import { AxiosError } from 'axios'
import { Alert, Button, Card, Form, Input, Typography } from 'antd'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth-context'

type LoginFormValues = {
  email: string
  password: string
}

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

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
            Sign in to the new React admin frontend
          </Typography.Title>
          <Typography.Paragraph>
            This app uses the current PHP backend and keeps the same session
            authentication while we migrate the frontend page by page.
          </Typography.Paragraph>
        </div>

        <Card className="auth-card">
          <Typography.Title level={3}>Admin Login</Typography.Title>
          {errorMessage ? (
            <Alert
              type="error"
              showIcon
              message={errorMessage}
              style={{ marginBottom: 16 }}
            />
          ) : null}
          <Form<LoginFormValues> layout="vertical" onFinish={handleFinish}>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: 'Please enter your email.' }]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="you@example.com"
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
          </Form>
        </Card>
      </div>
    </div>
  )
}
