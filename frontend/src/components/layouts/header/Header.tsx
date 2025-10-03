"use client"

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useWallet } from "@/components/modules/auth/hooks/wallet.hook";
import { useWalletContext } from "@/providers/wallet.provider";
import { useUserContext } from "@/providers/user.provider";
import { useTranslation } from "@/hooks/useTranslation";
import { WalletManagementDialog } from "@/components/modules/wallet/ui/wallet-management-dialog";
import { LanguageSelector } from "@/components/ui/language-selector";
import { Wallet } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const { walletAddress, walletName } = useWalletContext();
  const { profile } = useUserContext();
  const { handleConnect, handleDisconnect } = useWallet();
  const { t } = useTranslation();
  const [isWalletManagementOpen, setIsWalletManagementOpen] = useState(false);

  const isPasskeyUser = profile?.authMethod === "passkey";

  const truncateAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleMobileMenuClick = () => {
    alert("Mobile menu will be implemented in the full version.");
  };

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <header className="navbar fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center">
          <div className="flex items-center mr-6">
            <Link href="/" className="flex items-center">
              <Image
                src="/img/TrustBridge.png"
                alt="TrustBridge Logo"
                width={40}
                height={40}
                className="mr-2"
              />
            </Link>
          </div>
          <nav className="desktop-menu hidden md:flex space-x-1">
            <Link
              href="/dashboard"
              className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}
            >
              {t('navigation.dashboard')}
            </Link>
            <Link
              href="/dashboard/marketplace"
              className={`nav-link ${isActive("/marketplace") ? "active" : ""}`}
            >
              {t('navigation.marketplace')}
            </Link>
            <Link
              href="/dashboard/profile"
              className={`nav-link ${isActive("/profile") ? "active" : ""}`}
            >
              {t('navigation.profile')}
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-3">
          <span className="network-badge hidden md:inline-flex">
            {t('header.stellarTestnet')}
          </span>

          {/* Language Selector */}
          <LanguageSelector />

          {/* Desktop Wallet Section */}
          <div className="hidden sm:flex items-center gap-3">
            {walletAddress ? (
              <>
                {isPasskeyUser && (
                  <button
                    className="btn-secondary"
                    onClick={() => setIsWalletManagementOpen(true)}
                    title="Wallet Management"
                  >
                    <Wallet className="h-4 w-4" />
                  </button>
                )}
                <div className="wallet-btn">
                  <i className="fas fa-wallet mr-2"></i>
                  <span className="wallet-address">
                    {walletName && walletName !== "Freighter"
                      ? walletName
                      : truncateAddress(walletAddress)}
                  </span>
                  <i className="fas fa-chevron-down ml-2 text-xs text-gray-400"></i>
                </div>
                <button
                  className="btn-secondary text-sm px-3 py-1.5"
                  onClick={handleDisconnect}
                >
                  <i className="fas fa-sign-out-alt mr-1.5"></i>
                  {t('header.disconnect')}
                </button>
              </>
            ) : (
              <button className="wallet-btn" onClick={handleConnect}>
                <i className="fas fa-wallet mr-2"></i>
                <span>{t('header.connectWallet')}</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="mobile-menu-btn md:hidden" onClick={handleMobileMenuClick}>
            <i className="fas fa-bars text-gray-400"></i>
          </button>
        </div>
      </header>

      <WalletManagementDialog
        open={isWalletManagementOpen}
        onOpenChange={setIsWalletManagementOpen}
      />
    </>
  );
}
