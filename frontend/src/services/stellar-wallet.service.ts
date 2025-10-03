import { Keypair, Horizon, Networks, TransactionBuilder, Memo, BASE_FEE } from "@stellar/stellar-sdk"
import { keyManagementService } from "./key-management.service"
import type { TransactionRequest } from "@/@types/stellar-wallet.entity"
import { db, doc, getDoc } from "@/lib/firebase"
import type { PasskeyWalletData } from "@/@types/user.entity"
import { Buffer } from "buffer"

export class StellarWalletService {
  private server: Horizon.Server
  private networkPassphrase: string
  private network: "testnet" | "mainnet"

  constructor(network: "testnet" | "mainnet" = "testnet") {
    this.network = network
    this.server = new Horizon.Server(
      network === "testnet" ? "https://horizon-testnet.stellar.org" : "https://horizon.stellar.org",
    )
    this.networkPassphrase = network === "testnet" ? Networks.TESTNET : Networks.PUBLIC
  }

  async createWallet(userId: string, passkeyCredential: string): Promise<PasskeyWalletData> {
    try {
      // Generate keypair using deterministic seed from passkey
      const seed = await this.deriveSeedFromPasskey(userId, passkeyCredential)
      const keypair = Keypair.fromRawEd25519Seed(Buffer.from(seed))

      // Encrypt private key before storage
      const { encryptedData, salt, iv } = await keyManagementService.encryptPrivateKey(keypair.secret(), userId)

      const walletData: PasskeyWalletData = {
        credentialId: passkeyCredential,
        publicKey: passkeyCredential,
        encryptedPrivateKey: encryptedData,
        stellarPublicKey: keypair.publicKey(),
        salt,
        iv,
        activated: false,
      }

      // Attempt to activate account
      await this.activateAccount(keypair.publicKey())

      walletData.activated = true

      return walletData
    } catch (error) {
      console.error("Wallet creation failed:", error)
      throw new Error("Failed to create Stellar wallet")
    }
  }

  private async deriveSeedFromPasskey(userId: string, credentialId: string): Promise<Uint8Array> {
    // Derive deterministic seed from user ID and passkey credential
    const encoder = new TextEncoder()
    const data = encoder.encode(userId + credentialId + "stellar-seed") as BufferSource

    const keyMaterial = await crypto.subtle.importKey("raw", data, { name: "PBKDF2" }, false, ["deriveBits"])

    const salt = encoder.encode("trustbridge-stellar-salt") as BufferSource
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      256, // 32 bytes for Ed25519 seed
    )

    return new Uint8Array(derivedBits)
  }

  async activateAccount(publicKey: string): Promise<void> {
    try {
      // Check if account already exists
      try {
        await this.server.loadAccount(publicKey)
        return // Already activated
      } catch {
        // Account doesn't exist, needs activation
      }

      // For testnet, use friendbot to fund account
      if (this.network === "testnet") {
        const response = await fetch(`https://friendbot.stellar.org?addr=${publicKey}`)

        if (!response.ok) {
          throw new Error("Failed to activate account with friendbot")
        }
      } else {
        // For mainnet, account needs to be funded externally
        console.log("Mainnet account created but requires external funding")
      }
    } catch (error) {
      console.error("Account activation failed:", error)
      throw error
    }
  }

  async getWalletData(walletAddress: string): Promise<PasskeyWalletData | null> {
    if (!db) return null

    try {
      const userDoc = await getDoc(doc(db, "users", walletAddress))
      if (!userDoc.exists()) return null

      const userData = userDoc.data()
      return userData.passkeyData || null
    } catch (error) {
      console.error("Error retrieving wallet data:", error)
      return null
    }
  }

  async signTransaction(walletAddress: string, transactionRequest: TransactionRequest): Promise<string> {
    const walletData = await this.getWalletData(walletAddress)
    if (!walletData) {
      throw new Error("Wallet not found")
    }

    if (!walletData.activated) {
      throw new Error("Account not activated")
    }

    try {
      // Decrypt private key
      const privateKey = await keyManagementService.decryptPrivateKey(
        walletData.encryptedPrivateKey,
        walletData.salt,
        walletData.iv,
        walletAddress,
      )

      const keypair = Keypair.fromSecret(privateKey)

      // Load account
      const account = await this.server.loadAccount(walletData.stellarPublicKey)

      // Build transaction
      let txBuilder = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: this.networkPassphrase,
      })

      // Add operations
      transactionRequest.operations.forEach((op) => {
        txBuilder = txBuilder.addOperation(op)
      })

      // Add memo if provided
      if (transactionRequest.memo) {
        txBuilder = txBuilder.addMemo(Memo.text(transactionRequest.memo))
      }

      // Set time bounds
      if (transactionRequest.timeBounds) {
        txBuilder = txBuilder.setTimeout(transactionRequest.timeBounds.maxTime)
      } else {
        txBuilder = txBuilder.setTimeout(300) // 5 minutes default
      }

      const transaction = txBuilder.build()

      // Sign transaction
      transaction.sign(keypair)

      return transaction.toXDR()
    } catch (error) {
      console.error("Transaction signing failed:", error)
      throw new Error("Failed to sign transaction")
    }
  }

  async submitTransaction(signedTransactionXDR: string): Promise<any> {
    try {
      const transaction = TransactionBuilder.fromXDR(signedTransactionXDR, this.networkPassphrase)

      const result = await this.server.submitTransaction(transaction)
      return result
    } catch (error) {
      console.error("Transaction submission failed:", error)
      throw new Error("Failed to submit transaction")
    }
  }

  async getAccountBalance(publicKey: string): Promise<any[]> {
    try {
      const account = await this.server.loadAccount(publicKey)
      return account.balances
    } catch (error) {
      console.error("Failed to get account balance:", error)
      return []
    }
  }

  async getAccountInfo(publicKey: string): Promise<any> {
    try {
      const account = await this.server.loadAccount(publicKey)
      return {
        accountId: account.accountId(),
        sequenceNumber: account.sequenceNumber(),
        balances: account.balances,
        signers: account.signers,
        thresholds: account.thresholds,
        flags: account.flags,
        dataEntries: account.data_attr,
      }
    } catch (error) {
      console.error("Failed to get account info:", error)
      return null
    }
  }
}

export const stellarWalletService = new StellarWalletService()
