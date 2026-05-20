# Rental Management Frontend

React + TypeScript + Vite frontend for the existing PHP rental management backend.

## Stack

- React
- TypeScript
- Vite
- Ant Design
- React Router
- React Query
- Axios

## Current migration slice

- Login
- Dashboard
- Houses
- Tenants

The backend logic still lives in the PHP app at:

`D:\Personal\RM\Rental-house-management-system`

The React app talks to JSON endpoints under:

`/api/admin`

## Setup

1. Copy `.env.example` to `.env`
2. Confirm the PHP app is running in XAMPP at:
   `http://localhost/Rental-house-management-system`
3. Install dependencies:

```bash
npm install
```

4. Start the frontend:

```bash
npm run dev
```

Default Vite URL:

`http://localhost:5173`

## Local XAMPP config

Use this `.env` for the PHP backend in XAMPP:

```bash
VITE_API_BASE_URL=/api/admin
VITE_PHP_BASE_URL=http://localhost/Rental-house-management-system
```

Vite will proxy `/api/admin` and `/uploads` to the PHP app, which keeps session cookies working during local development.

## Optional Node backend config

If you want to test against the separate Node backend instead of XAMPP, copy `.env.node-backend.example` to `.env`.

## Notes

- Authentication currently uses the existing PHP session/cookie flow.
- The PHP backend now exposes JSON endpoints for auth, session, dashboard, houses, and tenants.
- This is the first migration slice. CRUD modals, invoices, payments, complaints, and the remaining admin screens can be moved next.
