import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Alert, Button, Card, Form, Image, Input, Select, Space, Spin, Tag, Timeline, Typography, Upload, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import type { UploadFile } from 'antd/es/upload/interface'
import dayjs from 'dayjs'
import { PageHeader } from '../../components/PageHeader'
import { useAuth } from '../../lib/auth-context'
import { http } from '../../lib/http'
import type { Complaint, ComplaintAttachment, ComplaintHistoryEntry, ComplaintsResponse } from '../../lib/types'

async function fetchComplaints() {
  const { data } = await http.get<ComplaintsResponse>('/resources/complaints')
  return data
}

function complaintColor(status: string) {
  const value = status.toLowerCase()
  if (value === 'open') return 'red'
  if (value === 'in progress') return 'processing'
  if (value === 'completed') return 'success'
  if (value === 'rejected') return 'default'
  return 'default'
}

function formatFileSize(bytes: number) {
  if (!bytes) return ''
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`
  return `${bytes} B`
}

function ComplaintAttachments({ attachments }: { attachments: ComplaintAttachment[] }) {
  if (!attachments.length) {
    return null
  }

  return (
    <Space direction="vertical" size="small" style={{ width: '100%' }}>
      <Typography.Text strong>Images</Typography.Text>
      <Image.PreviewGroup>
        <Space wrap>
          {attachments.map((attachment) => (
            <div key={attachment.attachment_id} style={{ width: 140 }}>
              <Image
                src={attachment.file_url}
                alt={attachment.file_name || 'Complaint image'}
                width={140}
                height={100}
                style={{ objectFit: 'cover', borderRadius: 8 }}
              />
              <Typography.Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                {attachment.file_name || 'Attachment'}
              </Typography.Text>
              <Typography.Text type="secondary" style={{ display: 'block' }}>
                {formatFileSize(attachment.file_size)}
              </Typography.Text>
            </div>
          ))}
        </Space>
      </Image.PreviewGroup>
    </Space>
  )
}

function ComplaintTimeline({ history }: { history: ComplaintHistoryEntry[] }) {
  if (!history.length) {
    return null
  }

  return (
    <Space direction="vertical" size="small" style={{ width: '100%' }}>
      <Typography.Text strong>Status Timeline</Typography.Text>
      <Timeline
        items={history.map((entry) => ({
          color: complaintColor(entry.new_status),
          children: (
            <Space direction="vertical" size={0}>
              <Typography.Text>
                <strong>{entry.new_status}</strong>
                {entry.actor_name ? ` by ${entry.actor_name}` : ''}
              </Typography.Text>
              {entry.note ? <Typography.Text type="secondary">{entry.note}</Typography.Text> : null}
              <Typography.Text type="secondary">{entry.created_at ? dayjs(entry.created_at).format('DD MMM YYYY HH:mm') : '-'}</Typography.Text>
            </Space>
          ),
        }))}
      />
    </Space>
  )
}

function ComplaintCard({
  complaint,
  canManage,
  onUpdate,
  onReopen,
}: {
  complaint: Complaint
  canManage: boolean
  onUpdate: (values: { complaint_id: number; status: string; admin_reason: string }) => void
  onReopen: (complaint_id: number) => void
}) {
  const normalizedStatus = complaint.status.toLowerCase()
  const isCompleted = normalizedStatus === 'completed'
  const canTenantReopen = !canManage && normalizedStatus === 'rejected'

  return (
    <Card style={{ marginBottom: 16 }}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Space wrap style={{ justifyContent: 'space-between', width: '100%' }}>
          <div>
            <Typography.Title level={4} style={{ margin: 0 }}>{complaint.title}</Typography.Title>
            <Typography.Text type="secondary">
              {complaint.tenant_name ? `${complaint.tenant_name} | ` : ''}
              {complaint.house_name || '-'} {complaint.partition_number ? `/ ${complaint.partition_number}` : ''}
            </Typography.Text>
          </div>
          <Tag color={complaintColor(complaint.status)}>{complaint.status}</Tag>
        </Space>

        <Typography.Paragraph style={{ marginBottom: 0 }}>{complaint.description}</Typography.Paragraph>
        {complaint.admin_reason ? <Typography.Text><strong>Latest Admin Note:</strong> {complaint.admin_reason}</Typography.Text> : null}
        <Typography.Text type="secondary">
          Created: {complaint.created_at ? dayjs(complaint.created_at).format('DD MMM YYYY HH:mm') : '-'}
          {' | '}
          Updated: {complaint.updated_at ? dayjs(complaint.updated_at).format('DD MMM YYYY HH:mm') : '-'}
        </Typography.Text>

        <ComplaintAttachments attachments={complaint.attachments} />
        <ComplaintTimeline history={complaint.history} />

        {canManage && !isCompleted ? (
          <Form
            layout="vertical"
            onFinish={(values) => onUpdate({ complaint_id: complaint.complaint_id, status: values.status, admin_reason: values.admin_reason ?? '' })}
          >
            <Space align="start" wrap style={{ width: '100%' }}>
              <Form.Item initialValue={complaint.status} label="Status" name="status" style={{ minWidth: 180 }}>
                <Select options={['Open', 'In Progress', 'Completed', 'Rejected'].map((value) => ({ label: value, value }))} />
              </Form.Item>
              <Form.Item initialValue={complaint.admin_reason} label="Admin Note" name="admin_reason" style={{ minWidth: 320, flex: 1 }}>
                <Input placeholder="Progress update, completion note, or rejection reason" />
              </Form.Item>
              <Form.Item label=" ">
                <Button htmlType="submit" type="primary">Save</Button>
              </Form.Item>
            </Space>
          </Form>
        ) : canManage && isCompleted ? (
          <Alert
            type="success"
            showIcon
            message="This complaint is completed and locked. Raise a new complaint if more work is needed."
          />
        ) : canTenantReopen ? (
          <Button onClick={() => onReopen(complaint.complaint_id)}>Reopen Complaint</Button>
        ) : isCompleted ? (
          <Alert
            type="info"
            showIcon
            message="This complaint is completed. If there is a new issue, please raise a new complaint."
          />
        ) : null}
      </Space>
    </Card>
  )
}

export function ComplaintsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [form] = Form.useForm()
  const [files, setFiles] = useState<UploadFile[]>([])
  const { data, isLoading, isError } = useQuery({ queryKey: ['complaints'], queryFn: fetchComplaints })

  const createMutation = useMutation({
    mutationFn: async (values: { title: string; description: string }) => {
      const formData = new FormData()
      formData.append('action', 'create')
      formData.append('title', values.title)
      formData.append('description', values.description)
      files.forEach((file) => {
        if (file.originFileObj) {
          formData.append('images[]', file.originFileObj)
        }
      })
      return http.post('/resources/complaints', formData)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['complaints'] })
      form.resetFields()
      setFiles([])
      void message.success('Complaint submitted.')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (values: { complaint_id: number; status: string; admin_reason: string }) => http.post('/resources/complaints', { action: 'update', ...values }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['complaints'] }),
  })

  const reopenMutation = useMutation({
    mutationFn: (complaint_id: number) => http.post('/resources/complaints', { action: 'reopen', complaint_id }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['complaints'] }),
  })

  const sortedItems = useMemo(() => data?.items ?? [], [data?.items])

  return (
    <div className="page-stack">
      <PageHeader
        title="Complaints"
        subtitle={user?.isAdmin ? 'Manage tenant complaints with progress updates and completion tracking.' : 'Raise complaints with image proof and track what the admin does next.'}
        breadcrumbs={[{ title: 'Dashboard' }, { title: 'Complaints' }]}
      />

      {!user?.isAdmin ? (
        <Card>
          <Typography.Title level={4}>Log A Complaint</Typography.Title>
          <Form form={form} layout="vertical" onFinish={(values) => createMutation.mutate(values)}>
            <Form.Item label="Title" name="title" rules={[{ required: true, message: 'Title is required.' }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Description" name="description" rules={[{ required: true, message: 'Description is required.' }]}>
              <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item label="Issue Images">
              <Upload
                accept="image/jpeg,image/png,image/gif,image/webp"
                beforeUpload={(file) => {
                  const isAllowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)
                  if (!isAllowed) {
                    void message.error('Only JPG, PNG, GIF, and WEBP images are allowed.')
                    return Upload.LIST_IGNORE
                  }
                  const isSmallEnough = file.size / 1024 / 1024 <= 5
                  if (!isSmallEnough) {
                    void message.error('Each image must be 5 MB or smaller.')
                    return Upload.LIST_IGNORE
                  }
                  return false
                }}
                fileList={files}
                listType="picture"
                multiple
                onChange={({ fileList }) => setFiles(fileList.slice(0, 5))}
              >
                <Button icon={<UploadOutlined />}>Add Images</Button>
              </Upload>
            </Form.Item>
            <Button htmlType="submit" loading={createMutation.isPending} type="primary">Submit Complaint</Button>
          </Form>
        </Card>
      ) : null}

      {isLoading ? (
        <Card><div className="page-loader"><Spin size="large" /></div></Card>
      ) : isError || !data?.ok ? (
        <Alert type="error" showIcon message="Complaint data could not be loaded." />
      ) : !sortedItems.length ? (
        <Card><Typography.Text type="secondary">No complaints found yet.</Typography.Text></Card>
      ) : (
        sortedItems.map((complaint) => (
          <ComplaintCard
            key={complaint.complaint_id}
            complaint={complaint}
            canManage={Boolean(data.canManage)}
            onUpdate={(values) => updateMutation.mutate(values)}
            onReopen={(complaintId) => reopenMutation.mutate(complaintId)}
          />
        ))
      )}
    </div>
  )
}
