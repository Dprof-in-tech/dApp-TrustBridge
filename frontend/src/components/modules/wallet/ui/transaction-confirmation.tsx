"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface TransactionOperation {
  type: string
  description: string
  amount?: string
  asset?: string
  destination?: string
}

interface TransactionConfirmationProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  transactionDetails: {
    operations: TransactionOperation[]
    fee: string
    memo?: string
  }
}

export function TransactionConfirmation({
  isOpen,
  onClose,
  onConfirm,
  transactionDetails,
}: TransactionConfirmationProps) {
  const [isConfirming, setIsConfirming] = useState(false)

  const handleConfirm = async () => {
    setIsConfirming(true)
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      console.error("Transaction confirmation failed:", error)
    } finally {
      setIsConfirming(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Transaction</DialogTitle>
          <DialogDescription>Review the transaction details before signing</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Operations */}
          <div>
            <h4 className="font-medium mb-2">Operations</h4>
            <div className="space-y-2">
              {transactionDetails.operations.map((op, index) => (
                <div key={index} className="p-3 border rounded bg-muted/50">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{op.type}</span>
                    {op.amount && op.asset && (
                      <span className="text-sm">
                        {op.amount} {op.asset}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{op.description}</p>
                  {op.destination && (
                    <p className="text-xs text-muted-foreground mt-1">
                      To: {op.destination.substring(0, 8)}...{op.destination.substring(op.destination.length - 8)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Fee */}
          <div className="flex justify-between py-2 border-t">
            <span>Network Fee</span>
            <span>{transactionDetails.fee} XLM</span>
          </div>

          {/* Memo */}
          {transactionDetails.memo && (
            <div className="flex justify-between py-2">
              <span>Memo</span>
              <span className="text-sm">{transactionDetails.memo}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isConfirming}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isConfirming}>
            {isConfirming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Confirming...
              </>
            ) : (
              "Confirm & Sign"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
