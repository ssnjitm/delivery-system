import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormItem, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { useState } from 'react'
import {
  Plus,
  Trash2,
  MapPin,
  ArrowLeft,
  ArrowRight,
  ArrowLeftRight,
  Package,
  PackageCheck,
  Check,
  Navigation,
  FileCheck,
  CreditCard,
  Map,
} from 'lucide-react'
import { PACKAGE_TYPES } from '@/lib/constants'
import { MapPicker } from '@/components/shared/MapPicker'
import { cn } from '@/lib/utils'
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

const STEPS = [
  { title: 'Locations', icon: Map },
  { title: 'Package', icon: Package },
  { title: 'Payment', icon: CreditCard },
] as const

interface CreateOrderFormProps {
  onSubmit: (data: CreateOrderPayload) => Promise<void>
  isSubmitting?: boolean
}

export function CreateOrderForm({ onSubmit, isSubmitting }: CreateOrderFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState(0)
  const [activePicker, setActivePicker] = useState<'pickup' | 'delivery' | null>(null)

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    mode: 'onTouched',
    defaultValues: {
      items: [{ name: '', quantity: '1', price: '' }],
      isCOD: false,
    },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' })

  const stepZones: (keyof OrderFormData)[][] = [
    ['pickupAddress', 'pickupLat', 'pickupLng', 'deliveryAddress', 'deliveryLat', 'deliveryLng'],
    ['packageType', 'weight', 'description', 'items'],
    ['isCOD', 'codAmount'],
  ] as never

  const goNext = async () => {
    const fieldsOk = await form.trigger(stepZones[step] as never)
    if (!fieldsOk) return
    setError(null)
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  const goBack = () => {
    setActivePicker(null)
    setStep((s) => Math.max(s - 1, 0))
  }

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

  const setLatLng = (target: 'pickupLat' | 'deliveryLat', lat: number, lng: number) => {
    const isPickup = target === 'pickupLat'
    form.setValue(isPickup ? 'pickupLat' : 'deliveryLat', String(lat), { shouldValidate: true })
    form.setValue(isPickup ? 'pickupLng' : 'deliveryLng', String(lng), { shouldValidate: true })
  }

  const swapLocations = () => {
    const pAddr = form.getValues('pickupAddress')
    const dAddr = form.getValues('deliveryAddress')
    const pLat = form.getValues('pickupLat')
    const pLng = form.getValues('pickupLng')
    const dLat = form.getValues('deliveryLat')
    const dLng = form.getValues('deliveryLng')

    form.setValue('pickupAddress', dAddr, { shouldDirty: true })
    form.setValue('deliveryAddress', pAddr, { shouldDirty: true })
    if (dLat && dLng) setLatLng('pickupLat', Number(dLat), Number(dLng))
    if (pLat && pLng) setLatLng('deliveryLat', Number(pLat), Number(pLng))
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive animate-scale-in">
          {error}
        </div>
      )}

      {/* Stepper */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => {
          const active = i === step
          const done = i < step
          return (
            <div key={s.title} className="flex flex-1 items-center gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border font-semibold transition-all',
                    active && 'border-brand-500 bg-brand-500 text-white shadow-brand',
                    done && 'border-brand-500 bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
                    !active && !done && 'border-border bg-card text-muted-foreground'
                  )}
                >
                  {done ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
                </span>
                <span
                  className={cn(
                    'hidden text-sm font-semibold sm:block',
                    active ? 'text-foreground' : done ? 'text-brand-700 dark:text-brand-300' : 'text-muted-foreground'
                  )}
                >
                  {s.title}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    'h-px flex-1 transition-colors',
                    done ? 'bg-brand-500' : 'bg-border'
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* ── STEP 1 · LOCATIONS ─────────────── */}
      {step === 0 && (
        <div className="grid gap-6 md:grid-cols-2 animate-fade-in">
          {/* Pickup */}
          <Card className="border-border shadow-card">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-heading font-bold">Pickup</p>
                  <p className="text-xs text-muted-foreground">Where will the driver collect?</p>
                </div>
              </div>

              <FormItem>
                <Label htmlFor="pickupAddress">Address</Label>
                <Input id="pickupAddress" {...form.register('pickupAddress')} placeholder="e.g. Gulberg III, Lahore" />
                {form.formState.errors.pickupAddress && (
                  <FormMessage>{form.formState.errors.pickupAddress.message}</FormMessage>
                )}
              </FormItem>

              <div className="grid grid-cols-2 gap-3">
                <FormItem>
                  <Label htmlFor="pickupLat">Latitude</Label>
                  <Input id="pickupLat" {...form.register('pickupLat')} placeholder="31.5204" />
                  {form.formState.errors.pickupLat && (
                    <FormMessage>{form.formState.errors.pickupLat.message}</FormMessage>
                  )}
                </FormItem>
                <FormItem>
                  <Label htmlFor="pickupLng">Longitude</Label>
                  <Input id="pickupLng" {...form.register('pickupLng')} placeholder="74.3436" />
                  {form.formState.errors.pickupLng && (
                    <FormMessage>{form.formState.errors.pickupLng.message}</FormMessage>
                  )}
                </FormItem>
              </div>

              <Button
                type="button"
                variant={activePicker === 'pickup' ? 'default' : 'outline'}
                className="w-full"
                size="sm"
                onClick={() => setActivePicker(activePicker === 'pickup' ? null : 'pickup')}
              >
                <MapPin className="mr-2 h-4 w-4" />
                {activePicker === 'pickup' ? 'Close Map' : 'Pick on Map'}
              </Button>

              {activePicker === 'pickup' && (
                <MapPicker
                  position={
                    form.watch('pickupLat') && form.watch('pickupLng')
                      ? [Number(form.watch('pickupLat')), Number(form.watch('pickupLng'))]
                      : null
                  }
                  onChange={([lat, lng]) => setLatLng('pickupLat', lat, lng)}
                  height="220px"
                />
              )}
            </CardContent>
          </Card>

          {/* Delivery */}
          <Card className="border-border shadow-card">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-heading font-bold">Delivery</p>
                    <p className="text-xs text-muted-foreground">Where should it go?</p>
                  </div>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={swapLocations} title="Swap">
                  <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>

              <FormItem>
                <Label htmlFor="deliveryAddress">Address</Label>
                <Input id="deliveryAddress" {...form.register('deliveryAddress')} placeholder="e.g. DHA Phase 5, Lahore" />
                {form.formState.errors.deliveryAddress && (
                  <FormMessage>{form.formState.errors.deliveryAddress.message}</FormMessage>
                )}
              </FormItem>

              <div className="grid grid-cols-2 gap-3">
                <FormItem>
                  <Label htmlFor="deliveryLat">Latitude</Label>
                  <Input id="deliveryLat" {...form.register('deliveryLat')} placeholder="31.4761" />
                  {form.formState.errors.deliveryLat && (
                    <FormMessage>{form.formState.errors.deliveryLat.message}</FormMessage>
                  )}
                </FormItem>
                <FormItem>
                  <Label htmlFor="deliveryLng">Longitude</Label>
                  <Input id="deliveryLng" {...form.register('deliveryLng')} placeholder="74.2600" />
                  {form.formState.errors.deliveryLng && (
                    <FormMessage>{form.formState.errors.deliveryLng.message}</FormMessage>
                  )}
                </FormItem>
              </div>

              <Button
                type="button"
                variant={activePicker === 'delivery' ? 'default' : 'outline'}
                className="w-full"
                size="sm"
                onClick={() => setActivePicker(activePicker === 'delivery' ? null : 'delivery')}
              >
                <MapPin className="mr-2 h-4 w-4" />
                {activePicker === 'delivery' ? 'Close Map' : 'Pick on Map'}
              </Button>

              {activePicker === 'delivery' && (
                <MapPicker
                  position={
                    form.watch('deliveryLat') && form.watch('deliveryLng')
                      ? [Number(form.watch('deliveryLat')), Number(form.watch('deliveryLng'))]
                      : null
                  }
                  onChange={([lat, lng]) => setLatLng('deliveryLat', lat, lng)}
                  height="220px"
                />
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── STEP 2 · PACKAGE ──────────────── */}
      {step === 1 && (
        <div className="space-y-6 animate-fade-in">
          {/* Package type chips */}
          <div>
            <Label className="mb-3 block">Package type</Label>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {PACKAGE_TYPES.map((pt) => {
                const selected = form.watch('packageType') === pt
                return (
                  <button
                    key={pt}
                    type="button"
                    onClick={() => form.setValue('packageType', pt, { shouldDirty: true })}
                    className={cn(
                      'flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all',
                      selected
                        ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-brand dark:bg-brand-500/15 dark:text-brand-300'
                        : 'border-border bg-card text-muted-foreground hover:border-brand-300 hover:text-foreground'
                    )}
                  >
                    {selected && <Check className="h-4 w-4" />}
                    {pt.charAt(0) + pt.slice(1).toLowerCase()}
                  </button>
                )
              })}
            </div>
          </div>

          <Card className="border-border shadow-card">
            <CardContent className="space-y-4 p-5">
              <div className="grid grid-cols-2 gap-4">
                <FormItem>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input id="weight" type="number" step="0.1" {...form.register('weight')} placeholder="0.5" />
                </FormItem>
                <FormItem>
                  <Label htmlFor="items-estimate">Estimated items</Label>
                  <div className="flex h-11 items-center gap-2 rounded-xl border border-dashed border-border bg-card px-4 text-sm text-muted-foreground">
                    <PackageCheck className="h-4 w-4" />
                    {fields.length} item(s) added
                  </div>
                </FormItem>
              </div>
              <FormItem>
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea id="description" {...form.register('description')} placeholder="Attach a note for the driver e.g. fragile, leave at door…" />
              </FormItem>
            </CardContent>
          </Card>

          {/* Items */}
          <Card className="border-border shadow-card">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <p className="font-heading font-bold">Items</p>
                  <p className="text-xs text-muted-foreground">What's inside the package?</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => append({ name: '', quantity: '1', price: '' })}>
                  <Plus className="mr-1 h-4 w-4" /> Add Item
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-[1fr_5rem_6rem_auto] items-end gap-2 rounded-xl border border-border bg-card p-3">
                  <FormItem>
                    <Label className="text-xs">Name</Label>
                    <Input {...form.register(`items.${index}.name`)} placeholder="Item name" />
                  </FormItem>
                  <FormItem>
                    <Label className="text-xs">Qty</Label>
                    <Input type="number" {...form.register(`items.${index}.quantity`)} placeholder="1" />
                  </FormItem>
                  <FormItem>
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
              {form.formState.errors.items && (
                <FormMessage>{form.formState.errors.items.message || form.formState.errors.items.root?.message}</FormMessage>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── STEP 3 · PAYMENT & REVIEW ─────── */}
      {step === 2 && (
        <div className="grid gap-6 md:grid-cols-2 animate-fade-in">
          <Card className="border-border shadow-card">
            <CardContent className="space-y-4 p-5">
              <div className="border-b border-border pb-3">
                <p className="font-heading font-bold">Payment method</p>
                <p className="text-xs text-muted-foreground">Choose how this order is paid for</p>
              </div>

              <button
                type="button"
                onClick={() => form.setValue('isCOD', false)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-all',
                  !form.watch('isCOD')
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/15'
                    : 'border-border bg-card hover:border-brand-300'
                )}
              >
                <span className={cn('flex h-8 w-8 items-center justify-center rounded-full border-2', !form.watch('isCOD') ? 'border-brand-500' : 'border-border')}>
                  {!form.watch('isCOD') && <Check className="h-4 w-4 text-brand-500" />}
                </span>
                <div className="flex-1">
                  <p className="font-semibold">Pay on Delivery</p>
                  <p className="text-xs text-muted-foreground">Customer pays the driver at dropoff</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => form.setValue('isCOD', true)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-all',
                  form.watch('isCOD')
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/15'
                    : 'border-border bg-card hover:border-brand-300'
                )}
              >
                <span className={cn('flex h-8 w-8 items-center justify-center rounded-full border-2', form.watch('isCOD') ? 'border-brand-500' : 'border-border')}>
                  {form.watch('isCOD') && <Check className="h-4 w-4 text-brand-500" />}
                </span>
                <div className="flex-1">
                  <p className="font-semibold">Cash Collect (COD)</p>
                  <p className="text-xs text-muted-foreground">Driver collects a set amount on delivery</p>
                </div>
              </button>

              {form.watch('isCOD') && (
                <FormItem className="pt-1">
                  <Label htmlFor="codAmount">COD Amount</Label>
                  <Input id="codAmount" type="number" step="0.01" placeholder="Enter amount" {...form.register('codAmount')} />
                  {form.formState.errors.codAmount && (
                    <FormMessage>{form.formState.errors.codAmount.message}</FormMessage>
                  )}
                </FormItem>
              )}
            </CardContent>
          </Card>

          {/* Review */}
          <Card className="border-border shadow-card">
            <CardContent className="space-y-4 p-5">
              <div className="border-b border-border pb-3">
                <p className="font-heading font-bold">Review order</p>
                <p className="text-xs text-muted-foreground">Confirm the details before submitting</p>
              </div>

              <ReviewRow icon={MapPin} label="Pickup" value={form.watch('pickupAddress')} />
              <ReviewRow icon={Navigation} label="Delivery" value={form.watch('deliveryAddress')} />
              <ReviewRow label="Package type" value={form.watch('packageType') ? form.watch('packageType')!.charAt(0) + form.watch('packageType')!.slice(1).toLowerCase() : '—'} />
              <ReviewRow label="Items" value={`${form.watch('items')?.length ?? 0} item(s)`} />
              <ReviewRow label="Payment" value={form.watch('isCOD') ? `COD · ${form.watch('codAmount') ? 'PKR ' + form.watch('codAmount') : 'set by customer'}` : 'Pay on delivery'} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Footer nav */}
      <div className="flex items-center justify-between gap-3 border-t border-border pt-5">
        <Button type="button" variant="ghost" onClick={goBack} disabled={step === 0 || isSubmitting}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>

        {step < STEPS.length - 1 ? (
          <Button type="button" variant="gradient" onClick={goNext}>
            Continue <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button type="submit" variant="gradient" disabled={isSubmitting}>
            <PackageCheck className="mr-1 h-4 w-4" />
            {isSubmitting ? 'Creating Order...' : 'Create Order'}
          </Button>
        )}
      </div>
    </form>
  )
}

function ReviewRow({ icon: Icon, label, value }: { icon?: typeof MapPin; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      {Icon ? (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
          <Icon className="h-4 w-4" />
        </div>
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
          <FileCheck className="h-4 w-4" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-semibold">{value}</p>
      </div>
    </div>
  )
}