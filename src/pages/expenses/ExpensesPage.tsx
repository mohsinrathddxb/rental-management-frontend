import { FileImageOutlined, FilePdfOutlined, PlusOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { Alert, Button, Card, Col, Form, Row, Select, Spin, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import { http } from '../../lib/http'
import type { Expense, ExpensesResponse } from '../../lib/types'

async function fetchExpenses(month: string | null, category: string | null) {
  const params = new URLSearchParams()
  if (month) params.set('month', month)
  if (category) params.set('category', category)
  const query = params.toString() ? `?${params.toString()}` : ''
  const { data } = await http.get<ExpensesResponse>(`/resources/expenses.php${query}`)
  return data
}

export function ExpensesPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const month = searchParams.get('month') ?? dayjs().format('YYYY-MM')
  const category = searchParams.get('category') ?? ''
  const { data, isLoading, isError } = useQuery({
    queryKey: ['expenses', month, category],
    queryFn: () => fetchExpenses(month, category),
  })

  const columns: ColumnsType<Expense> = [
    { title: 'Date', dataIndex: 'expense_date', key: 'expense_date' },
    { title: 'Category', dataIndex: 'category', key: 'category', render: (v: string) => <Tag>{v}</Tag> },
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'House', dataIndex: 'house_name', key: 'house_name' },
    { title: 'Partition', dataIndex: 'partition_number', key: 'partition_number', render: (v: string) => v || '-' },
    { title: 'Vendor', dataIndex: 'vendor_name', key: 'vendor_name', render: (v: string) => v || '-' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (v: number) => `AED ${v.toLocaleString()}` },
    {
      title: 'Attachment',
      key: 'attachment',
      render: (_, record) =>
        record.attachment_path ? (
          <Button
            href={`http://localhost/Rental-house-management-system/admin/${record.attachment_path}`}
            icon={record.is_image_attachment ? <FileImageOutlined /> : <FilePdfOutlined />}
            size="small"
            target="_blank"
          >
            View
          </Button>
        ) : (
          <Tag>No file</Tag>
        ),
    },
    { title: 'Notes', dataIndex: 'notes', key: 'notes', render: (v: string) => v || '-' },
  ]

  return (
    <div className="page-stack">
      <PageHeader
        title="Expenses"
        subtitle="Monthly expense tracking with the same category filters and finance snapshot."
        breadcrumbs={[{ title: 'Dashboard' }, { title: 'Expenses' }]}
        extra={
          <Button icon={<PlusOutlined />} onClick={() => navigate('/create/expense')} type="primary">
            Add Expense
          </Button>
        }
      />
      <Card>
        <Form layout="vertical">
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item label="Month">
                <input
                  className="ant-input ant-input-lg"
                  type="month"
                  value={month}
                  onChange={(event) => {
                    const params = new URLSearchParams(searchParams)
                    params.set('month', event.target.value)
                    setSearchParams(params)
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Category">
                <Select
                  allowClear
                  value={category || undefined}
                  options={(data?.categories ?? []).map((value) => ({ label: value, value }))}
                  onChange={(value) => {
                    const params = new URLSearchParams(searchParams)
                    if (value) params.set('category', value)
                    else params.delete('category')
                    setSearchParams(params)
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
        {data?.summary ? (
          <Row gutter={[16, 16]} style={{ marginBottom: 18 }}>
            <Col xs={12} md={6}><Card><Typography.Text type="secondary">Rent Collected</Typography.Text><Typography.Title level={4}>AED {data.summary.rent_collected.toLocaleString()}</Typography.Title></Card></Col>
            <Col xs={12} md={6}><Card><Typography.Text type="secondary">DEWA Paid</Typography.Text><Typography.Title level={4}>AED {data.summary.dewa_paid.toLocaleString()}</Typography.Title></Card></Col>
            <Col xs={12} md={6}><Card><Typography.Text type="secondary">Other Expenses</Typography.Text><Typography.Title level={4}>AED {data.summary.other_expenses.toLocaleString()}</Typography.Title></Card></Col>
            <Col xs={12} md={6}><Card><Typography.Text type="secondary">Net Earning</Typography.Text><Typography.Title level={4}>AED {data.summary.net_earning.toLocaleString()}</Typography.Title></Card></Col>
          </Row>
        ) : null}
        {isLoading ? <div className="page-loader"><Spin size="large" /></div> : isError || !data?.ok ? <Alert type="error" showIcon message="Expense data could not be loaded." /> : <Table columns={columns} dataSource={data.items} rowKey="expense_id" scroll={{ x: 1200 }} pagination={{ pageSize: 10, showSizeChanger: false }} />}
      </Card>
    </div>
  )
}
