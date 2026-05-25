import {
  AppstoreOutlined,
  CameraOutlined,
  ColumnHeightOutlined,
  DeleteOutlined,
  EditOutlined,
  HomeOutlined,
} from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Alert, Button, Card, Checkbox, Divider, Form, Image, Input, InputNumber, Modal, Popconfirm, Popover, Select, Space, Spin, Table, Tag, Typography, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import { getApiErrorMessage } from '../../lib/api-errors'
import { http } from '../../lib/http'
import type { House, HousesResponse, TablePreferenceResponse } from '../../lib/types'

async function fetchHouses() {
  const { data } = await http.get<HousesResponse>('/resources/houses')
  return data
}

const housesScreenKey = 'houses'
const houseColumnOptions = [
  { label: 'House', value: 'house_name' },
  { label: 'Status', value: 'house_status' },
  { label: 'Rooms', value: 'number_of_rooms' },
  { label: 'Bedrooms', value: 'num_of_bedrooms' },
  { label: 'Rent', value: 'rent_amount' },
  { label: 'Location', value: 'location' },
  { label: 'Partitions', value: 'partitions' },
  { label: 'Photos', value: 'photo_count' },
  { label: 'Actions', value: 'actions' },
] as const
const defaultVisibleHouseColumns = houseColumnOptions
  .map((option) => option.value)
  .filter((value) => value !== 'house_status')

async function fetchHouseTablePreference() {
  const { data } = await http.get<TablePreferenceResponse>('/resources/table-preferences', {
    params: { screen: housesScreenKey },
  })
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
  const [visibleColumnKeys, setVisibleColumnKeys] = useState<string[]>(defaultVisibleHouseColumns)
  const { data, isLoading, isError } = useQuery({
    queryKey: ['houses'],
    queryFn: fetchHouses,
  })
  const { data: preferenceData } = useQuery({
    queryKey: ['table-preferences', housesScreenKey],
    queryFn: fetchHouseTablePreference,
    enabled: Boolean(data?.canManage),
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

  const preferenceMutation = useMutation({
    mutationFn: async (nextVisibleColumns: string[]) => {
      const { data } = await http.post<TablePreferenceResponse>('/resources/table-preferences', {
        screen: housesScreenKey,
        visible_columns: nextVisibleColumns,
      })
      return data
    },
    onSuccess: (response) => {
      if (response.visible_columns?.length) {
        setVisibleColumnKeys(response.visible_columns)
      }
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error, 'Column preferences could not be saved.'))
    },
  })

  useEffect(() => {
    if (preferenceData?.visible_columns?.length) {
      setVisibleColumnKeys(preferenceData.visible_columns)
    }
  }, [preferenceData])

  const allColumns: ColumnsType<House> = [
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

  const columns = useMemo(
    () => allColumns.filter((column) => visibleColumnKeys.includes(String(column.key ?? ''))),
    [allColumns, visibleColumnKeys],
  )

  const columnPickerContent = (
    <div style={{ maxWidth: 260 }}>
      <Typography.Text strong>Visible Columns</Typography.Text>
      <Divider style={{ margin: '12px 0' }} />
      <Checkbox.Group
        options={houseColumnOptions as unknown as { label: string; value: string }[]}
        value={visibleColumnKeys}
        onChange={(checkedValues) => {
          const nextVisibleColumns = checkedValues.map((value) => String(value))
          if (nextVisibleColumns.length === 0) {
            message.warning('Keep at least one column visible.')
            return
          }

          setVisibleColumnKeys(nextVisibleColumns)
          preferenceMutation.mutate(nextVisibleColumns)
        }}
      />
    </div>
  )

  return (
    <div className="page-stack">
      <PageHeader
        title="Houses"
        subtitle="Vacant houses first, then houses with available vacant partitions."
        breadcrumbs={[{ title: 'Dashboard' }, { title: 'Houses' }]}
        extra={
          <Space wrap>
            {data?.canManage ? (
              <Popover content={columnPickerContent} placement="bottomRight" trigger="click">
                <Button icon={<ColumnHeightOutlined />}>Columns</Button>
              </Popover>
            ) : null}
            <Button
              icon={<HomeOutlined />}
              onClick={() => navigate('/create/house')}
              type="primary"
            >
              Add House
            </Button>
          </Space>
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
