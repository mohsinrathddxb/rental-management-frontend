# Rental Management System End User Guide

This guide explains how to use the Rental Management System from an end-user point of view. It is written for property owners, admins, staff members, and tenants who need to manage houses, partitions, tenants, invoices, payments, cheques, complaints, notices, and reports.

## 1. What The System Does

The application helps a rental business manage shared living spaces and house-related operations in one place.

You can use it to:

- Create houses and partitions.
- Admit tenants into available partitions.
- Create monthly rent and deposit invoices.
- Record payments and track unpaid balances.
- Track owner/landlord cheques and outgoing house-related payments.
- Record expenses against houses and partitions.
- Manage tenant complaints with status tracking.
- Send notices and manage communication.
- Review reports for collection, dues, expenses, and profit.
- Keep each owner's data private from other owners.

## 2. User Roles

The system uses roles to decide what each user can see and do.

### Owner Admin

An owner admin is the main admin for one owner account. This user can manage that owner's houses, partitions, tenants, invoices, payments, expenses, cheques, reports, complaints, notices, and users.

Important privacy rule:

- Owner Admin 1 cannot see Owner Admin 2 data.
- Houses, partitions, tenants, invoices, payments, expenses, cheques, complaints, and reports are separated by owner.
- One property belongs to one owner only.

### Admin User

An admin user works under an owner account. Admin users under the same owner can share the same owner's data, depending on their access level.

Use admin users for staff members who help manage the same owner account.

### Platform Admin

A platform admin is a special system-level user. This user can manage owner records and platform-level setup. Normal owner admins should not use platform admin access for daily rental work.

### Tenant User

A tenant user can log in to view tenant-facing information such as available partitions, invoices, notices, and complaints. Tenants do not get admin controls such as adding tenants, creating invoices, adding expenses, or managing cheques.

## 3. Login And Sessions

Open the production application URL and sign in from the login page.

### Admin Login

Admins sign in using their username or email and password.

After successful login, the admin is taken to the dashboard.

### Tenant Login

Tenant accounts are created by the admin when admitting a tenant.

Tenant login details:

- Login ID: tenant email address.
- Initial password: tenant phone number without country code.

Example:

- Full phone number: `+971507180644`
- Country code: `+971`
- Initial password: `507180644`

The tenant should change or reset the password if needed.

### Session Timeout

Sessions are time-limited. If the session expires, the system redirects the user back to login. This protects the account if a browser is left open.

Different browsers or incognito windows create separate sessions.

## 4. Creating A New Independent Owner Admin

Use this when a completely separate owner needs to use the application.

From the login page:

1. Click `Create New Owner Admin`.
2. Enter the owner/admin details.
3. The system checks whether the username is already taken.
4. If the username is available, the system creates a new owner and a new level-0 admin for that owner.
5. The new owner admin signs in using the new account.

This does not give access to another owner's data. For example, a new owner admin cannot see Mohsin_admin data unless they are created under the same owner account.

## 5. Dashboard

The dashboard gives a quick view of the rental business.

Use it to quickly understand:

- Overall rental activity.
- House and partition status.
- Collection and balance highlights.
- Recently changing information.

If dashboard data does not load, the session may have expired or the backend may be temporarily unavailable. Log in again first, then check again.

## 6. Houses

Use Houses to manage the physical properties.

### Add A House

Go to `Houses > Add a House`.

Enter:

- House name.
- Number of rooms.
- Bedrooms per unit.
- Rent amount.
- Number of partitions to create automatically.
- Location.
- Status.
- House photos.

The `Number of Partitions` dropdown can create up to 100 linked partitions at the same time as the house.

Use `0` if you want to create the house first and add partitions later.

### View Houses

Go to `Houses > View Houses`.

The house list shows:

- House name.
- Rooms.
- Bedrooms.
- Rent.
- Location.
- Partition availability.
- Photos.
- Actions.

The status column can be hidden or shown per admin using the column preference control. Preferences are saved to the backend, so each admin keeps their own table layout across devices.

### House Status

A house should be treated as vacant if at least one partition is vacant. It should be treated as occupied only when all partitions are full.

