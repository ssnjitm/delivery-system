import { Types } from 'mongoose';
import { AppError } from '@/middlewares/auth.js';
import { PackageType, OrderStatus } from '@/types/enums.js';

import {
  IPriceRequest,
  IPriceResponse,
  IPriceBreakdown,
  IPricingRule,
  IPricingConfig,
  IDistanceMatrix,
  PricingRuleType,
  PricingRuleStatus,
  PeakHourType,
  DEFAULT_PRICING_CONFIG,
  IPriceHistory,
  IAreaPricing,
} from './types.js';
import { AreaPricingModel, PriceHistoryModel, PricingRuleModel } from './models.js';

export class PricingService {
  private static config: IPricingConfig = DEFAULT_PRICING_CONFIG;

  // ============================================
  // Configuration Management
  // ============================================

  static setConfig(config: Partial<IPricingConfig>): void {
    this.config = { ...this.config, ...config };
  }

  static getConfig(): IPricingConfig {
    return { ...this.config };
  }

  // ============================================
  // Core Price Calculation
  // ============================================

  static async calculatePrice(request: IPriceRequest): Promise<IPriceResponse> {
    const {
      pickupLocation,
      deliveryLocation,
      packageType,
      packageWeight,
      isPeakHour = false, // 👈 Added default fallback to fix ts(2345)
      scheduledTime,
      customerType = 'CUSTOMER',
      specialHandling = false,
    } = request;

    // 1. Calculate distance between pickup and delivery
    const distanceMatrix = await this.calculateDistance(
      pickupLocation.coordinates,
      deliveryLocation.coordinates
    );

    const distanceKm = distanceMatrix.distance.value / 1000;

    // 2. Get active pricing rules
    const rules = await this.getActiveRules(packageType, isPeakHour, pickupLocation.area, deliveryLocation.area);

    // 3. Calculate price breakdown
    const breakdown = await this.calculateBreakdown({
      distanceKm,
      packageType,
      packageWeight,
      isPeakHour, // 👈 Simplified since isPeakHour is now strictly a boolean
      scheduledTime,
      pickupArea: pickupLocation.area,
      deliveryArea: deliveryLocation.area,
      customerType,
      specialHandling,
      rules,
    });

    // 4. Apply min/max constraints
    const total = this.applyConstraints(breakdown);

    // 5. Save price history
    const priceHistory = new PriceHistoryModel({
      priceBreakdown: breakdown,
      appliedRules: breakdown.appliedRules.map((rule) => ({
        ruleId: new Types.ObjectId(rule.ruleId),
        name: rule.name,
        type: rule.type,
        amount: rule.amount,
      })),
      total,
    });
    await priceHistory.save();

    return {
      breakdown,
      total,
      currency: this.config.currency,
      validUntil: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      calculatedAt: new Date(),
    };
  }

  // ============================================
  // Breakdown Calculation
  // ============================================

