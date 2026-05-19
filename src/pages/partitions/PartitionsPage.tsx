import {
  PlusCircleOutlined,
  CameraOutlined,
  EnvironmentOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Image,
  Modal,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
} from 'antd'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import { http } from '../../lib/http'
import type { Partition, PartitionsResponse } from '../../lib/types'

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
}: {
  partition: Partition
  onPreview: (title: string, images: string[]) => void
  onAddTenant: (partition: Partition) => void
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
              onClick={() => onPreview(`${partition.house_name} / ${partition.partition_number} photos`, partition.photo_urls)}
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
          <Button onClick={() => onAddTenant(partition)} type="primary">
            Add Tenant
          </Button>
        </Space>
      </Space>
    </Card>
  )
}

export function PartitionsPage() {
  const navigate = useNavigate()
  const [previewTitle, setPreviewTitle] = useState('')
  const [previewImages, setPreviewImages] = useState<string[]>([])
  const [searchParams] = useSearchParams()
  const houseId = searchParams.get('house_id')
  const { data, isLoading, isError } = useQuery({
    queryKey: ['partitions', houseId],
    queryFn: () => fetchPartitions(houseId),
  })

  return (
    <div className="page-stack">
      <PageHeader
        title="Partitions"
        subtitle="Vacant partitions are listed first, matching the current PHP admin behavior."
        breadcrumbs={[{ title: 'Dashboard' }, { title: 'Partitions' }]}
        extra={
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
        footer={null}
        onCancel={() => setPreviewImages([])}
        open={previewImages.length > 0}
        title={previewTitle}
        width={900}
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