### House Photos

Uploaded house photos are stored on the backend server. In production, images should load from the backend URL, not from the local computer.

## 7. Partitions

Partitions are the rentable units inside a house.

### Add A Partition

Go to `Houses > Add Partition`.

Select the house, enter partition details, rent amount, status, description, facilities, and images if required.

### View Partitions

Go to `Houses > View Partitions`.

Partitions are grouped by house. Expand a house to see its partition list.

The list should show:

- Vacant partitions first.
- Occupied partitions after vacant partitions.
- Partition number/name.
- Rent amount.
- Location.
- Facilities.
- Photos.
- Actions.

### Add Tenant From Partition

Use `Add Tenant` only on vacant partitions. Occupied partitions should not be used for adding another tenant unless the current tenant is moved out or moved to another partition.

## 8. Tenants

Use Tenants to admit, update, move, and manage tenant records.

### Create Tenant

Go to `Tenants > Add Tenant`.

Select:

- House.
- Partition.
- Tenant name.
- Email.
- ID number if available.
- Phone code.
- Phone number without country code.
- Profession.
- Telegram username/chat ID if available.
- Address and home country address.
- Country.
- Start date and expected end date.

After saving, the system creates the tenant record and also creates a tenant login account.

Tenant account rule:

- Username/login ID is the tenant email.
- Initial password is the local phone number without country code.

### View Tenants

Go to `Tenants > View Tenants`.

Use this screen to:

- View tenant stay details.
- See rent and contact information.
- Fetch or assign Telegram chat ID.
- Send Telegram test messages.
- Edit tenant details.
- Delete or move out tenants.

### Edit Tenant And Move Tenant

When editing a tenant, the current linked house and partition should be shown.

If you move a tenant:

- The move must stay within the same owner account.
- The tenant can move to another vacant partition.
- The old partition becomes available after the move.
- The new partition becomes occupied after the move.

### Deleted / Moved Out

Go to `Tenants > Deleted / Moved Out` to review tenants who have been removed or moved out.

## 9. Invoices

Invoices are used to bill tenants for rent and deposit.

### Create Invoice

Go to `Invoices > Add Invoice`.

Select:

- Tenant.
- Invoice month.
- Due date.
- Security deposit if applicable.
- Comment.

The system uses the tenant rent automatically.

Invoice fields should be easy to understand:

- Monthly rent.
- Deposit.
- Total charges.
- Amount received.
- Rent remaining.
- Deposit due.
- Total due.
- Invoice status.

### Invoice Status Logic

The invoice status should explain the real balance:

- `Unpaid`: no payment has been recorded.
- `Partial Paid`: some amount has been paid, but balance is still due.
- `Fully Paid`: rent and deposit due are fully paid.
- `Advance`: tenant paid more than the current invoice balance, and the extra amount is carried forward.

### Deposit And Rent Example

If:

- Monthly rent is AED 500.
- Deposit is AED 1500.
- Tenant paid AED 1500.

Then the invoice should show:

- Monthly rent: AED 500.
- Deposit: AED 1500.
- Rent remaining: AED 500.
- Deposit due: AED 0.
- Total due: AED 500.

This means the tenant paid the deposit but still owes the rent.

### Invoice PDF

Use `Invoice PDF` to open or download the invoice document.

The PDF should be generated from the backend and should not depend on local files.

### Send Telegram

Use `Send Telegram` to send invoice details to the tenant through Telegram.

Telegram sending requires:

- A valid bot token configured in the backend.
- Tenant Telegram chat ID.
- Invoice PDF available from the backend.

If sending fails, first check the tenant chat ID and PDF availability.

## 10. Payments

Payments are used to settle invoice balances.

### Create Payment

Go to `Payments > New Payment`, or click `Make Payment` from an invoice row.

The payment screen shows:

- Tenant ID.
- Deposit due.
- Rent remaining.
- Advance already applied.
- Total outstanding.
- Due date.

Enter the paid amount and payment details.

### Payment Application Rule

Payments are applied in this order:

1. Deposit due.
2. Rent remaining.
3. Extra amount becomes advance credit.

