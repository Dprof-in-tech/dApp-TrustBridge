"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { Copy, CheckCircle, ExternalLink, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface AddressFieldProps {
  name: string;
  label: string;
  addressType?: "stellar" | "ethereum" | "bitcoin";
  showCopyButton?: boolean;
  showExplorerLink?: boolean;
  formatDisplay?: boolean;
  validation?: any;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  description?: string;
}

export function AddressField({
  name,
  label,
  addressType = "stellar",
  showCopyButton = false,
  showExplorerLink = false,
  formatDisplay = false,
  validation,
  placeholder,
  className,
  required = false,
  disabled = false,
  description,
  ...props
}: AddressFieldProps) {
  const {
    register,
    setValue,
    watch,
    formState: { errors, touchedFields },
  } = useFormContext();

  const value = watch(name) || "";
  const error = errors[name];
  const touched = touchedFields[name];
  const [displayValue, setDisplayValue] = React.useState(value);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  const addressValidation = React.useMemo(() => {
    const rules: any = {};

    if (required) {
      rules.required = "Address is required";
    }

    if (addressType === "stellar") {
      rules.pattern = {
        value: /^G[A-Z2-7]{55}$/,
        message: "Invalid Stellar address format",
      };
    } else if (addressType === "ethereum") {
      rules.pattern = {
        value: /^0x[a-fA-F0-9]{40}$/,
        message: "Invalid Ethereum address format",
      };
    }

    return { ...rules, ...validation };
  }, [addressType, required, validation]);

  const formatAddress = (addr: string) => {
    if (!addr || addr.length < 8) return addr;
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setDisplayValue(newValue);
    setValue(name, newValue, { shouldValidate: true });
  };

  const handleCopy = async () => {
    if (value) {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Address copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getExplorerUrl = (address: string) => {
    switch (addressType) {
      case "stellar":
        return `https://stellar.expert/explorer/public/account/${address}`;
      case "ethereum":
        return `https://etherscan.io/address/${address}`;
      default:
        return "";
    }
  };

  const placeholderText = React.useMemo(() => {
    if (placeholder) return placeholder;
    switch (addressType) {
      case "stellar":
        return "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
      case "ethereum":
        return "0x0000000000000000000000000000000000000000";
      default:
        return "Enter address";
    }
  }, [addressType, placeholder]);

  const validationState = React.useMemo(() => {
    if (error) return "error";
    if (touched && value && !error) return "success";
    return "default";
  }, [error, touched, value]);

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

      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            {...register(name, addressValidation)}
            id={name}
            className={cn(
              "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-colors",
              "file:border-0 file:bg-transparent file:text-foreground file:text-sm file:font-medium",
              "placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-destructive ring-destructive/20",
              showCopyButton && "pr-10",
            )}
            onChange={handleInputChange}
            onFocus={(e) => {
              // Show full address on focus if formatted
              if (formatDisplay && value) {
                setDisplayValue(value);
              }
            }}
            onBlur={(e) => {
              // Format address on blur if enabled
              if (formatDisplay && e.target.value.length > 8) {
                setDisplayValue(formatAddress(e.target.value));
              }
            }}
            value={displayValue}
            placeholder={placeholderText}
            disabled={disabled}
          />

          {showCopyButton && value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              onClick={handleCopy}
            >
              {copied ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>

        {showExplorerLink && value && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9"
            onClick={() => window.open(getExplorerUrl(value), "_blank")}
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        )}
      </div>

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
