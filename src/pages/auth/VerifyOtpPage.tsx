import { AxiosError } from 'axios'
import { Alert, Button, Card, Form, Input, Space, Typography } from 'antd'
import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { http } from '../../lib/http'
import type { ApiMessageResponse } from '../../lib/types'
import { useOwnerBranding, withOwnerQuery } from './owner-branding'

type VerifyOtpValues = {
  otp: string
}

export function VerifyOtpPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') ?? ''
  const ownerSlug = searchParams.get('owner')
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const { ownerBranding } = useOwnerBranding()

  if (!email) {
    return <Navigate replace to="/forgot-password" />
  }

  const handleFinish = async (values: VerifyOtpValues) => {
    setSubmitting(true)
    setErrorMessage('')

    try {
      await http.post<ApiMessageResponse>('/auth/forgot-password-verify', {
        email,
        otp: values.otp,
      })
      navigate(`/forgot-password/reset?email=${encodeURIComponent(email)}${ownerSlug ? `&owner=${encodeURIComponent(ownerSlug)}` : ''}`, { replace: true })
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>
      setErrorMessage(axiosError.response?.data?.message ?? 'OTP verification failed.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    setErrorMessage('')
    setInfoMessage('')

    try {
      const { data } = await http.post<ApiMessageResponse>('/auth/forgot-password-request', {
        email,
      })
      setInfoMessage(data.message)
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>
      setErrorMessage(axiosError.response?.data?.message ?? 'OTP resend failed.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <div className="auth-copy">
          <Typography.Text className="eyebrow">Email OTP</Typography.Text>
          <Typography.Title>
            {ownerBranding ? `Verify your ${ownerBranding.brand_name} reset code` : 'Verify your one-time password'}
          </Typography.Title>
          <Typography.Paragraph>
            If the email <strong>{email}</strong> is registered, a 6-digit
            verification code should arrive there shortly. Enter the OTP to
            continue resetting your password.
          </Typography.Paragraph>
          <Typography.Paragraph type="secondary">
            If no email arrives, check the address and request a new code.
          </Typography.Paragraph>
        </div>

        <Card className="auth-card">
          <Typography.Title level={3}>Verify OTP</Typography.Title>
          {errorMessage ? <Alert className="auth-helper" message={errorMessage} showIcon type="error" /> : null}
          {infoMessage ? <Alert className="auth-helper" message={infoMessage} showIcon type="success" /> : null}
          <Form<VerifyOtpValues> layout="vertical" onFinish={handleFinish}>
            <Form.Item label="OTP Code" name="otp" rules={[{ required: true }, { len: 6 }]}>
              <Input maxLength={6} placeholder="123456" size="large" />
            </Form.Item>
            <Button block htmlType="submit" loading={submitting} size="large" type="primary">
              Verify OTP
            </Button>
            <Space className="auth-links" direction="vertical" size={6}>
              <Button loading={resending} onClick={handleResend} type="link">
                Resend OTP
              </Button>
              <Link to={withOwnerQuery('/login', ownerSlug)}>Back to login</Link>
            </Space>
          </Form>
        </Card>
      </div>
    </div>
  )
}
