import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Alert, Button, Card, Form, Input, InputNumber, Select, Space, Spin, Typography } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import { getApiErrorMessage } from '../../lib/api-errors'
import { http } from '../../lib/http'
import { useFormOptions } from './useFormOptions'

type CreatePaymentValues = {
  invoiceNumber: string
  amountDue?: number
  paidAmount: number
  mpesa?: string
  comment: string
}

function formatAed(amount: unknown) {
  const numeric = Number(amount)
  return Number.isFinite(numeric) ? numeric.toLocaleString() : '0'
}

export function CreatePaymentPage() {
  const [form] = Form.useForm<CreatePaymentValues>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const { data, isLoading } = useFormOptions({
    staleTime: 0,
    refetchOnMount: 'always',
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const initialInvoiceNumber = searchParams.get('invoiceNumber') ?? ''
  const [selectedInvoice, setSelectedInvoice] = useState<string>(initialInvoiceNumber)

  const invoice = useMemo(
    () => (data?.openInvoices ?? []).find((item) => item.invoiceNumber === selectedInvoice),
    [data?.openInvoices, selectedInvoice],
  )

  const invoiceOptions = (data?.openInvoices ?? []).map((item) => ({
    label: (
      <Space direction="vertical" size={0}>
        <Typography.Text strong>{item.tenant_name}</Typography.Text>
        <Typography.Text type="secondary">
          {`${item.invoiceNumber} | Due: ${item.dateDue || '-'} | Balance: AED ${formatAed(item.amountDue)}`}
        </Typography.Text>
      </Space>
    ),
    searchText: `${item.tenant_name} ${item.invoiceNumber} ${item.dateDue} ${item.status}`.trim(),
    value: item.invoiceNumber,
  }))

  const mutation = useMutation({
    mutationFn: (values: CreatePaymentValues) => {
      const matchedInvoice = (data?.openInvoices ?? []).find((item) => item.invoiceNumber === values.invoiceNumber)
      if (!matchedInvoice) {
        throw new Error('Please select a valid invoice before saving the payment.')
      }

      return http.post('/create/payment', {
        ...values,
        tenID: matchedInvoice.tenantID,
        amountDue: matchedInvoice.amountDue,
      })
    },
    onSuccess: () => {
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ['form-options'] }),
        queryClient.invalidateQueries({ queryKey: ['invoices'] }),
        queryClient.invalidateQueries({ queryKey: ['payments'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['reports'] }),
      ])
      setError('')
      setMessage('Payment saved successfully.')
      setTimeout(() => navigate('/payments'), 600)
    },
    onError: (err: unknown) => {
      setMessage('')
      setError(getApiErrorMessage(err, 'Payment could not be saved.'))
    },
  })

  useEffect(() => {
    if (!invoice) {
      if (selectedInvoice) {
        form.setFieldsValue({
          invoiceNumber: undefined,
          amountDue: undefined,
          paidAmount: undefined,
        })
        setSelectedInvoice('')
      }
      return
    }

    form.setFieldsValue({
      invoiceNumber: invoice.invoiceNumber,
      amountDue: invoice.amountDue,
      paidAmount: invoice.amountDue,
    })
  }, [form, invoice, selectedInvoice])

  if (isLoading) {
    return (
      <Card>
        <div className="page-loader">
          <Spin size="large" />
        </div>
      </Card>
    )
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Create Payment"
        subtitle="Apply a payment against deposit first, then rent, and move any extra into advance."
        breadcrumbs={[{ title: 'Dashboard' }, { title: 'Create Payment' }]}
      />
      <Card>
        {message ? <Alert type="success" showIcon message={message} style={{ marginBottom: 16 }} /> : null}
        {error ? <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} /> : null}

        <Form<CreatePaymentValues>
          form={form}
          layout="vertical"
          onFinish={(values) => mutation.mutate(values)}
          initialValues={{ invoiceNumber: initialInvoiceNumber || undefined }}
        >
          <Form.Item label="Invoice / Tenant" name="invoiceNumber" rules={[{ required: true }]}>
            <Select
              showSearch
              optionFilterProp="searchText"
              onChange={(value) => setSelectedInvoice(value)}
              options={invoiceOptions}
              placeholder="Select invoice / tenant"
              notFoundContent="No unpaid invoices available"
            />
          </Form.Item>

          {invoice ? (
            <Card size="small" style={{ marginBottom: 16 }}>
              <Typography.Text>Tenant ID: {invoice.tenantID}</Typography.Text>
              <br />
              <Typography.Text>Deposit Due: AED {formatAed(invoice.deposit_due_amount)}</Typography.Text>
              <br />
              <Typography.Text>Rent Remaining: AED {formatAed(invoice.rent_due_amount)}</Typography.Text>
              <br />
              <Typography.Text>Advance Already Applied: AED {formatAed(invoice.credit_applied)}</Typography.Text>
              <br />
              <Typography.Text strong>Total Outstanding: AED {formatAed(invoice.amountDue)}</Typography.Text>
              <br />
              <Typography.Text>Due Date: {invoice.dateDue || '-'}</Typography.Text>
            </Card>
          ) : null}

          <Form.Item name="amountDue" hidden>
            <InputNumber />
          </Form.Item>

          <Form.Item label="Amount Paid" name="paidAmount" rules={[{ required: true }]}>
            <InputNumber min={0.01} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="MPESA Code" name="mpesa">
            <Input />
          </Form.Item>

          <Form.Item label="Comment" name="comment" rules={[{ required: true }]}>
            <Input.TextArea rows={4} />
          </Form.Item>

          <Button htmlType="submit" loading={mutation.isPending} type="primary">
            Update this Payment
          </Button>
        </Form>
      </Card>
    </div>
  )
}
