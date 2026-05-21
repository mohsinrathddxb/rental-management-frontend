import { useMutation } from '@tanstack/react-query'
import { Alert, Button, Card, Form, Input } from 'antd'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import { getApiErrorMessage } from '../../lib/api-errors'
import { http } from '../../lib/http'

type CreatePostValues = {
  author?: string
  title: string
  content: string
}

export function CreatePostPage() {
  const navigate = useNavigate()
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const mutation = useMutation({
    mutationFn: (values: CreatePostValues) => http.post('/create/post', values),
    onSuccess: () => { setError(''); setMessage('Post created successfully.'); setTimeout(() => navigate('/posts'), 600) },
    onError: (err: unknown) => { setMessage(''); setError(getApiErrorMessage(err, 'Post could not be created.')) },
  })
  return <div className="page-stack"><PageHeader title="Create Post" subtitle="Create a blog post directly from the React admin." breadcrumbs={[{ title: 'Dashboard' }, { title: 'Create Post' }]} /><Card>{message ? <Alert type="success" showIcon message={message} style={{ marginBottom: 16 }} /> : null}{error ? <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} /> : null}<Form<CreatePostValues> layout="vertical" onFinish={(values) => mutation.mutate(values)}><Form.Item label="Author" name="author"><Input /></Form.Item><Form.Item label="Title" name="title" rules={[{ required: true }]}><Input /></Form.Item><Form.Item label="Content" name="content" rules={[{ required: true }]}><Input.TextArea rows={8} /></Form.Item><Button htmlType="submit" loading={mutation.isPending} type="primary">Create Post</Button></Form></Card></div>
}
