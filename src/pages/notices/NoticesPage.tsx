import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Alert, Button, Card, Form, Input, Select, Space, Spin, Tag, Typography } from 'antd'
import dayjs from 'dayjs'
import { PageHeader } from '../../components/PageHeader'
import { useAuth } from '../../lib/auth-context'
import { http } from '../../lib/http'
import type { NoticesResponse, Notice } from '../../lib/types'

async function fetchNotices() {
  const { data } = await http.get<NoticesResponse>('/resources/notices.php')
  return data
}

function NoticeCard({ notice, canManage, onUpdate }: { notice: Notice; canManage: boolean; onUpdate: (values: { notice_id: number; status: string; admin_reply: string }) => void }) {
  return (
    <Card style={{ marginBottom: 16 }}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Space wrap style={{ justifyContent: 'space-between', width: '100%' }}>
          <div>
            <Typography.Title level={4} style={{ margin: 0 }}>{notice.subject}</Typography.Title>
            <Typography.Text type="secondary">
              {notice.sender_role} {notice.tenant_name ? `| ${notice.tenant_name}` : ''} {notice.house_name ? `| ${notice.house_name}` : ''}
            </Typography.Text>
          </div>
          <Tag color="blue">{notice.status}</Tag>
        </Space>
        <Typography.Paragraph style={{ marginBottom: 0 }}>{notice.message}</Typography.Paragraph>
        {notice.admin_reply ? <Typography.Text><strong>Admin Reply:</strong> {notice.admin_reply}</Typography.Text> : null}
        <Typography.Text type="secondary">Updated: {notice.updated_at ? dayjs(notice.updated_at).format('DD MMM YYYY HH:mm') : '-'}</Typography.Text>
        {canManage ? (
          <Form layout="vertical" onFinish={(values) => onUpdate({ notice_id: notice.notice_id, status: values.status, admin_reply: values.admin_reply ?? '' })}>
            <Space align="start" wrap style={{ width: '100%' }}>
              <Form.Item initialValue={notice.status} label="Status" name="status" style={{ minWidth: 180 }}><Select options={['Open', 'Replied', 'Closed', 'Published'].map((value) => ({ label: value, value }))} /></Form.Item>
              <Form.Item initialValue={notice.admin_reply} label="Admin Reply" name="admin_reply" style={{ minWidth: 320, flex: 1 }}><Input placeholder="Optional internal note or reply" /></Form.Item>
              <Form.Item label=" "><Button htmlType="submit" type="primary">Save</Button></Form.Item>
            </Space>
          </Form>
        ) : null}
      </Space>
    </Card>
  )
}

export function NoticesPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { data, isLoading, isError } = useQuery({ queryKey: ['notices'], queryFn: fetchNotices })
  const createMutation = useMutation({ mutationFn: (values: Record<string, string>) => http.post('/resources/notices.php', { action: 'create', ...values }), onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['notices'] }) })
  const updateMutation = useMutation({ mutationFn: (values: { notice_id: number; status: string; admin_reply: string }) => http.post('/resources/notices.php', { action: 'update', ...values }), onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['notices'] }) })

  return (
    <div className="page-stack">
      <PageHeader title="Notices" subtitle={user?.isAdmin ? 'Create notices for one tenant or broadcast to all active tenants.' : 'Send notices to admin and review notice history.'} breadcrumbs={[{ title: 'Dashboard' }, { title: 'Notices' }]} />
      <Card>
        <Typography.Title level={4}>{user?.isAdmin ? 'Create Notice' : 'Send Notice'}</Typography.Title>
        <Form layout="vertical" onFinish={(values) => createMutation.mutate(values as Record<string, string>)}>
          <Space direction="vertical" style={{ width: '100%' }}>
            {user?.isAdmin ? (
              <Form.Item label="Recipient" name="recipient_tenant" initialValue="all" rules={[{ required: true }]}>
                <Select
                  options={[
                    { label: 'All Active Tenants', value: 'all' },
                    ...((data?.recipients ?? []).map((recipient) => ({
                      label: `${recipient.tenant_name} (${recipient.email}) | ${recipient.house_name}${recipient.partition_number ? ` / ${recipient.partition_number}` : ''}`,
                      value: String(recipient.tenantID),
                    }))),
                  ]}
                />
              </Form.Item>
            ) : null}
            <Form.Item label="Subject" name="subject" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item label="Message" name="message" rules={[{ required: true }]}><Input.TextArea rows={4} /></Form.Item>
            <Button htmlType="submit" loading={createMutation.isPending} type="primary">{user?.isAdmin ? 'Create Notice' : 'Send Notice'}</Button>
          </Space>
        </Form>
      </Card>
      {isLoading ? <Card><div className="page-loader"><Spin size="large" /></div></Card> : isError || !data?.ok ? <Alert type="error" showIcon message="Notice data could not be loaded." /> : data.items.map((notice) => <NoticeCard key={notice.notice_id} notice={notice} canManage={Boolean(data.canManage)} onUpdate={(values) => updateMutation.mutate(values)} />)}
    </div>
  )
}
