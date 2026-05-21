import {
  BankOutlined,
  CreditCardOutlined,
  FileTextOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { Alert, Card, Col, Empty, Row, Spin, Typography } from 'antd'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { PageHeader } from '../../components/PageHeader'
import { StatCard } from '../../components/StatCard'
import { http } from '../../lib/http'
import type { DashboardResponse } from '../../lib/types'

async function fetchDashboard() {
  const { data } = await http.get<DashboardResponse>('/resources/dashboard')
  return data
}

export function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
  })

  if (isLoading) {
    return (
      <div className="page-loader">
        <Spin size="large" />
      </div>
    )
  }

  if (isError || !data?.ok) {
    return (
      <Alert
        type="error"
        showIcon
        message="Dashboard data could not be loaded."
      />
    )
  }

  if (data.mode === 'tenant') {
    return (
      <div className="page-stack">
        <PageHeader
          title="Dashboard"
          subtitle="Tenant view from the migrated frontend."
          breadcrumbs={[{ title: 'Dashboard' }]}
        />
        <Row gutter={[18, 18]}>
          <Col xs={24} md={8}>
            <StatCard title="House" value={data.stay.house || '-'} />
          </Col>
          <Col xs={24} md={8}>
            <StatCard title="Partition" value={data.stay.partition || '-'} />
          </Col>
          <Col xs={24} md={8}>
            <StatCard title="Rent" value={data.stay.rent || '-'} />
          </Col>
          <Col xs={24} md={12}>
            <StatCard title="Invoices" value={data.stats.invoices} />
          </Col>
          <Col xs={24} md={12}>
            <StatCard title="Complaints" value={data.stats.complaints} />
          </Col>
        </Row>
      </div>
    )
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Dashboard"
        subtitle="High-level admin metrics from the current PHP backend."
        breadcrumbs={[{ title: 'Dashboard' }]}
      />

      <Row gutter={[18, 18]}>
        <Col xs={24} sm={12} xl={6}>
          <StatCard title="Houses" value={data.stats.houses} prefix={<BankOutlined />} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard title="Tenants" value={data.stats.tenants} prefix={<TeamOutlined />} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard title="Invoices" value={data.stats.invoices} prefix={<FileTextOutlined />} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard title="Payments" value={data.stats.payments} prefix={<CreditCardOutlined />} />
        </Col>
      </Row>

      <Row gutter={[18, 18]}>
        <Col xs={24} lg={12}>
          <Card className="metric-panel metric-panel--green">
            <Typography.Text type="secondary">Month Collections</Typography.Text>
            <Typography.Title level={2}>
              AED {data.finance.monthCollections.toLocaleString()}
            </Typography.Title>
            <Typography.Paragraph style={{ marginBottom: 0 }}>
              {dayjs(`${data.finance.month}-01`).format('MMMM YYYY')}
            </Typography.Paragraph>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card className="metric-panel metric-panel--gold">
            <Typography.Text type="secondary">Pending Invoices</Typography.Text>
            <Typography.Title level={2}>
              AED {data.finance.pendingInvoices.toLocaleString()}
            </Typography.Title>
            <Typography.Paragraph style={{ marginBottom: 0 }}>
              Open balance still outstanding
            </Typography.Paragraph>
          </Card>
        </Col>
      </Row>

      {!data.stats.houses && !data.stats.tenants ? (
        <Card>
          <Empty description="No dashboard data yet." />
        </Card>
      ) : null}
    </div>
  )
}
