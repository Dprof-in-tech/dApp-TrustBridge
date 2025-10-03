"use client";

import { useEffect, useState } from "react";
import { useBorrow } from "../../hooks/useBorrow.hook";
import {
  monitorHealthFactor,
  getHealthFactorAlerts,
  calculateMaxBorrowable,
  calculateLiquidationPrice,
  type HealthFactorResult,
} from "@/helpers/health-factor.helper";
import { useWalletContext } from "@/providers/wallet.provider";
import { EnhancedForm } from "@/components/ui/form/EnhancedForm";
import { NumberInput } from "@/components/ui/form/NumberInput";
import { AmountField } from "@/components/ui/form-field";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  X,
  ArrowDown,
  AlertTriangle,
  Info,
  CheckCircle,
  Shield,
} from "lucide-react";

interface PoolReserve {
  symbol: string;
  supplied: string;
  borrowed: string;
  supplyAPY: string;
  borrowAPY: string;
}

interface PoolData {
  name: string;
  totalSupplied: string;
  totalBorrowed: string;
  utilizationRate: string;
  reserves: PoolReserve[];
}

interface BorrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  poolData: PoolData | null;
  poolId?: string;
}

export function BorrowModal({ isOpen, onClose, poolId }: BorrowModalProps) {
  const { walletAddress } = useWalletContext();
  const [healthFactor, setHealthFactor] = useState<HealthFactorResult | null>(
    null,
  );
  const [alerts, setAlerts] = useState<string[]>([]);
  const [maxBorrowable, setMaxBorrowable] = useState<number>(0);
  const [liquidationPrice, setLiquidationPrice] = useState<number>(0);

  const {
    loading,
    estimates,
    handleBorrow,
    isHealthy,
    isAtRisk,
    isBorrowDisabled,
  } = useBorrow({ isOpen, onClose, poolId });

  const handleFormSubmit = async (data: any) => {
    const { amount, slippageTolerance } = data;

    // Handle borrow with form data directly - no state update needed
    await handleBorrow({ amount, slippageTolerance });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  // Calculate health factor for a given borrow amount
  const calculateHealthFactorForAmount = async (
    borrowAmount: number,
  ): Promise<number> => {
    if (!healthFactor) return 1.0;

    const newBorrowedValue = healthFactor.borrowedValue + borrowAmount;
    const newHealthFactor =
      (healthFactor.collateralValue * 0.85) / newBorrowedValue;

    return newHealthFactor;
  };

  // Always call useEffect hook before any conditional returns
  useEffect(() => {
    if (!isOpen || !walletAddress) return;

    const stopMonitoring = monitorHealthFactor(walletAddress, (result) => {
      setHealthFactor(result);
      setAlerts(getHealthFactorAlerts(result));

      // Calculate max borrowable amount
      const maxBorrow = calculateMaxBorrowable(
        result.collateralValue,
        85, // USDC collateral factor
        result.borrowedValue,
      );
      setMaxBorrowable(maxBorrow);

      // Calculate liquidation price
      const liqPrice = calculateLiquidationPrice(
        result.borrowedValue,
        result.collateralValue,
        85, // USDC collateral factor
      );
      setLiquidationPrice(liqPrice);
    });

    return stopMonitoring;
  }, [isOpen, walletAddress]);

  // Use conditional rendering instead of early return
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onKeyDown={handleKeyDown}
    >
      <div className="card bg-dark-secondary p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-900/30 rounded-lg">
              <ArrowDown className="text-orange-400 h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Borrow USDC</h3>
              <p className="text-gray-400 text-sm">
                Borrow USDC against your collateral
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Real-time Health Factor Alerts */}
        {alerts.length > 0 && (
          <div className="mb-6 space-y-2">
            {alerts.map((alert, index) => (
              <Alert
                key={index}
                variant={alert.includes("CRITICAL") ? "destructive" : "default"}
                className={
                  alert.includes("CRITICAL")
                    ? "border-red-500 bg-red-500/10"
                    : alert.includes("WARNING")
                      ? "border-yellow-500 bg-yellow-500/10 text-yellow-300"
                      : "border-blue-500 bg-blue-500/10"
                }
              >
                {alert.includes("CRITICAL") ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <Info className="h-4 w-4" />
                )}
                <AlertDescription className="text-sm">{alert}</AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Enhanced Form */}
        <EnhancedForm
          onSubmit={handleFormSubmit}
          submitText="Borrow USDC"
          loadingText="Processing Borrow..."
          showProgress
          disabled={loading || isBorrowDisabled}
        >
          <AmountField
            name="amount"
            label="Amount to Borrow"
            asset="USDC"
            max={maxBorrowable}
            min={0.01}
            precision={6}
            showMaxButton
            balance={maxBorrowable}
            showQuickButtons={[100, 500, 1000, 2500]}
            required
            disabled={loading}
            validation={{
              required: "Please enter an amount to borrow",
              custom: async (value: string) => {
                const amount = parseFloat(value);
                if (amount < 0.01) return "Minimum borrow amount is 0.01 USDC";
                if (amount > maxBorrowable) {
                  return `Maximum borrowable amount is ${maxBorrowable.toFixed(2)} USDC`;
                }

                // Health factor validation
                if (healthFactor && amount > 0) {
                  const newHealthFactor =
                    await calculateHealthFactorForAmount(amount);
                  if (newHealthFactor < 1.0) {
                    return "This amount would cause immediate liquidation";
                  }
                  if (newHealthFactor < 1.2) {
                    return "This amount would make your position extremely risky";
                  }
                  if (newHealthFactor < 1.5) {
                    return "Warning: This amount puts your position at risk of liquidation";
                  }
                }

                return undefined;
              },
            }}
            description={
              maxBorrowable > 0
                ? `Maximum borrowable: ${maxBorrowable.toFixed(2)} USDC`
                : undefined
            }
          />

          <NumberInput
            name="slippageTolerance"
            label="Slippage Tolerance"
            min={0.1}
            max={5}
            step={0.1}
            precision={1}
            suffix="%"
            validation={{
              required: "Slippage tolerance is required",
              custom: async (value: any) => {
                const num = parseFloat(value);
                if (num > 3)
                  return "High slippage may result in poor execution";
                return undefined;
              },
            }}
          />
        </EnhancedForm>

        {/* Real-time Position Health Status */}
        {healthFactor && (
          <div className="mt-6 border-t border-neutral-700 pt-4">
            <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
              <ArrowDown className="h-4 w-4" />
              Borrow Overview
            </h4>

            {/* Enhanced Health Factor Card */}
            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Health Factor</span>
                <div className="flex items-center gap-1">
                  {healthFactor?.riskLevel === "safe" ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : healthFactor?.riskLevel === "warning" ? (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
              <div
                className={`text-xl font-bold ${
                  healthFactor?.riskLevel === "safe"
                    ? "text-green-400"
                    : healthFactor?.riskLevel === "warning"
                      ? "text-yellow-400"
                      : "text-red-400"
                }`}
              >
                {healthFactor?.healthFactor ||
                  estimates.healthFactor.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {healthFactor?.riskLevel === "safe" &&
                  "Your position is healthy"}
                {healthFactor?.riskLevel === "warning" &&
                  "Monitor your position closely"}
                {healthFactor?.riskLevel === "danger" &&
                  "Position at high risk"}
              </p>
            </div>

            {/* Collateral and Liquidation Info */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-neutral-800/50 border border-neutral-700 rounded p-3">
                <div className="flex items-center gap-1 mb-1">
                  <Shield className="text-blue-400 h-3 w-3" />
                  <span className="text-xs text-neutral-400">
                    Required Collateral
                  </span>
                </div>
                <div className="text-sm font-semibold text-white">
                  $
                  {estimates.requiredCollateral > 0
                    ? estimates.requiredCollateral.toLocaleString()
                    : "--"}
                </div>
              </div>
              <div className="bg-neutral-800/50 border border-neutral-700 rounded p-3">
                <div className="flex items-center gap-1 mb-1">
                  <AlertTriangle className="text-red-400 h-3 w-3" />
                  <span className="text-xs text-neutral-400">
                    Liquidation Price
                  </span>
                </div>
                <div className="text-sm font-semibold text-white">
                  ${liquidationPrice > 0 ? liquidationPrice.toFixed(2) : "--"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Risk Disclaimer */}
        <div className="mt-6 p-3 rounded bg-blue-900/20 border border-blue-700 text-blue-300">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 text-blue-400 shrink-0" />
            <div className="text-sm">
              <strong>Risk Disclaimer:</strong> Borrowing involves liquidation
              risk. Monitor your health factor regularly and maintain adequate
              collateral ratios to avoid liquidation. Market volatility can
              affect your position's health factor.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
