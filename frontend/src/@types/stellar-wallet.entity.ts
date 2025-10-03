export interface StellarWallet {
  publicKey: string
  encryptedPrivateKey: string
  accountId: string
  isActivated: boolean
  network: "testnet" | "mainnet"
  createdAt: Date
}

export interface TransactionRequest {
  operations: any[]
  memo?: string
  timeBounds?: {
    minTime: number
    maxTime: number
  }
}

export interface AuthUser {
  id: string
  username: string
  displayName: string
  credentialId: string
  stellarPublicKey?: string
  stellarAccountActivated?: boolean
  createdAt: Date
}

export interface PasskeyCredential {
  id: string
  userId: string
  publicKey: string
  counter: number
}
