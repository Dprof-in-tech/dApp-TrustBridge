"use client";

import React from "react";
import { toast } from "sonner";
import { useUserContext } from "@/providers/user.provider";
import { useWalletContext } from "@/providers/wallet.provider";
import { profileSchema } from "../schemas/profile.schema";
import { EnhancedForm } from "@/components/ui/form/EnhancedForm";
import { FormField } from "@/components/ui/form/FormField";
import { AddressField } from "@/components/ui/form-field";
import { SelectField } from "@/components/ui/form-field";
import { validationRules } from "@/lib/validation";

export default function Profile() {
  const { profile, loading, saving, saveProfile } = useUserContext();
  const { walletAddress } = useWalletContext();

  const onSubmit = async (data: any) => {
    try {
      await saveProfile(data);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
      console.error("Profile update error:", error);
    }
  };

  const countries = [
    { value: "us", label: "United States" },
    { value: "ca", label: "Canada" },
    { value: "mx", label: "Mexico" },
    { value: "uk", label: "United Kingdom" },
    { value: "de", label: "Germany" },
    { value: "fr", label: "France" },
    { value: "jp", label: "Japan" },
    { value: "au", label: "Australia" },
  ];

  if (loading) {
    return (
      <main className="container mx-auto px-4 md:px-6 pt-24 pb-16 max-w-3xl">
        <div className="flex items-center justify-center h-64">
          <div className="loader"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 md:px-6 pt-24 pb-16 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
      <p className="text-gray-400 mb-8">
        Keep your information up-to-date for the best experience on TrustBridge.
      </p>

      <div className="card p-6 mb-8">
        <h2 className="text-xl font-medium mb-4 border-b border-custom pb-3">
          Personal Details
        </h2>

        {/* Enhanced Form */}
        <EnhancedForm
          onSubmit={onSubmit}
          submitText="Save Changes"
          loadingText="Saving..."
          disabled={saving}
          formOptions={{
            defaultValues: {
              firstName: profile?.firstName || "",
              lastName: profile?.lastName || "",
              country: profile?.country || "",
              phoneNumber: profile?.phoneNumber || "",
              walletAddress: walletAddress || profile?.walletAddress || "",
            },
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              name="firstName"
              label="First Name"
              placeholder="Enter your first name"
              required
              validation={validationRules.name}
            />

            <FormField
              name="lastName"
              label="Last Name"
              placeholder="Enter your last name"
              required
              validation={validationRules.name}
            />
          </div>

          <SelectField
            name="country"
            label="Country"
            required
            options={countries}
            placeholder="Select your country"
          />

          <FormField
            name="phoneNumber"
            label="Phone Number"
            type="tel"
            placeholder="+1 (555) 000-0000"
            validation={{
              pattern: /^[\+]?[1-9][\d]{0,15}$/,
              custom: async (value: string) => {
                if (value && value.length < 10) {
                  return "Phone number must be at least 10 digits";
                }
                return undefined;
              },
            }}
            description="Optional: Used for important notifications"
          />

          <AddressField
            name="walletAddress"
            label="Stellar Wallet Address"
            addressType="stellar"
            showCopyButton
            showExplorerLink
            formatDisplay
            required
            disabled
            description="Your connected wallet address (read-only)"
          />
        </EnhancedForm>
      </div>
    </main>
  );
}