This keeps the tenant ledger clear for both admin and tenant.

### View Payments

Go to `Payments > View Payments` to review all recorded payments and receipts.

Use the receipt link when available to share proof of payment.

## 11. Expenses

Expenses are outgoing costs such as maintenance, repairs, utilities, or other house-related spending.

### Add Expense

Go to `Expenses > Add Expense`.

Enter:

- Expense date.
- Category.
- Amount.
- Title.
- Vendor name.
- House.
- Partition if the expense belongs to a specific partition.
- Notes.
- Attachment/image if available.

Expense images should be stored on the backend server and retrieved from the backend URL in production.

### View Expenses

Go to `Expenses > View Expenses` to review recorded expenses.

Expenses help calculate house-wise and tenant-wise reporting.

## 12. Cheques

Cheques are for outgoing house-related payments only. Use this module for landlord payments, DEWA bills, quarterly payments, yearly payments, or any recurring house payment.

### Create Cheque Plan

Go to `Cheques > Create Cheque Plan`.

Enter:

- House.
- Payment category.
- Party/payee name.
- Frequency.
- First due date.
- Cheque amount.
- Number of cheques.
- Notes.

The system creates scheduled cheque/payable entries from the plan.

### Track Cheques

Go to `Cheques > Track Cheques`.

The screen groups cheques by house and shows tabs such as:

- Coming Cheques.
- Remaining Cheques.
- Paid Cheques.
- History.

Expand a house to view the monthly cheque list.

### Cheque Statuses

Cheque/payment entries can be:

- Unpaid.
- Paid.
- Partially Paid.
- Bounced.
- Rescheduled.

### Record Payment

Use `Record Payment` when a cheque or payable is paid.

Enter:

- Paid amount.
- Paid date.
- Paid rent/payment month.
- Payment mode.
- Cheque number if applicable.
- Reference.
- Notes.

### Paid Cheques

Paid cheque entries should only show an `Edit` action. They should not show `Reschedule`, `Record Payment`, or `Mark Bounced`, because the entry is already paid.

### Reschedule Or Bounce

Use `Reschedule` if the payment date or amount changes.

Use `Mark Bounced` if the cheque bounced and must be tracked separately.

## 13. Reports

Reports help the owner understand the business position.

Use Reports to review:

- Tenant-wise collection.
- House-wise collection.
- Actual earnings.
- Expenses.
- Due amounts.
- Advance balances.
- Fully paid or up-to-date tenants.

### Tenant Payment Logic In Reports

Reports should explain the tenant balance clearly.

Examples:

- If a tenant has generated invoices and has not paid, the report should show the due amount.
- If the tenant paid all due amounts, the report should show `Fully Paid` or `Up to Date`.
- If the tenant paid extra, the report should show the advance balance.
- If advance credit is used against a future invoice, the remaining due should be calculated after applying the advance.

### House-Wise Collection

House-wise collection should group collection by house instead of room. This helps the owner see which property is producing rent and which property has dues or expenses.

## 14. Complaints

Tenants can create complaints, and admins can manage them.

### Tenant Complaint Flow

Tenant can:

- Create a complaint.
- Add a title.
- Add a description.
- Upload images.
- View complaint status.

New complaints start as `Open`.

### Admin Complaint Flow

Admin can change complaint status to:

- Open.
- In Progress.
- Completed.
- Rejected.

Admin can add notes while updating the status.

### Completed Complaints Are Locked

Once a complaint is marked as `Completed`, it cannot be edited again, even by an admin.

If the same issue returns, create a new complaint.

This keeps the complaint history clean and prevents accidental changes after completion.

## 15. Notices

Use Notices to publish information for tenants or users.

Examples:

- Rent reminders.
- Maintenance schedules.
- Building announcements.
- Policy updates.

Tenants can view notices from their account.

## 16. Blog, Messages, Audience, And Subscribers

Admins can use these modules for communication and content management.

### Blog

Use Blog to create posts and manage comments.

### Messages

Use Messages to review user messages or inquiries.

### Subscribers

Use Subscribers to manage audience/subscriber records.

## 17. Locations

