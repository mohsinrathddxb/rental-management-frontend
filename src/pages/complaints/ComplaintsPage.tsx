import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Alert, Button, Card, Form, Input, Select, Space, Spin, Tag, Typography } from 'antd'
import dayjs from 'dayjs'
import { PageHeader } from '../../components/PageHeader'
import { useAuth } from '../../lib/auth-context'
import { http } from '../../lib/http'
import type { Complaint, ComplaintsResponse } from '../../lib/types'

async function fetchComplaints() {
  const { data } = await http.get<ComplaintsResponse>('/resources/complaints.php')
  return data
}

function complaintColor(status: string) {
  const value = status.toLowerCase()
  if (value === 'open' || value === 'reopened') return 'red'
  if (value === 'in progress') return 'processing'
  if (value === 'resolved') return 'success'
  if (value === 'rejected') return 'default'
  return 'default'
}

function ComplaintCard({ complaint, canManage, onUpdate, onReopen }: { complaint: Complaint; canManage: boolean; onUpdate: (values: { complaint_id: number; status: string; admin_reason: string }) => void; onReopen: (complaint_id: number) => void }) {
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
        {complaint.admin_reason ? <Typography.Text><strong>Admin Note:</strong> {complaint.admin_reason}</Typography.Text> : null}
        <Typography.Text type="secondary">Updated: {complaint.updated_at ? dayjs(complaint.updated_at).format('DD MMM YYYY HH:mm') : '-'}</Typography.Text>
        {canManage ? (
          <Form layout="vertical" onFinish={(values) => onUpdate({ complaint_id: complaint.complaint_id, status: values.status, admin_reason: values.admin_reason ?? '' })}>
            <Space align="start" wrap style={{ width: '100%' }}>
              <Form.Item initialValue={complaint.status} label="Status" name="status" style={{ minWidth: 180 }}><Select options={['Open', 'In Progress', 'Resolved', 'Rejected'].map((value) => ({ label: value, value }))} /></Form.Item>
              <Form.Item initialValue={complaint.admin_reason} label="Admin Note" name="admin_reason" style={{ minWidth: 320, flex: 1 }}><Input placeholder="Reason, action taken, or progress update" /></Form.Item>
              <Form.Item label=" "><Button htmlType="submit" type="primary">Save</Button></Form.Item>
            </Space>
          </Form>
        ) : complaint.status.toLowerCase() !== 'open' && complaint.status.toLowerCase() !== 'reopened' && complaint.status.toLowerCase() !== 'in progress' ? (
          <Button onClick={() => onReopen(complaint.complaint_id)}>Reopen Complaint</Button>
        ) : null}
      </Space>
    </Card>
  )
}

export function ComplaintsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { data, isLoading, isError } = useQuery({ queryKey: ['complaints'], queryFn: fetchComplaints })
  const createMutation = useMutation({ mutationFn: (values: { title: string; description: string }) => http.post('/resources/complaints.php', { action: 'create', ...values }), onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['complaints'] }) })
  const updateMutation = useMutation({ mutationFn: (values: { complaint_id: number; status: string; admin_reason: string }) => http.post('/resources/complaints.php', { action: 'update', ...values }), onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['complaints'] }) })
  const reopenMutation = useMutation({ mutationFn: (complaint_id: number) => http.post('/resources/complaints.php', { action: 'reopen', complaint_id }), onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['complaints'] }) })

  return (
    <div className="page-stack">
      <PageHeader title="Complaints" subtitle={user?.isAdmin ? 'Manage tenant complaints in the same status order as the PHP admin page.' : 'Track and raise complaints from the React tenant/admin frontend.'} breadcrumbs={[{ title: 'Dashboard' }, { title: 'Complaints' }]} />
      {!user?.isAdmin ? (
        <Card>
          <Typography.Title level={4}>Log A Complaint</Typography.Title>
          <Form layout="vertical" onFinish={(values) => createMutation.mutate(values)}>
            <Form.Item label="Title" name="title" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item label="Description" name="description" rules={[{ required: true }]}><Input.TextArea rows={4} /></Form.Item>
            <Button htmlType="submit" loading={createMutation.isPending} type="primary">Submit Complaint</Button>
          </Form>
        </Card>
      ) : null}
      {isLoading ? <Card><div className="page-loader"><Spin size="large" /></div></Card> : isError || !data?.ok ? <Alert type="error" showIcon message="Complaint data could not be loaded." /> : data.items.map((complaint) => <ComplaintCard key={complaint.complaint_id} complaint={complaint} canManage={Boolean(data.canManage)} onUpdate={(values) => updateMutation.mutate(values)} onReopen={(complaintId) => reopenMutation.mutate(complaintId)} />)}
    </div>
  )
}
