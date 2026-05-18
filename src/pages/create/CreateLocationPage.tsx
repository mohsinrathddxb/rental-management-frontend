import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Alert, Button, Card, Form, Input, List, Spin } from 'antd'
import { useState } from 'react'
import { PageHeader } from '../../components/PageHeader'
import { getApiErrorMessage } from '../../lib/api-errors'
import { http } from '../../lib/http'
import { useFormOptions } from './useFormOptions'

type CreateLocationValues = {
  hname: string
}

export function CreateLocationPage() {
  const { data, isLoading } = useFormOptions()
  const queryClient = useQueryClient()
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const createMutation = useMutation({
    mutationFn: (values: CreateLocationValues) => http.post('/create/location.php', values),
    onSuccess: async () => { setError(''); setMessage('Location created successfully.'); await queryClient.invalidateQueries({ queryKey: ['form-options'] }) },
    onError: (err: unknown) => { setMessage(''); setError(getApiErrorMessage(err, 'Location could not be created.')) },
  })
  const deleteMutation = useMutation({
    mutationFn: (id: number) => http.delete(`/create/location.php?id=${id}`),
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['form-options'] }) },
  })
  if (isLoading) return <Card><div className="page-loader"><Spin size="large" /></div></Card>
  return <div className="page-stack"><PageHeader title="Create Location" subtitle="Manage saved locations from the React frontend." breadcrumbs={[{ title: 'Dashboard' }, { title: 'Create Location' }]} /><Card>{message ? <Alert type="success" showIcon message={message} style={{ marginBottom: 16 }} /> : null}{error ? <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} /> : null}<Form<CreateLocationValues> layout="vertical" onFinish={(values) => createMutation.mutate(values)}><Form.Item label="Location Name" name="hname" rules={[{ required: true }]}><Input /></Form.Item><Button htmlType="submit" loading={createMutation.isPending} type="primary">Add Location</Button></Form><List style={{ marginTop: 24 }} bordered dataSource={data?.locations ?? []} renderItem={(item) => <List.Item actions={[<Button danger loading={deleteMutation.isPending} onClick={() => deleteMutation.mutate(item.id)}>Delete</Button>]}>{item.location_name}</List.Item>} /></Card></div>
}
