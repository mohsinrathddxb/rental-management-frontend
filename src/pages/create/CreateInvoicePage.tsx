import { useMutation } from '@tanstack/react-query'
import { Alert, Button, Card, Form, Input, InputNumber, Select, Space, Spin, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import { getApiErrorMessage } from '../../lib/api-errors'
import { http } from '../../lib/http'
import { useFormOptions } from './useFormOptions'

type CreateInvoiceValues = {
  tenant_id: number
  invoice_month: string
  ddate?: string
  deposit_amount?: number
  comment: string
}

export function CreateInvoicePage() {
  const [form] = Form.useForm<CreateInvoiceValues>()
  const navigate = useNavigate()
  const { data, isLoading } = useFormOptions()
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [selectedTenantId, setSelectedTenantId] = useState<number>()
  const mutation = useMutation({
    mutationFn: (values: CreateInvoiceValues) => http.post('/create/invoice', values),
    onSuccess: () => { setError(''); setMessage('Invoice created successfully.'); setTimeout(() => navigate('/invoices'), 600) },
    onError: (err: unknown) => { setMessage(''); setError(getApiErrorMessage(err, 'Invoice could not be created.')) },
  })
  const tenants = data?.activeTenants ?? []
  const selectedTenant = useMemo(
    () => tenants.find((tenant) => tenant.tenantID === selectedTenantId),
    [selectedTenantId, tenants],
  )
  const tenantOptions = (data?.activeTenants ?? []).map((tenant) => ({
    label: (
      <Space direction="vertical" size={0}>
        <Typography.Text strong>{tenant.tenant_name}</Typography.Text>
        <Typography.Text type="secondary">
          {tenant.email}
          {tenant.house_name ? ` | ${tenant.house_name}` : ''}
          {tenant.partition_number ? ` / ${tenant.partition_number}` : ''}
          {` | Rent: AED ${tenant.rent_amount.toLocaleString()}`}
        </Typography.Text>
      </Space>
    ),
    searchText: `${tenant.tenant_name} ${tenant.email} ${tenant.house_name} ${tenant.partition_number}`.trim(),
    value: tenant.tenantID,
  }))
  if (isLoading) return <Card><div className="page-loader"><Spin size="large" /></div></Card>
  return <div className="page-stack"><PageHeader title="Create Invoice" subtitle="Issue a monthly invoice using the tenant rent, security deposit, account credit, and duplicate checks." breadcrumbs={[{ title: 'Dashboard' }, { title: 'Create Invoice' }]} /><Card>{message ? <Alert type="success" showIcon message={message} style={{ marginBottom: 16 }} /> : null}{error ? <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} /> : null}<Form<CreateInvoiceValues> form={form} layout="vertical" onFinish={(values) => mutation.mutate(values)} initialValues={{ invoice_month: new Date().toISOString().slice(0, 7), deposit_amount: 0, comment: 'This is the rent invoice for this month' }}><Form.Item label="Tenant" name="tenant_id" rules={[{ required: true }]}><Select showSearch optionFilterProp="searchText" onChange={(value) => setSelectedTenantId(value)} options={tenantOptions} placeholder="Select tenant" notFoundContent="No active tenants available" /></Form.Item>{selectedTenant ? <Card size="small" style={{ marginBottom: 16 }}><Typography.Text>House: {selectedTenant.house_name || '-'}{selectedTenant.partition_number ? ` / ${selectedTenant.partition_number}` : ''}</Typography.Text><br /><Typography.Text strong>Rent Amount: AED {selectedTenant.rent_amount.toLocaleString()}</Typography.Text></Card> : null}<Form.Item label="Invoice Month" name="invoice_month" rules={[{ required: true }]}><Input type="month" /></Form.Item><Form.Item label="Due Date" name="ddate"><Input type="date" /></Form.Item><Form.Item label="Security Deposit" name="deposit_amount"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item><Form.Item label="Comment" name="comment" rules={[{ required: true }]}><Input.TextArea rows={4} /></Form.Item><Button htmlType="submit" loading={mutation.isPending} type="primary">Add Invoice</Button></Form></Card></div>
}
