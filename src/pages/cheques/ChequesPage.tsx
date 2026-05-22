import { CloseCircleOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Alert, Button, Card, Col, Form, Input, InputNumber, Modal, Row, Select, Space, Spin, Statistic, Table, Tabs, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import { getApiErrorMessage } from '../../lib/api-errors'
import { http } from '../../lib/http'
import type { ChequesResponse, LandlordCheque, LandlordChequeEvent } from '../../lib/types'

async function fetchCheques() {
  const { data } = await http.get<ChequesResponse>('/resources/cheques')
  return data
}

type RescheduleValues = {
  new_due_date: string
  new_amount?: number
  reason?: string
}

type PaidValues = {
  paid_amount: number
  paid_date: string
  paid_for_month: string
  payment_mode: 'Cheque' | 'Cash' | 'Bank Transfer' | 'Other'
  cheque_number?: string
  payment_reference?: string
  paid_note?: string
}

type BounceValues = {
  cheque_number?: string
  bounce_reason?: string
}

type ChequeHouseGroup = {
  key: string
  isGroup: true
  house_name: string
  total_amount: number
  remaining_amount: number
  paid_amount: number
  item_count: number
  children: LandlordCheque[]
}

type ChequeTableRow = LandlordCheque | ChequeHouseGroup

function isHouseGroupRow(record: ChequeTableRow): record is ChequeHouseGroup {
  return 'isGroup' in record && record.isGroup === true
}

function formatAed(value: unknown) {
  const amount = Number(value ?? 0)
  return `AED ${amount.toLocaleString()}`
}

function formatChequeMonth(value: unknown) {
  const normalized = String(value ?? '').trim()
  if (!/^\d{4}-\d{2}$/.test(normalized)) {
    return '-'
  }
  return dayjs(`${normalized}-01`).format('MMM YYYY')
}

function chequeStatusTag(status: string) {
  const normalized = status.toLowerCase()
  if (normalized === 'paid') return <Tag color="success">Paid</Tag>
  if (normalized === 'partially paid') return <Tag color="warning">Partially Paid</Tag>
  if (normalized === 'bounced') return <Tag color="error">Bounced</Tag>
  if (normalized === 'rescheduled') return <Tag color="processing">Rescheduled</Tag>
  return <Tag color="default">Unpaid</Tag>
}

function buildChequeHouseGroups(items: LandlordCheque[]) {
  const grouped = new Map<string, ChequeHouseGroup>()

  items.forEach((item) => {
    const key = `house-${item.house_id}`
    const current = grouped.get(key)

    if (current) {
      current.total_amount += item.amount
      current.remaining_amount += item.remaining_amount
      current.paid_amount += item.paid_amount
      current.item_count += 1
      current.children.push(item)
      return
    }

    grouped.set(key, {
      key,
      isGroup: true,
      house_name: item.house_name,
      total_amount: item.amount,
      remaining_amount: item.remaining_amount,
      paid_amount: item.paid_amount,
      item_count: 1,
      children: [item],
    })
  })

  return Array.from(grouped.values()).sort((a, b) => a.house_name.localeCompare(b.house_name))
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
  const [bounceTarget, setBounceTarget] = useState<LandlordCheque | null>(null)
  const [pageError, setPageError] = useState('')
  const isPaidEntryModal = paidTarget?.status?.toLowerCase() === 'paid'

  const refreshCheques = async () => {
    await queryClient.invalidateQueries({ queryKey: ['cheques'] })
  }

  const rescheduleMutation = useMutation({
    mutationFn: (values: RescheduleValues) => http.post('/resources/cheques', {
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
    mutationFn: (values: PaidValues) => http.post('/resources/cheques', {
      action: paidTarget?.status?.toLowerCase() === 'paid' ? 'update_paid' : 'mark_paid',
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

  const bounceMutation = useMutation({
    mutationFn: (values: BounceValues) => http.post('/resources/cheques', {
      action: 'mark_bounced',
      cheque_id: bounceTarget?.cheque_id,
      ...values,
    }),
    onSuccess: async () => {
      setPageError('')
      setBounceTarget(null)
      await refreshCheques()
    },
    onError: (err: unknown) => {
      setPageError(getApiErrorMessage(err, 'Cheque bounce could not be recorded.'))
    },
  })

  const groupedColumns: ColumnsType<ChequeTableRow> = useMemo(() => [
    {
      title: 'House / Party',
      key: 'house_payee',
      render: (_, record) => {
        if (isHouseGroupRow(record)) {
          return (
            <Space direction="vertical" size={0}>
              <Typography.Text strong>{record.house_name}</Typography.Text>
              <Typography.Text type="secondary">{record.item_count} cheque entries</Typography.Text>
            </Space>
          )
        }

        return (
          <Space direction="vertical" size={0}>
            <Typography.Text strong>{record.house_name}</Typography.Text>
            <Typography.Text type="secondary">{record.category} | {record.payee_name}</Typography.Text>
          </Space>
        )
      },
    },
    {
      title: 'Schedule',
      key: 'schedule',
      render: (_, record) => {
        if (isHouseGroupRow(record)) {
          return (
            <Space direction="vertical" size={0}>
              <Typography.Text>All schedules</Typography.Text>
              <Typography.Text type="secondary">Expand to view monthly list</Typography.Text>
            </Space>
          )
        }

        return (
          <Space direction="vertical" size={0}>
            <Typography.Text>{record.frequency}</Typography.Text>
            <Typography.Text type="secondary">
              Cheque {record.installment_number} of {record.total_installments}
            </Typography.Text>
          </Space>
        )
      },
    },
    {
      title: 'Cheque Details',
      key: 'cheque_details',
      render: (_, record) => {
        if (isHouseGroupRow(record)) {
          return (
            <Space direction="vertical" size={0}>
              <Typography.Text>-</Typography.Text>
              <Typography.Text type="secondary">Grouped by house</Typography.Text>
            </Space>
          )
        }

        return (
          <Space direction="vertical" size={0}>
            <Typography.Text>{record.cheque_number || '-'}</Typography.Text>
            <Typography.Text type="secondary">{record.payment_mode}</Typography.Text>
          </Space>
        )
      },
    },
    {
      title: 'Amount',
      key: 'amount',
      render: (_, record) => {
        if (isHouseGroupRow(record)) {
          return (
            <Space direction="vertical" size={0}>
              <Typography.Text strong>AED {record.total_amount.toLocaleString()}</Typography.Text>
              <Typography.Text strong>{formatAed(record.total_amount)}</Typography.Text>
              <Typography.Text type="secondary">Remaining: {formatAed(record.remaining_amount)}</Typography.Text>
            </Space>
          )
        }

        return (
          <Space direction="vertical" size={0}>
            <Typography.Text strong>{formatAed(record.amount)}</Typography.Text>
            <Typography.Text type="secondary">Remaining: {formatAed(record.remaining_amount)}</Typography.Text>
          </Space>
        )
      },
    },
    {
      title: 'Due Date',
      key: 'due_date',
      render: (_, record) => {
        if (isHouseGroupRow(record)) {
          const sortedDates = [...record.children].map((item) => item.due_date).filter(Boolean).sort()
          const firstDate = sortedDates[0]
          const lastDate = sortedDates[sortedDates.length - 1]
          return (
            <Space direction="vertical" size={0}>
              <Typography.Text>{firstDate ? dayjs(firstDate).format('DD MMM YYYY') : '-'}</Typography.Text>
              <Typography.Text type="secondary">
                {lastDate && lastDate !== firstDate ? `to ${dayjs(lastDate).format('DD MMM YYYY')}` : 'Expand for full dates'}
              </Typography.Text>
            </Space>
          )
        }

        return (
          <Space direction="vertical" size={0}>
            <Typography.Text>{record.due_date ? dayjs(record.due_date).format('DD MMM YYYY') : '-'}</Typography.Text>
            {record.reschedule_count > 0 ? (
              <Typography.Text type="secondary">
                Original: {record.original_due_date ? dayjs(record.original_due_date).format('DD MMM YYYY') : '-'}
              </Typography.Text>
            ) : null}
          </Space>
        )
      },
    },
    {
      title: 'Paid For Month',
      key: 'paid_for_month',
      render: (_, record) => {
        if (isHouseGroupRow(record)) {
          const paidMonths = Array.from(
            new Set(
              record.children
                .map((item) => item.paid_for_month)
                .filter((value) => /^\d{4}-\d{2}$/.test(String(value ?? ''))),
            ),
          ).sort()

          if (paidMonths.length === 0) {
            return <Typography.Text type="secondary">Expand to view paid months</Typography.Text>
          }

          if (paidMonths.length === 1) {
            return <Typography.Text>{formatChequeMonth(paidMonths[0])}</Typography.Text>
          }

          return (
            <Space direction="vertical" size={0}>
              <Typography.Text>{formatChequeMonth(paidMonths[0])}</Typography.Text>
              <Typography.Text type="secondary">+{paidMonths.length - 1} more months</Typography.Text>
            </Space>
          )
        }

        return (
          <Typography.Text>
            {record.status.toLowerCase() === 'paid' ? formatChequeMonth(record.paid_for_month) : '-'}
          </Typography.Text>
        )
      },
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        if (isHouseGroupRow(record)) {
          const hasBounced = record.children.some((item) => item.status.toLowerCase() === 'bounced')
          const hasPartial = record.children.some((item) => item.status.toLowerCase() === 'partially paid')
          const hasRescheduled = record.children.some((item) => item.status.toLowerCase() === 'rescheduled')
          const allPaid = record.children.every((item) => item.status.toLowerCase() === 'paid')

          if (allPaid) return <Tag color="success">All Paid</Tag>
          if (hasBounced) return <Tag color="error">Has Bounced</Tag>
          if (hasPartial) return <Tag color="warning">Has Partial</Tag>
          if (hasRescheduled) return <Tag color="processing">Has Rescheduled</Tag>
          return <Tag color="default">Open</Tag>
        }

        return chequeStatusTag(record.status)
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        if (isHouseGroupRow(record)) {
          return <Typography.Text type="secondary">Expand this house to manage entries</Typography.Text>
        }

        const isPaid = record.status.toLowerCase() === 'paid'

        return (
          <Space wrap>
            {isPaid ? (
              <Button icon={<EditOutlined />} onClick={() => setPaidTarget(record)} size="small">
                Edit
              </Button>
            ) : (
              <>
                <Button icon={<EditOutlined />} onClick={() => setRescheduleTarget(record)} size="small">
                  Reschedule
                </Button>
                <Button onClick={() => setPaidTarget(record)} size="small" type="primary">
                  Record Payment
                </Button>
                <Button danger icon={<CloseCircleOutlined />} onClick={() => setBounceTarget(record)} size="small">
                  Mark Bounced
                </Button>
              </>
            )}
          </Space>
        )
      },
    },
  ], [])

  const groupedComing = useMemo(() => buildChequeHouseGroups(data?.coming ?? []), [data?.coming])
  const groupedRemaining = useMemo(() => buildChequeHouseGroups(data?.remaining ?? []), [data?.remaining])
  const groupedPaid = useMemo(() => buildChequeHouseGroups(data?.paid ?? []), [data?.paid])

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
        subtitle="Track outgoing house-related cheque and payable entries, including partial, cash, bounced, and rescheduled cases."
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
              <Card><Statistic title="Coming Cheques" value={data.summary.coming_count} suffix={`| ${formatAed(data.summary.total_coming_amount)}`} /></Card>
            </Col>
            <Col xs={24} md={8}>
              <Card><Statistic title="Remaining Cheques" value={data.summary.remaining_count} suffix={`| ${formatAed(data.summary.total_remaining_amount)}`} /></Card>
            </Col>
            <Col xs={24} md={8}>
              <Card><Statistic title="Paid Cheques" value={data.summary.paid_count} suffix={`| ${formatAed(data.summary.total_paid_amount)}`} /></Card>
            </Col>
          </Row>

          <Card>
            <Tabs
              items={[
                {
                  key: 'coming',
                  label: `Coming Cheques (${data.coming.length})`,
                  children: (
                    <Table
                      columns={groupedColumns}
                      dataSource={groupedComing}
                      rowKey={(record) => isHouseGroupRow(record) ? record.key : `cheque-${record.cheque_id}`}
                      scroll={{ x: 1300 }}
                      pagination={false}
                    />
                  ),
                },
                {
                  key: 'remaining',
                  label: `Remaining Cheques (${data.remaining.length})`,
                  children: (
                    <Table
                      columns={groupedColumns}
                      dataSource={groupedRemaining}
                      rowKey={(record) => isHouseGroupRow(record) ? record.key : `cheque-${record.cheque_id}`}
                      scroll={{ x: 1300 }}
                      pagination={false}
                    />
                  ),
                },
                {
                  key: 'paid',
                  label: `Paid Cheques (${data.paid.length})`,
                  children: (
                    <Table
                      columns={groupedColumns}
                      dataSource={groupedPaid}
                      rowKey={(record) => isHouseGroupRow(record) ? record.key : `cheque-${record.cheque_id}`}
                      scroll={{ x: 1300 }}
                      pagination={false}
                    />
                  ),
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
            new_amount: rescheduleTarget?.amount,
            reason: rescheduleTarget?.reschedule_note || '',
          }}
          key={rescheduleTarget?.cheque_id}
        >
          <Form.Item label="New Due Date" name="new_due_date" rules={[{ required: true }]}>
            <Input type="date" />
          </Form.Item>
          <Form.Item label="Updated Amount" name="new_amount" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
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
        title={isPaidEntryModal ? 'Edit Paid Cheque Entry' : 'Add Paid Cheque Entry'}
      >
        <Form<PaidValues>
          layout="vertical"
          onFinish={(values) => paidMutation.mutate(values)}
          initialValues={{
            paid_amount: paidTarget?.remaining_amount || paidTarget?.amount,
            paid_date: paidTarget?.paid_date || new Date().toISOString().slice(0, 10),
            paid_for_month: paidTarget?.paid_for_month || paidTarget?.due_date?.slice(0, 7) || '',
            payment_mode: paidTarget?.payment_mode || 'Cheque',
            cheque_number: paidTarget?.cheque_number || '',
            payment_reference: paidTarget?.payment_reference || '',
            paid_note: paidTarget?.paid_note || '',
          }}
          key={paidTarget?.cheque_id}
        >
          <Form.Item label="Paid Amount" name="paid_amount" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Paid Date" name="paid_date" rules={[{ required: true }]}>
            <Input type="date" />
          </Form.Item>
          <Form.Item label="Paid Rent For Month" name="paid_for_month" rules={[{ required: true }]}>
            <Input type="month" />
          </Form.Item>
          <Form.Item label="Payment Mode" name="payment_mode" rules={[{ required: true }]}>
            <Select options={['Cheque', 'Cash', 'Bank Transfer', 'Other'].map((value) => ({ label: value, value }))} />
          </Form.Item>
          <Form.Item label="Cheque Number" name="cheque_number">
            <Input placeholder="Optional cheque number" />
          </Form.Item>
          <Form.Item label="Reference" name="payment_reference">
            <Input placeholder="Cheque / transfer / voucher reference" />
          </Form.Item>
          <Form.Item label="Notes" name="paid_note">
            <Input.TextArea rows={4} placeholder="Optional paid-entry notes" />
          </Form.Item>
          <Button htmlType="submit" loading={paidMutation.isPending} type="primary">
            {isPaidEntryModal ? 'Save Changes' : 'Save Payment'}
          </Button>
        </Form>
      </Modal>

      <Modal
        footer={null}
        onCancel={() => setBounceTarget(null)}
        open={Boolean(bounceTarget)}
        title="Mark Cheque as Bounced"
      >
        <Form<BounceValues>
          layout="vertical"
          onFinish={(values) => bounceMutation.mutate(values)}
          initialValues={{
            cheque_number: bounceTarget?.cheque_number || '',
            bounce_reason: bounceTarget?.bounce_reason || '',
          }}
          key={bounceTarget?.cheque_id}
        >
          <Form.Item label="Cheque Number" name="cheque_number">
            <Input placeholder="Cheque number if available" />
          </Form.Item>
          <Form.Item label="Bounce Reason" name="bounce_reason">
            <Input.TextArea rows={4} placeholder="Optional note about why the cheque bounced." />
          </Form.Item>
          <Button danger htmlType="submit" loading={bounceMutation.isPending} type="primary">
            Save Bounce Status
          </Button>
        </Form>
      </Modal>
    </div>
  )
}

