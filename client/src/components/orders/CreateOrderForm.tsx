import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormItem, FormMessage } from '@/components/ui/form'


import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { Plus, Trash2, MapPin } from 'lucide-react'
import { PACKAGE_TYPES } from '@/lib/constants'
import { MapPicker } from '@/components/shared/MapPicker'
import type { CreateOrderPayload } from '@/types/order'

const orderSchema = z.object({
  pickupAddress: z.string().min(4, 'Pickup address is required'),
  pickupLat: z.string().refine((v) => !isNaN(Number(v)), 'Required'),
  pickupLng: z.string().refine((v) => !isNaN(Number(v)), 'Required'),
  deliveryAddress: z.string().min(4, 'Delivery address is required'),
  deliveryLat: z.string().refine((v) => !isNaN(Number(v)), 'Required'),
  deliveryLng: z.string().refine((v) => !isNaN(Number(v)), 'Required'),
  packageType: z.string().optional(),
  weight: z.string().optional(),
  description: z.string().optional(),
  items: z.array(z.object({
    name: z.string().min(1, 'Item name is required'),
    quantity: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Qty must be > 0'),
    price: z.string().optional(),
  })).min(1, 'At least one item is required'),
  isCOD: z.boolean().optional(),
  codAmount: z.string().optional(),
})

type OrderFormData = z.infer<typeof orderSchema>

interface CreateOrderFormProps {
  onSubmit: (data: CreateOrderPayload) => Promise<void>
  isSubmitting?: boolean
}

