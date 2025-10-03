"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { stellarWalletService } from "@/services/stellar-wallet.service"
import { passkeysService } from "@/services/passkey.service"
import { useWalletContext } from "@/providers/wallet.provider"
import { toast } from "sonner"
import { Asset, Operation } from "@stellar/stellar-sdk"
import { RefreshCcw } from "lucide-react"

interface WalletManagementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WalletManagementDialog({ open, onOpenChange }: WalletManagementDialogProps) {
  const { walletAddress } = useWalletContext()
  const [activeTab, setActiveTab] = useState("balance")
  const [balances, setBalances] = useState<any[]>([])
  const [isLoadingBalance, setIsLoadingBalance] = useState(false)
  const [network, setNetwork] = useState<"testnet" | "mainnet">("testnet")

  // Transaction form state
  const [destination, setDestination] = useState("")
  const [amount, setAmount] = useState("")
  const [memo, setMemo] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Recovery state
  const [isRecovering, setIsRecovering] = useState(false)

  const [xlmPrice, setXlmPrice] = useState<number>(0)

  useEffect(() => {
    if (open && walletAddress) {
      loadBalance()
      fetchXLMPrice()
    }
  }, [open, walletAddress])

  const fetchXLMPrice = async () => {
    try {
      const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=usd")
      const data = await response.json()
      setXlmPrice(data.stellar?.usd || 0)
    } catch (error) {
      console.error("Failed to fetch XLM price:", error)
    }
  }

  const loadBalance = async () => {
    if (!walletAddress) return

    setIsLoadingBalance(true)
    try {
      const accountBalances = await stellarWalletService.getAccountBalance(walletAddress)
      setBalances(accountBalances)
    } catch (error) {
      console.error("Failed to load balance:", error)
      toast.error("Failed to load account balance")
    } finally {
      setIsLoadingBalance(false)
    }
  }

  const getXLMBalance = () => {
    const xlmBalance = balances.find((b) => b.asset_type === "native")
    return xlmBalance ? Number.parseFloat(xlmBalance.balance) : 0
  }

  const setAmountByPercentage = (percentage: number) => {
    const balance = getXLMBalance()
    const calculatedAmount = (balance * percentage) / 100
    setAmount(calculatedAmount.toFixed(7))
  }

  const setMaxAmount = () => {
    const balance = getXLMBalance()
    // Reserve 1 XLM for fees and minimum balance
    const maxAmount = Math.max(0, balance - 1)
    setAmount(maxAmount.toFixed(7))
  }

