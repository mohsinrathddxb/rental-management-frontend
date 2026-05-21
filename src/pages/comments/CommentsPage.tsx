import { useQuery } from '@tanstack/react-query'
import { Alert, Card, Spin, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { PageHeader } from '../../components/PageHeader'
import { http } from '../../lib/http'
import type { BlogComment, CommentsResponse } from '../../lib/types'

async function fetchComments() {
  const { data } = await http.get<CommentsResponse>('/resources/comments')
  return data
}

export function CommentsPage() {
  const { data, isLoading, isError } = useQuery({ queryKey: ['comments'], queryFn: fetchComments })
  const columns: ColumnsType<BlogComment> = [
    { title: 'Author', dataIndex: 'name', key: 'name' },
    { title: 'Post', dataIndex: 'post_title', key: 'post_title' },
    { title: 'Comment', dataIndex: 'comment', key: 'comment' },
    { title: 'Date', dataIndex: 'date', key: 'date' },
  ]
  return <div className="page-stack"><PageHeader title="Comments" subtitle="Recent post comments from the current backend." breadcrumbs={[{ title: 'Dashboard' }, { title: 'Comments' }]} /><Card>{isLoading ? <div className="page-loader"><Spin size="large" /></div> : isError || !data?.ok ? <Alert type="error" showIcon message="Comments could not be loaded." /> : <Table columns={columns} dataSource={data.items} rowKey="id" />}</Card></div>
}
