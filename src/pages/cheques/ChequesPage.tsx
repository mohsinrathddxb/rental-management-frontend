import { EditOutlined, PlusOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Alert, Button, Card, Col, Form, Input, InputNumber, Modal, Row, Space, Spin, Statistic, Table, Tabs, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import { getApiErrorMessage } from '../../lib/api-errors'
import { http } from '../../lib/http'
import type { ChequesResponse, LandlordCheque, LandlordChequeEvent } from '../../lib/types'

async function fetchCheques() {
  const { data } = await http.get<ChequesResponse>('/resources/cheques.php')
  return data
}

type RescheduleValues = {
  new_due_date: string
  reason?: string
}

type PaidValues = {
  paid_amount: number
  paid_date: string
  payment_reference?: string
  paid_note?: string
}

function chequeStatusTag(status: string) {
  return status.toLowerCase() === 'paid' ? <Tag color="success">Paid</Tag> : <Tag color="processing">Pending</Tag>
}

export function ChequesPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['cheques'],
    queryFn: fetchCheques,
  })
  const [rescheduleTarget, setRescheduleTarget] = useState<LandlordCheque | null>(null)
  const [paidTarget, setPaidTarget] = useState<LandlordCheque | null>(null)
  const [pageError, setPageError] = useState('')

  const refreshCheques = async () => {
    await queryClient.invalidateQueries({ queryKey: ['cheques'] })
  }

  const rescheduleMutation = useMutation({
    mutationFn: (values: RescheduleValues) => http.post('/resources/cheques.php', {
      action: 'reschedule',
      cheque_id: rescheduleTarget?.cheque_id,
      ...values,
    }),
    onSuccess: async () => {
      setPageError('')
      setRescheduleTarget(null)
      await refreshCheques()
    },
    onError: (err: unknown) => {
      setPageError(getApiErrorMessage(err, 'Cheque date could not be updated.'))
    },
  })

  const paidMutation = useMutation({
    mutationFn: (values: PaidValues) => http.post('/resources/cheques.php', {
      action: 'mark_paid',
      cheque_id: paidTarget?.cheque_id,
      ...values,
    }),
    onSuccess: async () => {
      setPageError('')
      setPaidTarget(null)
      await refreshCheques()
    },
    onError: (err: unknown) => {
      setPageError(getApiErrorMessage(err, 'Paid cheque entry could not be saved.'))
    },
  })

  const pendingColumns: ColumnsType<LandlordCheque> = useMemo(() => [
    {
      title: 'House / Payee',
      key: 'house_payee',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{record.house_name}</Typography.Text>
          <Typography.Text type="secondary">{record.payee_name}</Typography.Text>
        </Space>
      ),
    },
    {
      title: 'Schedule',
      key: 'schedule',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text>{record.frequency}</Typography.Text>
          <Typography.Text type="secondary">
            Cheque {record.installment_number} of {record.total_installments}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (value: number) => `AED ${value.toLocaleString()}`,
    },
    {
      title: 'Due Date',
      key: 'due_date',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text>{record.due_date ? dayjs(record.due_date).format('DD MMM YYYY') : '-'}</Typography.Text>
          {record.reschedule_count > 0 ? (
            <Typography.Text type="secondary">
              Original: {record.original_due_date ? dayjs(record.original_due_date).format('DD MMM YYYY') : '-'}
            </Typography.Text>
          ) : null}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (value: string) => chequeStatusTag(value),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space wrap>
          <Button
            icon={<EditOutlined />}
            onClick={() => setRescheduleTarget(record)}
            size="small"
          >
            Move Date
          </Button>
          <Button
            onClick={() => setPaidTarget(record)}
            size="small"
            type="primary"
          >
            Add Paid Entry
          </Button>
        </Space>
      ),
    },
  ], [])

  const paidColumns: ColumnsType<LandlordCheque> = useMemo(() => [
    {
      title: 'House / Payee',
      key: 'house_payee',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{record.house_name}</Typography.Text>
          <Typography.Text type="secondary">{record.payee_name}</Typography.Text>
        </Space>
      ),
    },
    {
      title: 'Cheque',
      key: 'schedule',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text>{record.frequency}</Typography.Text>
          <Typography.Text type="secondary">
            Cheque {record.installment_number} of {record.total_installments}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: 'Paid',
      key: 'paid',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>AED {(record.paid_amount || record.amount).toLocaleString()}</Typography.Text>
          <Typography.Text type="secondary">
            {record.paid_date ? dayjs(record.paid_date).format('DD MMM YYYY') : '-'}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: 'Reference',
      dataIndex: 'payment_reference',
      key: 'payment_reference',
      render: (value: string) => value || '-',
    },
    {
      title: 'Notes',
      key: 'notes',
      render: (_, record) => record.paid_note || record.notes || '-',
    },
  ], [])

  const eventColumns: ColumnsType<LandlordChequeEvent> = useMemo(() => [
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (value: string) => value ? dayjs(value).format('DD MMM YYYY HH:mm') : '-',
    },
    {
      title: 'Action',
      dataIndex: 'event_type',
      key: 'event_type',
      render: (value: string) => <Tag>{value}</Tag>,
    },
    {
      title: 'Cheque ID',
      dataIndex: 'cheque_id',
      key: 'cheque_id',
    },
    {
      title: 'Actor',
      dataIndex: 'actor_name',
      key: 'actor_name',
    },
    {
      title: 'Notes',
      dataIndex: 'note',
      key: 'note',
      render: (value: string) => value || '-',
    },
  ], [])

  return (
    <div className="page-stack">
      <PageHeader
        title="Cheques"
        subtitle="Track landlord cheques, move dates when the landlord agrees to defer, and record paid cheques manually."
        breadcrumbs={[{ title: 'Dashboard' }, { title: 'Cheques' }]}
        extra={
          <Button icon={<PlusOutlined />} onClick={() => navigate('/create/cheque')} type="primary">
            Create Cheque Plan
          </Button>
        }
      />

      {pageError ? <Alert type="error" showIcon message={pageError} /> : null}

      {isLoading ? (
        <Card><div className="page-loader"><Spin size="large" /></div></Card>
      ) : isError || !data?.ok ? (
        <Alert type="error" showIcon message="Cheque data could not be loaded." />
      ) : (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card><Statistic title="Coming Cheques" value={data.summary.coming_count} suffix={`| AED ${data.summary.total_coming_amount.toLocaleString()}`} /></Card>
            </Col>
            <Col xs={24} md={8}>
              <Card><Statistic title="Remaining Cheques" value={data.summary.remaining_count} suffix={`| AED ${data.summary.total_remaining_amount.toLocaleString()}`} /></Card>
            </Col>
            <Col xs={24} md={8}>
              <Card><Statistic title="Paid Cheques" value={data.summary.paid_count} suffix={`| AED ${data.summary.total_paid_amount.toLocaleString()}`} /></Card>
            </Col>
          </Row>

          <Card>
            <Tabs
              items={[
                {
                  key: 'coming',
                  label: `Coming Cheques (${data.coming.length})`,
                  children: <Table columns={pendingColumns} dataSource={data.coming} rowKey="cheque_id" scroll={{ x: 1100 }} />,
                },
                {
                  key: 'remaining',
                  label: `Remaining Cheques (${data.remaining.length})`,
                  children: <Table columns={pendingColumns} dataSource={data.remaining} rowKey="cheque_id" scroll={{ x: 1100 }} />,
                },
                {
                  key: 'paid',
                  label: `Paid Cheques (${data.paid.length})`,
                  children: <Table columns={paidColumns} dataSource={data.paid} rowKey="cheque_id" scroll={{ x: 900 }} />,
                },
                {
                  key: 'history',
                  label: 'History',
                  children: <Table columns={eventColumns} dataSource={data.events} rowKey="event_id" scroll={{ x: 900 }} />,
                },
              ]}
            />
          </Card>
        </>
      )}

      <Modal
        footer={null}
        onCancel={() => setRescheduleTarget(null)}
        open={Boolean(rescheduleTarget)}
        title="Move Cheque Date"
      >
        <Form<RescheduleValues>
          layout="vertical"
          onFinish={(values) => rescheduleMutation.mutate(values)}
          initialValues={{
            new_due_date: rescheduleTarget?.due_date,
            reason: rescheduleTarget?.reschedule_note || '',
          }}
          key={rescheduleTarget?.cheque_id}
        >
          <Form.Item label="New Due Date" name="new_due_date" rules={[{ required: true }]}>
            <Input type="date" />
          </Form.Item>
          <Form.Item label="Reason / Landlord Note" name="reason">
            <Input.TextArea rows={4} placeholder="Example: landlord agreed to take this cheque next month." />
          </Form.Item>
          <Button htmlType="submit" loading={rescheduleMutation.isPending} type="primary">
            Save New Date
          </Button>
        </Form>
      </Modal>

      <Modal
        footer={null}
        onCancel={() => setPaidTarget(null)}
        open={Boolean(paidTarget)}
        title="Add Paid Cheque Entry"
      >
        <Form<PaidValues>
          layout="vertical"
          onFinish={(values) => paidMutation.mutate(values)}
          initialValues={{
            paid_amount: paidTarget?.amount,
            paid_date: new Date().toISOString().slice(0, 10),
            payment_reference: '',
            paid_note: '',
          }}
          key={paidTarget?.cheque_id}
        >
          <Form.Item label="Paid Amount" name="paid_amount" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Paid Date" name="paid_date" rules={[{ required: true }]}>
            <Input type="date" />
          </Form.Item>
          <Form.Item label="Reference" name="payment_reference">
            <Input placeholder="Cheque / transfer / voucher reference" />
          </Form.Item>
          <Form.Item label="Notes" name="paid_note">
            <Input.TextArea rows={4} placeholder="Optional paid-entry notes" />
          </Form.Item>
          <Button htmlType="submit" loading={paidMutation.isPending} type="primary">
            Mark as Paid
          </Button>
        </Form>
      </Modal>
    </div>
  )
}

