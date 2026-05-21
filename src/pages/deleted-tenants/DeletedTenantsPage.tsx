import { useQuery } from '@tanstack/react-query'
import { Alert, Card, Spin, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { PageHeader } from '../../components/PageHeader'
import { http } from '../../lib/http'
import type { DeletedTenant, DeletedTenantsResponse } from '../../lib/types'

async function fetchDeletedTenants() {
  const { data } = await http.get<DeletedTenantsResponse>('/resources/deleted-tenants')
  return data
}

export function DeletedTenantsPage() {
  const { data, isLoading, isError } = useQuery({ queryKey: ['deleted-tenants'], queryFn: fetchDeletedTenants })
  const columns: ColumnsType<DeletedTenant> = [
    { title: 'Name', dataIndex: 'tenant_name', key: 'tenant_name' },
    { title: 'House', dataIndex: 'house_name', key: 'house_name' },
    { title: 'Partition', dataIndex: 'partition_number', key: 'partition_number' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Phone', dataIndex: 'phone_number', key: 'phone_number' },
    { title: 'Country', dataIndex: 'tenant_country', key: 'tenant_country' },
    { title: 'Rent', dataIndex: 'rent_amount', key: 'rent_amount', render: (v: number) => `AED ${v.toLocaleString()}` },
    { title: 'Exit Date', dataIndex: 'exit_date', key: 'exit_date' },
    { title: 'Status', dataIndex: 'tenant_status', key: 'tenant_status' },
  ]
  return <div className="page-stack"><PageHeader title="Deleted / Moved Out Tenants" subtitle="Archived tenant history preserved in the database." breadcrumbs={[{ title: 'Dashboard' }, { title: 'Archive' }]} /><Card>{isLoading ? <div className="page-loader"><Spin size="large" /></div> : isError || !data?.ok ? <Alert type="error" showIcon message="Archived tenants could not be loaded." /> : <Table columns={columns} dataSource={data.items} rowKey="tenantID" scroll={{ x: 1100 }} />}</Card></div>
}
