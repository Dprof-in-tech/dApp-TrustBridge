"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface AmountFieldProps {
  name: string;
  label: string;
  asset: string;
  balance?: number;
  min?: number;
  max?: number;
  precision?: number;
  showQuickButtons?: number[];
  showMaxButton?: boolean;
  validation?: any;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  description?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export function AmountField({
  name,
  label,
  asset,
  balance,
  min = 0,
  max,
  precision = 6,
  showQuickButtons,
  showMaxButton = true,
  validation,
  placeholder = "0.00",
  className,
  required = false,
  disabled = false,
  description,
  value,
  onValueChange,
  ...props
}: AmountFieldProps) {
  const {
    register,
    setValue,
    watch,
    formState: { errors, touchedFields },
  } = useFormContext();

  const formValue = watch(name) || "";
  const error = errors[name];
  const touched = touchedFields[name];
  const currentValue = value !== undefined ? value : formValue;

  const amountValidation = React.useMemo(() => {
    const rules: any = {};

    if (required) {
      rules.required = "Amount is required";
    }

    if (min !== undefined) {
      rules.min = {
        value: min,
        message: `Minimum amount is ${min}`,
      };
    }

    if (max !== undefined) {
      rules.max = {
        value: max,
        message: `Maximum amount is ${max}`,
      };
    }

    return { ...rules, ...validation };
  }, [required, min, max, validation]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    // Allow only numbers and decimal point
    newValue = newValue.replace(/[^0-9.]/g, "");

    // Prevent multiple decimal points
    const parts = newValue.split(".");
    if (parts.length > 2) {
      newValue = parts[0] + "." + parts.slice(1).join("");
    }

    // Limit decimal places
    if (parts[1] && parts[1].length > precision) {
      newValue = parts[0] + "." + parts[1].slice(0, precision);
    }

    if (onValueChange) {
      onValueChange(newValue);
    } else {
      setValue(name, newValue, { shouldValidate: true });
    }
  };

  const handleQuickAmount = (amount: number) => {
    const newValue = amount.toString();
    if (onValueChange) {
      onValueChange(newValue);
    } else {
      setValue(name, newValue, { shouldValidate: true });
    }
  };

  const handleMaxClick = () => {
    if (balance !== undefined) {
      const newValue = balance.toString();
      if (onValueChange) {
        onValueChange(newValue);
      } else {
        setValue(name, newValue, { shouldValidate: true });
      }
    }
  };

  const validationState = React.useMemo(() => {
    if (error) return "error";
    if (touched && currentValue && !error) return "success";
    return "default";
  }, [error, touched, currentValue]);

  const validationIcon = {
    error: <AlertCircle className="h-4 w-4 text-destructive" />,
    success: <CheckCircle className="h-4 w-4 text-green-500" />,
    default: null,
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <label
          htmlFor={name}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label} {required && <span className="text-destructive">*</span>}
        </label>
        <div className="flex items-center gap-2">
          {validationIcon[validationState]}
          <span className="text-xs text-gray-400 bg-secondary px-2 py-1 rounded">
            {asset}
          </span>
        </div>
      </div>

      <div className="relative">
        <input
          {...register(name, amountValidation)}
          id={name}
          type="text"
          inputMode="decimal"
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-colors",
            "file:border-0 file:bg-transparent file:text-foreground file:text-sm file:font-medium",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive ring-destructive/20",
            showMaxButton && balance && "pr-16",
          )}
          onChange={handleInputChange}
          value={currentValue}
          placeholder={placeholder}
          disabled={disabled}
        />

        {showMaxButton && balance !== undefined && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-3 text-xs"
            onClick={handleMaxClick}
            disabled={disabled}
          >
            Max
          </Button>
        )}
      </div>

      {balance !== undefined && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Balance: {balance.toLocaleString()} {asset}
          </span>
        </div>
      )}

      {showQuickButtons && showQuickButtons.length > 0 && (
        <div className="flex gap-2">
          {showQuickButtons.map((amount) => (
            <Button
              key={amount}
              type="button"
              variant="secondary"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => handleQuickAmount(amount)}
              disabled={disabled}
            >
              {amount}
            </Button>
          ))}
        </div>
      )}

      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error.message as string}
        </p>
      )}
    </div>
  );
}
