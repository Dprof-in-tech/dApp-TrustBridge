export class KeyManagementService {
  private readonly ALGORITHM = "AES-GCM"
  private readonly KEY_LENGTH = 256

  async encryptPrivateKey(
    privateKey: string,
    userId: string,
  ): Promise<{ encryptedData: string; salt: string; iv: string }> {
    try {
      // Generate random salt and IV
      const salt = crypto.getRandomValues(new Uint8Array(16))
      const iv = crypto.getRandomValues(new Uint8Array(12))

      // Derive encryption key
      const encryptionKey = await this.deriveEncryptionKey(userId, salt)

      // Encrypt private key
      const encoder = new TextEncoder()
      const data = encoder.encode(privateKey) as BufferSource

      const encryptedData = await crypto.subtle.encrypt(
        {
          name: this.ALGORITHM,
          iv: iv as BufferSource,
        },
        encryptionKey,
        data,
      )

      // Return encrypted data and metadata as base64
      return {
        encryptedData: btoa(String.fromCharCode(...new Uint8Array(encryptedData))),
        salt: btoa(String.fromCharCode(...salt)),
        iv: btoa(String.fromCharCode(...iv)),
      }
    } catch (error) {
      console.error("Private key encryption failed:", error)
      throw new Error("Failed to encrypt private key")
    }
  }

  async decryptPrivateKey(
    encryptedPrivateKey: string,
    saltBase64: string,
    ivBase64: string,
    userId: string,
  ): Promise<string> {
    try {
      console.log("Starting decryption for userId:", userId)
      const salt = new Uint8Array(
        atob(saltBase64)
          .split("")
          .map((char) => char.charCodeAt(0)),
      )
      const iv = new Uint8Array(
        atob(ivBase64)
          .split("")
          .map((char) => char.charCodeAt(0)),
      )

      console.log("Salt and IV decoded successfully")

      // Derive encryption key
      const encryptionKey = await this.deriveEncryptionKey(userId, salt)

      console.log("Encryption key derived")

      // Decode encrypted data from base64
      const encryptedData = new Uint8Array(
        atob(encryptedPrivateKey)
          .split("")
          .map((char) => char.charCodeAt(0)),
      ) as BufferSource

      console.log("Encrypted data decoded, attempting decryption")

      // Decrypt
      const decryptedData = await crypto.subtle.decrypt(
        {
          name: this.ALGORITHM,
          iv: iv as BufferSource,
        },
        encryptionKey,
        encryptedData,
      )

      console.log("Decryption successful")

      // Convert back to string
      const decoder = new TextDecoder()
      return decoder.decode(decryptedData)
    } catch (error) {
      console.error("Private key decryption failed:", error)
      throw new Error("Failed to decrypt private key")
    }
  }

  private async deriveEncryptionKey(userId: string, salt: Uint8Array): Promise<CryptoKey> {
    // Derive key from user ID only (no device-specific data)
    const encoder = new TextEncoder()
    const userData = encoder.encode(userId + "trustbridge-stellar-encryption") as BufferSource

    // Import as key material
    const keyMaterial = await crypto.subtle.importKey("raw", userData, { name: "PBKDF2" }, false, ["deriveKey"])

    // Derive actual encryption key
    return await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt as BufferSource,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH,
      },
      false,
      ["encrypt", "decrypt"],
    )
  }
}

export const keyManagementService = new KeyManagementService()
