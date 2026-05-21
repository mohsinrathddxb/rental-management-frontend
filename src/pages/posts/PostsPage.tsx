import { useQuery } from '@tanstack/react-query'
import { Alert, Button, Card, Spin, Table, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import { http } from '../../lib/http'
import type { BlogPost, PostsResponse } from '../../lib/types'

async function fetchPosts() {
  const { data } = await http.get<PostsResponse>('/resources/posts')
  return data
}

export function PostsPage() {
  const navigate = useNavigate()
  const { data, isLoading, isError } = useQuery({ queryKey: ['posts'], queryFn: fetchPosts })
  const columns: ColumnsType<BlogPost> = [
    { title: 'Title', dataIndex: 'title', key: 'title', render: (v: string) => <Typography.Text strong>{v}</Typography.Text> },
    { title: 'Content', dataIndex: 'content', key: 'content', render: (v: string) => <Typography.Text>{v?.slice(0, 180)}{v?.length > 180 ? '...' : ''}</Typography.Text> },
    { title: 'Date', dataIndex: 'date', key: 'date' },
  ]
  return <div className="page-stack"><PageHeader title="Posts" subtitle="Blog post inventory from the current backend." breadcrumbs={[{ title: 'Dashboard' }, { title: 'Posts' }]} extra={<Button icon={<PlusOutlined />} onClick={() => navigate('/create/post')} type="primary">Create Post</Button>} /><Card>{isLoading ? <div className="page-loader"><Spin size="large" /></div> : isError || !data?.ok ? <Alert type="error" showIcon message="Posts could not be loaded." /> : <Table columns={columns} dataSource={data.items} rowKey="id" />}</Card></div>
}
