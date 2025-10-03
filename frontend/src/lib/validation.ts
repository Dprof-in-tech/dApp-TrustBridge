/**
 * Common validation rules and utilities for forms
 */

export interface ValidationRule {
  required?: string;
  custom?: (value: string) => string | undefined | Promise<string | undefined>;
}

/**
 * Common validation rules for different input types
 */
export const validationRules = {
  /**
   * Amount validation for crypto currencies
   */
  amount: (min = 0, max?: number, decimals = 18): ValidationRule => ({
    required: "Amount is required",
    custom: async (value: string) => {
      const num = parseFloat(value);
      if (isNaN(num)) return "Please enter a valid number";
      if (num <= min) return `Amount must be greater than ${min}`;
      if (max && num > max) return `Amount cannot exceed ${max}`;

      // Check decimal places
      const decimalPlaces = (value.split(".")[1] || "").length;
      if (decimalPlaces > decimals) {
        return `Maximum ${decimals} decimal places allowed`;
      }

      return undefined;
    },
  }),

  /**
   * Stellar address validation
   */
  stellarAddress: {
    required: "Stellar address is required",
    custom: async (value: string) => {
      if (!value) return undefined;

      // Basic Stellar address validation
      if (!value.startsWith("G") || value.length !== 56) {
        return "Invalid Stellar address format";
      }

      // Additional validation for valid characters
      const validChars = /^[A-Z2-7]+$/;
      if (!validChars.test(value)) {
        return "Stellar address contains invalid characters";
      }

      return undefined;
    },
  } as ValidationRule,

  /**
   * Percentage validation
   */
  percentage: (min = 0, max = 100): ValidationRule => ({
    required: "Percentage is required",
    custom: async (value: string) => {
      const num = parseFloat(value);
      if (isNaN(num)) return "Please enter a valid percentage";
      if (num < min || num > max) {
        return `Percentage must be between ${min}% and ${max}%`;
      }
      return undefined;
    },
  }),

  /**
   * Email validation
   */
  email: {
    required: "Email is required",
    custom: async (value: string) => {
      if (!value) return undefined;

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return "Please enter a valid email address";
      }
      return undefined;
    },
  } as ValidationRule,

  /**
   * Name validation
   */
  name: {
    required: "Name is required",
    custom: async (value: string) => {
      if (!value) return undefined;

      if (value.length < 2) {
        return "Name must be at least 2 characters long";
      }

      if (value.length > 50) {
        return "Name cannot exceed 50 characters";
      }

      const nameRegex = /^[a-zA-Z\s]+$/;
      if (!nameRegex.test(value)) {
        return "Name can only contain letters and spaces";
      }

      return undefined;
    },
  } as ValidationRule,
};

/**
 * Debounce utility for validation functions
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
): T {
  let timeoutId: NodeJS.Timeout;

  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
}

/**
 * Async validation helpers
 */
export const asyncValidators = {
  /**
   * Validate sufficient balance for a given asset
   */
  validateSufficientBalance:
    (getBalance: (asset: string) => Promise<number>) =>
    async (amount: string, asset: string): Promise<string | undefined> => {
      try {
        const balance = await getBalance(asset);
        const requestedAmount = parseFloat(amount);

        if (isNaN(requestedAmount)) return "Please enter a valid amount";
        if (requestedAmount > balance) {
          return `Insufficient ${asset} balance. Available: ${balance.toFixed(6)}`;
        }
        return undefined;
      } catch (error) {
        return "Unable to verify balance";
      }
    },

  /**
   * Validate health factor for borrowing operations
   */
  validateHealthFactor:
    (
      calculateHealthFactor: (
        borrowAmount: string,
        collateralValue: number,
      ) => Promise<number>,
    ) =>
    async (
      borrowAmount: string,
      collateralValue: number,
    ): Promise<string | undefined> => {
      try {
        const newHealthFactor = await calculateHealthFactor(
          borrowAmount,
          collateralValue,
        );

        if (newHealthFactor < 1.0) {
          return "This amount would cause immediate liquidation";
        }

        if (newHealthFactor < 1.2) {
          return "This amount would make your position extremely risky";
        }

        if (newHealthFactor < 1.5) {
          return "This amount would put your position at risk of liquidation";
        }

        return undefined;
      } catch (error) {
        return "Unable to calculate health factor";
      }
    },
};

/**
 * Format validation error messages
 */
export const formatValidationError = (error: any): string => {
  if (typeof error === "string") return error;
  if (error?.message) return error.message;
  return "Validation error occurred";
};

/**
 * Validation state helpers
 */
export const getValidationState = (
  error: any,
  touched: boolean,
  value: any,
  isValidating: boolean,
): "default" | "validating" | "error" | "success" => {
  if (isValidating) return "validating";
  if (error) return "error";
  if (touched && value && !error) return "success";
  return "default";
};
