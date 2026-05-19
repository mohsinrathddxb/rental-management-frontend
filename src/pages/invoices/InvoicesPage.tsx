import {
  FilePdfOutlined,
  FileTextOutlined,
  PlusOutlined,
  SendOutlined,
} from '@ant-design/icons'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Alert, Button, Card, Space, Spin, Table, Tag, Typography, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import { http } from '../../lib/http'
import type { Invoice, InvoicesResponse, TelegramActionResponse } from '../../lib/types'

async function fetchInvoices() {
  const { data } = await http.get<InvoicesResponse>('/resources/invoices.php')
  return data
}

function invoiceStatusTag(status: string) {
  const normalized = status.trim().toLowerCase()
  if (normalized === 'paid') return <Tag color="success">Fully Paid</Tag>
  if (normalized === 'partial paid') return <Tag color="warning">Partially Paid</Tag>
  return <Tag color="error">{status || 'Unknown'}</Tag>
}

export function InvoicesPage() {
  const navigate = useNavigate()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['invoices'],
    queryFn: fetchInvoices,
  })

  const telegramMutation = useMutation({
    mutationFn: async (invoiceNumber: string) => {
      const { data } = await http.post<TelegramActionResponse>('/telegram/invoice-actions.php', {
        invoiceNumber,
        telegram_action: 'send_invoice',
      })
      return data
    },
    onSuccess: (response) => {
      message.success(response.message || 'Invoice sent on Telegram.')
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Invoice could not be sent on Telegram.')
    },
  })

  const columns: ColumnsType<Invoice> = [
    {
      title: 'Tenant',
      key: 'tenant',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{record.tenant_name || '-'}</Typography.Text>
          <Typography.Text type="secondary">{record.phone_number || '-'}</Typography.Text>
        </Space>
      ),
    },
    {
      title: 'Invoice Status',
      dataIndex: 'status',
      key: 'status',
      render: (value: string) => invoiceStatusTag(value),
    },
    {
      title: 'Amount',
      key: 'amount',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>AED {record.amountDue.toLocaleString()}</Typography.Text>
          <Typography.Text type="secondary">
            Total: AED {record.total_amount.toLocaleString()}
          </Typography.Text>
        </Space>
      ),
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
          {record.receipt_pdf_url ? (
            <Button
              href={record.receipt_pdf_url}
              icon={<FilePdfOutlined />}
              size="small"
              target="_blank"
            >
              Latest Receipt
            </Button>
          ) : null}
          {data?.canManage ? (
            <Button
              icon={<SendOutlined />}
              loading={telegramMutation.isPending && telegramMutation.variables === record.invoiceNumber}
              onClick={() => telegramMutation.mutate(record.invoiceNumber)}
              size="small"
              type="primary"
              ghost
            >
              Send Telegram
            </Button>
          ) : null}
        </Space>
      ),
    },
    {
      title: 'Invoice ID',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
    },
    {
      title: 'Invoice Date',
      dataIndex: 'dateOfInvoice',
      key: 'dateOfInvoice',
      render: (value: string) => (value ? dayjs(value).format('DD MMM YYYY') : '-'),
    },
    {
      title: 'Due Date',
      dataIndex: 'dateDue',
      key: 'dateDue',
      render: (value: string) => (value ? dayjs(value).format('DD MMM YYYY') : '-'),
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
        title="Invoices"
        subtitle="The same invoice ordering and status logic, now presented in Ant Design."
        breadcrumbs={[{ title: 'Dashboard' }, { title: 'Invoices' }]}
        extra={
          data?.canManage ? (
            <Button
              icon={<PlusOutlined />}
              onClick={() => navigate('/create/invoice')}
              type="primary"
            >
              New Invoice
            </Button>
          ) : null
        }
      />

      <Card>
        {isLoading ? (
          <div className="page-loader">
            <Spin size="large" />
          </div>
        ) : isError || !data?.ok ? (
          <Alert type="error" showIcon message="Invoice data could not be loaded." />
        ) : (
          <Table
            columns={columns}
            dataSource={data.items}
            rowKey="invoiceNumber"
            scroll={{ x: 1200 }}
            pagination={{ pageSize: 10, showSizeChanger: false }}
          />
        )}
      </Card>
    </div>
  )
}
