import { AxiosError } from 'axios'
import { Alert, Button, Card, Form, Input, Typography } from 'antd'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { http } from '../../lib/http'
import type { ApiMessageResponse } from '../../lib/types'

type SignupFormValues = {
  full_name: string
  email: string
  phone_number: string
  country: string
  id_number: string
  tenant_address: string
  tenant_home_country_address: string
  profession?: string
  password: string
  password2: string
}

export function SignupPage() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleFinish = async (values: SignupFormValues) => {
    setSubmitting(true)
    setErrorMessage('')

    try {
      await http.post<ApiMessageResponse>('/auth/signup.php', values)
      navigate('/login', {
        replace: true,
        state: { successMessage: 'Account created successfully. Please sign in.' },
      })
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>
      setErrorMessage(axiosError.response?.data?.message ?? 'Signup failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <div className="auth-copy">
          <Typography.Text className="eyebrow">New Tenant</Typography.Text>
          <Typography.Title>Create your tenant account</Typography.Title>
          <Typography.Paragraph>
            Sign up first, then an admin can assign your house and partition later.
            You can still access your account immediately after registration.
          </Typography.Paragraph>
        </div>

        <Card className="auth-card">
          <Typography.Title level={3}>Tenant Sign Up</Typography.Title>
          {errorMessage ? <Alert className="auth-helper" message={errorMessage} showIcon type="error" /> : null}
          <Form<SignupFormValues> layout="vertical" onFinish={handleFinish}>
            <Form.Item label="Full Name" name="full_name" rules={[{ required: true }]}>
              <Input size="large" />
            </Form.Item>
            <Form.Item label="Email" name="email" rules={[{ required: true }, { type: 'email' }]}>
              <Input size="large" />
            </Form.Item>
            <Form.Item label="Phone Number" name="phone_number" rules={[{ required: true }]}>
              <Input placeholder="+971 50 123 4567" size="large" />
            </Form.Item>
            <Form.Item label="Country" name="country" rules={[{ required: true }]}>
              <Input placeholder="United Arab Emirates" size="large" />
            </Form.Item>
            <Form.Item label="Emirates ID / Passport" name="id_number" rules={[{ required: true }]}>
              <Input size="large" />
            </Form.Item>
            <Form.Item label="Current Address" name="tenant_address" rules={[{ required: true }]}>
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item label="Home Country Address" name="tenant_home_country_address" rules={[{ required: true }]}>
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item label="Profession" name="profession">
              <Input size="large" />
            </Form.Item>
            <Form.Item label="Password" name="password" rules={[{ required: true }, { min: 6 }]}>
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
              Create Account
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
