export enum ShippingMethod {
    STANDARD = 'STANDARD',
    EXPRESS = 'EXPRESS',
    STORE = 'STORE',
  }
  
  export const ShippingDetails: Record<ShippingMethod, { cost: number }> = {
    [ShippingMethod.STANDARD]: { cost: 3.99 },
    [ShippingMethod.EXPRESS]: { cost: 7.99 },
    [ShippingMethod.STORE]: { cost: 0.0 },
  };
  