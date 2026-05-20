export type TenantSummary = {
  tenantID: number
  tenant_name: string
  house_name: string
  partition_number: string
  rent_amount?: string
}

export type AuthUser = {
  email: string
  name: string
  role: string
  isAdmin: boolean
  isTenant: boolean
  tenant: TenantSummary | null
}

export type SessionResponse = {
  ok: boolean
  authenticated: boolean
  user: AuthUser | null
}

export type DashboardResponse =
  | {
      ok: true
      mode: 'admin'
      stats: {
        houses: number
        tenants: number
        invoices: number
        payments: number
      }
      finance: {
        month: string
        monthCollections: number
        pendingInvoices: number
      }
    }
  | {
      ok: true
      mode: 'tenant'
      stay: {
        house: string
        partition: string
        rent: string
      }
      stats: {
        invoices: number
        complaints: number
      }
    }

export type House = {
  houseID: number
  house_name: string
  number_of_rooms: number
  rent_amount: number
  location: string
  num_of_bedrooms: number
  house_status: string
  partition_count: number
  available_partition_count: number
  photo_count: number
  photo_urls: string[]
  partitions_url: string
}

export type HousesResponse = {
  ok: boolean
  canManage: boolean
  items: House[]
}

export type Partition = {
  partition_id: number
  house_id: number
  house_name: string
  location: string
  partition_number: string
  rent_amount: number
  partition_status: string
  description: string
  facilities: string[]
  photo_count: number
  photo_urls: string[]
}

export type PartitionsResponse = {
  ok: boolean
  canManage: boolean
  selected_house_id: number
  items: Partition[]
}

export type Tenant = {
  tenantID: number
  tenant_name: string
  email: string
  ID_number: string
  profession: string
  phone_number: string
  telegram_username: string
  telegram_chat_id: string
  tenant_address: string
  tenant_home_country_address: string
  tenant_country: string
  start_date: string
  end_date: string
  dateAdmitted: string
  agreement_file: string
  house_name: string
  houseID: number
  partition_id: number
  partition_number: string
  rent_amount: number
}

export type TenantsResponse = {
  ok: boolean
  items: Tenant[]
}

export type LoginResponse = {
  ok: boolean
  user: AuthUser
  message?: string
  errors?: Record<string, string>
}

export type ApiMessageResponse = {
  ok: boolean
  message: string
}

export type TelegramActionResponse = ApiMessageResponse & {
  chat_id?: string
  items?: TelegramRecentChat[]
}

export type TelegramRecentChat = {
  chat_id: string
  username: string
  display_name: string
  message_preview: string
}

export type Invoice = {
  invoiceNumber: string
  tenant_name: string
  phone_number: string
  telegram_username: string
  telegram_chat_id: string
  tenantID: number
  amountDue: number
  rent_amount: number
  deposit_amount: number
  credit_applied: number
  total_paid: number
  rent_due_amount: number
  deposit_due_amount: number
  total_amount: number
  dateOfInvoice: string
  dateDue: string
  status: string
  comment: string
  latestPaymentID: number
  invoice_pdf_url: string
  receipt_pdf_url: string
}

export type InvoicesResponse = {
  ok: boolean
  canManage: boolean
  items: Invoice[]
}

export type Payment = {
  paymentID: number
  tenantID: number
  tenant_name: string
  house_name: string
  invoiceNumber: string
  expectedAmount: number
  amountPaid: number
  balance: number
  mpesaCode: string
  dateofPayment: string
  comment: string
  invoice_pdf_url: string
  receipt_pdf_url: string
}

export type PaymentsResponse = {
  ok: boolean
  items: Payment[]
}

export type Complaint = {
  complaint_id: number
  tenant_id: number
  tenant_name: string
  email: string
  house_name: string
  partition_number: string
  title: string
  description: string
  status: string
  admin_reason: string
  reopened_count: number
  created_at: string
  updated_at: string
  attachments: ComplaintAttachment[]
  history: ComplaintHistoryEntry[]
}

export type ComplaintsResponse = {
  ok: boolean
  canManage: boolean
  items: Complaint[]
}

export type ComplaintAttachment = {
  attachment_id: number
  file_name: string
  file_path: string
  file_url: string
  mime_type: string
  file_size: number
  uploaded_by_role: string
  created_at: string
}

export type ComplaintHistoryEntry = {
  history_id: number
  old_status: string
  new_status: string
  note: string
  actor_role: string
  actor_name: string
  created_at: string
}

export type Notice = {
  notice_id: number
  tenant_id: number
  tenant_name: string
  email: string
  house_name: string
  partition_number: string
  subject: string
  message: string
  sender_role: string
  created_by_name: string
  status: string
  admin_reply: string
  document_url: string
  document_label: string
  secondary_document_url: string
  secondary_document_label: string
  created_at: string
  updated_at: string
}

export type NoticeRecipient = {
  tenantID: number
  tenant_name: string
  email: string
  house_name: string
  partition_number: string
}

export type NoticesResponse = {
  ok: boolean
  canManage: boolean
  items: Notice[]
  recipients: NoticeRecipient[]
}

export type Expense = {
  expense_id: number
  expense_date: string
  category: string
  title: string
  house_name: string
  partition_number: string
  vendor_name: string
  amount: number
  attachment_path: string
  attachment_kind: string
  is_image_attachment: boolean
  notes: string
}

