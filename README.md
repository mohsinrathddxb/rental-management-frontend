# Rental Management Frontend

React + TypeScript + Vite frontend for the Node rental management backend.

## Stack

- React
- TypeScript
- Vite
- Ant Design
- React Router
- React Query
- Axios

## Current app

The deployed frontend talks to the Node backend through `/api/admin` routes and backend-hosted `/uploads` assets.

## Setup

1. Copy `.env.example` to `.env`
2. Confirm the Node backend is running locally at:
   `http://localhost:4000`
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

## Local Node config

Use `.env.example` for local development against the Node backend.

If you want a direct copy helper, `.env.node-backend.example` contains the same local backend base URLs.

## Render config

Use `.env.render.example` as the reference for Render environment variables:

- `VITE_API_BASE_URL=https://your-backend.onrender.com/api/admin`
- `VITE_BACKEND_ORIGIN=https://your-backend.onrender.com`
- `VITE_ASSET_BASE_URL=https://your-backend.onrender.com`

## Notes

- Local and Render must use different `.env` values.
- Render should never depend on local file paths or local MySQL/XAMPP.
- Backend documents and uploads should always resolve from the backend origin in production.
