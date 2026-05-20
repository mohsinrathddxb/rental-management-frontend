import {
  PlusCircleOutlined,
  CameraOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Empty,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from 'antd'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import { getApiErrorMessage } from '../../lib/api-errors'
import { http } from '../../lib/http'
import type { Partition, PartitionsResponse } from '../../lib/types'
import { useFormOptions } from '../create/useFormOptions'

async function fetchPartitions(houseId: string | null) {
  const search = houseId ? `?house_id=${encodeURIComponent(houseId)}` : ''
  const { data } = await http.get<PartitionsResponse>(`/resources/partitions.php${search}`)
  return data
}

function partitionStatusColor(status: string) {
  return status.toLowerCase() === 'vacant' ? 'green' : 'blue'
}

function PartitionCard({
  partition,
  onPreview,
  onAddTenant,
  onEdit,
  onDelete,
  canManage,
}: {
  partition: Partition
  onPreview: (title: string, images: string[]) => void
  onAddTenant: (partition: Partition) => void
  onEdit: (partition: Partition) => void
  onDelete: (partition: Partition) => void
  canManage: boolean
}) {
  return (
    <Card className="partition-card">
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Space wrap size="small" style={{ justifyContent: 'space-between', width: '100%' }}>
          <div>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {partition.partition_number}
            </Typography.Title>
            <Typography.Text type="secondary">
              {partition.house_name || 'Unknown house'}
            </Typography.Text>
          </div>
          <Tag color={partitionStatusColor(partition.partition_status)}>
            {partition.partition_status}
          </Tag>
        </Space>

        <Space wrap size="small">
          <Tag icon={<EnvironmentOutlined />}>{partition.location || 'No location'}</Tag>
          <Tag color="gold">AED {partition.rent_amount.toLocaleString()}</Tag>
          {partition.photo_count > 0 ? (
            <Button
              icon={<CameraOutlined />}
              onClick={() =>
                onPreview(
                  `${partition.house_name} / ${partition.partition_number} photos`,
                  partition.photo_urls ?? [],
                )
              }
              size="small"
            >
              {partition.photo_count} photos
            </Button>
          ) : (
            <Tag icon={<CameraOutlined />} color="default">
              0 photos
            </Tag>
          )}
        </Space>

        {partition.description ? (
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            {partition.description}
          </Typography.Paragraph>
        ) : (
          <Typography.Text type="secondary">No description added.</Typography.Text>
        )}

        <Space wrap size={[8, 8]}>
          {partition.facilities.length > 0 ? (
            partition.facilities.map((facility) => (
              <Tag key={`${partition.partition_id}-${facility}`} color="blue">
                {facility}
              </Tag>
            ))
          ) : (
            <Typography.Text type="secondary">No facilities added.</Typography.Text>
          )}
        </Space>

        <Space wrap>
          {canManage ? (
            <Button onClick={() => onAddTenant(partition)} type="primary">
              Add Tenant
            </Button>
          ) : null}
          {canManage ? (
            <Button icon={<EditOutlined />} onClick={() => onEdit(partition)}>
              Edit
            </Button>
          ) : null}
          {canManage ? (
            <Popconfirm
              okText="Delete"
              onConfirm={() => onDelete(partition)}
              title="Delete this partition?"
              description="This works only if the partition has no active tenant."
            >
              <Button danger icon={<DeleteOutlined />}>
                Delete
              </Button>
            </Popconfirm>
          ) : null}
        </Space>
      </Space>
    </Card>
  )
}

export function PartitionsPage() {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: formOptions } = useFormOptions()
  const [previewTitle, setPreviewTitle] = useState('')
  const [previewImages, setPreviewImages] = useState<string[]>([])
  const [editingPartition, setEditingPartition] = useState<Partition | null>(null)
  const [searchParams] = useSearchParams()
  const houseId = searchParams.get('house_id')
  const { data, isLoading, isError } = useQuery({
    queryKey: ['partitions', houseId],
    queryFn: () => fetchPartitions(houseId),
  })

  const updateMutation = useMutation({
    mutationFn: async (values: any) => {
      const { data } = await http.post('/manage/partition.php', {
        action: 'update',
        partition_id: editingPartition?.partition_id,
        ...values,
      })
      return data
    },
    onSuccess: async (response: any) => {
      message.success(response?.message || 'Partition updated successfully.')
      setEditingPartition(null)
      form.resetFields()
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['partitions'] }),
        queryClient.invalidateQueries({ queryKey: ['houses'] }),
        queryClient.invalidateQueries({ queryKey: ['form-options'] }),
      ])
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error, 'Partition could not be updated.'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (partitionId: number) => {
      const { data } = await http.post('/manage/partition.php', {
        action: 'delete',
        partition_id: partitionId,
      })
      return data
    },
    onSuccess: async (response: any) => {
      message.success(response?.message || 'Partition deleted successfully.')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['partitions'] }),
        queryClient.invalidateQueries({ queryKey: ['houses'] }),
        queryClient.invalidateQueries({ queryKey: ['form-options'] }),
      ])
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error, 'Partition could not be deleted.'))
    },
  })

  return (
    <div className="page-stack">
      <PageHeader
        title="Partitions"
        subtitle={data?.canManage ? 'Vacant partitions are listed first, matching the current PHP admin behavior.' : 'Only available vacant partitions are shown here for tenants.'}
        breadcrumbs={[{ title: 'Dashboard' }, { title: 'Partitions' }]}
        extra={
          data?.canManage ? (
            <Space wrap>
              <Button
                icon={<PlusCircleOutlined />}
                onClick={() => navigate('/create/tenant')}
              >
                Add Tenant
              </Button>
              <Button
                icon={<PlusOutlined />}
                onClick={() =>
                  navigate(`/create/partition${houseId ? `?house_id=${encodeURIComponent(houseId)}` : ''}`)
                }
                type="primary"
              >
                Add Partition
              </Button>
            </Space>
          ) : undefined
        }
      />

      {isLoading ? (
        <Card>
          <div className="page-loader">
            <Spin size="large" />
          </div>
        </Card>
      ) : isError || !data?.ok ? (
        <Alert type="error" showIcon message="Partition data could not be loaded." />
      ) : data.items.length === 0 ? (
        <Card>
          <Empty description="No partitions found." />
        </Card>
      ) : (
        <Row gutter={[18, 18]}>
          {data.items.map((partition) => (
            <Col key={partition.partition_id} xs={24} md={12} xl={8}>
              <PartitionCard
                onAddTenant={(partition) =>
                  navigate(`/create/tenant?house_id=${encodeURIComponent(String(partition.house_id))}&partition_id=${encodeURIComponent(String(partition.partition_id))}`)
                }
                canManage={!!data.canManage}
                onDelete={(partition) => deleteMutation.mutate(partition.partition_id)}
                onEdit={(partition) => {
                  setEditingPartition(partition)
                  form.setFieldsValue({
                    partition_number: partition.partition_number,
                    rent_amount: partition.rent_amount,
                    partition_status: partition.partition_status,
                    description: partition.description,
                    facilities: partition.facilities,
                  })
                }}
                onPreview={(title, images) => {
                  setPreviewTitle(title)
                  setPreviewImages(images)
                }}
                partition={partition}
              />
            </Col>
          ))}
        </Row>
      )}

      <Modal
        confirmLoading={updateMutation.isPending}
        destroyOnHidden
        onCancel={() => {
          setEditingPartition(null)
          form.resetFields()
        }}
        onOk={() => form.submit()}
        open={!!editingPartition}
        title={editingPartition ? `Edit Partition: ${editingPartition.partition_number}` : 'Edit Partition'}
      >
        <Form form={form} layout="vertical" onFinish={(values) => updateMutation.mutate(values)}>
          <Form.Item label="Partition Number / Name" name="partition_number" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Rent Amount" name="rent_amount" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Status" name="partition_status" rules={[{ required: true }]}>
            <Select options={[{ label: 'Vacant', value: 'Vacant' }, { label: 'Occupied', value: 'Occupied' }]} />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input />
          </Form.Item>
          <Form.Item label="Facilities" name="facilities">
            <Checkbox.Group options={(formOptions?.partition_facilities ?? []).map((value) => ({ label: value, value }))} />
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
