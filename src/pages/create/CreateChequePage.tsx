import { useMutation } from '@tanstack/react-query'
import { Alert, Button, Card, Form, Input, InputNumber, Select, Spin } from 'antd'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import { getApiErrorMessage } from '../../lib/api-errors'
import { http } from '../../lib/http'
import { useFormOptions } from './useFormOptions'

type CreateChequeValues = {
  house_id: number
  payee_name: string
  frequency: 'Monthly' | 'Quarterly' | 'Yearly'
  start_date: string
  amount: number
  number_of_cheques: number
  notes?: string
}

export function CreateChequePage() {
  const navigate = useNavigate()
  const { data, isLoading } = useFormOptions()
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: (values: CreateChequeValues) => http.post('/create/cheque.php', values),
    onSuccess: () => {
      setError('')
      setMessage('Cheque plan created successfully.')
      setTimeout(() => navigate('/cheques'), 600)
    },
    onError: (err: unknown) => {
      setMessage('')
      setError(getApiErrorMessage(err, 'Cheque plan could not be created.'))
    },
  })

  if (isLoading) {
    return <Card><div className="page-loader"><Spin size="large" /></div></Card>
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Create Cheque Plan"
        subtitle="Create monthly, quarterly, or yearly landlord cheque schedules per house."
        breadcrumbs={[{ title: 'Dashboard' }, { title: 'Create Cheque Plan' }]}
      />
      <Card>
        {message ? <Alert type="success" showIcon message={message} style={{ marginBottom: 16 }} /> : null}
        {error ? <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} /> : null}
        <Form<CreateChequeValues>
          layout="vertical"
          onFinish={(values) => mutation.mutate(values)}
          initialValues={{
            frequency: 'Monthly',
            start_date: new Date().toISOString().slice(0, 10),
            number_of_cheques: 12,
          }}
        >
          <Form.Item label="House" name="house_id" rules={[{ required: true }]}>
            <Select
              options={(data?.houses ?? []).map((house) => ({
                label: `${house.house_name} - ${house.location}`,
                value: house.houseID,
              }))}
            />
          </Form.Item>
          <Form.Item label="Landlord / Payee Name" name="payee_name" rules={[{ required: true }]}>
            <Input placeholder="Enter landlord or payee name" />
          </Form.Item>
          <Form.Item label="Frequency" name="frequency" rules={[{ required: true }]}>
            <Select options={['Monthly', 'Quarterly', 'Yearly'].map((value) => ({ label: value, value }))} />
          </Form.Item>
          <Form.Item label="First Due Date" name="start_date" rules={[{ required: true }]}>
            <Input type="date" />
          </Form.Item>
          <Form.Item label="Cheque Amount" name="amount" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Number of Cheques" name="number_of_cheques" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Notes" name="notes">
            <Input.TextArea rows={4} placeholder="Optional notes about this landlord schedule" />
          </Form.Item>
          <Button htmlType="submit" loading={mutation.isPending} type="primary">
            Create Cheque Plan
          </Button>
        </Form>
      </Card>
    </div>
  )
}

