"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { passkeysService } from "../services/passkey.service"
import {  stellarWalletService } from "../services/stellar-wallet.service"
import type { AuthUser, TransactionRequest } from "@/@types/stellar-wallet.entity"
import { toast } from "sonner"

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  stellarAccount: string | null
  login: (username: string, displayName: string) => Promise<void>
  authenticate: (username: string) => Promise<void>
  logout: () => void
  signTransaction: (transactionRequest: TransactionRequest) => Promise<string>
  submitTransaction: (signedXDR: string) => Promise<any>
  getAccountBalance: () => Promise<any[]>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stellarAccount, setStellarAccount] = useState<string | null>(null)

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("trustbridge_auth_user")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        parsedUser.createdAt = new Date(parsedUser.createdAt)
        setUser(parsedUser)
        setIsAuthenticated(true)
        setStellarAccount(parsedUser.stellarPublicKey || null)
      } catch (err) {
        console.error("Failed to parse stored user:", err)
      }
    }
  }, [])

  const login = async (username: string, displayName: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // Register passkey
      const credential = await passkeysService.registerPasskey(username, displayName)

      // Create Stellar wallet automatically
      const stellarWallet = await stellarWalletService.createWallet(credential.userId, credential.id)

      // Create user object with Stellar account
      const newUser: AuthUser = {
        id: credential.userId,
        username,
        displayName,
        credentialId: credential.id,
        stellarPublicKey: stellarWallet.publicKey,
        stellarAccountActivated: stellarWallet.activated,
        createdAt: new Date(),
      }

      // Store user data
      localStorage.setItem("trustbridge_auth_user", JSON.stringify(newUser))

      setUser(newUser)
      setStellarAccount(newUser.stellarPublicKey as string)
      setIsAuthenticated(true)

      // Show success message if account was activated
      if (stellarWallet.activated) {
        toast.success("Account created and activated on Stellar network!")
      } else {
        toast.info("Account created. Stellar activation pending.")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Account creation failed"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const authenticate = async (username: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // Authenticate with passkey
      const credential = await passkeysService.authenticatePasskey()

      // Load user data
      const storedUser = localStorage.getItem("trustbridge_auth_user")
      if (!storedUser) {
        throw new Error("User not found")
      }

      const parsedUser = JSON.parse(storedUser)
      parsedUser.createdAt = new Date(parsedUser.createdAt)

      setUser(parsedUser)
      setStellarAccount(parsedUser.stellarPublicKey || null)
      setIsAuthenticated(true)

      toast.success("Successfully authenticated!")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Authentication failed"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    setStellarAccount(null)
    setError(null)
    toast.info("Logged out successfully")
  }

  const signTransaction = async (transactionRequest: TransactionRequest): Promise<string> => {
    if (!user) throw new Error("User not authenticated")

    return await stellarWalletService.signTransaction(user.id, transactionRequest)
  }

  const submitTransaction = async (signedXDR: string): Promise<any> => {
    return await stellarWalletService.submitTransaction(signedXDR)
  }

  const getAccountBalance = async (): Promise<any[]> => {
    if (!stellarAccount) return []
    return await stellarWalletService.getAccountBalance(stellarAccount)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        stellarAccount,
        login,
        authenticate,
        logout,
        signTransaction,
        submitTransaction,
        getAccountBalance,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
