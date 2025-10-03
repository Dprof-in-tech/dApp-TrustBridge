export interface UserProfile {
  walletAddress: string;
  firstName: string;
  lastName: string;
  country: string;
  phoneNumber: string;
  createdAt: number;
  updatedAt: number;
  authMethod?: "external" | "passkey";
  passkeyData?: PasskeyWalletData;
}

export interface UserProfileFormData {
  firstName: string;
  lastName: string;
  country: string;
  phoneNumber: string;
}

export interface UserChatData {
  firstName: string;
  lastName: string;
  walletAddress: string;
}

export interface PasskeyWalletData {
  credentialId: string
  publicKey: string
  encryptedPrivateKey: string
  stellarPublicKey: string
  salt: string
  iv: string
  activated: boolean
}
