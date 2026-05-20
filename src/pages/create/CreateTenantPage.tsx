import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Alert, Button, Card, Form, Input, Select, Space, Spin } from 'antd'
import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import { getApiErrorMessage } from '../../lib/api-errors'
import { http } from '../../lib/http'
import { useFormOptions } from './useFormOptions'

type TenantFormRow = {
  tname: string
  temail: string
  idnum?: string
  phone_code: string
  phone_local?: string
  prof?: string
  telegram_username?: string
  telegram_chat_id?: string
  tenant_address?: string
  tenant_home_country_address?: string
  tenant_country: string
  start_date: string
  end_date?: string
}

type CreateTenantValues = {
  house: string
  partition_id: number
  tenants: TenantFormRow[]
}

export function CreateTenantPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const { data, isLoading } = useFormOptions()
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const initialHouseValue = searchParams.get('house_id') ?? ''
  const initialPartitionId = searchParams.get('partition_id')
  const [houseValue, setHouseValue] = useState<string>(initialHouseValue)
  const mutation = useMutation({
    mutationFn: (values: CreateTenantValues) => http.post('/create/tenant.php', values),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['form-options'] }),
        queryClient.invalidateQueries({ queryKey: ['tenants'] }),
        queryClient.invalidateQueries({ queryKey: ['houses'] }),
        queryClient.invalidateQueries({ queryKey: ['partitions'] }),
      ])
      setError('')
      setMessage('Tenant saved successfully.')
      setTimeout(() => navigate('/tenants'), 600)
    },
    onError: (err: unknown) => {
      setMessage('')
      setError(getApiErrorMessage(err, 'Tenant could not be saved.'))
    },
  })

  const partitionOptions = useMemo(() => {
    const houseId = Number(houseValue || 0)
    return (data?.partitions ?? []).filter((partition) => partition.house_id === houseId)
  }, [data?.partitions, houseValue])

  if (isLoading) return <Card><div className="page-loader"><Spin size="large" /></div></Card>

  return (
    <div className="page-stack">
      <PageHeader title="Create Tenant" subtitle="Admit one or more tenants into a selected partition." breadcrumbs={[{ title: 'Dashboard' }, { title: 'Create Tenant' }]} />
      <Card>
        {message ? <Alert type="success" showIcon message={message} style={{ marginBottom: 16 }} /> : null}
        {error ? <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} /> : null}
        <Form<CreateTenantValues> layout="vertical" onFinish={(values) => mutation.mutate(values)} initialValues={{ house: initialHouseValue || undefined, partition_id: initialPartitionId ? Number(initialPartitionId) : undefined, tenants: [{ phone_code: data?.defaultPhoneCode, tenant_country: data?.defaultCountry }] }}>
          <Form.Item label="House" name="house" rules={[{ required: true }]}><Select onChange={(value) => setHouseValue(String(value))} options={(data?.houses ?? []).map((house) => ({ label: house.house_name, value: String(house.houseID) }))} /></Form.Item>
          <Form.Item label="Partition" name="partition_id" rules={[{ required: true }]}><Select options={partitionOptions.map((partition) => ({ label: `${partition.house_name} - ${partition.partition_number} (Rent: ${partition.rent_amount}, ${partition.partition_status})`, value: partition.partition_id }))} /></Form.Item>
          <Form.List name="tenants">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <Card key={field.key} type="inner" title={`Tenant ${index + 1}`} style={{ marginBottom: 16 }}>
                    <Form.Item {...field} label="Tenant Name" name={[field.name, 'tname']} rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item {...field} label="Email" name={[field.name, 'temail']} rules={[{ required: true, type: 'email' }]}><Input /></Form.Item>
                    <Form.Item {...field} label="ID Number" name={[field.name, 'idnum']}><Input /></Form.Item>
                    <Space style={{ display: 'flex' }} align="start">
                      <Form.Item {...field} label="Phone Code" name={[field.name, 'phone_code']} rules={[{ required: true }]}><Select style={{ width: 220 }} options={(data?.countries ?? []).map((country) => ({ label: `${country.code} ${country.name}`, value: country.code }))} /></Form.Item>
                      <Form.Item {...field} label="Phone Number" name={[field.name, 'phone_local']}><Input /></Form.Item>
                    </Space>
                    <Form.Item {...field} label="Profession" name={[field.name, 'prof']}><Input /></Form.Item>
                    <Form.Item {...field} label="Telegram Username" name={[field.name, 'telegram_username']}><Input /></Form.Item>
                    <Form.Item {...field} label="Telegram Chat ID" name={[field.name, 'telegram_chat_id']}><Input /></Form.Item>
                    <Form.Item {...field} label="Address" name={[field.name, 'tenant_address']}><Input /></Form.Item>
                    <Form.Item {...field} label="Home Country Address" name={[field.name, 'tenant_home_country_address']}><Input /></Form.Item>
                    <Form.Item {...field} label="Country" name={[field.name, 'tenant_country']} rules={[{ required: true }]}><Select options={(data?.countries ?? []).map((country) => ({ label: country.name, value: country.name }))} /></Form.Item>
                    <Form.Item {...field} label="Start Date" name={[field.name, 'start_date']} rules={[{ required: true }]}><Input type="date" /></Form.Item>
                    <Form.Item {...field} label="Expected End Date" name={[field.name, 'end_date']}><Input type="date" /></Form.Item>
                    {fields.length > 1 ? <Button danger onClick={() => remove(field.name)}>Remove Tenant</Button> : null}
                  </Card>
                ))}
                <Button onClick={() => add({ phone_code: data?.defaultPhoneCode, tenant_country: data?.defaultCountry })}>Add Another Tenant</Button>
              </>
            )}
          </Form.List>
          <div style={{ marginTop: 16 }}><Button htmlType="submit" loading={mutation.isPending} type="primary">Admit Tenant(s)</Button></div>
        </Form>
      </Card>
    </div>
  )
}
