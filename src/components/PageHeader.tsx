import { Breadcrumb, Space, Typography } from 'antd'
import type { ReactNode } from 'react'

type PageHeaderProps = {
  title: string
  subtitle?: string
  breadcrumbs?: Array<{ title: ReactNode }>
  extra?: ReactNode
}

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  extra,
}: PageHeaderProps) {
  return (
    <div className="page-header-card">
      <div>
        {breadcrumbs?.length ? (
          <Breadcrumb items={breadcrumbs} style={{ marginBottom: 12 }} />
        ) : null}
        <Typography.Title level={2} style={{ marginBottom: 6 }}>
          {title}
        </Typography.Title>
        {subtitle ? (
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            {subtitle}
          </Typography.Paragraph>
        ) : null}
      </div>
      {extra ? <Space>{extra}</Space> : null}
    </div>
  )
}
