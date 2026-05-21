import {
  CreditCardOutlined,
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
import { assetBaseURL, http } from '../../lib/http'
import type { Invoice, InvoicesResponse, TelegramActionResponse } from '../../lib/types'

async function fetchInvoices() {
  const { data } = await http.get<InvoicesResponse>('/resources/invoices')
  return data
}

function formatAed(value: unknown) {
  const amount = Number(value ?? 0)
  return Number.isFinite(amount) ? amount.toLocaleString() : '0'
}

function buildInvoicePdfHref(invoiceNumber: string) {
  return `${assetBaseURL}/api/admin/documents/invoice-pdf?invoice=${encodeURIComponent(invoiceNumber)}`
}

function buildReceiptPdfHref(paymentId: number) {
  return `${assetBaseURL}/api/admin/documents/payment-receipt-pdf?payment=${paymentId}`
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
      const { data } = await http.post<TelegramActionResponse>('/telegram/invoice-actions', {
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
          <Typography.Text strong>AED {formatAed(record.amountDue)}</Typography.Text>
          <Typography.Text type="secondary">
            Deposit due: AED {formatAed(record.deposit_due_amount)}
          </Typography.Text>
          <Typography.Text type="secondary">
            Rent remaining: AED {formatAed(record.rent_due_amount)}
          </Typography.Text>
          <Typography.Text type="secondary">
            Total: AED {formatAed(record.total_amount)}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: 'Documents',
      key: 'documents',
      render: (_, record) => (
        <Space wrap>
          {record.invoice_pdf_url ? (
            <Button
              href={buildInvoicePdfHref(record.invoiceNumber)}
              icon={<FileTextOutlined />}
              size="small"
              target="_blank"
            >
              Invoice PDF
            </Button>
          ) : null}
          {record.receipt_pdf_url ? (
            <Button
              href={buildReceiptPdfHref(record.latestPaymentID)}
              icon={<FilePdfOutlined />}
              size="small"
              target="_blank"
            >
              Latest Receipt
            </Button>
          ) : null}
          {data?.canManage && record.status.trim().toLowerCase() !== 'paid' ? (
            <Button
              icon={<CreditCardOutlined />}
              onClick={() =>
                navigate(`/create/payment?invoiceNumber=${encodeURIComponent(record.invoiceNumber)}`)
              }
              size="small"
              type="primary"
            >
              Make Payment
            </Button>
          ) : null}
          {data?.canManage ? (
            <Button
              icon={<SendOutlined />}
              disabled={!record.telegram_chat_id}
              loading={telegramMutation.isPending && telegramMutation.variables === record.invoiceNumber}
              onClick={() => telegramMutation.mutate(record.invoiceNumber)}
              size="small"
              type="primary"
              ghost
              title={record.telegram_chat_id ? 'Send invoice on Telegram' : record.telegram_username ? 'Fetch chat ID from the tenant page first' : 'Add Telegram details on the tenant page first'}
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
        subtitle="Itemized invoice balances from the local PHP backend."
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
