import { useQuery } from '@tanstack/react-query'
import { Alert, Card, Space, Spin, Table, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { Link } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import { http } from '../../lib/http'
import type { MessageRecord, MessagesResponse } from '../../lib/types'

async function fetchMessages() {
  const { data } = await http.get<MessagesResponse>('/resources/messages.php')
  return data
}

export function MessagesPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['messages'],
    queryFn: fetchMessages,
  })

  const columns: ColumnsType<MessageRecord> = [
    {
      title: 'Sender',
      key: 'sender',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>
            <Link to={`/messages/${record.id}`}>{record.names || '-'}</Link>
          </Typography.Text>
          <Typography.Text type="secondary">{record.email || '-'}</Typography.Text>
        </Space>
      ),
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      render: (value: string, record) => (
        <Typography.Text>
          <Link to={`/messages/${record.id}`}>
            {value?.length > 140 ? `${value.slice(0, 140)}...` : value || '-'}
          </Link>
        </Typography.Text>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (value: string) => (value ? dayjs(value).format('DD MMM YYYY') : '-'),
    },
  ]

  return (
    <div className="page-stack">
      <PageHeader
        title="Messages"
        subtitle="Recent contact form messages from the PHP admin inbox."
        breadcrumbs={[{ title: 'Dashboard' }, { title: 'Messages' }]}
      />
      <Card>
        {isLoading ? (
          <div className="page-loader">
            <Spin size="large" />
          </div>
        ) : isError || !data?.ok ? (
          <Alert type="error" showIcon message="Messages could not be loaded." />
        ) : (
          <Table
            columns={columns}
            dataSource={data.items}
            rowKey="id"
            pagination={{ pageSize: 10, showSizeChanger: false }}
          />
        )}
      </Card>
    </div>
  )
}
