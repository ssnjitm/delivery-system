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
  name: string
  area: {
    type: 'Polygon'
    coordinates: number[][][]
  }
  basePrice: number
  pricePerKm: number
  isActive: boolean
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
  defaultCurrency: string
  surgeThreshold: number
  surgeMultiplier: number
  discountPercentages: {
    firstOrder: number
    referral: number
    bulk: number
  }
}
