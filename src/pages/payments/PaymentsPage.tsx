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
import { openAuthenticatedPdf } from '../../lib/documents'
import { http } from '../../lib/http'
import type { Payment, PaymentsResponse, TelegramActionResponse } from '../../lib/types'

async function fetchPayments() {
  const { data } = await http.get<PaymentsResponse>('/resources/payments')
  return data
}

export function PaymentsPage() {
  const navigate = useNavigate()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['payments'],
    queryFn: fetchPayments,
  })

  const telegramMutation = useMutation({
    mutationFn: async (paymentID: number) => {
      const { data } = await http.post<TelegramActionResponse>('/telegram/payment-actions', {
        paymentID,
        telegram_action: 'send_receipt',
      })
      return data
    },
    onSuccess: (response) => {
      message.success(response.message || 'Payment receipt sent on Telegram.')
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Payment receipt could not be sent on Telegram.')
    },
  })

  const documentMutation = useMutation({
    mutationFn: async (payload: { type: 'invoice' | 'receipt'; invoiceNumber?: string; paymentId?: number }) => {
      if (payload.type === 'invoice' && payload.invoiceNumber) {
        await openAuthenticatedPdf('/documents/invoice-pdf', { invoice: payload.invoiceNumber })
        return
      }

      if (payload.type === 'receipt' && payload.paymentId) {
        await openAuthenticatedPdf('/documents/payment-receipt-pdf', { payment: payload.paymentId })
      }
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'PDF could not be opened.')
    },
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
          {record.invoice_pdf_url ? (
            <Button
              icon={<FileTextOutlined />}
              loading={documentMutation.isPending && documentMutation.variables?.type === 'invoice' && documentMutation.variables?.invoiceNumber === record.invoiceNumber}
              onClick={() =>
                documentMutation.mutate({
                  type: 'invoice',
                  invoiceNumber: record.invoiceNumber,
                })
              }
              size="small"
            >
              Invoice PDF
            </Button>
          ) : null}
          {record.receipt_pdf_url ? (
            <Button
              icon={<FilePdfOutlined />}
              loading={documentMutation.isPending && documentMutation.variables?.type === 'receipt' && documentMutation.variables?.paymentId === record.paymentID}
              onClick={() =>
                documentMutation.mutate({
                  type: 'receipt',
                  paymentId: record.paymentID,
                })
              }
              size="small"
            >
              Receipt PDF
            </Button>
          ) : null}
          <Button
            icon={<SendOutlined />}
            loading={telegramMutation.isPending && telegramMutation.variables === record.paymentID}
            onClick={() => telegramMutation.mutate(record.paymentID)}
            size="small"
            type="primary"
            ghost
          >
            Send Telegram
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
        subtitle="Payment history from the local Node backend with the important columns surfaced first."
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