  private static async calculateBreakdown(params: {
    distanceKm: number;
    packageType: PackageType;
    packageWeight?: number;
    isPeakHour: boolean;
    scheduledTime?: Date;
    pickupArea: string;
    deliveryArea: string;
    customerType: string;
    specialHandling: boolean;
    rules: IPricingRule[];
  }): Promise<IPriceBreakdown> {
    const {
      distanceKm,
      packageType,
      packageWeight,
      isPeakHour,
      scheduledTime,
      pickupArea,
      deliveryArea,
      customerType,
      specialHandling,
      rules,
    } = params;

    // Base Price
    const basePrice = this.getBasePrice(rules);

    // Distance Calculation
    const perKmRate = this.getPerKmRate(rules, distanceKm);
    const distanceAmount = distanceKm * perKmRate;

    // Package Surcharge
    const packageSurcharge = this.getPackageSurcharge(rules, packageType);

    // Peak Hour Surcharge
    const peakHourResult = this.getPeakHourSurcharge(rules, isPeakHour, scheduledTime);

    // Area Surcharge
    const areaSurcharge = await this.getAreaSurcharge(pickupArea, deliveryArea);

    // Special Handling
    const specialHandlingFee = specialHandling ? this.config.specialHandlingFee : 0;

    // Calculate total
    let total = basePrice + distanceAmount + packageSurcharge.amount +
      peakHourResult.amount + areaSurcharge.total + specialHandlingFee;

    // Track applied rules
    const appliedRules = [];

    // Base price rule
    const baseRule = rules.find(r => r.type === PricingRuleType.BASE_PRICE);
    if (baseRule) {
      appliedRules.push({
        ruleId: baseRule._id.toString(),
        name: baseRule.name,
        type: baseRule.type,
        amount: basePrice,
      });
    }

    // Per km rule
    const kmRule = rules.find(r => r.type === PricingRuleType.PER_KM_RATE);
    if (kmRule) {
      appliedRules.push({
        ruleId: kmRule._id.toString(),
        name: kmRule.name,
        type: kmRule.type,
        amount: distanceAmount,
      });
    }

    // Package surcharge rule
    const packageRule = rules.find(r => r.type === PricingRuleType.PACKAGE_TYPE_SURCHARGE);
    if (packageRule) {
      appliedRules.push({
        ruleId: packageRule._id.toString(),
        name: packageRule.name,
        type: packageRule.type,
        amount: packageSurcharge.amount,
      });
    }

    // Peak hour rule
    const peakRule = rules.find(r => r.type === PricingRuleType.PEAK_HOUR_SURCHARGE);
    if (peakRule && peakHourResult.isPeak) {
      appliedRules.push({
        ruleId: peakRule._id.toString(),
        name: peakRule.name,
        type: peakRule.type,
        amount: peakHourResult.amount,
      });
    }

    // Area surcharge rules
    if (areaSurcharge.pickup > 0 || areaSurcharge.delivery > 0) {
      const areaRules = rules.filter(r => r.type === PricingRuleType.AREA_SURCHARGE);
      for (const rule of areaRules) {
        appliedRules.push({
          ruleId: rule._id.toString(),
          name: rule.name,
          type: rule.type,
          amount: areaSurcharge.total,
        });
      }
    }

    return {
      basePrice,
      distance: {
        km: distanceKm,
        perKmRate,
        amount: distanceAmount,
      },
      packageSurcharge: {
        type: packageType,
        amount: packageSurcharge.amount,
      },
      peakHourSurcharge: {
        isPeak: peakHourResult.isPeak,
        peakType: peakHourResult.peakType,
        amount: peakHourResult.amount,
      },
      areaSurcharge,
      specialHandling: specialHandlingFee,
      minimumFee: this.config.minimumFee,
      maximumFee: this.config.maximumFee,
      total,
      appliedRules,
    };
  }

  // Rule-Based Calculations

  private static getBasePrice(rules: IPricingRule[]): number {
    const baseRule = rules.find(r => r.type === PricingRuleType.BASE_PRICE);
    if (baseRule) {
      return baseRule.value.amount;
    }
    return this.config.defaultBasePrice;
  }

  private static getPerKmRate(rules: IPricingRule[], distanceKm: number): number {
    // Check distance bracket rules first
    const bracketRule = rules.find(r => 
      r.type === PricingRuleType.DISTANCE_BRACKET &&
      r.conditions.distanceRange &&
      distanceKm >= r.conditions.distanceRange.min &&
      distanceKm <= r.conditions.distanceRange.max
    );

    if (bracketRule) {
      return bracketRule.value.amount;
    }

    // Check standard per km rule
    const kmRule = rules.find(r => r.type === PricingRuleType.PER_KM_RATE);
    if (kmRule) {
      return kmRule.value.amount;
    }

    // Use default from distance brackets
    for (const bracket of this.config.distanceBrackets) {
      if (distanceKm >= bracket.min && distanceKm <= bracket.max) {
        return bracket.rate;
      }
    }

    return this.config.defaultPerKmRate;
  }

