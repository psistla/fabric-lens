/** A single pricing item from the Azure Retail Prices API. */
export interface AzurePriceItem {
  currencyCode: string;
  tierMinimumUnits: number;
  retailPrice: number;
  unitPrice: number;
  armRegionName: string;
  location: string;
  effectiveStartDate: string;
  meterId: string;
  meterName: string;
  productId: string;
  skuId: string;
  productName: string;
  skuName: string;
  serviceName: string;
  serviceId: string;
  serviceFamily: string;
  unitOfMeasure: string;
  type: string;
  isPrimaryMeterRegion: boolean;
  armSkuName: string;
  reservationTerm?: string;
  effectiveEndDate?: string;
}

/** Response shape from the Azure Retail Prices REST API. */
export interface AzurePricingResponse {
  BillingCurrency: string;
  CustomerEntityId: string;
  CustomerEntityType: string;
  Items: AzurePriceItem[];
  NextPageLink: string | null;
  Count: number;
}

/** Simplified per-SKU rate after processing the API response. */
export interface SkuRate {
  sku: string;
  retailPrice: number;
  currencyCode: string;
  region: string;
  location: string;
}
