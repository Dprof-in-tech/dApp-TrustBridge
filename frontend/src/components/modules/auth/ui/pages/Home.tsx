"use client"

import Link from "next/link"
import { useState } from "react"
import { useWallet } from "../../hooks/wallet.hook"
import { useWalletContext } from "@/providers/wallet.provider"
import { PasskeyAuthDialog } from "@/components/modules/wallet/ui/passkey-auth-dialog"
import { Button } from "@/components/ui/button"
import { Fingerprint, Wallet } from "lucide-react"

export default function HomePage() {
  const { walletAddress } = useWalletContext()
  const { handleConnect } = useWallet()
  const [showPasskeyDialog, setShowPasskeyDialog] = useState(false)

  return (
    <div className="flex flex-col bg-dark-primary text-light">
      <div className="flex-grow">
        <section className="w-full py-12 md:py-24 lg:py-18 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="flex flex-col justify-center space-y-6 text-center md:text-left">
              <div className="space-y-4">
                <span className="network-badge mx-auto md:mx-0 w-fit">Powered by Stellar Blockchain</span>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  <span className="text-success">TrustBridge</span>
                  <span className="block mt-2 text-white">Decentralized Microloans</span>
                </h1>
                <p className="max-w-[600px] text-gray-400 text-base md:text-lg lg:text-xl mx-auto md:mx-0 leading-relaxed">
                  Connecting lenders and borrowers through secure, transparent, and efficient blockchain technology.
                  Build trust, create opportunity.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 justify-center md:justify-start pt-6">
                {/* External Wallet Connection */}
                <Button
                  className="btn-primary flex items-center justify-center gap-2"
                  onClick={handleConnect}
                  size="lg"
                >
                  <Wallet className="h-5 w-5" />
                  {walletAddress ? "Go to Dashboard" : "Connect Wallet"}
                </Button>

                {/* Passkey Authentication */}
                <Button
                  className="btn-secondary flex items-center justify-center gap-2"
                  onClick={() => setShowPasskeyDialog(true)}
                  variant="outline"
                  size="lg"
                >
                  <Fingerprint className="h-5 w-5" />
                  Sign In with Passkey
                </Button>

                <Link href="https://trustbridge.gitbook.io/docs">
                  <Button variant="ghost" size="lg" className="w-full md:w-auto">
                    <i className="fas fa-book-open mr-2"></i>
                    Learn More
                  </Button>
                </Link>
              </div>

              {/* Info Section */}
              <div className="pt-8 space-y-4">
                <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto md:mx-0">
                  <div className="p-4 rounded-lg bg-neutral-800 border border-neutral-700">
                    <div className="flex items-start gap-3">
                      <Wallet className="h-5 w-5 text-blue-400 mt-1" />
                      <div>
                        <h3 className="font-semibold text-white mb-1">External Wallet</h3>
                        <p className="text-sm text-gray-400">
                          Connect your existing Stellar wallet (Freighter, Albedo, etc.)
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-neutral-800 border border-neutral-700">
                    <div className="flex items-start gap-3">
                      <Fingerprint className="h-5 w-5 text-green-400 mt-1" />
                      <div>
                        <h3 className="font-semibold text-white mb-1">Passkey Auth</h3>
                        <p className="text-sm text-gray-400">Create account with biometrics - wallet auto-generated</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <PasskeyAuthDialog open={showPasskeyDialog} onOpenChange={setShowPasskeyDialog} />
    </div>
  )
}
