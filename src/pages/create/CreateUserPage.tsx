import { useMutation, useQuery } from '@tanstack/react-query'
import { Alert, Button, Card, Form, Input, Select, Spin } from 'antd'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import { getApiErrorMessage } from '../../lib/api-errors'
import { useAuth } from '../../lib/auth-context'
import { http } from '../../lib/http'
import type { OwnersResponse } from '../../lib/types'
import { useFormOptions } from './useFormOptions'

type CreateUserValues = {
  uname: string
  email: string
  role: string
  owner_id?: number
  password: string
  password2: string
}

async function fetchOwners() {
  const { data } = await http.get<OwnersResponse>('/resources/owners')
  return data
}

export function CreateUserPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isPlatformAdmin = Boolean(user?.isPlatformAdmin)
  const { data, isLoading } = useFormOptions()
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const ownersQuery = useQuery({
    queryKey: ['owners'],
    queryFn: fetchOwners,
    enabled: Boolean(user?.isPlatformAdmin),
  })
  const mutation = useMutation({
    mutationFn: (values: CreateUserValues) => http.post('/create/user', values),
    onSuccess: () => {
      setError('')
      setMessage('Admin created successfully.')
      setTimeout(() => navigate('/users'), 600)
    },
    onError: (err: unknown) => {
      setMessage('')
      setError(getApiErrorMessage(err, 'Admin could not be created.'))
    },
  })
  if (isLoading || ownersQuery.isLoading) {
    return (
      <Card>
        <div className="page-loader">
          <Spin size="large" />
        </div>
      </Card>
    )
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Create Admin"
        subtitle="Create an admin or normal user account from the React frontend."
        breadcrumbs={[{ title: 'Dashboard' }, { title: 'Create Admin' }]}
      />
      <Card>
        {message ? <Alert type="success" showIcon message={message} style={{ marginBottom: 16 }} /> : null}
        {error ? <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} /> : null}
        {ownersQuery.isError ? (
          <Alert
            type="error"
            showIcon
            message="Owners could not be loaded for user assignment."
            style={{ marginBottom: 16 }}
          />
        ) : null}
        <Form<CreateUserValues> layout="vertical" onFinish={(values) => mutation.mutate(values)}>
          {isPlatformAdmin ? (
            <Form.Item
              label="Owner"
              name="owner_id"
              rules={[{ required: true, message: 'Owner is required.' }]}
            >
              <Select
                options={(ownersQuery.data?.items ?? []).map((owner) => ({
                  label: owner.owner_name,
                  value: owner.owner_id,
                }))}
              />
            </Form.Item>
          ) : null}
          <Form.Item label="User Name" name="uname" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Role" name="role" rules={[{ required: true }]}>
            <Select options={(data?.roles ?? []).map((value) => ({ label: value, value }))} />
          </Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true }, { min: 6 }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="Confirm Password"
            name="password2"
            dependencies={['password']}
            rules={[
              { required: true },
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
          <Button htmlType="submit" loading={mutation.isPending} type="primary">
            Create Admin
          </Button>
        </Form>
      </Card>
    </div>
  )
}
