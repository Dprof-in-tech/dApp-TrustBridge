"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  FormField,
  type FormFieldProps,
  type ValidationRules,
} from "./FormField";

export interface NumberInputProps
  extends Omit<FormFieldProps, "type" | "validation"> {
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  suffix?: string;
  showMaxButton?: boolean;
  maxValue?: number;
  validation?: ValidationRules;
}

export function NumberInput({
  min = 0,
  max,
  step = 1,
  precision = 2,
  suffix,
  showMaxButton,
  maxValue,
  validation,
  className,
  ...props
}: NumberInputProps) {
  const { setValue, watch, register } = useFormContext();
  const value = watch(props.name);

  const handleMaxClick = () => {
    if (maxValue !== undefined) {
      setValue(props.name, maxValue.toString(), { shouldValidate: true });
    }
  };

  const formatValue = (val: number) => {
    return Number(val).toFixed(precision);
  };

  const enhancedValidation: ValidationRules = {
    ...validation,
    min,
    max,
    custom: async (value: string) => {
      // Run custom validation first if provided
      if (validation?.custom) {
        const customError = await validation.custom(value);
        if (customError) return customError;
      }

      const num = parseFloat(value);
      if (isNaN(num)) return "Please enter a valid number";
      if (num < min) return `Minimum value is ${min}`;
      if (max && num > max) return `Maximum value is ${max}`;

      // Check decimal places
      const decimalPlaces = (value.split(".")[1] || "").length;
      if (decimalPlaces > precision) {
        return `Maximum ${precision} decimal places allowed`;
      }

      return undefined;
    },
  };

  return (
    <FormField
      {...props}
      type="number"
      validation={enhancedValidation}
      className={className}
    >
      <div className="relative">
        <Input
          type="number"
          min={min}
          max={max}
          step={step}
          placeholder={props.placeholder}
          disabled={props.disabled}
          className={cn(
            showMaxButton && maxValue !== undefined && "pr-20",
            suffix && !showMaxButton && "pr-12",
            suffix && showMaxButton && "pr-24",
            className,
          )}
          aria-invalid={false}
          {...register(props.name)}
        />

        {/* Suffix */}
        {suffix && (
          <div
            className={cn(
              "absolute top-1/2 -translate-y-1/2 text-sm text-muted-foreground",
              showMaxButton && maxValue !== undefined ? "right-16" : "right-3",
            )}
          >
            {suffix}
          </div>
        )}

        {/* Max Button */}
        {showMaxButton && maxValue !== undefined && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2 text-xs"
            onClick={handleMaxClick}
            disabled={props.disabled}
          >
            Max
          </Button>
        )}
      </div>
    </FormField>
  );
}