  const handleSignAndSubmitTransaction = async () => {
    if (!walletAddress || !destination || !amount) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    try {
      const paymentOp = Operation.payment({
        destination,
        asset: Asset.native(),
        amount: amount,
      })

      const signedXDR = await stellarWalletService.signTransaction(walletAddress, {
        operations: [paymentOp],
        memo: memo || undefined,
      })

      const result = await stellarWalletService.submitTransaction(signedXDR)

      toast.success("Transaction submitted successfully!")
      console.log("Transaction result:", result)

      setDestination("")
      setAmount("")
      setMemo("")

      await loadBalance()
    } catch (error) {
      console.error("Transaction failed:", error)
      toast.error("Transaction failed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNetworkSwitch = (newNetwork: "testnet" | "mainnet") => {
    setNetwork(newNetwork)
    toast.success(`Switched to ${newNetwork}`)
    loadBalance()
  }

  const handleAccountRecovery = async () => {
    if (!walletAddress) return

    setIsRecovering(true)
    try {
      const authResult = await passkeysService.authenticatePasskey()

      if (!authResult) {
        throw new Error("Authentication failed")
      }

      toast.success("Account recovered successfully!")
      await loadBalance()
    } catch (error) {
      console.error("Recovery failed:", error)
      toast.error("Failed to recover account. Please try again.")
    } finally {
      setIsRecovering(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar bg-dark-secondary border-custom">
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-2" style={{ color: "var(--text-light)" }}>
            Wallet Management
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            Manage your Stellar wallet, view balances, and send transactions
          </p>

          {/* Custom Tabs */}
          <div className="tab-buttons flex mb-6">
            <button
              className={`tab-btn ${activeTab === "balance" ? "active" : ""}`}
              onClick={() => setActiveTab("balance")}
            >
              Balance
            </button>
            <button
              className={`tab-btn ${activeTab === "transaction" ? "active" : ""}`}
              onClick={() => setActiveTab("transaction")}
            >
              Send
            </button>
            <button
              className={`tab-btn ${activeTab === "network" ? "active" : ""}`}
              onClick={() => setActiveTab("network")}
            >
              Network
            </button>
            <button
              className={`tab-btn ${activeTab === "recovery" ? "active" : ""}`}
              onClick={() => setActiveTab("recovery")}
            >
              Recovery
            </button>
          </div>

          {/* Balance Tab */}
          {activeTab === "balance" && (
            <div className="space-y-4">
              <div className="card p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold" style={{ color: "var(--text-light)" }}>
                    Account Balance
                  </h3>
                  <button className="btn-secondary text-sm" onClick={loadBalance} disabled={isLoadingBalance}>
                    {isLoadingBalance ? (
                      <span className="loader inline-block"></span>
                    ) : (
                      <RefreshCcw />
                    )}
                  </button>
                </div>
                <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
                  View your current account balances
                </p>
                {isLoadingBalance ? (
                  <div className="flex items-center justify-center py-8">
                    <span className="loader"></span>
                  </div>
                ) : balances.length > 0 ? (
                  <div className="space-y-3">
                    {balances.map((balance, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-dark-tertiary">
                        <div>
                          <p className="font-medium" style={{ color: "var(--text-light)" }}>
                            {balance.asset_type === "native" ? "XLM (Lumens)" : balance.asset_code}
                          </p>
                          {balance.asset_type !== "native" && (
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                              Issuer: {balance.asset_issuer.slice(0, 8)}...{balance.asset_issuer.slice(-8)}
                            </p>
                          )}
                          {balance.asset_type === "native" && xlmPrice > 0 && (
                            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                              ≈ ${(Number.parseFloat(balance.balance) * xlmPrice).toFixed(2)} USD
                            </p>
                          )}
                        </div>
                        <p className="text-lg font-semibold text-success">
                          {Number.parseFloat(balance.balance).toFixed(7)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8" style={{ color: "var(--text-muted)" }}>
                    No balances found
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Transaction Tab */}
          {activeTab === "transaction" && (
            <div className="space-y-4">
              <div className="card p-4">
                <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-light)" }}>
                  Send Transaction
                </h3>
                <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
                  Sign and submit a payment transaction
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="form-label">Destination Address</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="G..."
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="form-label">Amount (XLM)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.0000001"
                        className="form-input flex-1"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                      <button className="btn-secondary px-4" onClick={setMaxAmount}>
                        Max
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                        Balance: {getXLMBalance().toFixed(7)} XLM
                        {xlmPrice > 0 && <span className="ml-2">≈ ${(getXLMBalance() * xlmPrice).toFixed(2)} USD</span>}
                      </p>
                    </div>
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {[5, 10, 25, 50, 75, 100].map((percentage) => (
                        <button
                          key={percentage}
                          className="btn-secondary text-xs px-3 py-1"
                          onClick={() => setAmountByPercentage(percentage)}
                        >
                          {percentage}%
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Memo (Optional)</label>
                    <textarea
                      className="form-input"
                      placeholder="Add a note to your transaction"
                      value={memo}
                      onChange={(e) => setMemo(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <button
                    className="btn-primary w-full flex items-center justify-center"
                    onClick={handleSignAndSubmitTransaction}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="loader mr-2"></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane mr-2"></i>
                        Sign & Submit Transaction
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Network Tab */}
          {activeTab === "network" && (
            <div className="space-y-4">
              <div className="card p-4">
                <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-light)" }}>
                  Network Settings
                </h3>
                <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
                  Switch between Stellar networks
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="form-label">Select Network</label>
                    <select
                      className="form-select"
                      value={network}
                      onChange={(e) => handleNetworkSwitch(e.target.value as "testnet" | "mainnet")}
                    >
                      <option value="testnet">Testnet</option>
                      <option value="mainnet">Mainnet</option>
                    </select>
                  </div>
                  <div className="rounded-lg p-4 bg-dark-tertiary">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="text-xs font-medium px-2 py-1 rounded"
                        style={{
                          backgroundColor: network === "testnet" ? "rgba(55, 188, 100, 0.15)" : "var(--tertiary-dark)",
                          color: network === "testnet" ? "var(--primary-green)" : "var(--text-light)",
                        }}
                      >
                        {network === "testnet" ? "Test Network" : "Live Network"}
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                      {network === "testnet"
                        ? "You are connected to the Stellar test network. Transactions use test XLM with no real value."
                        : "You are connected to the Stellar public network. Transactions use real XLM."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recovery Tab */}
          {activeTab === "recovery" && (
            <div className="space-y-4">
              <div className="card p-4">
                <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-light)" }}>
                  Account Recovery
                </h3>
                <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
                  Re-authenticate using your passkey to recover account access
                </p>
                <div className="rounded-lg p-4 bg-dark-tertiary mb-4">
                  <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
                    If you've lost access to your account or need to verify your identity, you can re-authenticate using
                    your passkey. This will restore full access to your wallet.
                  </p>
                  <button
                    className="btn-primary w-full flex items-center justify-center"
                    onClick={handleAccountRecovery}
                    disabled={isRecovering}
                  >
                    {isRecovering ? (
                      <>
                        <span className="loader mr-2"></span>
                        Recovering...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-key mr-2"></i>
                        Re-authenticate with Passkey
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
