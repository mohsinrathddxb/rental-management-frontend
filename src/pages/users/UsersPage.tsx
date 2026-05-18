import { PlusOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { Alert, Button, Card, Spin, Table, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import { http } from '../../lib/http'
import type { AdminUserRow, UsersResponse } from '../../lib/types'

async function fetchUsers() {
  const { data } = await http.get<UsersResponse>('/resources/users.php')
  return data
}

export function UsersPage() {
  const navigate = useNavigate()
  const { data, isLoading, isError } = useQuery({ queryKey: ['users'], queryFn: fetchUsers })
  const columns: ColumnsType<AdminUserRow> = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Role', dataIndex: 'role', key: 'role', render: (v: string) => <Tag>{v}</Tag> },
    { title: 'Date', dataIndex: 'date', key: 'date' },
  ]
  return <div className="page-stack"><PageHeader title="Administrators" subtitle="Admin accounts from the current backend." breadcrumbs={[{ title: 'Dashboard' }, { title: 'Admins' }]} extra={<Button icon={<PlusOutlined />} onClick={() => navigate('/create/user')} type="primary">Create Admin</Button>} /><Card>{isLoading ? <div className="page-loader"><Spin size="large" /></div> : isError || !data?.ok ? <Alert type="error" showIcon message="Admin users could not be loaded." /> : <Table columns={columns} dataSource={data.items} rowKey="id" />}</Card></div>
}
