import { useMutation } from '@tanstack/react-query'
import { Alert, Button, Card, Form, Input, InputNumber, Select, Upload } from 'antd'
import type { UploadFile } from 'antd'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import { getApiErrorMessage } from '../../lib/api-errors'
import { http } from '../../lib/http'

type CreateHouseValues = {
  hname: string
  numOfRooms: number
  numOfbRooms: number
  rent: number
  location: string
  status: string
  house_photos?: UploadFile[]
}

export function CreateHousePage() {
  const navigate = useNavigate()
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const mutation = useMutation({
    mutationFn: async (values: CreateHouseValues) => {
      const formData = new FormData()
      formData.append('hname', values.hname)
      formData.append('numOfRooms', String(values.numOfRooms))
      formData.append('numOfbRooms', String(values.numOfbRooms))
      formData.append('rent', String(values.rent))
      formData.append('location', values.location)
      formData.append('status', values.status)
      ;(values.house_photos ?? []).forEach((file) => {
        if (file.originFileObj) formData.append('house_photos[]', file.originFileObj)
      })
      const { data } = await http.post('/create/house.php', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      return data
    },
    onSuccess: () => {
      setError('')
      setMessage('House created successfully.')
      setTimeout(() => navigate('/houses'), 600)
    },
    onError: (err: unknown) => {
      setMessage('')
      setError(getApiErrorMessage(err, 'House could not be created.'))
    },
  })

  return (
    <div className="page-stack">
      <PageHeader title="Create House" subtitle="React replacement for the legacy house form." breadcrumbs={[{ title: 'Dashboard' }, { title: 'Create House' }]} />
      <Card>
        {message ? <Alert type="success" showIcon message={message} style={{ marginBottom: 16 }} /> : null}
        {error ? <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} /> : null}
        <Form<CreateHouseValues> layout="vertical" onFinish={(values) => mutation.mutate(values)}>
          <Form.Item label="House Name" name="hname" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="Number of Rooms" name="numOfRooms" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
          <Form.Item label="Bedrooms Per Unit" name="numOfbRooms" rules={[{ required: true }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item label="Rent Amount" name="rent" rules={[{ required: true }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item label="Location" name="location" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="Status" name="status" initialValue="Vacant" rules={[{ required: true }]}><Select options={[{ label: 'Vacant', value: 'Vacant' }, { label: 'Occupied', value: 'Occupied' }]} /></Form.Item>
          <Form.Item label="House Photos" name="house_photos" valuePropName="fileList" getValueFromEvent={(e: { fileList: UploadFile[] }) => e?.fileList}><Upload multiple beforeUpload={() => false} listType="text"><Button>Choose Files</Button></Upload></Form.Item>
          <Button htmlType="submit" loading={mutation.isPending} type="primary">Save House</Button>
        </Form>
      </Card>
    </div>
  )
}
