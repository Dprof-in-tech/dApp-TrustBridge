"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePasskeyAuth } from "@/hooks/use-passkey-auth"
import { Fingerprint, Loader2 } from "lucide-react"

interface PasskeyAuthDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function PasskeyAuthDialog({ open, onOpenChange }: PasskeyAuthDialogProps) {
    const { registerWithPasskey, signInWithPasskey, isLoading } = usePasskeyAuth()
    const [email, setEmail] = useState("")
    const [displayName, setDisplayName] = useState("")

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email || !displayName) return

        await registerWithPasskey(email, displayName)
        onOpenChange(false)
    }

    const handleSignIn = async () => {
        await signInWithPasskey()
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-[#262626] border-1 border-gray-600">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Fingerprint className="h-5 w-5" />
                        Passkey Authentication
                    </DialogTitle>
                    <DialogDescription>
                        Sign in securely with your device's biometric authentication or create a new account.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="signin" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 space-x-5">
                        <TabsTrigger
                            value="signin"
                            className="py-3 cursor-pointer bg-gray-800 text-gray-300 data-[state=active]:bg-[#37bc64] data-[state=active]:text-white"
                        >
                            Sign In
                        </TabsTrigger>
                        <TabsTrigger
                            value="register"
                            className="py-3 cursor-pointer bg-gray-800 text-gray-300 data-[state=active]:bg-[#37bc64] data-[state=active]:text-white"
                        >
                            Register
                        </TabsTrigger>
                    </TabsList>


                    <TabsContent value="signin" className="space-y-4">
                        <div className="space-y-4 py-4">
                            <p className="text-sm text-muted-foreground">
                                Use your device's biometric authentication to sign in securely.
                            </p>
                            <Button onClick={handleSignIn} disabled={isLoading} className="w-full bg-gray-800 cursor-pointer py-3" size="lg">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Authenticating...
                                    </>
                                ) : (
                                    <>
                                        <Fingerprint className="mr-2 h-4 w-4" />
                                        Sign In with Passkey
                                    </>
                                )}
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="register" className="space-y-4">
                        <form onSubmit={handleRegister} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="displayName">Display Name</Label>
                                <Input
                                    id="displayName"
                                    type="text"
                                    placeholder="John Doe"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" disabled={isLoading || !email || !displayName} className="w-full" size="lg">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        <Fingerprint className="mr-2 h-4 w-4" />
                                        Create Account with Passkey
                                    </>
                                )}
                            </Button>
                            <p className="text-xs text-muted-foreground">
                                A Stellar wallet will be automatically created and secured with your passkey.
                            </p>
                        </form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
