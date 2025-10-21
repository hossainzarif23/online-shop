/**
 * Price Formatting Helpers
 */

export const priceHelpers = {
  /**
   * Format number to USD currency (e.g., "$19.99")
   */
  formatPrice(amount: number | string): string {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(num);
  },

  /**
   * Calculate percentage discount
   */
  calculateDiscount(originalPrice: number, salePrice: number): number {
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  },

  /**
   * Calculate tax amount
   */
  calculateTax(subtotal: number, taxRate: number = 0.1): number {
    return Math.round(subtotal * taxRate * 100) / 100;
  },

  /**
   * Calculate shipping cost
   */
  calculateShipping(
    subtotal: number,
    freeShippingThreshold: number = 50
  ): number {
    return subtotal >= freeShippingThreshold ? 0 : 9.99;
  },

  /**
   * Calculate order total
   */
  calculateTotal(subtotal: number, tax: number, shipping: number): number {
    return Math.round((subtotal + tax + shipping) * 100) / 100;
  },

  /**
   * Round to 2 decimal places
   */
  roundPrice(amount: number): number {
    return Math.round(amount * 100) / 100;
  },
};
