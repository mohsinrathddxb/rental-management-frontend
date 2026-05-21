import { useQuery } from '@tanstack/react-query'
import { Alert, Card, Spin, Table, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { PageHeader } from '../../components/PageHeader'
import { http } from '../../lib/http'
import type { SubscriberRecord, SubscribersResponse } from '../../lib/types'

async function fetchSubscribers() {
  const { data } = await http.get<SubscribersResponse>('/resources/subscribers')
  return data
}

export function SubscribersPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['subscribers'],
    queryFn: fetchSubscribers,
  })

  const columns: ColumnsType<SubscriberRecord> = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (value: string) => <Typography.Text strong>{value || '-'}</Typography.Text>,
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
        title="Subscribers"
        subtitle="Newsletter/contact subscribers from the local database."
        breadcrumbs={[{ title: 'Dashboard' }, { title: 'Subscribers' }]}
      />
      <Card>
        {isLoading ? (
          <div className="page-loader">
            <Spin size="large" />
          </div>
        ) : isError || !data?.ok ? (
          <Alert type="error" showIcon message="Subscribers could not be loaded." />
        ) : (
          <Table
            columns={columns}
            dataSource={data.items}
            rowKey={(record) => `${record.email}-${record.date}`}
            pagination={{ pageSize: 10, showSizeChanger: false }}
          />
        )}
      </Card>
    </div>
  )
}
