import {
  AppstoreOutlined,
  CameraOutlined,
  DeleteOutlined,
  EditOutlined,
  HomeOutlined,
} from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Alert, Button, Card, Form, Image, Input, InputNumber, Modal, Popconfirm, Select, Space, Spin, Table, Tag, Typography, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import { getApiErrorMessage } from '../../lib/api-errors'
import { http } from '../../lib/http'
import type { House, HousesResponse } from '../../lib/types'

async function fetchHouses() {
  const { data } = await http.get<HousesResponse>('/resources/houses')
  return data
}

function statusColor(status: string) {
  const normalized = status.toLowerCase()
  if (normalized === 'vacant') return 'green'
  if (normalized === 'occupied') return 'blue'
  return 'default'
}

export function HousesPage() {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [previewTitle, setPreviewTitle] = useState('')
  const [previewImages, setPreviewImages] = useState<string[]>([])
  const [editingHouse, setEditingHouse] = useState<House | null>(null)
  const { data, isLoading, isError } = useQuery({
    queryKey: ['houses'],
    queryFn: fetchHouses,
  })

  const updateMutation = useMutation({
    mutationFn: async (values: any) => {
      const { data } = await http.post('/manage/house.php', {
        action: 'update',
        houseID: editingHouse?.houseID,
        ...values,
      })
      return data
    },
    onSuccess: async (response: any) => {
      message.success(response?.message || 'House updated successfully.')
      setEditingHouse(null)
      form.resetFields()
      await queryClient.invalidateQueries({ queryKey: ['houses'] })
      await queryClient.invalidateQueries({ queryKey: ['form-options'] })
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error, 'House could not be updated.'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (houseID: number) => {
      const { data } = await http.post('/manage/house.php', { action: 'delete', houseID })
      return data
    },
    onSuccess: async (response: any) => {
      message.success(response?.message || 'House deleted successfully.')
      await queryClient.invalidateQueries({ queryKey: ['houses'] })
      await queryClient.invalidateQueries({ queryKey: ['form-options'] })
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error, 'House could not be deleted.'))
    },
  })

  const columns: ColumnsType<House> = [
    {
      title: 'House',
      dataIndex: 'house_name',
      key: 'house_name',
      render: (value: string, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{value}</Typography.Text>
          <Typography.Text type="secondary">
            House ID: {record.houseID}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'house_status',
      key: 'house_status',
      render: (value: string) => <Tag color={statusColor(value)}>{value}</Tag>,
    },
    {
      title: 'Rooms',
      dataIndex: 'number_of_rooms',
      key: 'number_of_rooms',
    },
    {
      title: 'Bedrooms',
      dataIndex: 'num_of_bedrooms',
      key: 'num_of_bedrooms',
    },
    {
      title: 'Rent',
      dataIndex: 'rent_amount',
      key: 'rent_amount',
      render: (value: number) => `AED ${value.toLocaleString()}`,
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Partitions',
      key: 'partitions',
      render: (_, record) => (
        <Space size="small">
          <Tag color="blue">{record.available_partition_count} vacant</Tag>
          <Tag>{record.partition_count} total</Tag>
        </Space>
      ),
    },
    {
      title: 'Photos',
      dataIndex: 'photo_count',
      key: 'photo_count',
      render: (value: number, record) =>
        value > 0 ? (
          <Button
            icon={<CameraOutlined />}
            onClick={() => {
              setPreviewTitle(`${record.house_name} photos`)
              setPreviewImages(record.photo_urls ?? [])
            }}
            size="small"
          >
            {value} photos
          </Button>
        ) : (
          <Tag icon={<CameraOutlined />} color="default">
            0
          </Tag>
        ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space wrap>
          <Button
            icon={<AppstoreOutlined />}
            onClick={() => navigate(`/partitions?house_id=${encodeURIComponent(String(record.houseID))}`)}
          >
            Open Partitions
          </Button>
          {data?.canManage ? (
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                setEditingHouse(record)
                form.setFieldsValue({
                  hname: record.house_name,
                  numOfRooms: record.number_of_rooms,
                  numOfbRooms: record.num_of_bedrooms,
                  rent: record.rent_amount,
                  location: record.location,
                  status: record.house_status,
                })
              }}
            >
              Edit
            </Button>
          ) : null}
          {data?.canManage ? (
            <Popconfirm
              okButtonProps={{ loading: deleteMutation.isPending }}
              okText="Delete"
              onConfirm={() => deleteMutation.mutate(record.houseID)}
              title="Delete this house?"
              description="This works only if the house has no active tenants and no partitions."
            >
              <Button danger icon={<DeleteOutlined />}>
                Delete
              </Button>
            </Popconfirm>
          ) : null}
        </Space>
      ),
    },
  ]

  return (
    <div className="page-stack">
      <PageHeader
        title="Houses"
        subtitle="Vacant houses first, then houses with available vacant partitions."
        breadcrumbs={[{ title: 'Dashboard' }, { title: 'Houses' }]}
        extra={
          <Button
            icon={<HomeOutlined />}
            onClick={() => navigate('/create/house')}
            type="primary"
          >
            Add House
          </Button>
        }
      />

      <Card>
        {isLoading ? (
          <div className="page-loader">
            <Spin size="large" />
          </div>
        ) : isError || !data?.ok ? (
          <Alert type="error" showIcon message="House data could not be loaded." />
        ) : (
          <Table
            columns={columns}
            dataSource={data.items}
            rowKey="houseID"
            scroll={{ x: 1000 }}
            pagination={{ pageSize: 10, showSizeChanger: false }}
          />
        )}
      </Card>

      <Modal
        confirmLoading={updateMutation.isPending}
        destroyOnHidden
        onCancel={() => {
          setEditingHouse(null)
          form.resetFields()
        }}
        onOk={() => form.submit()}
        open={!!editingHouse}
        title={editingHouse ? `Edit House: ${editingHouse.house_name}` : 'Edit House'}
      >
        <Form form={form} layout="vertical" onFinish={(values) => updateMutation.mutate(values)}>
          <Form.Item label="House Name" name="hname" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Number of Rooms" name="numOfRooms" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Bedrooms Per Unit" name="numOfbRooms" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Rent Amount" name="rent" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Location" name="location" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Status" name="status" rules={[{ required: true }]}>
            <Select options={[{ label: 'Vacant', value: 'Vacant' }, { label: 'Occupied', value: 'Occupied' }]} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        footer={null}
        onCancel={() => setPreviewImages([])}
        open={previewImages.length > 0}
        title={previewTitle}
        width={900}
        destroyOnHidden
      >
        <Image.PreviewGroup>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {previewImages.map((imageUrl) => (
              <Image
                alt={previewTitle}
                key={imageUrl}
                src={imageUrl}
                style={{ borderRadius: 12, width: '100%' }}
              />
            ))}
          </Space>
        </Image.PreviewGroup>
      </Modal>
    </div>
  )
}
