import { AxiosError } from 'axios'
import { Alert, Button, Card, Form, Input, Typography } from 'antd'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { http } from '../../lib/http'
import type { ApiMessageResponse } from '../../lib/types'

type ForgotPasswordValues = {
  email: string
}

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleFinish = async (values: ForgotPasswordValues) => {
    setSubmitting(true)
    setErrorMessage('')

    try {
      await http.post<ApiMessageResponse>('/auth/forgot-password-request', values)
      navigate(`/forgot-password/verify?email=${encodeURIComponent(values.email)}`, {
        replace: true,
      })
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>
      setErrorMessage(
        axiosError.response?.data?.message ?? 'OTP request failed. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <div className="auth-copy">
          <Typography.Text className="eyebrow">Reset Access</Typography.Text>
          <Typography.Title>Request a password reset OTP</Typography.Title>
          <Typography.Paragraph>
            Enter your registered email address and we will send a one-time password
            to verify the reset request.
          </Typography.Paragraph>
        </div>

        <Card className="auth-card">
          <Typography.Title level={3}>Forgot Password</Typography.Title>
          {errorMessage ? <Alert className="auth-helper" message={errorMessage} showIcon type="error" /> : null}
          <Form<ForgotPasswordValues> layout="vertical" onFinish={handleFinish}>
            <Form.Item label="Registered Email" name="email" rules={[{ required: true }, { type: 'email' }]}>
              <Input size="large" />
            </Form.Item>
            <Button block htmlType="submit" loading={submitting} size="large" type="primary">
              Send OTP
            </Button>
            <div className="auth-links">
              <Link to="/login">Back to login</Link>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  )
}
