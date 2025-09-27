"use client";

import * as React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { ChevronDown, Check, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  description?: string;
}

export interface SelectFieldProps {
  name: string;
  label: string;
  options: SelectOption[];
  placeholder?: string;
  searchable?: boolean;
  clearable?: boolean;
  validation?: any;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  description?: string;
}

export function SelectField({
  name,
  label,
  options,
  placeholder = "Select an option...",
  searchable = false,
  clearable = false,
  validation,
  className,
  required = false,
  disabled = false,
  description,
  ...props
}: SelectFieldProps) {
  const {
    control,
    formState: { errors, touchedFields },
  } = useFormContext();

  const error = errors[name];
  const touched = touchedFields[name];

  const selectValidation = React.useMemo(() => {
    const rules: any = {};

    if (required) {
      rules.required = "Please select an option";
    }

    return { ...rules, ...validation };
  }, [required, validation]);

  const validationState = React.useMemo(() => {
    if (error) return "error";
    if (touched && !error) return "success";
    return "default";
  }, [error, touched]);

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
        {validationIcon[validationState]}
      </div>

      <Controller
        name={name}
        control={control}
        rules={selectValidation}
        render={({ field }) => (
          <Select
            onValueChange={field.onChange}
            value={field.value}
            disabled={disabled}
          >
            <SelectTrigger
              className={cn(
                "h-9",
                error && "border-destructive ring-destructive/20",
              )}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className="flex items-center gap-2"
                >
                  <div className="flex items-center gap-2">
                    {option.icon}
                    <div>
                      <div className="font-medium">{option.label}</div>
                      {option.description && (
                        <div className="text-xs text-muted-foreground">
                          {option.description}
                        </div>
                      )}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />

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
