import {
  FilePdfOutlined,
  FileTextOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { Alert, Button, Card, Space, Spin, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import { http } from '../../lib/http'
import type { Payment, PaymentsResponse } from '../../lib/types'

async function fetchPayments() {
  const { data } = await http.get<PaymentsResponse>('/resources/payments.php')
  return data
}

export function PaymentsPage() {
  const navigate = useNavigate()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['payments'],
    queryFn: fetchPayments,
  })

  const columns: ColumnsType<Payment> = [
    {
      title: 'Tenant',
      key: 'tenant',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{record.tenant_name || '-'}</Typography.Text>
          <Typography.Text type="secondary">{record.house_name || '-'}</Typography.Text>
        </Space>
      ),
    },
    {
      title: 'Paid Amount',
      dataIndex: 'amountPaid',
      key: 'amountPaid',
      render: (value: number) => <Tag color="success">AED {value.toLocaleString()}</Tag>,
    },
    {
      title: 'Documents',
      key: 'documents',
      render: (_, record) => (
        <Space wrap>
          <Button
            href={record.invoice_pdf_url}
            icon={<FileTextOutlined />}
            size="small"
            target="_blank"
          >
            Invoice PDF
          </Button>
          <Button
            href={record.receipt_pdf_url}
            icon={<FilePdfOutlined />}
            size="small"
            target="_blank"
          >
            Receipt PDF
          </Button>
        </Space>
      ),
    },
    {
      title: 'Invoice No.',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
    },
    {
      title: 'Expected Amount',
      dataIndex: 'expectedAmount',
      key: 'expectedAmount',
      render: (value: number) => `AED ${value.toLocaleString()}`,
    },
    {
      title: 'Balance',
      dataIndex: 'balance',
      key: 'balance',
      render: (value: number) => `AED ${value.toLocaleString()}`,
    },
    {
      title: 'Date Paid',
      dataIndex: 'dateofPayment',
      key: 'dateofPayment',
      render: (value: string) => (value ? dayjs(value).format('DD MMM YYYY') : '-'),
    },
    {
      title: 'Reference',
      dataIndex: 'mpesaCode',
      key: 'mpesaCode',
      render: (value: string) => value || '-',
    },
    {
      title: 'Comments',
      dataIndex: 'comment',
      key: 'comment',
      render: (value: string) => value || '-',
    },
  ]

  return (
    <div className="page-stack">
      <PageHeader
        title="Payments"
        subtitle="Payment history from the current backend with the important columns surfaced first."
        breadcrumbs={[{ title: 'Dashboard' }, { title: 'Payments' }]}
        extra={
          <Button
            icon={<PlusOutlined />}
            onClick={() => navigate('/create/payment')}
            type="primary"
          >
            New Payment
          </Button>
        }
      />

      <Card>
        {isLoading ? (
          <div className="page-loader">
            <Spin size="large" />
          </div>
        ) : isError || !data?.ok ? (
          <Alert type="error" showIcon message="Payment data could not be loaded." />
        ) : (
          <Table
            columns={columns}
            dataSource={data.items}
            rowKey="paymentID"
            scroll={{ x: 1200 }}
            pagination={{ pageSize: 10, showSizeChanger: false }}
          />
        )}
      </Card>
    </div>
  )
}
