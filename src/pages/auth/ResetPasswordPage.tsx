import { AxiosError } from 'axios'
import { Alert, Button, Card, Form, Input, Typography } from 'antd'
import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { http } from '../../lib/http'
import type { ApiMessageResponse } from '../../lib/types'
import { useOwnerBranding, withOwnerQuery } from './owner-branding'

type ResetPasswordValues = {
  password: string
  password2: string
}

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') ?? ''
  const ownerSlug = searchParams.get('owner')
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const { ownerBranding } = useOwnerBranding()

  if (!email) {
    return <Navigate replace to="/forgot-password" />
  }

  const handleFinish = async (values: ResetPasswordValues) => {
    setSubmitting(true)
    setErrorMessage('')

    try {
      await http.post<ApiMessageResponse>('/auth/reset-password', {
        email,
        ...values,
      })
      navigate(withOwnerQuery('/login', ownerSlug), {
        replace: true,
        state: { successMessage: 'Password reset successfully. Please sign in.' },
      })
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>
      setErrorMessage(
        axiosError.response?.data?.message ?? 'Password reset failed. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <div className="auth-copy">
          <Typography.Text className="eyebrow">New Password</Typography.Text>
          <Typography.Title>
            {ownerBranding ? `Set a new ${ownerBranding.brand_name} password` : 'Set a fresh password'}
          </Typography.Title>
          <Typography.Paragraph>
            Your OTP has been verified for <strong>{email}</strong>. Choose a new
            password to complete the reset.
          </Typography.Paragraph>
        </div>

        <Card className="auth-card">
          <Typography.Title level={3}>Reset Password</Typography.Title>
          {errorMessage ? <Alert className="auth-helper" message={errorMessage} showIcon type="error" /> : null}
          <Form<ResetPasswordValues> layout="vertical" onFinish={handleFinish}>
            <Form.Item label="New Password" name="password" rules={[{ required: true }, { min: 6 }]}>
              <Input.Password size="large" />
            </Form.Item>
            <Form.Item
              dependencies={['password']}
              label="Confirm Password"
              name="password2"
              rules={[
                { required: true },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('Passwords do not match'))
                  },
                }),
              ]}
            >
              <Input.Password size="large" />
            </Form.Item>
            <Button block htmlType="submit" loading={submitting} size="large" type="primary">
              Update Password
            </Button>
            <div className="auth-links">
              <Link to={withOwnerQuery('/login', ownerSlug)}>Back to login</Link>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  )
}
