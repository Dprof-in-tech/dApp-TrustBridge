//@ts-nocheck
"use client"

import type { PasskeyCredential } from "@/@types/stellar-wallet.entity"
import { db, doc, getDoc, updateDoc } from "@/lib/firebase"
import type { PasskeyWalletData } from "@/@types/user.entity"

export class PasskeysService {
    async registerPasskey(username: string, displayName: string): Promise<PasskeyCredential> {
        try {
            if (!window.PublicKeyCredential) {
                throw new Error("WebAuthn is not supported in this browser")
            }

            // Generate a random user ID
            const userId = crypto.randomUUID()
            const userIdBuffer = new TextEncoder().encode(userId)

            // Generate a random challenge
            const challenge = crypto.getRandomValues(new Uint8Array(32))

            // Create credential options
            const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
                challenge,
                rp: {
                    name: "TrustBridge",
                    id: typeof window !== "undefined" ? window.location.hostname : "localhost",
                },
                user: {
                    id: userIdBuffer as Buffer,
                    name: username,
                    displayName: displayName,
                },
                pubKeyCredParams: [
                    { alg: -7, type: "public-key" }, 
                    { alg: -257, type: "public-key" },
                ],
                authenticatorSelection: {
                    authenticatorAttachment: "platform",
                    requireResidentKey: true,
                    residentKey: "required",
                    userVerification: "required",
                },
                timeout: 60000,
                attestation: "none",
            }

            // Create credential
            const credential = (await navigator.credentials.create({
                publicKey: publicKeyCredentialCreationOptions,
            })) as PublicKeyCredential

            if (!credential) {
                throw new Error("Failed to create credential")
            }

            // Extract credential data
            const credentialId = this.bufferToBase64(credential.rawId)
            const response = credential.response as AuthenticatorAttestationResponse
            const publicKey = this.bufferToBase64(response.getPublicKey()!)

            const passkeyCredential: PasskeyCredential = {
                id: credentialId,
                userId,
                publicKey,
                counter: 0,
            }

            return passkeyCredential
        } catch (error) {
            console.error("Passkey registration failed:", error)
            throw new Error("Failed to register passkey")
        }
    }

    async authenticatePasskey(): Promise<{ credentialId: string; walletAddress: string } | null> {
        try {
            // Check if WebAuthn is supported
            if (!window.PublicKeyCredential) {
                throw new Error("WebAuthn is not supported in this browser")
            }

            // Generate a random challenge
            const challenge = crypto.getRandomValues(new Uint8Array(32))

            // Create authentication options
            const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
                challenge,
                timeout: 60000,
                userVerification: "required",
                rpId: typeof window !== "undefined" ? window.location.hostname : "localhost",
            }

            // Get credential
            const credential = (await navigator.credentials.get({
                publicKey: publicKeyCredentialRequestOptions,
            })) as PublicKeyCredential

            if (!credential) {
                throw new Error("Failed to authenticate")
            }

            // Extract credential data
            const credentialId = this.bufferToBase64(credential.rawId)

            const walletAddress = await this.getWalletAddressByCredentialId(credentialId)

            if (!walletAddress) {
                throw new Error("Wallet not found for this passkey")
            }

            return { credentialId, walletAddress }
        } catch (error) {
            console.error("Passkey authentication failed:", error)
            throw new Error("Failed to authenticate with passkey")
        }
    }

    private async getWalletAddressByCredentialId(credentialId: string): Promise<string | null> {
        if (!db) return null

        try {
            // Store credential ID mapping in localStorage for quick lookup
            const walletAddress = localStorage.getItem(`passkey_wallet_${credentialId}`)
            if (walletAddress) {
                return walletAddress
            }
            return null
        } catch (error) {
            console.error("Error retrieving wallet address:", error)
            return null
        }
    }

    async storePasskeyData(walletAddress: string, credentialId: string, passkeyData: PasskeyWalletData): Promise<void> {
        if (!db) throw new Error("Firebase not available")

        try {
            // Update user document with passkey data
            await updateDoc(doc(db, "users", walletAddress), {
                authMethod: "passkey",
                passkeyData: passkeyData,
                updatedAt: Date.now(),
            })
            localStorage.setItem(`passkey_wallet_${credentialId}`, walletAddress)
        } catch (error) {
            console.error("Error storing passkey data:", error)
            throw new Error("Failed to store passkey data")
        }
    }

    async getPasskeyData(walletAddress: string): Promise<PasskeyWalletData | null> {
        if (!db) return null

        try {
            const userDoc = await getDoc(doc(db, "users", walletAddress))
            if (!userDoc.exists()) return null

            const userData = userDoc.data()
            return userData.passkeyData || null
        } catch (error) {
            console.error("Error retrieving passkey data:", error)
            return null
        }
    }

    private bufferToBase64(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer)
        let binary = ""
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i])
        }
        return btoa(binary)
    }
}

export const passkeysService = new PasskeysService()
