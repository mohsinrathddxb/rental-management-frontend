import {
  AppstoreOutlined,
  BankOutlined,
  BookOutlined,
  BuildOutlined,
  CommentOutlined,
  DashboardOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  NotificationOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  ToolOutlined,
  UserDeleteOutlined,
  UserOutlined,
  WalletOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import {
  Avatar,
  Button,
  Drawer,
  Grid,
  Layout,
  Menu,
  Space,
  Typography,
} from 'antd'
import type { PropsWithChildren, ReactNode } from 'react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'

const { Header, Content, Sider } = Layout
const { useBreakpoint } = Grid

type NavItem = {
  key: string
  icon: ReactNode
  label: string
  path: string
  adminOnly?: boolean
}

const NAV_ITEMS: NavItem[] = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
    path: '/dashboard',
  },
  {
    key: '/houses',
    icon: <BankOutlined />,
    label: 'Houses',
    path: '/houses',
  },
  {
    key: '/tenants',
    icon: <TeamOutlined />,
    label: 'Tenants',
    path: '/tenants',
  },
  {
    key: '/partitions',
    icon: <AppstoreOutlined />,
    label: 'Partitions',
    path: '/partitions',
  },
  {
    key: '/invoices',
    icon: <FileTextOutlined />,
    label: 'Invoices',
    path: '/invoices',
  },
  {
    key: '/payments',
    icon: <WalletOutlined />,
    label: 'Payments',
    path: '/payments',
    adminOnly: true,
  },
  {
    key: '/expenses',
    icon: <BuildOutlined />,
    label: 'Expenses',
    path: '/expenses',
    adminOnly: true,
  },
  {
    key: '/reports',
    icon: <FileDoneOutlined />,
    label: 'Reports',
    path: '/reports',
    adminOnly: true,
  },
  {
    key: '/notices',
    icon: <NotificationOutlined />,
    label: 'Notices',
    path: '/notices',
  },
  {
    key: '/complaints',
    icon: <ToolOutlined />,
    label: 'Complaints',
    path: '/complaints',
  },
  {
    key: '/deleted-tenants',
    icon: <UserDeleteOutlined />,
    label: 'Archive',
    path: '/deleted-tenants',
    adminOnly: true,
  },
  {
    key: '/posts',
    icon: <BookOutlined />,
    label: 'Posts',
    path: '/posts',
    adminOnly: true,
  },
  {
    key: '/comments',
    icon: <CommentOutlined />,
    label: 'Comments',
    path: '/comments',
    adminOnly: true,
  },
  {
    key: '/users',
    icon: <UserOutlined />,
    label: 'Admins',
    path: '/users',
    adminOnly: true,
  },
  {
    key: '/settings',
    icon: <SettingOutlined />,
    label: 'Settings',
    path: '/settings',
  },
  {
    key: '/tools',
    icon: <ToolOutlined />,
    label: 'Tools',
    path: '/tools',
    adminOnly: true,
  },
]

function NavigationMenu({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation()
  const { user } = useAuth()
  const availableItems = NAV_ITEMS.filter((item) => !item.adminOnly || user?.isAdmin)

  return (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[location.pathname]}
      items={availableItems.map((item) => ({
        key: item.key,
        icon: item.icon,
        label: (
          <Link onClick={onNavigate} to={item.path}>
            {item.label}
          </Link>
        ),
      }))}
    />
  )
}

export function AppShell({ children }: PropsWithChildren) {
  const screens = useBreakpoint()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const isMobile = !screens.lg
  const initials = user?.name
    ? user.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('')
    : 'RM'

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const sideContent = (
    <div className="app-sider">
      <div className="brand-block">
        <div className="brand-mark">RM</div>
        <div>
          <Typography.Title level={5} style={{ margin: 0, color: '#f8f5ef' }}>
            Rental Manager
          </Typography.Title>
          <Typography.Text style={{ color: '#cbbf9e' }}>
            Admin Console
          </Typography.Text>
        </div>
      </div>
      <NavigationMenu onNavigate={() => setDrawerOpen(false)} />
    </div>
  )

  return (
    <Layout className="app-layout">
      {isMobile ? null : <Sider width={260}>{sideContent}</Sider>}
      <Layout>
        <Header className="app-header">
          <Space size="middle">
            {isMobile ? (
              <Button
                aria-label="Open navigation"
                icon={<MenuUnfoldOutlined />}
                onClick={() => setDrawerOpen(true)}
              />
            ) : null}
            <div>
              <Typography.Title level={4} style={{ margin: 0, color: '#f8f5ef' }}>
                {user?.name ?? 'Rental Manager'}
              </Typography.Title>
              <Typography.Text style={{ color: '#d9c78d' }}>
                {user?.role ?? 'Session'}
              </Typography.Text>
            </div>
          </Space>
          <Space size="middle">
            <Space size="small">
              <Avatar style={{ background: '#d9b65f', color: '#0b1c2e' }}>
                {initials}
              </Avatar>
              {!isMobile ? (
                <Typography.Text style={{ color: '#f8f5ef' }}>
                  {user?.email}
                </Typography.Text>
              ) : null}
            </Space>
            <Button icon={<LogoutOutlined />} onClick={handleLogout}>
              Logout
            </Button>
          </Space>
        </Header>
        <Content className="app-content">{children}</Content>
      </Layout>
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        placement="left"
        width={260}
        styles={{
          body: { padding: 0, background: '#0b1c2e' },
          header: { display: 'none' },
        }}
      >
        {sideContent}
      </Drawer>
    </Layout>
  )
}