Use Locations to manage location options used when creating houses or partitions.

Keep names consistent so reports and filters remain clean.

## 18. Accounts And Admin Users

Use Accounts to manage admin users under an owner account.

### Create Admin

Go to `Accounts > Create Admin`.

Use this when adding staff for the same owner account.

This is different from `Create New Owner Admin` on the login page:

- `Create Admin` creates a user under an existing owner.
- `Create New Owner Admin` creates a separate owner and separate owner admin.

### Owner Privacy

Admins under Owner 1 should not access Owner 2 data.

If an admin must see Mohsin_admin data, create that admin under the same owner as Mohsin_admin. Do not create a separate owner admin for that person.

## 19. Settings

Use Settings for account-level changes.

Depending on access, this may include user profile settings and related account preferences.

## 20. Tools

Tools contains admin utility actions. Use this screen carefully because tools may affect data or system behavior.

## 21. Telegram Setup For Tenants

Telegram features require the tenant to message the bot first.

Recommended flow:

1. Tenant opens Telegram.
2. Tenant sends a message to the rental bot.
3. Admin opens `Tenants > View Tenants`.
4. Admin clicks `Find Recent Chat` or `Fetch Chat ID`.
5. Admin assigns the correct chat to the tenant.
6. Admin clicks `Send Test`.
7. If the test succeeds, invoices can be sent through Telegram.

If no recent chat is found, ask the tenant to send a new message to the bot and try again.

## 22. Common Daily Workflow

For a new property:

1. Create the house.
2. Choose the number of partitions to auto-create, or create partitions manually.
3. Upload house and partition photos if needed.
4. Review partitions and confirm vacant status.
5. Add tenant from a vacant partition.
6. Share tenant login email and initial password.
7. Create monthly invoice.
8. Record payment when received.
9. Review reports for dues, advance, and collection.

For monthly rent collection:

1. Open active tenants.
2. Create invoices for the month.
3. Send invoice PDFs or Telegram messages.
4. Record payments.
5. Check remaining balances.
6. Review tenant-wise and house-wise reports.

For outgoing house payments:

1. Create cheque plan for landlord, DEWA, or other house-related payments.
2. Track upcoming cheques.
3. Record paid entries when paid.
4. Reschedule or mark bounced if needed.
5. Review cheque history.

## 23. Troubleshooting

### I was logged out automatically

Your session may have expired. Log in again.

### Dashboard or page data could not load

Possible reasons:

- Session expired.
- Internet issue.
- Backend service is restarting.
- Database service is unavailable.
- The account does not have permission for that page.

Try logging in again first.

### I see Unauthorized or 401 errors

This usually means the session is missing or expired. Log out, log in again, and retry.

### Image does not show

Images must be uploaded to the backend and loaded from the backend URL. Images stored only on a local computer will not be visible on Render production.

### Invoice PDF says Not Found

The frontend may be opening the wrong origin, or the backend document route may be unavailable. The PDF should open from the backend service URL.

### Telegram message failed

Check:

- Tenant has a Telegram chat ID.
- Tenant messaged the bot first.
- Bot token is configured.
- Invoice PDF exists.

### Tenant cannot log in

Check:

- Tenant email is correct.
- Initial password is the phone number without country code.
- Tenant account was created by admin through Create Tenant.
- If forgotten, use password reset.

## 24. Good Data Entry Practices

- Use consistent house names.
- Use clear partition numbers.
- Keep tenant email unique and correct.
- Enter phone numbers without country code in the phone number field.
- Upload clear images.
- Record payments immediately when received.
- Use notes for special cases such as partial payment, bounce, or reschedule.
- Do not edit completed complaints; create a new complaint if needed.
- Keep owner accounts separate when data privacy is required.

## 25. Key Rules To Remember

- One property belongs to one owner only.
- Different owners cannot see each other's data.
- Tenant accounts are created by admin only.
- Tenant initial password is local phone number without country code.
- Payments apply to deposit first, then rent, then advance.
- Completed complaints are locked.
- Paid cheques only allow editing the paid entry.
- Render production must use hosted backend/database/uploads, not local XAMPP or local files.
