import {
  DeleteOutlined,
  EditOutlined,
  FileTextOutlined,
  MailOutlined,
  PhoneOutlined,
  SearchOutlined,
  SendOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Alert, Button, Card, Form, Input, Modal, Select, Space, Spin, Table, Tag, Tooltip, Typography, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import { getApiErrorMessage } from '../../lib/api-errors'
import { assetBaseURL, http } from '../../lib/http'
import type { TelegramActionResponse, TelegramRecentChat, Tenant, TenantsResponse } from '../../lib/types'
import { useFormOptions } from '../create/useFormOptions'

async function fetchTenants() {
  const { data } = await http.get<TenantsResponse>('/resources/tenants')
  return data
}

export function TenantsPage() {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: formOptions, isLoading: isOptionsLoading } = useFormOptions()
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null)
  const [deletingTenant, setDeletingTenant] = useState<Tenant | null>(null)
  const [chatPickerTenant, setChatPickerTenant] = useState<Tenant | null>(null)
  const [recentChats, setRecentChats] = useState<TelegramRecentChat[]>([])
  const { data, isLoading, isError } = useQuery({
    queryKey: ['tenants'],
    queryFn: fetchTenants,
  })

  const selectedHouseId = Form.useWatch('house_id', form)
  const partitionOptions = useMemo(() => {
    const houseId = Number(selectedHouseId || 0)
    return (formOptions?.partitions ?? []).filter((partition) => partition.house_id === houseId)
  }, [formOptions?.partitions, selectedHouseId])

  const updateTenantMutation = useMutation({
    mutationFn: async (values: any) => {
      const { data } = await http.post('/manage/tenant.php', {
        action: 'update',
        tenantID: editingTenant?.tenantID,
        ...values,
      })
      return data
    },
    onSuccess: async (response: any) => {
      message.success(response?.message || 'Tenant updated successfully.')
      setEditingTenant(null)
      form.resetFields()
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tenants'] }),
        queryClient.invalidateQueries({ queryKey: ['houses'] }),
        queryClient.invalidateQueries({ queryKey: ['partitions'] }),
        queryClient.invalidateQueries({ queryKey: ['form-options'] }),
      ])
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error, 'Tenant could not be updated.'))
    },
  })

  const deleteTenantMutation = useMutation({
    mutationFn: async (values: { tenantID: number; exit_date: string }) => {
      const { data } = await http.post('/manage/tenant.php', {
        action: 'delete',
        tenantID: values.tenantID,
        exit_date: values.exit_date,
      })
      return data
    },
    onSuccess: async (response: any) => {
      message.success(response?.message || 'Tenant moved out successfully.')
      setDeletingTenant(null)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tenants'] }),
        queryClient.invalidateQueries({ queryKey: ['houses'] }),
        queryClient.invalidateQueries({ queryKey: ['partitions'] }),
        queryClient.invalidateQueries({ queryKey: ['form-options'] }),
      ])
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error, 'Tenant could not be moved out.'))
    },
  })

  const fetchChatIdMutation = useMutation({
    mutationFn: async (tenantId: number) => {
      const { data } = await http.post<TelegramActionResponse>('/telegram/tenant-actions', {
        tenant_id: tenantId,
        telegram_action: 'fetch_chat_id',
      })
      return data
    },
    onSuccess: async (response) => {
      message.success(response.message || 'Telegram chat ID fetched successfully.')
      await queryClient.invalidateQueries({ queryKey: ['tenants'] })
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Telegram chat ID could not be fetched.')
    },
  })

  const sendTestMutation = useMutation({
    mutationFn: async (tenantId: number) => {
      const { data } = await http.post<TelegramActionResponse>('/telegram/tenant-actions', {
        tenant_id: tenantId,
        telegram_action: 'send_test',
      })
      return data
    },
    onSuccess: (response) => {
      message.success(response.message || 'Telegram test message sent.')
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Telegram test message failed.')
    },
  })

  const recentChatsMutation = useMutation({
    mutationFn: async (tenantId: number) => {
      const { data } = await http.post<TelegramActionResponse>('/telegram/tenant-actions', {
        tenant_id: tenantId,
        telegram_action: 'list_recent_chats',
      })
      return data
    },
    onSuccess: (response) => {
      setRecentChats(response.items ?? [])
      if ((response.items ?? []).length === 0) {
        message.info(response.message || 'No recent Telegram chats were found.')
      }
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Recent Telegram chats could not be loaded.')
    },
  })

  const assignChatMutation = useMutation({
    mutationFn: async (values: { tenant_id: number; chat_id: string; telegram_username?: string }) => {
      const { data } = await http.post<TelegramActionResponse>('/telegram/tenant-actions', {
        tenant_id: values.tenant_id,
        telegram_action: 'assign_chat_id',
        chat_id: values.chat_id,
        telegram_username: values.telegram_username,
      })
      return data
    },
    onSuccess: async (response) => {
      message.success(response.message || 'Telegram chat assigned successfully.')
      setChatPickerTenant(null)
      setRecentChats([])
      await queryClient.invalidateQueries({ queryKey: ['tenants'] })
      await queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Telegram chat could not be assigned.')
    },
  })

  const columns: ColumnsType<Tenant> = [
    {
      title: 'Tenant',
      key: 'tenant',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{record.tenant_name}</Typography.Text>
          <Typography.Text type="secondary">
            ID: {record.tenantID}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: 'Stay',
      key: 'stay',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text>{record.house_name || '-'}</Typography.Text>
          <Typography.Text type="secondary">
            Partition: {record.partition_number || '-'}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: 'Rent',
      dataIndex: 'rent_amount',
      key: 'rent_amount',
      render: (value: number) => <Tag color="gold">AED {value.toLocaleString()}</Tag>,
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text>
            <MailOutlined /> {record.email}
          </Typography.Text>
          <Typography.Text>
            <PhoneOutlined /> {record.phone_number}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: 'Telegram',
      key: 'telegram',
      render: (_, record) => (
        <Space direction="vertical" size={4}>
          <Typography.Text>{record.telegram_username ? `@${record.telegram_username}` : 'No username'}</Typography.Text>
          <Typography.Text type="secondary">
            {record.telegram_chat_id || 'No chat ID'}
          </Typography.Text>
          <Space wrap>
            <Tooltip title={record.telegram_username ? 'Fetch the chat ID by matching this tenant username in recent bot messages.' : 'Add a Telegram username or use Find Recent Chat to assign a chat directly.'}>
              <Button
                icon={<SendOutlined />}
                loading={fetchChatIdMutation.isPending && fetchChatIdMutation.variables === record.tenantID}
                onClick={() => fetchChatIdMutation.mutate(record.tenantID)}
                size="small"
                disabled={!record.telegram_username}
              >
                Fetch Chat ID
              </Button>
            </Tooltip>
            <Button
              icon={<SearchOutlined />}
              loading={recentChatsMutation.isPending && recentChatsMutation.variables === record.tenantID}
              onClick={() => {
                setChatPickerTenant(record)
                setRecentChats([])
                recentChatsMutation.mutate(record.tenantID)
              }}
              size="small"
            >
              Find Recent Chat
            </Button>
            <Button
              icon={<SendOutlined />}
              loading={sendTestMutation.isPending && sendTestMutation.variables === record.tenantID}
              onClick={() => sendTestMutation.mutate(record.tenantID)}
              size="small"
              type="primary"
              ghost
              disabled={!record.telegram_chat_id}
            >
              Send Test
            </Button>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Country',
      dataIndex: 'tenant_country',
      key: 'tenant_country',
    },
    {
      title: 'Profession',
      dataIndex: 'profession',
      key: 'profession',
    },
    {
      title: 'Dates',
      key: 'dates',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text>Start: {record.start_date || '-'}</Typography.Text>
          <Typography.Text type="secondary">
            End: {record.end_date || '-'}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: 'Documents',
      key: 'agreement_file',
      render: (_, record) =>
        record.agreement_file ? (
          <Button
            href={`${assetBaseURL}/uploads/agreements/${record.agreement_file}`}
            icon={<FileTextOutlined />}
            target="_blank"
          >
            Agreement
          </Button>
        ) : (
          <Tag>No file</Tag>
        ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space wrap>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              const [phoneCode = formOptions?.defaultPhoneCode ?? '', ...rest] = (record.phone_number || '').split(' ')
              setEditingTenant(record)
              form.setFieldsValue({
                house_id: record.houseID,
                partition_id: record.partition_id,
                tname: record.tenant_name,
                temail: record.email,
                idnum: record.ID_number,
                phone_code: phoneCode,
                phone_local: rest.join(' ').trim(),
                prof: record.profession,
                telegram_username: record.telegram_username,
                telegram_chat_id: record.telegram_chat_id,
                tenant_address: record.tenant_address,
                tenant_home_country_address: record.tenant_home_country_address,
                tenant_country: record.tenant_country,
                start_date: record.start_date,
                end_date: record.end_date,
              })
            }}
          >
            Edit
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => setDeletingTenant(record)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div className="page-stack">
      <PageHeader
        title="Tenants"
        subtitle="Active tenants from the local Node backend, now rendered with Ant Design."
        breadcrumbs={[{ title: 'Dashboard' }, { title: 'Tenants' }]}
        extra={
          <Button
            icon={<TeamOutlined />}
            onClick={() => navigate('/create/tenant')}
            type="primary"
          >
            Add Tenant
          </Button>
        }
      />

      <Card>
        {isLoading || isOptionsLoading ? (
          <div className="page-loader">
            <Spin size="large" />
          </div>
        ) : isError || !data?.ok ? (
          <Alert type="error" showIcon message="Tenant data could not be loaded." />
        ) : (
          <Table
            columns={columns}
            dataSource={data.items}
            rowKey="tenantID"
            scroll={{ x: 1200 }}
            pagination={{ pageSize: 10, showSizeChanger: false }}
          />
        )}
      </Card>

      <Modal
        confirmLoading={updateTenantMutation.isPending}
        destroyOnHidden
        onCancel={() => {
          setEditingTenant(null)
          form.resetFields()
        }}
        onOk={() => form.submit()}
        open={!!editingTenant}
        title={editingTenant ? `Edit Tenant: ${editingTenant.tenant_name}` : 'Edit Tenant'}
        width={760}
      >
        <Form form={form} layout="vertical" onFinish={(values) => updateTenantMutation.mutate(values)}>
          <Form.Item label="House" name="house_id" rules={[{ required: true }]}>
            <Select options={(formOptions?.houses ?? []).map((house) => ({ label: house.house_name, value: house.houseID }))} />
          </Form.Item>
          <Form.Item label="Partition" name="partition_id" rules={[{ required: true }]}>
            <Select options={partitionOptions.map((partition) => ({ label: `${partition.house_name} - ${partition.partition_number} (${partition.partition_status})`, value: partition.partition_id }))} />
          </Form.Item>
          <Form.Item label="Tenant Name" name="tname" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Email" name="temail" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="ID Number" name="idnum">
            <Input />
          </Form.Item>
          <Space style={{ display: 'flex' }} align="start">
            <Form.Item label="Phone Code" name="phone_code" rules={[{ required: true }]}>
              <Select style={{ width: 220 }} options={(formOptions?.countries ?? []).map((country) => ({ label: `${country.code} ${country.name}`, value: country.code }))} />
            </Form.Item>
            <Form.Item label="Phone Number" name="phone_local">
              <Input />
            </Form.Item>
          </Space>
          <Form.Item label="Profession" name="prof">
            <Input />
          </Form.Item>
          <Form.Item label="Telegram Username" name="telegram_username">
            <Input />
          </Form.Item>
          <Form.Item label="Telegram Chat ID" name="telegram_chat_id">
            <Input />
          </Form.Item>
          <Form.Item label="Address" name="tenant_address">
            <Input />
          </Form.Item>
          <Form.Item label="Home Country Address" name="tenant_home_country_address">
            <Input />
          </Form.Item>
          <Form.Item label="Country" name="tenant_country" rules={[{ required: true }]}>
            <Select options={(formOptions?.countries ?? []).map((country) => ({ label: country.name, value: country.name }))} />
          </Form.Item>
          <Form.Item label="Start Date" name="start_date" rules={[{ required: true }]}>
            <Input type="date" />
          </Form.Item>
          <Form.Item label="Expected End Date" name="end_date">
            <Input type="date" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        destroyOnHidden
        footer={null}
        onCancel={() => {
          setChatPickerTenant(null)
          setRecentChats([])
        }}
        open={!!chatPickerTenant}
        title={chatPickerTenant ? `Assign Telegram Chat: ${chatPickerTenant.tenant_name}` : 'Assign Telegram Chat'}
        width={760}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Typography.Text type="secondary">
            Pick the correct recent bot chat for this tenant, or save the username/chat ID from the Edit dialog manually.
          </Typography.Text>
          {recentChatsMutation.isPending ? (
            <div className="page-loader">
              <Spin size="large" />
            </div>
          ) : recentChats.length === 0 ? (
            <Alert type="info" showIcon message="No recent chats found. Ask the tenant to message the bot, then reopen this picker." />
          ) : (
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              {recentChats.map((chat) => (
                <Card key={chat.chat_id} size="small">
                  <Space direction="vertical" size={4} style={{ width: '100%' }}>
                    <Typography.Text strong>
                      {chat.display_name || 'Unknown Telegram user'}
                      {chat.username ? ` (@${chat.username})` : ''}
                    </Typography.Text>
                    <Typography.Text type="secondary">Chat ID: {chat.chat_id}</Typography.Text>
                    <Typography.Text type="secondary">
                      {chat.message_preview || 'No text preview available.'}
                    </Typography.Text>
                    <Space>
                      <Button
                        loading={assignChatMutation.isPending}
                        onClick={() =>
                          chatPickerTenant &&
                          assignChatMutation.mutate({
                            tenant_id: chatPickerTenant.tenantID,
                            chat_id: chat.chat_id,
                            telegram_username: chat.username,
                          })
                        }
                        type="primary"
                      >
                        Use This Chat
                      </Button>
                    </Space>
                  </Space>
                </Card>
              ))}
            </Space>
          )}
        </Space>
      </Modal>

      <Modal
        confirmLoading={deleteTenantMutation.isPending}
        destroyOnHidden
        onCancel={() => setDeletingTenant(null)}
        onOk={() => {
          if (deletingTenant) {
            deleteTenantMutation.mutate({
              tenantID: deletingTenant.tenantID,
              exit_date: new Date().toISOString().slice(0, 10),
            })
          }
        }}
        open={!!deletingTenant}
        okButtonProps={{ danger: true }}
        okText="Move Out"
        title={deletingTenant ? `Delete / Move Out: ${deletingTenant.tenant_name}` : 'Delete Tenant'}
      >
        <Typography.Paragraph style={{ marginBottom: 0 }}>
          This will soft-delete the tenant and move them to the deleted/moved-out list using today&apos;s exit date.
        </Typography.Paragraph>
      </Modal>
    </div>
  )
}
