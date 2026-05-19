import {
  FileTextOutlined,
  MailOutlined,
  PhoneOutlined,
  SendOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Alert, Button, Card, Space, Spin, Table, Tag, Typography, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import { assetBaseURL, http } from '../../lib/http'
import type { TelegramActionResponse, Tenant, TenantsResponse } from '../../lib/types'

async function fetchTenants() {
  const { data } = await http.get<TenantsResponse>('/resources/tenants.php')
  return data
}

export function TenantsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['tenants'],
    queryFn: fetchTenants,
  })

  const fetchChatIdMutation = useMutation({
    mutationFn: async (tenantId: number) => {
      const { data } = await http.post<TelegramActionResponse>('/telegram/tenant-actions.php', {
        tenant_id: tenantId,
        telegram_action: 'fetch_chat_id',
      })
      return data
    },
    onSuccess: async (response) => {
      message.success(response.message || 'Telegram chat ID fetched successfully.')
      await queryClient.invalidateQueries({ queryKey: ['tenants'] })
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Telegram chat ID could not be fetched.')
    },
  })

  const sendTestMutation = useMutation({
    mutationFn: async (tenantId: number) => {
      const { data } = await http.post<TelegramActionResponse>('/telegram/tenant-actions.php', {
        tenant_id: tenantId,
        telegram_action: 'send_test',
      })
      return data
    },
    onSuccess: (response) => {
      message.success(response.message || 'Telegram test message sent.')
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Telegram test message failed.')
    },
  })

  const columns: ColumnsType<Tenant> = [
    {
      title: 'Tenant',
      key: 'tenant',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{record.tenant_name}</Typography.Text>
          <Typography.Text type="secondary">
            ID: {record.tenantID}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: 'Stay',
      key: 'stay',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text>{record.house_name || '-'}</Typography.Text>
          <Typography.Text type="secondary">
            Partition: {record.partition_number || '-'}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: 'Rent',
      dataIndex: 'rent_amount',
      key: 'rent_amount',
      render: (value: number) => <Tag color="gold">AED {value.toLocaleString()}</Tag>,
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text>
            <MailOutlined /> {record.email}
          </Typography.Text>
          <Typography.Text>
            <PhoneOutlined /> {record.phone_number}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: 'Telegram',
      key: 'telegram',
      render: (_, record) => (
        <Space direction="vertical" size={4}>
          <Typography.Text>{record.telegram_username ? `@${record.telegram_username}` : 'No username'}</Typography.Text>
          <Typography.Text type="secondary">
            {record.telegram_chat_id || 'No chat ID'}
          </Typography.Text>
          <Space wrap>
            <Button
              icon={<SendOutlined />}
              loading={fetchChatIdMutation.isPending && fetchChatIdMutation.variables === record.tenantID}
              onClick={() => fetchChatIdMutation.mutate(record.tenantID)}
              size="small"
              disabled={!record.telegram_username}
            >
              Fetch Chat ID
            </Button>
            <Button
              icon={<SendOutlined />}
              loading={sendTestMutation.isPending && sendTestMutation.variables === record.tenantID}
              onClick={() => sendTestMutation.mutate(record.tenantID)}
              size="small"
              type="primary"
              ghost
              disabled={!record.telegram_chat_id}
            >
              Send Test
            </Button>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Country',
      dataIndex: 'tenant_country',
      key: 'tenant_country',
    },
    {
      title: 'Profession',
      dataIndex: 'profession',
      key: 'profession',
    },
    {
      title: 'Dates',
      key: 'dates',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text>Start: {record.start_date || '-'}</Typography.Text>
          <Typography.Text type="secondary">
            End: {record.end_date || '-'}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: 'Documents',
      key: 'agreement_file',
      render: (_, record) =>
        record.agreement_file ? (
          <Button
            href={`${assetBaseURL}/uploads/agreements/${record.agreement_file}`}
            icon={<FileTextOutlined />}
            target="_blank"
          >
            Agreement
          </Button>
        ) : (
          <Tag>No file</Tag>
        ),
    },
  ]

  return (
    <div className="page-stack">
      <PageHeader
        title="Tenants"
        subtitle="Active tenants from the local Node backend, now rendered with Ant Design."
        breadcrumbs={[{ title: 'Dashboard' }, { title: 'Tenants' }]}
        extra={
          <Button
            icon={<TeamOutlined />}
            onClick={() => navigate('/create/tenant')}
            type="primary"
          >
            Add Tenant
          </Button>
        }
      />

      <Card>
        {isLoading ? (
          <div className="page-loader">
            <Spin size="large" />
          </div>
        ) : isError || !data?.ok ? (
          <Alert type="error" showIcon message="Tenant data could not be loaded." />
        ) : (
          <Table
            columns={columns}
            dataSource={data.items}
            rowKey="tenantID"
            scroll={{ x: 1200 }}
            pagination={{ pageSize: 10, showSizeChanger: false }}
          />
        )}
      </Card>
    </div>
  )
}
