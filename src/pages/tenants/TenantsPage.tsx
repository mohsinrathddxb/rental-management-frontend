import {
  FileTextOutlined,
  MailOutlined,
  PhoneOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { Alert, Button, Card, Space, Spin, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import { http } from '../../lib/http'
import type { Tenant, TenantsResponse } from '../../lib/types'

async function fetchTenants() {
  const { data } = await http.get<TenantsResponse>('/resources/tenants.php')
  return data
}

export function TenantsPage() {
  const navigate = useNavigate()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['tenants'],
    queryFn: fetchTenants,
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
            href={`http://localhost/Rental-house-management-system/admin/uploads/agreements/${record.agreement_file}`}
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
        subtitle="Active tenants from the current backend, now rendered with Ant Design."
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
