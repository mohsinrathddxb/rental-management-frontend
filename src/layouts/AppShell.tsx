import {
  AppstoreOutlined,
  BankOutlined,
  BookOutlined,
  BuildOutlined,
  DashboardOutlined,
  EnvironmentOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  ScheduleOutlined,
  MailOutlined,
  NotificationOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  ToolOutlined,
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
import type { MenuProps } from 'antd'
import type { PropsWithChildren, ReactNode } from 'react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'

const { Header, Content, Sider } = Layout
const { useBreakpoint } = Grid

type AppMenuItem = NonNullable<MenuProps['items']>[number]

function navLink(path: string, label: string, onNavigate?: () => void) {
  return (
    <Link onClick={onNavigate} to={path}>
      {label}
    </Link>
  )
}

function menuItem(
  key: string,
  label: ReactNode,
  icon?: ReactNode,
  children?: AppMenuItem[],
): AppMenuItem {
  return { key, label, icon, children }
}

function menuGroup(label: string, children: AppMenuItem[]): AppMenuItem {
  return { type: 'group', label, children }
}

function getMenuState(pathname: string) {
  const openKeyByPath: Record<string, string> = {
    '/create/house': 'houses',
    '/partitions': 'houses',
    '/houses': 'houses',
    '/create/partition': 'houses',
    '/create/tenant': 'tenants',
    '/tenants': 'tenants',
    '/deleted-tenants': 'tenants',
    '/create/invoice': 'invoices',
    '/invoices': 'invoices',
    '/create/payment': 'payments',
    '/payments': 'payments',
    '/create/expense': 'expenses',
    '/expenses': 'expenses',
    '/create/cheque': 'cheques',
    '/cheques': 'cheques',
    '/posts': 'blog',
    '/create/post': 'blog',
    '/comments': 'blog',
    '/messages': 'audience',
    '/subscribers': 'audience',
    '/users': 'accounts',
    '/owners': 'accounts',
    '/create/user': 'accounts',
  }

  if (pathname.startsWith('/messages/')) {
    return {
      selectedKeys: [pathname],
      defaultOpenKeys: ['audience'],
    }
  }

  return {
    selectedKeys: [pathname],
    defaultOpenKeys: openKeyByPath[pathname] ? [openKeyByPath[pathname]] : [],
  }
}

function buildMenuItems(
  isAdmin: boolean,
  isTenant: boolean,
  isPlatformAdmin: boolean,
  onNavigate?: () => void,
) {
  const housesChildren: AppMenuItem[] = []

  if (isAdmin) {
    housesChildren.push(
      menuItem('/create/house', navLink('/create/house', 'Add a House', onNavigate)),
      menuItem('/create/partition', navLink('/create/partition', 'Add Partition', onNavigate)),
    )
  }

  housesChildren.push(
    menuItem(
      '/houses',
      navLink('/houses', isTenant ? 'Available Partitions' : 'View Houses', onNavigate),
    ),
    menuItem(
      '/partitions',
      navLink('/partitions', 'View Partitions', onNavigate),
    ),
  )

  const mainItems: AppMenuItem[] = [
    menuItem('/dashboard', navLink('/dashboard', 'Dashboard', onNavigate), <DashboardOutlined />),
    menuItem('houses', 'Houses', <BankOutlined />, housesChildren),
  ]

  if (isAdmin) {
    mainItems.push(
      menuItem('tenants', 'Tenants', <TeamOutlined />, [
        menuItem('/create/tenant', navLink('/create/tenant', 'Add Tenant', onNavigate)),
        menuItem('/tenants', navLink('/tenants', 'View Tenants', onNavigate)),
        menuItem(
          '/deleted-tenants',
          navLink('/deleted-tenants', 'Deleted / Moved Out', onNavigate),
        ),
      ]),
    )
  }

  mainItems.push(
    menuItem('invoices', 'Invoices', <FileTextOutlined />, [
      ...(isAdmin
        ? [menuItem('/create/invoice', navLink('/create/invoice', 'Add Invoice', onNavigate))]
        : []),
      menuItem(
        '/invoices',
        navLink('/invoices', isTenant ? 'My Invoices' : 'View Invoices', onNavigate),
      ),
    ]),
  )

  if (isAdmin) {
    mainItems.push(
      menuItem('payments', 'Payments', <WalletOutlined />, [
        menuItem('/create/payment', navLink('/create/payment', 'New Payment', onNavigate)),
        menuItem('/payments', navLink('/payments', 'View Payments', onNavigate)),
      ]),
      menuItem('expenses', 'Expenses', <BuildOutlined />, [
        menuItem('/create/expense', navLink('/create/expense', 'Add Expense', onNavigate)),
        menuItem('/expenses', navLink('/expenses', 'View Expenses', onNavigate)),
      ]),
      menuItem('cheques', 'Cheques', <ScheduleOutlined />, [
        menuItem('/create/cheque', navLink('/create/cheque', 'Create Cheque Plan', onNavigate)),
        menuItem('/cheques', navLink('/cheques', 'Track Cheques', onNavigate)),
      ]),
      menuItem('/reports', navLink('/reports', 'Reports', onNavigate), <FileDoneOutlined />),
    )
  }

  mainItems.push(
    menuItem('/notices', navLink('/notices', 'Notices', onNavigate), <NotificationOutlined />),
    menuItem(
      '/complaints',
      navLink('/complaints', isTenant ? 'My Complaints' : 'Complaints', onNavigate),
      <ToolOutlined />,
    ),
  )

  if (isAdmin) {
    mainItems.push(
      menuItem('blog', 'Blog', <BookOutlined />, [
        menuItem('/posts', navLink('/posts', 'All Posts', onNavigate)),
        menuItem('/create/post', navLink('/create/post', 'Create Post', onNavigate)),
        menuItem('/comments', navLink('/comments', 'Comments', onNavigate)),
      ]),
      menuItem('audience', 'Audience', <MailOutlined />, [
        menuItem('/messages', navLink('/messages', 'Messages', onNavigate)),
        menuItem('/subscribers', navLink('/subscribers', 'Subscribers', onNavigate)),
      ]),
      menuItem(
        '/create/location',
        navLink('/create/location', 'Locations', onNavigate),
        <EnvironmentOutlined />,
      ),
    )
  }

  const otherItems: AppMenuItem[] = []

  if (isAdmin) {
    otherItems.push(
      menuItem('accounts', 'Accounts', <UserOutlined />, [
        menuItem('/users', navLink('/users', 'Administrators', onNavigate)),
        ...(isPlatformAdmin ? [menuItem('/owners', navLink('/owners', 'Owners', onNavigate))] : []),
        menuItem('/create/user', navLink('/create/user', 'Create Admin', onNavigate)),
      ]),
      menuItem('/tools', navLink('/tools', 'Tools', onNavigate), <AppstoreOutlined />),
    )
  }

  otherItems.push(
    menuItem('/settings', navLink('/settings', 'Account Setting', onNavigate), <SettingOutlined />),
  )

  return [menuGroup('Main Menu', mainItems), menuGroup('Other', otherItems)]
}

function NavigationMenu({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation()
  const { user } = useAuth()
  const { selectedKeys, defaultOpenKeys } = getMenuState(location.pathname)
  const items = buildMenuItems(
    Boolean(user?.isAdmin),
    Boolean(user?.isTenant),
    Boolean(user?.isPlatformAdmin),
    onNavigate,
  )

  return (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={selectedKeys}
      defaultOpenKeys={defaultOpenKeys}
      items={items}
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
