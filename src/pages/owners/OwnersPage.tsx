import { EditOutlined, PlusOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Alert, Button, Card, Form, Input, Modal, Select, Spin, Table, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useMemo, useState } from 'react'
import { PageHeader } from '../../components/PageHeader'
import { getApiErrorMessage } from '../../lib/api-errors'
import { http } from '../../lib/http'
import type { OwnerRecord, OwnersResponse } from '../../lib/types'

type OwnerFormValues = {
  owner_name: string
  contact_email?: string
  contact_phone?: string
  notes?: string
  status: string
}

async function fetchOwners() {
  const { data } = await http.get<OwnersResponse>('/resources/owners')
  return data
}

export function OwnersPage() {
  const queryClient = useQueryClient()
  const [form] = Form.useForm<OwnerFormValues>()
  const [editingOwner, setEditingOwner] = useState<OwnerRecord | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const { data, isLoading, isError } = useQuery({ queryKey: ['owners'], queryFn: fetchOwners })

  const ownerMutation = useMutation({
    mutationFn: async (values: OwnerFormValues) => {
      if (editingOwner) {
        return http.post('/manage/owner', {
          action: 'update',
          owner_id: editingOwner.owner_id,
          ...values,
        })
      }

      return http.post('/create/owner', values)
    },
    onSuccess: async () => {
      setErrorMessage('')
      setIsModalOpen(false)
      setEditingOwner(null)
      form.resetFields()
      await queryClient.invalidateQueries({ queryKey: ['owners'] })
    },
    onError: (error: unknown) => {
      setErrorMessage(getApiErrorMessage(error, 'Owner changes could not be saved.'))
    },
  })

  const openCreateModal = () => {
    setEditingOwner(null)
    setErrorMessage('')
    form.setFieldsValue({
      owner_name: '',
      contact_email: '',
      contact_phone: '',
      notes: '',
      status: 'Active',
    })
    setIsModalOpen(true)
  }

  const openEditModal = (owner: OwnerRecord) => {
    setEditingOwner(owner)
    setErrorMessage('')
    form.setFieldsValue({
      owner_name: owner.owner_name,
      contact_email: owner.contact_email,
      contact_phone: owner.contact_phone,
      notes: owner.notes,
      status: owner.status || 'Active',
    })
    setIsModalOpen(true)
  }

  const columns = useMemo<ColumnsType<OwnerRecord>>(
    () => [
      {
        title: 'Owner',
        key: 'owner',
        render: (_, record) => (
          <div>
            <div>{record.owner_name}</div>
            <div className="table-subtext">{record.contact_email || 'No email'}</div>
          </div>
        ),
      },
      {
        title: 'Phone',
        dataIndex: 'contact_phone',
        key: 'contact_phone',
        render: (value: string) => value || '-',
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (value: string) => <Tag color={value === 'Active' ? 'green' : 'default'}>{value}</Tag>,
      },
      {
        title: 'Portfolio',
        key: 'portfolio',
        render: (_, record) => `${record.house_count} houses / ${record.tenant_count} tenants`,
      },
      {
        title: 'Admins',
        dataIndex: 'admin_count',
        key: 'admin_count',
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => (
          <Button icon={<EditOutlined />} onClick={() => openEditModal(record)}>
            Edit
          </Button>
        ),
      },
    ],
    [],
  )

  return (
    <div className="page-stack">
      <PageHeader
        title="Owners"
        subtitle="Manage owner accounts and keep each property portfolio private."
        breadcrumbs={[{ title: 'Dashboard' }, { title: 'Owners' }]}
        extra={(
          <Button icon={<PlusOutlined />} onClick={openCreateModal} type="primary">
            Add Owner
          </Button>
        )}
      />
      <Card>
        {isLoading ? (
          <div className="page-loader">
            <Spin size="large" />
          </div>
        ) : isError || !data?.ok ? (
          <Alert message="Owners could not be loaded." showIcon type="error" />
        ) : (
          <Table columns={columns} dataSource={data.items} rowKey="owner_id" />
        )}
      </Card>

      <Modal
        destroyOnClose
        onCancel={() => {
          setIsModalOpen(false)
          setEditingOwner(null)
          setErrorMessage('')
          form.resetFields()
        }}
        onOk={() => form.submit()}
        okButtonProps={{ loading: ownerMutation.isPending }}
        okText={editingOwner ? 'Save Owner' : 'Create Owner'}
        open={isModalOpen}
        title={editingOwner ? `Edit Owner: ${editingOwner.owner_name}` : 'Create Owner'}
      >
        {errorMessage ? (
          <Alert message={errorMessage} showIcon style={{ marginBottom: 16 }} type="error" />
        ) : null}
        <Form<OwnerFormValues>
          form={form}
          layout="vertical"
          onFinish={(values) => ownerMutation.mutate(values)}
        >
          <Form.Item label="Owner Name" name="owner_name" rules={[{ required: true, message: 'Owner name is required.' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Contact Email" name="contact_email" rules={[{ type: 'email', message: 'Enter a valid email.' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Contact Phone" name="contact_phone">
            <Input />
          </Form.Item>
          <Form.Item label="Status" name="status" rules={[{ required: true }]}>
            <Select
              options={[
                { label: 'Active', value: 'Active' },
                { label: 'Inactive', value: 'Inactive' },
              ]}
            />
          </Form.Item>
          <Form.Item label="Notes" name="notes">
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
