import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { Spin } from 'antd'
import type { ReactElement } from 'react'
import { AppShell } from '../layouts/AppShell'
import { useAuth } from '../lib/auth-context'
import { LoginPage } from '../pages/auth/LoginPage'
import { SignupPage } from '../pages/auth/SignupPage'
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage'
import { VerifyOtpPage } from '../pages/auth/VerifyOtpPage'
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage'
import { DashboardPage } from '../pages/dashboard/DashboardPage'
import { ExpensesPage } from '../pages/expenses/ExpensesPage'
import { ReportsPage } from '../pages/reports/ReportsPage'
import { HousesPage } from '../pages/houses/HousesPage'
import { InvoicesPage } from '../pages/invoices/InvoicesPage'
import { PartitionsPage } from '../pages/partitions/PartitionsPage'
import { PaymentsPage } from '../pages/payments/PaymentsPage'
import { TenantsPage } from '../pages/tenants/TenantsPage'
import { ComplaintsPage } from '../pages/complaints/ComplaintsPage'
import { NoticesPage } from '../pages/notices/NoticesPage'
import { DeletedTenantsPage } from '../pages/deleted-tenants/DeletedTenantsPage'
import { PostsPage } from '../pages/posts/PostsPage'
import { CommentsPage } from '../pages/comments/CommentsPage'
import { MessagesPage } from '../pages/messages/MessagesPage'
import { MessageDetailPage } from '../pages/messages/MessageDetailPage'
import { SubscribersPage } from '../pages/subscribers/SubscribersPage'
import { UsersPage } from '../pages/users/UsersPage'
import { SettingsPage } from '../pages/settings/SettingsPage'
import { ToolsPage } from '../pages/tools/ToolsPage'
import { CreateHousePage } from '../pages/create/CreateHousePage'
import { CreatePartitionPage } from '../pages/create/CreatePartitionPage'
import { CreateTenantPage } from '../pages/create/CreateTenantPage'
import { CreateInvoicePage } from '../pages/create/CreateInvoicePage'
import { CreatePaymentPage } from '../pages/create/CreatePaymentPage'
import { CreateExpensePage } from '../pages/create/CreateExpensePage'
import { CreateChequePage } from '../pages/create/CreateChequePage'
import { CreatePostPage } from '../pages/create/CreatePostPage'
import { CreateUserPage } from '../pages/create/CreateUserPage'
import { CreateLocationPage } from '../pages/create/CreateLocationPage'
import { ChequesPage } from '../pages/cheques/ChequesPage'

function ProtectedRoutes() {
  const { isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return (
      <div className="page-loader">
        <Spin size="large" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}

function PublicLoginRoute() {
  const { isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return (
      <div className="page-loader">
        <Spin size="large" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <LoginPage />
}

function PublicAuthRoute({ children }: { children: ReactElement }) {
  const { isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return (
      <div className="page-loader">
        <Spin size="large" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function AdminOnlyRoute({ children }: { children: ReactElement }) {
  const { isLoading, user } = useAuth()

  if (isLoading) {
    return (
      <div className="page-loader">
        <Spin size="large" />
      </div>
    )
  }

  if (!user?.isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicLoginRoute />} />
        <Route path="/signup" element={<PublicAuthRoute><SignupPage /></PublicAuthRoute>} />
        <Route path="/forgot-password" element={<PublicAuthRoute><ForgotPasswordPage /></PublicAuthRoute>} />
        <Route path="/forgot-password/verify" element={<PublicAuthRoute><VerifyOtpPage /></PublicAuthRoute>} />
        <Route path="/forgot-password/reset" element={<PublicAuthRoute><ResetPasswordPage /></PublicAuthRoute>} />
        <Route element={<ProtectedRoutes />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/houses" element={<HousesPage />} />
          <Route path="/tenants" element={<TenantsPage />} />
          <Route path="/partitions" element={<PartitionsPage />} />
          <Route path="/invoices" element={<InvoicesPage />} />
          <Route path="/payments" element={<AdminOnlyRoute><PaymentsPage /></AdminOnlyRoute>} />
          <Route path="/expenses" element={<AdminOnlyRoute><ExpensesPage /></AdminOnlyRoute>} />
          <Route path="/cheques" element={<AdminOnlyRoute><ChequesPage /></AdminOnlyRoute>} />
          <Route path="/reports" element={<AdminOnlyRoute><ReportsPage /></AdminOnlyRoute>} />
          <Route path="/notices" element={<NoticesPage />} />
          <Route path="/complaints" element={<ComplaintsPage />} />
          <Route path="/deleted-tenants" element={<AdminOnlyRoute><DeletedTenantsPage /></AdminOnlyRoute>} />
          <Route path="/posts" element={<AdminOnlyRoute><PostsPage /></AdminOnlyRoute>} />
          <Route path="/comments" element={<AdminOnlyRoute><CommentsPage /></AdminOnlyRoute>} />
          <Route path="/messages" element={<AdminOnlyRoute><MessagesPage /></AdminOnlyRoute>} />
          <Route path="/messages/:id" element={<AdminOnlyRoute><MessageDetailPage /></AdminOnlyRoute>} />
          <Route path="/subscribers" element={<AdminOnlyRoute><SubscribersPage /></AdminOnlyRoute>} />
          <Route path="/users" element={<AdminOnlyRoute><UsersPage /></AdminOnlyRoute>} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/tools" element={<AdminOnlyRoute><ToolsPage /></AdminOnlyRoute>} />
          <Route path="/create/house" element={<AdminOnlyRoute><CreateHousePage /></AdminOnlyRoute>} />
          <Route path="/create/partition" element={<AdminOnlyRoute><CreatePartitionPage /></AdminOnlyRoute>} />
          <Route path="/create/tenant" element={<AdminOnlyRoute><CreateTenantPage /></AdminOnlyRoute>} />
          <Route path="/create/invoice" element={<AdminOnlyRoute><CreateInvoicePage /></AdminOnlyRoute>} />
          <Route path="/create/payment" element={<AdminOnlyRoute><CreatePaymentPage /></AdminOnlyRoute>} />
          <Route path="/create/expense" element={<AdminOnlyRoute><CreateExpensePage /></AdminOnlyRoute>} />
          <Route path="/create/cheque" element={<AdminOnlyRoute><CreateChequePage /></AdminOnlyRoute>} />
          <Route path="/create/post" element={<AdminOnlyRoute><CreatePostPage /></AdminOnlyRoute>} />
          <Route path="/create/user" element={<AdminOnlyRoute><CreateUserPage /></AdminOnlyRoute>} />
          <Route path="/create/location" element={<AdminOnlyRoute><CreateLocationPage /></AdminOnlyRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
