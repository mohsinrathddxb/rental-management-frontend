import { useQuery } from '@tanstack/react-query'
import { Alert, Card, Col, Row, Spin, Table, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import { http } from '../../lib/http'
import type { ReportBreakdown, ReportPartition, ReportsResponse, ReportRoom } from '../../lib/types'

async function fetchReports(month: string | null, year: string | null, quarter: string | null) {
  const params = new URLSearchParams()
  if (month) params.set('month', month)
  if (year) params.set('year', year)
  if (quarter) params.set('quarter', quarter)
  const { data } = await http.get<ReportsResponse>(`/resources/reports.php?${params.toString()}`)
  return data
}

export function ReportsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const month = searchParams.get('month') ?? dayjs().format('YYYY-MM')
  const year = searchParams.get('year') ?? dayjs().format('YYYY')
  const quarter = searchParams.get('quarter') ?? String(Math.ceil((dayjs().month() + 1) / 3))
  const { data, isLoading, isError } = useQuery({
    queryKey: ['reports', month, year, quarter],
    queryFn: () => fetchReports(month, year, quarter),
  })

  const breakdownColumns: ColumnsType<ReportBreakdown> = [
    { title: 'Category', dataIndex: 'category', key: 'category' },
    { title: 'Total', dataIndex: 'total', key: 'total', render: (v: number) => `AED ${v.toLocaleString()}` },
  ]
  const roomColumns: ColumnsType<ReportRoom> = [
    { title: 'House', dataIndex: 'house_name', key: 'house_name' },
    { title: 'Partition', dataIndex: 'partition_number', key: 'partition_number' },
    { title: 'Tenant', dataIndex: 'tenant_name', key: 'tenant_name' },
    { title: 'Rent Collected', dataIndex: 'rent_collected', key: 'rent_collected', render: (v: number) => `AED ${v.toLocaleString()}` },
    { title: 'Direct Expenses', dataIndex: 'direct_expenses', key: 'direct_expenses', render: (v: number) => `AED ${v.toLocaleString()}` },
    { title: 'Net Earning', dataIndex: 'net_earning', key: 'net_earning', render: (v: number) => `AED ${v.toLocaleString()}` },
  ]
  const partitionColumns: ColumnsType<ReportPartition> = [
    { title: 'House', dataIndex: 'house_name', key: 'house_name' },
    { title: 'Partition', dataIndex: 'partition_number', key: 'partition_number' },
    { title: 'Status', dataIndex: 'partition_status', key: 'partition_status' },
    { title: 'Rent Collected', dataIndex: 'rent_collected', key: 'rent_collected', render: (v: number) => `AED ${v.toLocaleString()}` },
    { title: 'Direct Expenses', dataIndex: 'direct_expenses', key: 'direct_expenses', render: (v: number) => `AED ${v.toLocaleString()}` },
    { title: 'Net Earning', dataIndex: 'net_earning', key: 'net_earning', render: (v: number) => `AED ${v.toLocaleString()}` },
  ]

  return (
    <div className="page-stack">
      <PageHeader title="Reports" subtitle="Monthly, quarterly, room-wise, and partition-wise earnings from the current backend." breadcrumbs={[{ title: 'Dashboard' }, { title: 'Reports' }]} />
      <Card>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} md={8}><label>Month</label><input className="ant-input ant-input-lg" type="month" value={month} onChange={(e) => { const p = new URLSearchParams(searchParams); p.set('month', e.target.value); setSearchParams(p) }} /></Col>
          <Col xs={12} md={8}><label>Year</label><input className="ant-input ant-input-lg" type="number" value={year} onChange={(e) => { const p = new URLSearchParams(searchParams); p.set('year', e.target.value); setSearchParams(p) }} /></Col>
          <Col xs={12} md={8}><label>Quarter</label><input className="ant-input ant-input-lg" type="number" min={1} max={4} value={quarter} onChange={(e) => { const p = new URLSearchParams(searchParams); p.set('quarter', e.target.value); setSearchParams(p) }} /></Col>
        </Row>
        {isLoading ? <div className="page-loader"><Spin size="large" /></div> : isError || !data?.ok ? <Alert type="error" showIcon message="Report data could not be loaded." /> : (
          <div className="page-stack">
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}><Card><Typography.Title level={4}>Monthly Report</Typography.Title><Typography.Paragraph>{data.monthly.start} to {data.monthly.end}</Typography.Paragraph><Typography.Paragraph>Rent: AED {data.monthly.rent_collected.toLocaleString()}</Typography.Paragraph><Typography.Paragraph>Expenses: AED {data.monthly.total_expenses.toLocaleString()}</Typography.Paragraph><Typography.Title level={5}>Net: AED {data.monthly.net_earning.toLocaleString()}</Typography.Title></Card></Col>
              <Col xs={24} lg={12}><Card><Typography.Title level={4}>Quarterly Report</Typography.Title><Typography.Paragraph>{data.quarterly.start} to {data.quarterly.end}</Typography.Paragraph><Typography.Paragraph>Rent: AED {data.quarterly.rent_collected.toLocaleString()}</Typography.Paragraph><Typography.Paragraph>Expenses: AED {data.quarterly.total_expenses.toLocaleString()}</Typography.Paragraph><Typography.Title level={5}>Net: AED {data.quarterly.net_earning.toLocaleString()}</Typography.Title></Card></Col>
            </Row>
            <Card title="Expense Breakdown"><Table columns={breakdownColumns} dataSource={data.expenseBreakdown} rowKey="category" pagination={false} /></Card>
            <Card title="Room-wise Actual Earnings"><Table columns={roomColumns} dataSource={data.roomReport} rowKey={(r) => `${r.tenantID}-${r.partition_id}`} scroll={{ x: 1000 }} pagination={{ pageSize: 8, showSizeChanger: false }} /></Card>
            <Card title="Partition-wise Actual Earnings"><Table columns={partitionColumns} dataSource={data.partitionReport} rowKey="partition_id" scroll={{ x: 1000 }} pagination={{ pageSize: 8, showSizeChanger: false }} /></Card>
          </div>
        )}
      </Card>
    </div>
  )
}
