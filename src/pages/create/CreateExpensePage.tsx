import { useMutation } from '@tanstack/react-query'
import { Alert, Button, Card, Form, Input, InputNumber, Select, Spin, Upload } from 'antd'
import type { UploadFile } from 'antd'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import { getApiErrorMessage } from '../../lib/api-errors'
import { http } from '../../lib/http'
import { useFormOptions } from './useFormOptions'

type CreateExpenseValues = {
  expense_date: string
  category: string
  amount: number
  title: string
  vendor_name?: string
  house_id?: number
  partition_id?: number
  expense_attachment?: UploadFile[]
  notes?: string
}

export function CreateExpensePage() {
  const navigate = useNavigate()
  const { data, isLoading } = useFormOptions()
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [houseId, setHouseId] = useState<number | null>(null)
  const partitions = useMemo(() => (data?.expense_partitions ?? []).filter((partition) => !houseId || partition.house_id === houseId), [data?.expense_partitions, houseId])
  const mutation = useMutation({
    mutationFn: async (values: CreateExpenseValues) => {
      const formData = new FormData()
      Object.entries(values).forEach(([key, value]) => {
        if (key !== 'expense_attachment' && value !== undefined && value !== null) formData.append(key, String(value))
      })
      const file = values.expense_attachment?.[0]?.originFileObj
      if (file) formData.append('expense_attachment', file)
      const { data } = await http.post('/create/expense.php', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      return data
    },
    onSuccess: () => { setError(''); setMessage('Expense saved successfully.'); setTimeout(() => navigate('/expenses'), 600) },
    onError: (err: unknown) => { setMessage(''); setError(getApiErrorMessage(err, 'Expense could not be saved.')) },
  })
  if (isLoading) return <Card><div className="page-loader"><Spin size="large" /></div></Card>
  return <div className="page-stack"><PageHeader title="Create Expense" subtitle="Track DEWA, purchases, and operating costs with attachments." breadcrumbs={[{ title: 'Dashboard' }, { title: 'Create Expense' }]} /><Card>{message ? <Alert type="success" showIcon message={message} style={{ marginBottom: 16 }} /> : null}{error ? <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} /> : null}<Form<CreateExpenseValues> layout="vertical" onFinish={(values) => mutation.mutate(values)} initialValues={{ expense_date: new Date().toISOString().slice(0, 10) }}><Form.Item label="Expense Date" name="expense_date" rules={[{ required: true }]}><Input type="date" /></Form.Item><Form.Item label="Category" name="category" rules={[{ required: true }]}><Select options={(data?.expense_categories ?? []).map((value) => ({ label: value, value }))} /></Form.Item><Form.Item label="Amount" name="amount" rules={[{ required: true }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item><Form.Item label="Title" name="title" rules={[{ required: true }]}><Input /></Form.Item><Form.Item label="Vendor Name" name="vendor_name"><Input /></Form.Item><Form.Item label="House" name="house_id"><Select allowClear onChange={(value) => setHouseId(value ?? null)} options={(data?.houses ?? []).map((house) => ({ label: `${house.house_name} - ${house.location}`, value: house.houseID }))} /></Form.Item><Form.Item label="Partition" name="partition_id"><Select allowClear options={partitions.map((partition) => ({ label: `${partition.house_name} / ${partition.partition_number}`, value: partition.partition_id }))} /></Form.Item><Form.Item label="Expense Attachment" name="expense_attachment" valuePropName="fileList" getValueFromEvent={(e: { fileList: UploadFile[] }) => e?.fileList}><Upload beforeUpload={() => false}><Button>Choose File</Button></Upload></Form.Item><Form.Item label="Notes" name="notes"><Input.TextArea rows={4} /></Form.Item><Button htmlType="submit" loading={mutation.isPending} type="primary">Save Expense</Button></Form></Card></div>
}
