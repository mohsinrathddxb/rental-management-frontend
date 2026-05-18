import { AppstoreOutlined, BankOutlined, BuildOutlined, EnvironmentOutlined, FileTextOutlined, PlusOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Card, Col, Row, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'

const tools = [
  { title: 'New House', href: '/create/house', icon: <BankOutlined /> },
  { title: 'New Partition', href: '/create/partition', icon: <AppstoreOutlined /> },
  { title: 'New Tenant', href: '/create/tenant', icon: <TeamOutlined /> },
  { title: 'New Invoice', href: '/create/invoice', icon: <FileTextOutlined /> },
  { title: 'New Payment', href: '/create/payment', icon: <PlusOutlined /> },
  { title: 'New Expense', href: '/create/expense', icon: <BuildOutlined /> },
  { title: 'New Post', href: '/create/post', icon: <AppstoreOutlined /> },
  { title: 'New Admin', href: '/create/user', icon: <UserOutlined /> },
  { title: 'New Location', href: '/create/location', icon: <EnvironmentOutlined /> },
]

export function ToolsPage() {
  const navigate = useNavigate()

  return (
    <div className="page-stack">
      <PageHeader title="Tools" subtitle="Quick-create shortcuts for the migrated React admin workflows." breadcrumbs={[{ title: 'Dashboard' }, { title: 'Tools' }]} />
      <Row gutter={[16, 16]}>
        {tools.map((tool) => (
          <Col key={tool.title} xs={24} md={12} xl={8}>
            <Card>
              <Typography.Title level={4}>{tool.title}</Typography.Title>
              <Button icon={tool.icon} onClick={() => navigate(tool.href)} type="primary">Open</Button>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}
