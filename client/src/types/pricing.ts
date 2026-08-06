export interface PricingRule {
  _id: string
  name: string
  basePrice: number
  pricePerKm: number
  pricePerKg?: number
  surgeMultiplier?: number
  minPrice?: number
  maxPrice?: number
  isActive: boolean
}

export interface AreaPricing {
  _id: string
  area: string
  city: string
  type: 'PICKUP' | 'DELIVERY' | 'BOTH'
  surcharge: {
    type: 'FIXED' | 'PERCENTAGE'
    amount: number
  }
  isActive: boolean
  metadata?: Record<string, unknown>
  createdAt?: string
  updatedAt?: string
}

export interface PriceBreakdown {
  basePrice: number
  distancePrice: number
  weightPrice?: number
  surgeMultiplier?: number
  discount?: number
  total: number
  currency: string
}

export interface PricingConfig {
  defaultBasePrice: number
  defaultPerKmRate: number
  minimumFee: number
  maximumFee: number
  peakHourMultipliers?: Record<string, number>
  packageTypeMultipliers?: Record<string, number>
  distanceBrackets?: Array<{ min: number; max: number; rate: number }>
  specialHandlingFee: number
  currency: string
  useDynamicPricing: boolean
  maxDistanceForDelivery: number
}
