"use client"

import { useState } from "react"
import { useWalletContext } from "@/providers/wallet.provider"
import { passkeysService } from "@/services/passkey.service"
import { stellarWalletService } from "@/services/stellar-wallet.service"
import { db, doc, getDoc, setDoc } from "@/lib/firebase"
import type { UserProfile } from "@/@types/user.entity"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export const usePasskeyAuth = () => {
  const { setWalletInfo, clearWalletInfo } = useWalletContext()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const registerWithPasskey = async (email: string, displayName: string) => {
    if (!db) {
      toast.error("Firebase is not available")
      return
    }

    setIsLoading(true)
    try {
      // Register passkey
      const passkeyCredential = await passkeysService.registerPasskey(email, displayName)

      // Create Stellar wallet
      const walletData = await stellarWalletService.createWallet(passkeyCredential.userId, passkeyCredential.id)

      // Create user profile in Firebase
      const now = Date.now()
      const userProfile: UserProfile = {
        walletAddress: walletData.stellarPublicKey,
        firstName: displayName.split(" ")[0] || "",
        lastName: displayName.split(" ").slice(1).join(" ") || "",
        country: "",
        phoneNumber: "",
        createdAt: now,
        updatedAt: now,
        authMethod: "passkey",
        passkeyData: walletData,
      }

      await setDoc(doc(db, "users", walletData.stellarPublicKey), userProfile)

      // Store passkey data
      await passkeysService.storePasskeyData(walletData.stellarPublicKey, passkeyCredential.id, walletData)

      // Set wallet context
      setWalletInfo(walletData.stellarPublicKey, displayName)

      toast.success("Account created successfully!")
      router.push("/dashboard")
    } catch (error) {
      console.error("Passkey registration failed:", error)
      toast.error("Failed to create account with passkey")
    } finally {
      setIsLoading(false)
    }
  }

  const signInWithPasskey = async () => {
    if (!db) {
      toast.error("Firebase is not available")
      return
    }

    setIsLoading(true)
    try {
      // Authenticate with passkey
      const authResult = await passkeysService.authenticatePasskey()

      if (!authResult) {
        throw new Error("Authentication failed")
      }

      // Load user profile
      const userDoc = await getDoc(doc(db, "users", authResult.walletAddress))

      if (!userDoc.exists()) {
        throw new Error("User profile not found")
      }

      const userData = userDoc.data() as UserProfile
      const displayName =
        userData.firstName && userData.lastName ? `${userData.firstName} ${userData.lastName}`.trim() : "Passkey User"

      // Set wallet context
      setWalletInfo(authResult.walletAddress, displayName)

      toast.success(`Welcome back, ${displayName}!`)
      router.push("/dashboard")
    } catch (error) {
      console.error("Passkey sign in failed:", error)
      toast.error("Failed to sign in with passkey")
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    clearWalletInfo()
    router.push("/")
    toast.success("Signed out successfully")
  }

  return {
    registerWithPasskey,
    signInWithPasskey,
    signOut,
    isLoading,
  }
}
