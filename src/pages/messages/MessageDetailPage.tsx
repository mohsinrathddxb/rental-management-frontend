import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Alert, Button, Card, Descriptions, Popconfirm, Space, Spin, Typography } from 'antd'
import dayjs from 'dayjs'
import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import { getApiErrorMessage } from '../../lib/api-errors'
import { http } from '../../lib/http'
import type { MessageResponse } from '../../lib/types'

async function fetchMessage(id: string) {
  const { data } = await http.get<MessageResponse>(`/resources/message.php?id=${id}`)
  return data
}

export function MessageDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['message', id],
    queryFn: () => fetchMessage(id),
    enabled: Boolean(id),
  })

  const deleteMutation = useMutation({
    mutationFn: () => http.post('/resources/message.php', { id: Number(id) }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['messages'] })
      navigate('/messages', { replace: true })
    },
  })

  const message = data?.item

  return (
    <div className="page-stack">
      <PageHeader
        title="Message Detail"
        subtitle="Read and manage inbox messages from the legacy contact form."
        breadcrumbs={[
          { title: 'Dashboard' },
          { title: 'Messages' },
          { title: message?.names || 'Detail' },
        ]}
        extra={
          <Space>
            <Button onClick={() => navigate('/messages')}>Back to Messages</Button>
            <Popconfirm
              title="Delete this message?"
              okButtonProps={{ danger: true, loading: deleteMutation.isPending }}
              okText="Delete"
              onConfirm={() => deleteMutation.mutate()}
            >
              <Button danger loading={deleteMutation.isPending}>
                Delete Message
              </Button>
            </Popconfirm>
          </Space>
        }
      />
      <Card>
        {isLoading ? (
          <div className="page-loader">
            <Spin size="large" />
          </div>
        ) : isError || !data?.ok || !message ? (
          <Alert type="error" showIcon message="Message details could not be loaded." />
        ) : (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {deleteMutation.isError ? (
              <Alert
                type="error"
                showIcon
                message={getApiErrorMessage(deleteMutation.error, 'Message could not be deleted.')}
              />
            ) : null}
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Name">{message.names || '-'}</Descriptions.Item>
              <Descriptions.Item label="Email">{message.email || '-'}</Descriptions.Item>
              <Descriptions.Item label="Date">
                {message.date ? dayjs(message.date).format('DD MMM YYYY') : '-'}
              </Descriptions.Item>
            </Descriptions>
            <Card size="small" title="Message">
              <Typography.Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>
                {message.message || '-'}
              </Typography.Paragraph>
            </Card>
          </Space>
        )}
      </Card>
    </div>
  )
}
