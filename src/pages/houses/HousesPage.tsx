import {
  AppstoreOutlined,
  CameraOutlined,
  HomeOutlined,
} from '@ant-design/icons'
import { Alert, Button, Card, Space, Spin, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import { http } from '../../lib/http'
import type { House, HousesResponse } from '../../lib/types'

async function fetchHouses() {
  const { data } = await http.get<HousesResponse>('/resources/houses.php')
  return data
}

function statusColor(status: string) {
  const normalized = status.toLowerCase()
  if (normalized === 'vacant') return 'green'
  if (normalized === 'occupied') return 'blue'
  return 'default'
}

export function HousesPage() {
  const navigate = useNavigate()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['houses'],
    queryFn: fetchHouses,
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
      render: (value: number) => (
        <Tag icon={<CameraOutlined />} color={value > 0 ? 'processing' : 'default'}>
          {value}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          icon={<AppstoreOutlined />}
          onClick={() => navigate(`/partitions?house_id=${encodeURIComponent(String(record.houseID))}`)}
        >
          Open Partitions
        </Button>
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
    </div>
  )
}