  private static getPackageSurcharge(
    rules: IPricingRule[],
    packageType: PackageType
  ): { amount: number } {
    const packageRule = rules.find(r => 
      r.type === PricingRuleType.PACKAGE_TYPE_SURCHARGE &&
      r.conditions.packageTypes?.includes(packageType)
    );

    if (packageRule) {
      return { amount: packageRule.value.amount };
    }

    // Use multiplier from config
    const multiplier = this.config.packageTypeMultipliers[packageType] || 1;
    const basePrice = this.config.defaultBasePrice;
    return { amount: basePrice * (multiplier - 1) };
  }

  private static getPeakHourSurcharge(
    rules: IPricingRule[],
    isPeakHour: boolean,
    scheduledTime?: Date
  ): { isPeak: boolean; peakType?: PeakHourType; amount: number } {
    if (!isPeakHour) {
      return { isPeak: false, amount: 0 };
    }

    const now = scheduledTime || new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();

    let peakType: PeakHourType | undefined;

    // Determine peak type
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      peakType = PeakHourType.WEEKEND;
    } else if (hour >= 7 && hour <= 10) {
      peakType = PeakHourType.MORNING_PEAK;
    } else if (hour >= 17 && hour <= 20) {
      peakType = PeakHourType.EVENING_PEAK;
    } else if (hour >= 22 || hour <= 6) {
      peakType = PeakHourType.NIGHT;
    }

    if (!peakType) {
      return { isPeak: false, amount: 0 };
    }

    // Check for peak hour rule
    const peakRule = rules.find(r =>
      r.type === PricingRuleType.PEAK_HOUR_SURCHARGE &&
      r.conditions.peakHourTypes?.includes(peakType!)
    );

    if (peakRule) {
      return {
        isPeak: true,
        peakType,
        amount: peakRule.value.amount,
      };
    }

