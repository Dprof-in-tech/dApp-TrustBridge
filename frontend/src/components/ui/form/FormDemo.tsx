"use client";

import * as React from "react";
import { EnhancedForm } from "@/components/ui/form/EnhancedForm";
import { FormField } from "@/components/ui/form/FormField";
import { NumberInput } from "@/components/ui/form/NumberInput";
import {
  AmountField,
  AddressField,
  SelectField,
} from "@/components/ui/form-field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const cryptoAssets = [
  { value: "USDC", label: "USD Coin", icon: "💵" },
  { value: "XLM", label: "Stellar Lumens", icon: "⭐" },
  { value: "BTC", label: "Bitcoin", icon: "₿" },
];

const countries = [
  { value: "us", label: "United States" },
  { value: "ca", label: "Canada" },
  { value: "mx", label: "Mexico" },
  { value: "uk", label: "United Kingdom" },
];

export function FormDemoComponent() {
  const [userBalance, setUserBalance] = React.useState({
    USDC: 1000.5,
    XLM: 5000.25,
    BTC: 0.1234,
  });

  const handleSupplySubmit = async (data: any) => {
    console.log("Supply form submitted:", data);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    // Simulate success or error
    if (Math.random() > 0.3) {
      console.log("Supply successful");
    } else {
      throw new Error("Transaction failed due to network congestion");
    }
  };

  const handleProfileSubmit = async (data: any) => {
    console.log("Profile form submitted:", data);
    await new Promise((resolve) => setTimeout(resolve, 1500));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Enhanced Form Components Demo</h1>
        <p className="text-muted-foreground">
          Test all the enhanced form validation features
        </p>
      </div>

      <Tabs defaultValue="supply" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="supply">Supply Form</TabsTrigger>
          <TabsTrigger value="profile">Profile Form</TabsTrigger>
        </TabsList>

        <TabsContent value="supply">
          <Card>
            <CardHeader>
              <CardTitle>Supply Assets</CardTitle>
              <CardDescription>
                Supply your crypto assets to earn yield
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedForm
                onSubmit={handleSupplySubmit}
                submitText="Supply Assets"
                loadingText="Processing Transaction..."
                showProgress
              >
                <SelectField
                  name="asset"
                  label="Select Asset"
                  required
                  options={cryptoAssets.map((asset) => ({
                    value: asset.value,
                    label: asset.label,
                    icon: <span className="text-lg">{asset.icon}</span>,
                    description: `Current balance: ${userBalance[asset.value as keyof typeof userBalance]} ${asset.value}`,
                  }))}
                  placeholder="Choose an asset to supply"
                  searchable
                  clearable
                />

                <AmountField
                  name="amount"
                  label="Supply Amount"
                  asset="USDC"
                  balance={userBalance.USDC}
                  min={0.01}
                  precision={6}
                  showMaxButton
                  showQuickAmounts
                  quickAmounts={[10, 25, 50, 100]}
                  required
                />

                <FormField
                  name="useAsCollateral"
                  label="Use as Collateral"
                  type="text"
                  description="Allow this deposit to be used as collateral for borrowing"
                  validation={{
                    pattern: /^(yes|no)$/i,
                  }}
                  placeholder="Type 'yes' or 'no'"
                />

                <NumberInput
                  name="slippage"
                  label="Slippage Tolerance"
                  min={0.1}
                  max={5}
                  step={0.1}
                  precision={1}
                  suffix="%"
                  validation={{
                    required: "Slippage tolerance is required",
                    custom: async (value) => {
                      const num = parseFloat(value);
                      if (num > 3)
                        return "High slippage may result in poor execution";
                      return undefined;
                    },
                  }}
                />
              </EnhancedForm>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
              <CardDescription>Update your profile information</CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedForm
                onSubmit={handleProfileSubmit}
                submitText="Update Profile"
                loadingText="Saving Changes..."
              >
                <FormField
                  name="name"
                  label="Full Name"
                  required
                  validation={{
                    minLength: 2,
                    maxLength: 50,
                    pattern: /^[a-zA-Z\s]+$/,
                    custom: async (value) => {
                      if (value && value.split(" ").length < 2) {
                        return "Please enter your full name";
                      }
                      return undefined;
                    },
                  }}
                  placeholder="Enter your full name"
                />

                <FormField
                  name="email"
                  label="Email Address"
                  type="email"
                  validation={{
                    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  }}
                  placeholder="your@email.com"
                  description="We'll use this for important notifications"
                />

                <SelectField
                  name="country"
                  label="Country"
                  required
                  options={countries}
                  placeholder="Select your country"
                />

                <AddressField
                  name="stellarAddress"
                  label="Stellar Address"
                  addressType="stellar"
                  showCopyButton
                  showExplorerLink
                  formatDisplay
                  placeholder="Enter your Stellar address"
                  description="Your public Stellar address for receiving payments"
                />

                <NumberInput
                  name="age"
                  label="Age"
                  min={18}
                  max={120}
                  step={1}
                  precision={0}
                  validation={{
                    required: "Age is required for compliance",
                    custom: async (value) => {
                      const age = parseInt(value);
                      if (age < 18) return "You must be at least 18 years old";
                      if (age > 120) return "Please enter a valid age";
                      return undefined;
                    },
                  }}
                />
              </EnhancedForm>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
