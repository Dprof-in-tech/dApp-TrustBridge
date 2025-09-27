"use client";

import { useSupply } from "../../hooks/useSupply.hook";
import { useWalletBalance } from "@/components/modules/marketplace/hooks/useWalletBalance.hook";
import { EnhancedForm } from "@/components/ui/form/EnhancedForm";
import { AmountField } from "@/components/ui/form-field";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { X, DollarSign, ArrowRight, Percent, Shield, Info } from "lucide-react";

interface SupplyUSDCModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function SupplyUSDCModal({
  isOpen,
  onClose,
  onSuccess,
}: SupplyUSDCModalProps) {
  const {
    balancesFormatted,
    balances,
    loading: loadingBalances,
    refresh,
  } = useWalletBalance();

  const {
    supplyAmount,
    loading,
    estimates,
    setSupplyAmount,
    handleSupplyUSDC,
    isSupplyDisabled,
  } = useSupply({
    isOpen,
    onClose,
    onSuccess: () => {
      onSuccess?.();
      refresh();
    },
  });

  const handleFormSubmit = async (data: any) => {
    const { amount, useAsCollateral } = data;
    setSupplyAmount(amount);

    // Simulate the supply process with form data
    await handleSupplyUSDC();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onKeyDown={handleKeyDown}
    >
      <div className="card bg-dark-secondary p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-900/30 rounded-lg">
              <DollarSign className="text-green-400 h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-neutral-100">
                Supply USDC
              </h3>
              <p className="text-sm text-neutral-400">
                Earn yield by supplying USDC to the lending pool
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Enhanced Form */}
        <EnhancedForm
          onSubmit={handleFormSubmit}
          submitText="Supply USDC"
          loadingText="Processing Transaction..."
          showProgress
          disabled={loading || loadingBalances}
        >
          <AmountField
            name="amount"
            label="Amount to Supply"
            asset="USDC"
            balance={balances?.USDC ? parseFloat(balances.USDC) : undefined}
            min={0.01}
            precision={6}
            showMaxButton
            showQuickAmounts
            quickAmounts={[25, 50, 100, 500]}
            required
            disabled={loading || loadingBalances}
            validation={{
              required: "Please enter an amount to supply",
              custom: async (value: string) => {
                const amount = parseFloat(value);
                if (amount < 0.01) return "Minimum supply amount is 0.01 USDC";
                if (balances?.USDC && amount > parseFloat(balances.USDC)) {
                  return "Insufficient USDC balance";
                }
                return undefined;
              },
            }}
          />

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch id="useAsCollateral" />
              <Label
                htmlFor="useAsCollateral"
                className="text-sm text-neutral-300"
              >
                Use as Collateral
              </Label>
            </div>
            <p className="text-xs text-neutral-500">
              Allow this deposit to be used as collateral for borrowing
            </p>
          </div>
        </EnhancedForm>
        {/* Transaction Preview */}
        {estimates.expectedBTokens > 0 && (
          <div className="mb-6 mt-6">
            <div className="border-t border-neutral-700 pt-4 space-y-4">
              <h4 className="text-sm font-medium text-neutral-300 flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                Transaction Preview
              </h4>

              {/* You Will Receive */}
              <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-neutral-400">
                    You will receive
                  </span>
                  <span className="text-xs text-green-300 bg-green-900/30 border border-green-700 px-2 py-1 rounded">
                    bUSDC Tokens
                  </span>
                </div>
                <div className="text-xl font-bold text-green-400">
                  ~{estimates.expectedBTokens}
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  Receipt tokens representing your pool share
                </p>
              </div>

              {/* Pool Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-neutral-800/50 border border-neutral-700 rounded p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <Percent className="text-green-400 h-3 w-3" />
                    <span className="text-xs text-neutral-400">Supply APY</span>
                  </div>
                  <div className="text-sm font-semibold text-green-400">
                    {estimates.currentSupplyAPY}%
                  </div>
                </div>

                <div className="bg-neutral-800/50 border border-neutral-700 rounded p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <Shield className="text-blue-400 h-3 w-3" />
                    <span className="text-xs text-neutral-400">
                      Health Factor
                    </span>
                  </div>
                  <div
                    className={`text-sm font-semibold ${
                      estimates.newPositionHealth > 50
                        ? "text-green-400"
                        : "text-yellow-400"
                    }`}
                  >
                    {estimates.newPositionHealth}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Alert */}
        <div className="bg-blue-900/20 border border-blue-700/50 text-blue-300 text-sm rounded p-3 mb-6">
          <div className="flex items-start gap-2">
            <Info className="text-blue-400 h-4 w-4 mt-0.5 shrink-0" />
            <p>
              <strong>About bUSDC:</strong> These tokens automatically earn
              yield and represent your share of the pool. You can redeem them
              anytime for USDC plus accrued interest.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
