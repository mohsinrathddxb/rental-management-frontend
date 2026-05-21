import { useMutation } from '@tanstack/react-query'
import { Alert, Button, Card, Checkbox, Form, Input, InputNumber, Select, Spin, Upload } from 'antd'
import type { UploadFile } from 'antd'
import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import { getApiErrorMessage } from '../../lib/api-errors'
import { http } from '../../lib/http'
import { useFormOptions } from './useFormOptions'

type CreatePartitionValues = {
  house_id: number
  partition_number: string
  rent_amount: number
  partition_status: string
  description?: string
  facilities?: string[]
  house_photos?: UploadFile[]
}

export function CreatePartitionPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedHouseId = Number(searchParams.get('house_id') ?? 0) || undefined
  const { data, isLoading } = useFormOptions()
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const initialValues = useMemo<Partial<CreatePartitionValues>>(
    () => ({
      house_id: preselectedHouseId ?? 0,
      partition_status: 'Vacant',
      facilities: [],
    }),
    [preselectedHouseId],
  )

  const mutation = useMutation({
    mutationFn: async (values: CreatePartitionValues) => {
      const formData = new FormData()
      formData.append('house_id', String(values.house_id))
      formData.append('partition_number', values.partition_number)
      formData.append('rent_amount', String(values.rent_amount))
      formData.append('partition_status', values.partition_status)
      formData.append('description', values.description ?? '')
      ;(values.facilities ?? []).forEach((facility) => formData.append('facilities[]', facility))
      ;(values.house_photos ?? []).forEach((file) => {
        if (file.originFileObj) {
          formData.append('house_photos[]', file.originFileObj)
        }
      })
      const { data: response } = await http.post('/create/partition', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response
    },
    onSuccess: (_, values) => {
      setError('')
      setMessage('Partition created successfully.')
      const target = values.house_id ? `/partitions?house_id=${encodeURIComponent(String(values.house_id))}` : '/partitions'
      setTimeout(() => navigate(target), 600)
    },
    onError: (err: unknown) => {
      setMessage('')
      setError(getApiErrorMessage(err, 'Partition could not be created.'))
    },
  })

  if (isLoading) {
    return (
      <Card>
        <div className="page-loader">
          <Spin size="large" />
        </div>
      </Card>
    )
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Create Partition"
        subtitle="Add a house partition with facilities, status, rent, and optional photos."
        breadcrumbs={[{ title: 'Dashboard' }, { title: 'Create Partition' }]}
      />
      <Card>
        {message ? <Alert type="success" showIcon message={message} style={{ marginBottom: 16 }} /> : null}
        {error ? <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} /> : null}
        <Form<CreatePartitionValues>
          layout="vertical"
          initialValues={initialValues}
          onFinish={(values) => mutation.mutate(values)}
        >
          <Form.Item label="House" name="house_id" rules={[{ required: true }]}>
            <Select
              options={(data?.houses ?? []).map((house) => ({
                label: `${house.house_name} - ${house.location}`,
                value: house.houseID,
              }))}
            />
          </Form.Item>
          <Form.Item label="Partition Number / Name" name="partition_number" rules={[{ required: true }]}>
            <Input placeholder="e.g. P1 or Room A" />
          </Form.Item>
          <Form.Item label="Rent Amount" name="rent_amount" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Status" name="partition_status" rules={[{ required: true }]}>
            <Select
              options={[
                { label: 'Vacant', value: 'Vacant' },
                { label: 'Occupied', value: 'Occupied' },
              ]}
            />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input placeholder="Optional note" />
          </Form.Item>
          <Form.Item label="Facilities" name="facilities">
            <Checkbox.Group
              options={(data?.partition_facilities ?? []).map((value) => ({
                label: value,
                value,
              }))}
            />
          </Form.Item>
          <Form.Item
            label="Partition Photos"
            name="house_photos"
            valuePropName="fileList"
            getValueFromEvent={(event: { fileList?: UploadFile[] } | undefined) => event?.fileList ?? []}
          >
            <Upload beforeUpload={() => false} listType="text" multiple>
              <Button>Choose Files</Button>
            </Upload>
          </Form.Item>
          <Button htmlType="submit" loading={mutation.isPending} type="primary">
            Add Partition
          </Button>
        </Form>
      </Card>
    </div>
  )
}
