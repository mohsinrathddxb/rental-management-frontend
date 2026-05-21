import { useMutation } from '@tanstack/react-query'
import { Alert, Button, Card, Form, Input, Typography } from 'antd'
import { useState } from 'react'
import { PageHeader } from '../../components/PageHeader'
import { http } from '../../lib/http'

export function SettingsPage() {
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const mutation = useMutation({
    mutationFn: (values: { password: string; password2: string }) => http.post('/auth/change-password', values),
    onSuccess: () => {
      setError('')
      setMessage('Password updated successfully.')
    },
    onError: (err: unknown) => {
      const maybeAxios = err as { response?: { data?: { message?: string } } }
      setMessage('')
      setError(maybeAxios.response?.data?.message ?? 'Password update failed.')
    },
  })

  return (
    <div className="page-stack">
      <PageHeader title="Settings" subtitle="Account password settings from the new React frontend." breadcrumbs={[{ title: 'Dashboard' }, { title: 'Settings' }]} />
      <Card>
        <Typography.Title level={4}>Change Password</Typography.Title>
        {message ? <Alert type="success" showIcon message={message} style={{ marginBottom: 16 }} /> : null}
        {error ? <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} /> : null}
        <Form layout="vertical" onFinish={(values) => mutation.mutate(values)}>
          <Form.Item label="New Password" name="password" rules={[{ required: true }, { min: 6 }]}><Input.Password /></Form.Item>
          <Form.Item label="Confirm Password" name="password2" dependencies={['password']} rules={[{ required: true }, ({ getFieldValue }) => ({ validator(_, value) { return !value || getFieldValue('password') === value ? Promise.resolve() : Promise.reject(new Error('Passwords do not match')) } })]}><Input.Password /></Form.Item>
          <Button htmlType="submit" loading={mutation.isPending} type="primary">Update Password</Button>
        </Form>
      </Card>
    </div>
  )
}
