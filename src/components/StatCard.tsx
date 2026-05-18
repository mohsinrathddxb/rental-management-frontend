import { Card, Statistic, Typography } from 'antd'
import type { ReactNode } from 'react'

type StatCardProps = {
  title: string
  value: string | number
  prefix?: ReactNode
  suffix?: ReactNode
  accentClassName?: string
  helpText?: string
}

export function StatCard({
  title,
  value,
  prefix,
  suffix,
  accentClassName,
  helpText,
}: StatCardProps) {
  return (
    <Card className={`stat-card ${accentClassName ?? ''}`}>
      <Statistic title={title} value={value} prefix={prefix} suffix={suffix} />
      {helpText ? (
        <Typography.Text type="secondary">{helpText}</Typography.Text>
      ) : null}
    </Card>
  )
}