export function CreateOrderForm({ onSubmit, isSubmitting }: CreateOrderFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [pickupPickerOpen, setPickupPickerOpen] = useState(false)
  const [deliveryPickerOpen, setDeliveryPickerOpen] = useState(false)

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      items: [{ name: '', quantity: '1', price: '' }],
      isCOD: false,
    },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' })

  const handleSubmit = async (data: OrderFormData) => {
    setError(null)
    try {
      const payload: CreateOrderPayload = {
        pickupLocation: {
          address: data.pickupAddress,
          coordinates: [Number(data.pickupLng), Number(data.pickupLat)],
        },
        deliveryLocation: {
          address: data.deliveryAddress,
          coordinates: [Number(data.deliveryLng), Number(data.deliveryLat)],
        },
        packageDetails: {
          weight: data.weight ? Number(data.weight) : undefined,
          description: data.description || undefined,
          packageType: data.packageType || undefined,
        },
        items: data.items.map((item) => ({
          name: item.name,
          quantity: Number(item.quantity),
          price: item.price ? Number(item.price) : undefined,
        })),
        isCOD: data.isCOD || false,
        codAmount: data.isCOD && data.codAmount ? Number(data.codAmount) : undefined,
      }
      await onSubmit(payload)
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      setError(axiosError?.response?.data?.message || 'Failed to create order')
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      <div className="space-y-4">
        <h3 className="font-semibold">Pickup Location</h3>
        <FormItem>
          <Label htmlFor="pickupAddress">Address</Label>
          <Input id="pickupAddress" {...form.register('pickupAddress')} placeholder="Enter pickup address" />
          {form.formState.errors.pickupAddress && <FormMessage>{form.formState.errors.pickupAddress.message}</FormMessage>}
        </FormItem>
        <div className="grid grid-cols-2 gap-4">
          <FormItem>
            <Label htmlFor="pickupLat">Latitude</Label>
            <Input id="pickupLat" {...form.register('pickupLat')} placeholder="27.7172" />
            {form.formState.errors.pickupLat && <FormMessage>{form.formState.errors.pickupLat.message}</FormMessage>}
          </FormItem>
          <FormItem>
            <Label htmlFor="pickupLng">Longitude</Label>
            <Input id="pickupLng" {...form.register('pickupLng')} placeholder="85.3240" />
            {form.formState.errors.pickupLng && <FormMessage>{form.formState.errors.pickupLng.message}</FormMessage>}
          </FormItem>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => setPickupPickerOpen(!pickupPickerOpen)}>
          <MapPin className="mr-2 h-4 w-4" />
          Pick on Map
        </Button>
        {pickupPickerOpen && (
          <MapPicker
            position={
              form.watch('pickupLat') && form.watch('pickupLng')
                ? [Number(form.watch('pickupLat')), Number(form.watch('pickupLng'))]
                : null
            }
            onChange={([lat, lng]) => {
              form.setValue('pickupLat', String(lat))
              form.setValue('pickupLng', String(lng))
            }}
          />
        )}
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">Delivery Location</h3>
        <FormItem>
          <Label htmlFor="deliveryAddress">Address</Label>
          <Input id="deliveryAddress" {...form.register('deliveryAddress')} placeholder="Enter delivery address" />
          {form.formState.errors.deliveryAddress && <FormMessage>{form.formState.errors.deliveryAddress.message}</FormMessage>}
        </FormItem>
        <div className="grid grid-cols-2 gap-4">
          <FormItem>
            <Label htmlFor="deliveryLat">Latitude</Label>
            <Input id="deliveryLat" {...form.register('deliveryLat')} placeholder="27.7172" />
            {form.formState.errors.deliveryLat && <FormMessage>{form.formState.errors.deliveryLat.message}</FormMessage>}
          </FormItem>
          <FormItem>
            <Label htmlFor="deliveryLng">Longitude</Label>
            <Input id="deliveryLng" {...form.register('deliveryLng')} placeholder="85.3240" />
            {form.formState.errors.deliveryLng && <FormMessage>{form.formState.errors.deliveryLng.message}</FormMessage>}
          </FormItem>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => setDeliveryPickerOpen(!deliveryPickerOpen)}>
          <MapPin className="mr-2 h-4 w-4" />
          Pick on Map
        </Button>
        {deliveryPickerOpen && (
          <MapPicker
            position={
              form.watch('deliveryLat') && form.watch('deliveryLng')
                ? [Number(form.watch('deliveryLat')), Number(form.watch('deliveryLng'))]
                : null
            }
            onChange={([lat, lng]) => {
              form.setValue('deliveryLat', String(lat))
              form.setValue('deliveryLng', String(lng))
            }}
          />
        )}
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">Package Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <FormItem>
            <Label htmlFor="packageType">Package Type</Label>
            <select
              id="packageType"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
              onChange={(e) => form.setValue('packageType', e.target.value)}
            >
              <option value="">Select type</option>
              {PACKAGE_TYPES.map((pt) => (
                <option key={pt} value={pt}>{pt.charAt(0) + pt.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </FormItem>
          <FormItem>
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input id="weight" type="number" step="0.1" {...form.register('weight')} placeholder="0.5" />
          </FormItem>
        </div>
        <FormItem>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" {...form.register('description')} placeholder="Package description..." />
        </FormItem>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Items</h3>
          <Button type="button" variant="outline" size="sm" onClick={() => append({ name: '', quantity: '1', price: '' })}>
            <Plus className="mr-1 h-4 w-4" /> Add Item
          </Button>
        </div>
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-end gap-2 rounded-md border p-3">
            <FormItem className="flex-1">
              <Label className="text-xs">Name</Label>
              <Input {...form.register(`items.${index}.name`)} placeholder="Item name" />
            </FormItem>
            <FormItem className="w-20">
              <Label className="text-xs">Qty</Label>
              <Input type="number" {...form.register(`items.${index}.quantity`)} placeholder="1" />
            </FormItem>
            <FormItem className="w-24">
              <Label className="text-xs">Price</Label>
              <Input type="number" step="0.01" {...form.register(`items.${index}.price`)} placeholder="0" />
            </FormItem>
            {fields.length > 1 && (
              <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        ))}
        {form.formState.errors.items && <FormMessage>{form.formState.errors.items.message || form.formState.errors.items.root?.message}</FormMessage>}
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">Payment</h3>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...form.register('isCOD')} className="rounded" />
          Cash on Delivery
        </label>
        {form.watch('isCOD') && (
          <FormItem>
            <Label htmlFor="codAmount">COD Amount</Label>
            <Input id="codAmount" type="number" step="0.01" {...form.register('codAmount')} placeholder="Enter amount" />
            {form.formState.errors.codAmount && <FormMessage>{form.formState.errors.codAmount.message}</FormMessage>}
          </FormItem>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Creating Order...' : 'Create Order'}
      </Button>
    </form>
  )
}
