import {
  PlusCircleOutlined,
  CameraOutlined,
  DeleteOutlined,
  DownOutlined,
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
  Empty,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
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
  const { data } = await http.get<PartitionsResponse>(`/resources/partitions${search}`)
  return data
}

function partitionStatusColor(status: string) {
  return status.toLowerCase() === 'vacant' ? 'green' : 'blue'
}

function partitionSortValue(status: string) {
  return status.toLowerCase() === 'vacant' ? 0 : 1
}

function PartitionListRow({
  partition,
  onPreview,
  onAddTenant,
  onEdit,
  onDelete,
  canManage,
  canAddTenant,
}: {
  partition: Partition
  onPreview: (title: string, images: string[]) => void
  onAddTenant: (partition: Partition) => void
  onEdit: (partition: Partition) => void
  onDelete: (partition: Partition) => void
  canManage: boolean
  canAddTenant: boolean
}) {
  return (
    <div
      style={{
        border: '1px solid #ead9a3',
        borderRadius: 16,
        padding: 14,
        background: '#fffdfa',
      }}
    >
      <Space direction="vertical" size={10} style={{ width: '100%' }}>
        <Space wrap size="small" style={{ justifyContent: 'space-between', width: '100%' }}>
          <Space direction="vertical" size={0}>
            <Typography.Text strong style={{ fontSize: 18 }}>
              {partition.partition_number}
            </Typography.Text>
            <Typography.Text type="secondary">
              {partition.description || 'No description added.'}
            </Typography.Text>
          </Space>
          <Tag color={partitionStatusColor(partition.partition_status)}>
            {partition.partition_status}
          </Tag>
        </Space>

        <Space wrap size={[8, 8]}>
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

        <Space wrap size={[6, 6]}>
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

        <Space wrap size="small">
          {canAddTenant ? (
            <Button onClick={() => onAddTenant(partition)} size="small" type="primary">
              Add Tenant
            </Button>
          ) : null}
          {canManage ? (
            <Button icon={<EditOutlined />} onClick={() => onEdit(partition)} size="small">
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
              <Button danger icon={<DeleteOutlined />} size="small">
                Delete
              </Button>
            </Popconfirm>
          ) : null}
        </Space>
      </Space>
    </div>
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
  const [expandedHouses, setExpandedHouses] = useState<string[]>([])
  const [searchParams] = useSearchParams()
  const houseId = searchParams.get('house_id')
  const { data, isLoading, isError } = useQuery({
    queryKey: ['partitions', houseId],
    queryFn: () => fetchPartitions(houseId),
  })

  const groupedPartitions = (() => {
    const byHouse = new Map<string, Partition[]>()
    for (const partition of data?.items ?? []) {
      const houseName = partition.house_name || 'Unknown house'
      const current = byHouse.get(houseName) ?? []
      current.push(partition)
      byHouse.set(houseName, current)
    }

    return Array.from(byHouse.entries())
      .map(([houseName, partitions]) => ({
        houseName,
        partitions: [...partitions].sort((left, right) => {
          const statusDiff = partitionSortValue(left.partition_status) - partitionSortValue(right.partition_status)
          if (statusDiff !== 0) return statusDiff
          return String(left.partition_number).localeCompare(String(right.partition_number), undefined, {
            numeric: true,
            sensitivity: 'base',
          })
        }),
      }))
      .sort((left, right) => left.houseName.localeCompare(right.houseName, undefined, { sensitivity: 'base' }))
  })()

  const toggleHouseGroup = (houseName: string) => {
    setExpandedHouses((current) =>
      current.includes(houseName)
        ? current.filter((value) => value !== houseName)
        : [...current, houseName],
    )
  }

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
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {groupedPartitions.map((group) => (
            <Card
              key={group.houseName}
              bodyStyle={{ padding: 0 }}
            >
              <button
                onClick={() => toggleHouseGroup(group.houseName)}
                style={{
                  alignItems: 'center',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '18px 20px',
                  textAlign: 'left',
                  width: '100%',
                }}
                type="button"
              >
                <Space direction="vertical" size={2}>
                  <Typography.Text strong style={{ fontSize: 18 }}>
                    {group.houseName}
                  </Typography.Text>
                  <Typography.Text type="secondary">
                    {
                      group.partitions.filter(
                        (partition) => partition.partition_status.toLowerCase() === 'vacant',
                      ).length
                    }{' '}
                    vacant / {group.partitions.length} total
                  </Typography.Text>
                </Space>

                <DownOutlined
                  style={{
                    color: '#8c6d1f',
                    fontSize: 16,
                    transform: expandedHouses.includes(group.houseName)
                      ? 'rotate(180deg)'
                      : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                  }}
                />
              </button>

              {expandedHouses.includes(group.houseName) ? (
                <div style={{ padding: '0 20px 20px' }}>
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    {group.partitions.map((partition) => (
                      <PartitionListRow
                        key={partition.partition_id}
                        onAddTenant={(partition) =>
                          navigate(
                            `/create/tenant?house_id=${encodeURIComponent(String(partition.house_id))}&partition_id=${encodeURIComponent(String(partition.partition_id))}`,
                          )
                        }
                        canManage={!!data.canManage}
                        canAddTenant={
                          !!data.canManage &&
                          partition.partition_status.toLowerCase() === 'vacant'
                        }
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
                    ))}
                  </Space>
                </div>
              ) : null}
            </Card>
          ))}
        </Space>
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
