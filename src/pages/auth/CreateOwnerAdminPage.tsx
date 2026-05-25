import { AxiosError } from 'axios'
import { Alert, Button, Card, Form, Input, Space, Typography } from 'antd'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { http } from '../../lib/http'
import type { ApiMessageResponse, UsernameAvailabilityResponse } from '../../lib/types'

type OwnerAdminFormValues = {
  owner_name: string
  public_slug?: string
  brand_name?: string
  brand_tagline?: string
  contact_email?: string
  contact_phone?: string
  uname: string
  email: string
  password: string
  password2: string
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function checkUsernameAvailability(uname: string) {
  const { data } = await http.get<UsernameAvailabilityResponse>('/auth/check-owner-admin-username', {
    params: { uname },
  })
  return data
}

export function CreateOwnerAdminPage() {
  const navigate = useNavigate()
  const [form] = Form.useForm<OwnerAdminFormValues>()
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const username = Form.useWatch('uname', form)
  const ownerName = Form.useWatch('owner_name', form)

  const trimmedUsername = String(username ?? '').trim()
  const slugPlaceholder = useMemo(() => slugify(String(ownerName ?? '')), [ownerName])

  const usernameQuery = useQuery({
    queryKey: ['owner-admin-username', trimmedUsername],
    queryFn: () => checkUsernameAvailability(trimmedUsername),
    enabled: trimmedUsername.length > 0,
    staleTime: 10_000,
  })

  const mutation = useMutation({
    mutationFn: (values: OwnerAdminFormValues) => http.post<ApiMessageResponse>('/auth/owner-admin-signup', values),
    onSuccess: ({ data }) => {
      setErrorMessage('')
      setSuccessMessage(data.message || 'New owner admin created successfully.')
      form.resetFields()
      setTimeout(() => {
        navigate('/login', {
          replace: true,
          state: { successMessage: 'New owner admin created. Please sign in.' },
        })
      }, 800)
    },
    onError: (error: unknown) => {
      setSuccessMessage('')
      const axiosError = error as AxiosError<{ message?: string }>
      setErrorMessage(
        axiosError.response?.data?.message ??
          (error instanceof Error ? error.message : 'Owner admin could not be created.'),
      )
    },
  })

  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <div className="auth-copy">
          <Typography.Text className="eyebrow">NEW OWNER ACCESS</Typography.Text>
          <Typography.Title>Create a new owner admin</Typography.Title>
          <Typography.Paragraph>
            Create a completely separate owner account with its own `level-0` admin. This account will not have access to other owners&apos; data.
          </Typography.Paragraph>
        </div>

        <Card className="auth-card">
          <Typography.Title level={3}>Create New Owner Admin</Typography.Title>
          {errorMessage ? <Alert type="error" showIcon message={errorMessage} style={{ marginBottom: 16 }} /> : null}
          {successMessage ? <Alert type="success" showIcon message={successMessage} style={{ marginBottom: 16 }} /> : null}
          {trimmedUsername ? (
            usernameQuery.isError ? (
              <Alert type="warning" showIcon message="Username availability could not be checked right now." style={{ marginBottom: 16 }} />
            ) : usernameQuery.data ? (
              <Alert
                type={usernameQuery.data.available ? 'success' : 'error'}
                showIcon
                message={usernameQuery.data.message}
                style={{ marginBottom: 16 }}
              />
            ) : null
          ) : null}

          <Form<OwnerAdminFormValues> form={form} layout="vertical" onFinish={(values) => mutation.mutate(values)}>
            <Form.Item label="Owner Name" name="owner_name" rules={[{ required: true, message: 'Owner name is required.' }]}>
              <Input placeholder="Marina Homes" />
            </Form.Item>
            <Form.Item label="Public Slug" name="public_slug" extra={slugPlaceholder ? `Suggested: ${slugPlaceholder}` : 'Optional public owner slug.'}>
              <Input placeholder={slugPlaceholder || 'marina-homes'} />
            </Form.Item>
            <Form.Item label="Brand Name" name="brand_name">
              <Input placeholder="Marina Homes" />
            </Form.Item>
            <Form.Item label="Brand Tagline" name="brand_tagline">
              <Input placeholder="Private co-living management for Marina residents" />
            </Form.Item>
            <Form.Item label="Owner Contact Email" name="contact_email" rules={[{ type: 'email', message: 'Enter a valid email.' }]}>
              <Input placeholder="owner@example.com" />
            </Form.Item>
            <Form.Item label="Owner Contact Phone" name="contact_phone">
              <Input placeholder="+971..." />
            </Form.Item>
            <Form.Item label="Admin User Name" name="uname" rules={[{ required: true, message: 'User name is required.' }]}>
              <Input placeholder="admin2" />
            </Form.Item>
            <Form.Item label="Admin Email" name="email" rules={[{ required: true, type: 'email', message: 'Admin email is required.' }]}>
              <Input placeholder="admin2@example.com" />
            </Form.Item>
            <Form.Item label="Password" name="password" rules={[{ required: true, min: 6, message: 'Password must be at least 6 characters.' }]}>
              <Input.Password />
            </Form.Item>
            <Form.Item
              label="Confirm Password"
              name="password2"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Please confirm the password.' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    return !value || getFieldValue('password') === value
                      ? Promise.resolve()
                      : Promise.reject(new Error('Passwords do not match'))
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Button block htmlType="submit" loading={mutation.isPending || usernameQuery.isFetching} size="large" type="primary">
              Create New Owner Admin
            </Button>
            <Space className="auth-links" direction="vertical" size={6}>
              <Link to="/login">Back to login</Link>
            </Space>
          </Form>
        </Card>
      </div>
    </div>
  )
}
