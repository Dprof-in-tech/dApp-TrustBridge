"use client";

import { useEffect, useState } from "react";
import { useBorrow } from "../../hooks/useBorrow.hook";
import { 
  monitorHealthFactor, 
  getHealthFactorAlerts, 
  calculateMaxBorrowable,
  calculateLiquidationPrice,
  type HealthFactorResult 
} from "@/helpers/health-factor.helper";
import { useWalletContext } from "@/providers/wallet.provider";
import { EnhancedForm } from "@/components/ui/form/EnhancedForm";
import { NumberInput } from "@/components/ui/form/NumberInput";
import { AmountField } from "@/components/ui/form-field";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { X, ArrowDown, AlertTriangle, Info, CheckCircle, Shield } from "lucide-react";

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
  const [healthFactor, setHealthFactor] = useState<HealthFactorResult | null>(null);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [maxBorrowable, setMaxBorrowable] = useState<number>(0);
  const [liquidationPrice, setLiquidationPrice] = useState<number>(0);

  const {
    borrowAmount,
    loading,
    estimates,
    setBorrowAmount,
    handleBorrow,
    isHealthy,
    isAtRisk,
    isBorrowDisabled,
  } = useBorrow({ isOpen, onClose, poolId });

  const handleFormSubmit = async (data: any) => {
    const { amount, slippageTolerance } = data;
    setBorrowAmount(amount);
    
    // Handle borrow with form data
    await handleBorrow();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  // Calculate health factor for a given borrow amount
  const calculateHealthFactorForAmount = async (borrowAmount: number): Promise<number> => {
    if (!healthFactor) return 1.0;
    
    const newBorrowedValue = healthFactor.borrowedValue + borrowAmount;
    const newHealthFactor = (healthFactor.collateralValue * 0.85) / newBorrowedValue;
    
    return newHealthFactor;
  };

  if (!isOpen) return null;
  useEffect(() => {
    if (!isOpen || !walletAddress) return;

    const stopMonitoring = monitorHealthFactor(walletAddress, (result) => {
      setHealthFactor(result);
      setAlerts(getHealthFactorAlerts(result));
      
      // Calculate max borrowable amount
      const maxBorrow = calculateMaxBorrowable(
        result.collateralValue,
        85, // USDC collateral factor
        result.borrowedValue
      );
      setMaxBorrowable(maxBorrow);
      
      // Calculate liquidation price
      const liqPrice = calculateLiquidationPrice(
        result.borrowedValue,
        result.collateralValue,
        85 // USDC collateral factor
      );
      setLiquidationPrice(liqPrice);
    });

    return stopMonitoring;
  }, [isOpen, walletAddress]);

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
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Real-time Health Factor Alerts */}
        {alerts.length > 0 && (
          <div className="mb-6 space-y-2">
            {alerts.map((alert, index) => (
              <Alert
                key={index}
                variant={alert.includes('CRITICAL') ? 'destructive' : 'default'}
                className={
                  alert.includes('CRITICAL')
                    ? 'border-red-500 bg-red-500/10'
                    : alert.includes('WARNING')
                    ? 'border-yellow-500 bg-yellow-500/10 text-yellow-300'
                    : 'border-blue-500 bg-blue-500/10'
                }
              >
                {alert.includes('CRITICAL') ? (
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
                  const newHealthFactor = await calculateHealthFactorForAmount(amount);
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
              }
            }}
            description={maxBorrowable > 0 ? `Maximum borrowable: ${maxBorrowable.toFixed(2)} USDC` : undefined}
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
                if (num > 3) return "High slippage may result in poor execution";
                return undefined;
              }
            }}
          />
        </EnhancedForm>

        {/* Transaction Preview */}
        {borrowAmount && Number(borrowAmount) > 0 && (
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
                  {healthFactor?.riskLevel === 'safe' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : healthFactor?.riskLevel === 'warning' ? (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
              <div
                className={`text-xl font-bold ${
                  healthFactor?.riskLevel === 'safe'
                    ? "text-green-400"
                    : healthFactor?.riskLevel === 'warning'
                    ? "text-yellow-400"
                    : "text-red-400"
                }`}
              >
                {healthFactor?.healthFactor || estimates.healthFactor.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {healthFactor?.riskLevel === 'safe' && "Your position is healthy"}
                {healthFactor?.riskLevel === 'warning' && "Monitor your position closely"}
                {healthFactor?.riskLevel === 'danger' && "Position at high risk"}
              </p>
            </div>

            {/* Collateral and Liquidation Info */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-neutral-800/50 border border-neutral-700 rounded p-3">
                <div className="flex items-center gap-1 mb-1">
                  <Shield className="text-blue-400 h-3 w-3" />
                  <span className="text-xs text-neutral-400">Required Collateral</span>
                </div>
                <div className="text-sm font-semibold text-white">
                  ${estimates.requiredCollateral > 0 ? estimates.requiredCollateral.toLocaleString() : "--"}
                </div>
              </div>
              <div className="bg-neutral-800/50 border border-neutral-700 rounded p-3">
                <div className="flex items-center gap-1 mb-1">
                  <AlertTriangle className="text-red-400 h-3 w-3" />
                  <span className="text-xs text-neutral-400">Liquidation Price</span>
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
              <strong>Risk Disclaimer:</strong> Borrowing involves liquidation risk. Monitor your health factor regularly and maintain adequate collateral ratios to avoid liquidation. Market volatility can affect your position's health factor.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
                  }`}
                >
                  {healthFactor?.healthFactor ? healthFactor.healthFactor.toFixed(2) : estimates.healthFactor.toFixed(2)}
                </div>
                <div className="mt-2">
                  <div className="w-full bg-dark-tertiary rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        healthFactor?.riskLevel === 'safe'
                          ? "bg-success"
                          : healthFactor?.riskLevel === 'warning'
                            ? "bg-warning"
                            : "bg-danger"
                      }`}
                      style={{
                        width: `${Math.min(100, Math.max(0, ((healthFactor?.healthFactor || estimates.healthFactor) / 3) * 100))}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>
                      {healthFactor?.riskLevel === 'safe'
                        ? "Healthy position"
                        : healthFactor?.riskLevel === 'warning'
                          ? "At risk"
                          : "Liquidation risk"}
                    </span>
                    <span>Liquidation: 1.0</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Borrow Stats */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="card p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <i className="fas fa-percentage text-warning text-xs"></i>
                    <span className="text-xs text-gray-400">Borrow APY</span>
                  </div>
                  <div className="text-sm font-semibold text-warning">
                    {estimates.borrowAPY}%
                  </div>
                </div>
                <div className="card p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <i className="fas fa-shield text-gray-400 text-xs"></i>
                    <span className="text-xs text-gray-400">
                      Liquidation Threshold
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-white">
                    {estimates.liquidationThreshold}%
                  </div>
                </div>
              </div>

              {/* Collateral Information */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="card p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <i className="fas fa-dollar-sign text-gray-400 text-xs"></i>
                      <span className="text-xs text-gray-400">
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
                </div>
                <div className="card p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <i className="fas fa-chart-line text-gray-400 text-xs"></i>
                      <span className="text-xs text-gray-400">
                        Liquidation Price
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-white">
                      ${liquidationPrice > 0 ? liquidationPrice.toFixed(2) : "--"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Position Summary */}
              {healthFactor && (
                <div className="card p-3 mb-3">
                  <div className="text-xs text-gray-400 mb-2">Current Position</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-400">Collateral:</span>
                      <span className="text-white ml-1">${healthFactor.collateralValue.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Borrowed:</span>
                      <span className="text-white ml-1">${healthFactor.borrowedValue.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Ratio:</span>
                      <span className="text-white ml-1">{healthFactor.collateralRatio.toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Max Borrow:</span>
                      <span className="text-success ml-1">${maxBorrowable.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Enhanced Health Factor Warning */}
          {(healthFactor || estimates.healthFactor > 0) && (
            <div
              className={`p-3 rounded border-l-4 ${
                (healthFactor?.riskLevel || (isHealthy ? 'safe' : isAtRisk ? 'warning' : 'danger')) === 'safe'
                  ? "bg-green-900 bg-opacity-20 border-success text-success"
                  : (healthFactor?.riskLevel || (isHealthy ? 'safe' : isAtRisk ? 'warning' : 'danger')) === 'warning'
                    ? "bg-yellow-900 bg-opacity-20 border-warning text-warning"
                    : "bg-red-900 bg-opacity-20 border-danger text-danger"
              }`}
            >
              <div className="flex items-start gap-2">
                {(healthFactor?.riskLevel || (isHealthy ? 'safe' : isAtRisk ? 'warning' : 'danger')) === 'safe' ? (
                  <i className="fas fa-check-circle mt-0.5"></i>
                ) : (
                  <i className="fas fa-exclamation-triangle mt-0.5"></i>
                )}
                <div className="text-sm">
                  {healthFactor?.recommendations?.[0] || (
                    isHealthy ? (
                      <>
                        <strong>Healthy Position:</strong> You have sufficient
                        collateral buffer for this borrow amount.
                      </>
                    ) : isAtRisk ? (
                      <>
                        <strong>Position At Risk:</strong> Consider reducing
                        borrow amount or adding more collateral.
                      </>
                    ) : (
                      <>
                        <strong>Dangerous Position:</strong> This could lead to
                        immediate liquidation!
                      </>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Risk Disclaimer */}
          <div className="p-3 rounded bg-blue-900 bg-opacity-20 border border-blue-700 text-blue-300">
            <div className="flex items-start gap-2">
              <i className="fas fa-info-circle mt-0.5 text-blue-400"></i>
              <div className="text-sm">
                <strong>Risk Disclaimer:</strong> Borrowing involves liquidation
                risk. Monitor your health factor regularly and maintain adequate
                collateral ratios to avoid liquidation. Market volatility can
                affect your position&apos;s health factor.
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-2">
            <button
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className={`${
                healthFactor?.riskLevel === 'liquidatable' || healthFactor?.riskLevel === 'danger'
                  ? 'btn-danger'
                  : 'btn-primary'
              }`}
              onClick={handleBorrow}
              disabled={isBorrowDisabled || healthFactor?.riskLevel === 'liquidatable'}
            >
              {loading ? (
                <>
                  <div className="loader mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <i className="fas fa-arrow-down mr-2"></i>
                  Borrow USDC
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