    // Use multiplier from config
    const multiplier = this.config.peakHourMultipliers[peakType] || 1;
    const basePrice = this.config.defaultBasePrice;
    return {
      isPeak: true,
      peakType,
      amount: basePrice * (multiplier - 1),
    };
  }

  private static async getAreaSurcharge(
    pickupArea: string,
    deliveryArea: string
  ): Promise<{ pickup: number; delivery: number; total: number }> {
    const [pickupPricing, deliveryPricing] = await Promise.all([
      AreaPricingModel.findOne({
        area: pickupArea,
        isActive: true,
        type: { $in: ['PICKUP', 'BOTH'] },
      }),
      AreaPricingModel.findOne({
        area: deliveryArea,
        isActive: true,
        type: { $in: ['DELIVERY', 'BOTH'] },
      }),
    ]);

    const pickup = pickupPricing?.surcharge.amount || 0;
    const delivery = deliveryPricing?.surcharge.amount || 0;

    return {
      pickup,
      delivery,
      total: pickup + delivery,
    };
  }

  // ============================================
  // Constraints & Validation
  // ============================================

  private static applyConstraints(breakdown: IPriceBreakdown): number {
    let total = breakdown.total;

    // Apply minimum fee
    if (total < this.config.minimumFee) {
      total = this.config.minimumFee;
    }

    // Apply maximum fee
    if (total > this.config.maximumFee) {
      total = this.config.maximumFee;
    }

    return Math.round(total * 100) / 100; // Round to 2 decimal places
  }

  // ============================================
  // Distance Calculation
  // ============================================

  static async calculateDistance(
    origin: [number, number],
    destination: [number, number]
  ): Promise<IDistanceMatrix> {
    // TODO: Integrate with Google Maps API or OpenStreetMap
    // For now, use Haversine formula for approximate distance
    
    const distanceMeters = this.haversineDistance(origin, destination);
    const distanceKm = distanceMeters / 1000;
    
    // Estimate duration: assuming average speed of 30 km/h in city
    const durationSeconds = (distanceKm / 30) * 3600;

    return {
      origin: {
        coordinates: origin,
        address: '',
      },
      destination: {
        coordinates: destination,
        address: '',
      },
      distance: {
        text: `${distanceKm.toFixed(1)} km`,
        value: distanceMeters,
      },
      duration: {
        text: `${Math.ceil(durationSeconds / 60)} mins`,
        value: durationSeconds,
      },
      route: {
        polyline: '',
        waypoints: [origin, destination],
      },
    };
  }

  static haversineDistance(
    coord1: [number, number],
    coord2: [number, number]
  ): number {
    const R = 6371000; // Earth's radius in meters
    const lat1 = coord1[1] * Math.PI / 180;
    const lat2 = coord2[1] * Math.PI / 180;
    const dLat = (coord2[1] - coord1[1]) * Math.PI / 180;
    const dLon = (coord2[0] - coord1[0]) * Math.PI / 180;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  // ============================================
  // Rule Management
  // ============================================

  static async getActiveRules(
    packageType: PackageType,
    isPeakHour: boolean,
    pickupArea: string,
    deliveryArea: string
  ): Promise<IPricingRule[]> {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();

    const rules = await PricingRuleModel.find({
      status: PricingRuleStatus.ACTIVE,
      $or: [
        { 'conditions.packageTypes': { $in: [packageType, null] } },
        { 'conditions.packageTypes': { $exists: false } },
      ],
    }).sort({ priority: 1 });

    // Filter rules based on conditions
    return rules.filter(rule => {
      // Check distance range
      if (rule.conditions.distanceRange) {
        // We'll check this during calculation
        return true;
      }

      // Check time range
      if (rule.conditions.timeRange) {
        const { start, end } = rule.conditions.timeRange;
        const [startHour, startMin] = start.split(':').map(Number);
        const [endHour, endMin] = end.split(':').map(Number);
        const currentMinutes = hour * 60 + now.getMinutes();
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;

        if (currentMinutes < startMinutes || currentMinutes > endMinutes) {
          return false;
        }
      }

      // Check day of week
      if (rule.conditions.dayOfWeek && rule.conditions.dayOfWeek.length > 0) {
        if (!rule.conditions.dayOfWeek.includes(dayOfWeek)) {
          return false;
        }
      }

      // Check areas
      if (rule.conditions.areas && rule.conditions.areas.length > 0) {
        const areas = rule.conditions.areas;
        if (!areas.includes(pickupArea) && !areas.includes(deliveryArea)) {
          return false;
        }
      }

      return true;
    });
  }

  // ============================================
  // Price History
  // ============================================

  static async getPriceHistory(orderId: string): Promise<IPriceHistory | null> {
    return await PriceHistoryModel.findOne({
      orderId: new Types.ObjectId(orderId),
    }).lean();
  }

  // ============================================
  // Area Pricing Management (Admin)
  // ============================================

  static async createAreaPricing(data: Partial<IAreaPricing>): Promise<IAreaPricing> {
    const areaPricing = new AreaPricingModel(data);
    await areaPricing.save();
    return areaPricing;
  }

  static async updateAreaPricing(
    id: string,
    data: Partial<IAreaPricing>
  ): Promise<IAreaPricing | null> {
    return await AreaPricingModel.findByIdAndUpdate(
      id,
      data,
      { new: true }
    );
  }

  static async getAreaPricing(area: string, city: string): Promise<IAreaPricing | null> {
    return await AreaPricingModel.findOne({
      area,
      city,
      isActive: true,
    });
  }

  static async getAllAreaPricing(filters: {
    city?: string;
    isActive?: boolean;
  }): Promise<IAreaPricing[]> {
    const query: any = {};
    if (filters.city) query.city = filters.city;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    return await AreaPricingModel.find(query).sort({ area: 1 });
  }

  static async savePriceHistory(
  orderId: string,
  priceResult: IPriceResponse
): Promise<IPriceHistory> {
  const priceHistory = new PriceHistoryModel({
    orderId: new Types.ObjectId(orderId),
    priceBreakdown: priceResult.breakdown,
    appliedRules: priceResult.breakdown.appliedRules.map((rule) => ({
      ruleId: new Types.ObjectId(rule.ruleId),
      name: rule.name,
      type: rule.type,
      amount: rule.amount,
    })),
    total: priceResult.total,
  });
  await priceHistory.save();
  return priceHistory;
}
}