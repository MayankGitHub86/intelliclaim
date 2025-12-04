/**
 * Currency formatting utilities for Indian Rupees
 */

/**
 * Formats a number as Indian Rupees with proper Indian number formatting
 * @param amount - The amount to format (can be number or string)
 * @param showSymbol - Whether to show the ₹ symbol (default: true)
 * @returns Formatted Indian Rupee amount
 */
export function formatIndianRupees(amount: number | string | null | undefined, showSymbol: boolean = true): string {
  if (amount === null || amount === undefined || amount === '') {
    return 'N/A';
  }

  // Convert to number if it's a string
  const numAmount = typeof amount === 'string' ? parseFloat(amount.replace(/[^\d.-]/g, '')) : amount;
  
  if (isNaN(numAmount)) {
    return 'N/A';
  }

  // Format with Indian number system (commas in Indian positions)
  const formattedAmount = numAmount.toLocaleString('en-IN');
  
  return showSymbol ? `₹${formattedAmount}` : formattedAmount;
}

/**
 * Formats large amounts in Indian Crores/Lakhs notation
 * @param amount - The amount to format
 * @param showSymbol - Whether to show the ₹ symbol (default: true)
 * @returns Formatted amount with Cr/L notation for large numbers
 */
export function formatIndianRupeesCompact(amount: number | string | null | undefined, showSymbol: boolean = true): string {
  if (amount === null || amount === undefined || amount === '') {
    return 'N/A';
  }

  const numAmount = typeof amount === 'string' ? parseFloat(amount.replace(/[^\d.-]/g, '')) : amount;
  
  if (isNaN(numAmount)) {
    return 'N/A';
  }

  let formattedAmount: string;
  
  if (numAmount >= 10000000) { // 1 Crore or more
    formattedAmount = (numAmount / 10000000).toFixed(1) + ' Cr';
  } else if (numAmount >= 100000) { // 1 Lakh or more
    formattedAmount = (numAmount / 100000).toFixed(1) + ' L';
  } else {
    formattedAmount = numAmount.toLocaleString('en-IN');
  }
  
  return showSymbol ? `₹${formattedAmount}` : formattedAmount;
}

/**
 * Extracts numeric value from a formatted currency string
 * @param currencyString - The formatted currency string
 * @returns The numeric value
 */
export function parseIndianRupees(currencyString: string): number {
  if (!currencyString) return 0;
  
  // Remove currency symbol and any other non-numeric characters except decimal point
  const cleanString = currencyString.replace(/[₹$,\s]/g, '');
  return parseFloat(cleanString) || 0;
}

/**
 * Converts USD amounts to approximate INR (for demo/migration purposes)
 * Using approximate conversion rate of 1 USD = 83 INR
 * @param usdAmount - Amount in USD
 * @returns Approximate amount in INR
 */
export function convertUSDToINR(usdAmount: number | string): number {
  const numAmount = typeof usdAmount === 'string' ? parseFloat(usdAmount.replace(/[^\d.-]/g, '')) : usdAmount;
  if (isNaN(numAmount)) return 0;
  
  // Approximate conversion rate (this would be dynamic in a real application)
  return Math.round(numAmount * 83);
}