export type ExpensesResponse = {
  ok: boolean
  selectedMonth: string
  selectedCategory: string
  categories: string[]
  summary: {
    start: string
    end: string
    rent_collected: number
    dewa_paid: number
    other_expenses: number
    total_expenses: number
    net_earning: number
  }
  items: Expense[]
}

export type LandlordCheque = {
  cheque_id: number
  plan_id: number
  house_id: number
  house_name: string
  category: string
  payee_name: string
  frequency: string
  installment_number: number
  total_installments: number
  cheque_number: string
  payment_mode: string
  amount: number
  remaining_amount: number
  due_date: string
  original_due_date: string
  status: string
  notes: string
  reschedule_note: string
  reschedule_count: number
  paid_amount: number
  paid_date: string
  payment_reference: string
  paid_note: string
  issue_date: string
  bounce_reason: string
  created_by_name: string
  updated_at: string
  created_at: string
}

export type LandlordChequeEvent = {
  event_id: number
  cheque_id: number
  event_type: string
  actor_name: string
  note: string
  metadata_json: string
  created_at: string
}

export type ChequesResponse = {
  ok: boolean
  summary: {
    total_remaining_amount: number
    total_paid_amount: number
    total_coming_amount: number
    remaining_count: number
    coming_count: number
    paid_count: number
  }
  coming: LandlordCheque[]
  remaining: LandlordCheque[]
  paid: LandlordCheque[]
  events: LandlordChequeEvent[]
}

export type ReportBreakdown = {
  category: string
  total: number
}

export type ReportHouse = {
  houseID: number
  house_name: string
  rent_collected: number
  direct_expenses: number
  net_earning: number
  current_due_amount: number
  advance_amount: number
  invoice_count: number
  payment_status_label: string
  payment_status_amount: number
}

export type ReportPartition = {
  partition_id: number
  partition_number: string
  partition_status: string
  house_name: string
  rent_collected: number
  direct_expenses: number
  net_earning: number
}

export type ReportTenantCollection = {
  tenantID: number
  tenant_name: string
  email: string
  house_name: string
  partition_number: string
  rent_collected: number
  payment_count: number
  current_due_amount: number
  advance_amount: number
  invoice_count: number
  payment_status_label: string
  payment_status_amount: number
}

export type ReportsResponse = {
  ok: boolean
  selectedMonth: string
  selectedYear: number
  selectedQuarter: number
  monthly: {
    start: string
    end: string
    rent_collected: number
    dewa_paid: number
    other_expenses: number
    total_expenses: number
    net_earning: number
  }
  quarterly: {
    start: string
    end: string
    rent_collected: number
    dewa_paid: number
    other_expenses: number
    total_expenses: number
    net_earning: number
  }
  expenseBreakdown: ReportBreakdown[]
  houseReport: ReportHouse[]
  partitionReport: ReportPartition[]
  tenantCollectionReport: ReportTenantCollection[]
}

export type DeletedTenant = {
  tenantID: number
  tenant_name: string
  house_name: string
  partition_number: string
  email: string
  ID_number: string
  phone_number: string
  tenant_country: string
  rent_amount: number
  start_date: string
  end_date: string
  exit_date: string
  tenant_status: string
}

export type DeletedTenantsResponse = {
  ok: boolean
  items: DeletedTenant[]
}

export type BlogPost = {
  id: number
  title: string
  content: string
  date: string
}

export type PostsResponse = {
  ok: boolean
  items: BlogPost[]
}

export type BlogComment = {
  id: number
  blogid: number
  name: string
  comment: string
  date: string
  post_title: string
}

export type CommentsResponse = {
  ok: boolean
  items: BlogComment[]
}

export type MessageRecord = {
  id: number
  names: string
  email: string
  message: string
  date: string
}

export type MessagesResponse = {
  ok: boolean
  items: MessageRecord[]
}

export type MessageResponse = {
  ok: boolean
  item: MessageRecord
  message?: string
}

export type SubscriberRecord = {
  email: string
  date: string
}

export type SubscribersResponse = {
  ok: boolean
  items: SubscriberRecord[]
}

export type AdminUserRow = {
  id: number
  name: string
  email: string
  date: string
  role: string
}

export type UsersResponse = {
  ok: boolean
  items: AdminUserRow[]
}

export type CountryRecord = {
  name: string
  code: string
  iso: string
}

export type FormOptionsResponse = {
  ok: boolean
  countries: CountryRecord[]
  expense_categories: string[]
  houses: Array<{
    houseID: number
    house_name: string
    number_of_rooms: number
    location: string
    rent_amount: number
    house_status: string
  }>
  partitions: Array<{
    partition_id: number
    house_id: number
    partition_number: string
    rent_amount: number
    partition_status: string
    house_name: string
  }>
  expense_partitions: Array<{
    partition_id: number
    house_id: number
    partition_number: string
    rent_amount: number
    partition_status: string
    house_name: string
  }>
  activeTenants: Array<{
    tenantID: number
    tenant_name: string
    email: string
    house_name: string
    partition_number: string
    rent_amount: number
  }>
  openInvoices: Array<{
    invoiceNumber: string
    tenantID: number
    tenant_name: string
    amountDue: number
    rent_amount: number
    deposit_amount: number
    credit_applied: number
    total_paid: number
    rent_due_amount: number
    deposit_due_amount: number
    dateDue: string
    status: string
  }>
  locations: Array<{
    id: number
    location_name: string
    geo_id: string
  }>
  roles: string[]
  partition_facilities: string[]
  defaultCountry: string
  defaultPhoneCode: string
  canManage: boolean
}
