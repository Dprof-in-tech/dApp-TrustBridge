"use client";

import Image from "next/image";
import StatCard from "../cards/StatCard";
import { useTranslation } from "@/hooks/useTranslation";

export default function Dashboard() {
  const { t } = useTranslation();
  
  const handleManagePosition = () => {
    alert(
      "Position management functionality will be implemented in the full version.",
    );
  };

  // Create breakdown content for tooltips
  const createBreakdownContent = (
    positions: UserPosition[],
    type: "supplied" | "borrowed",
  ) => {
    if (!positions || positions.length === 0) {
      return <div className="text-gray-400">No data available</div>;
    }

    const filteredPositions = positions.filter((pos) => pos[type] > 0);

    if (filteredPositions.length === 0) {
      return <div className="text-gray-400">No {type} positions</div>;
    }

    return (
      <div className="space-y-1">
        <div className="font-medium text-gray-300">Breakdown:</div>
        {filteredPositions.map((position) => (
          <div key={position.asset} className="flex justify-between text-xs">
            <span className="text-gray-400">{position.symbol}:</span>
            <span className="text-white">{formatCurrency(position[type])}</span>
          </div>
        ))}
      </div>
    );
  };

  // Create Available Balance breakdown content
  const createAvailableBalanceContent = () => {
    if (!userPositions || userPositions.length === 0) {
      return <div className="text-gray-400">No data available</div>;
    }

    const availableByAsset = userPositions
      .map((position) => {
        const walletBalanceForAsset = 0; // TODO: Get actual wallet balance for this asset
        const available = Math.max(
          0,
          walletBalanceForAsset + position.supplied - position.borrowed,
        );

        return {
          symbol: position.symbol,
          available: available,
          walletBalance: walletBalanceForAsset,
          supplied: position.supplied,
          borrowed: position.borrowed,
        };
      })
      .filter((asset) => asset.available > 0);

    if (availableByAsset.length === 0) {
      return <div className="text-gray-400">No available balance</div>;
    }

    return (
      <div className="space-y-1">
        <div className="font-medium text-gray-300">Breakdown:</div>
        {availableByAsset.map((asset) => (
          <div key={asset.symbol} className="flex justify-between text-xs">
            <span className="text-gray-400">{asset.symbol}:</span>
            <span className="text-white">
              {formatCurrency(asset.available)}
            </span>
          </div>
        ))}
        {availableByAsset.some((asset) => asset.walletBalance > 0) && (
          <div className="text-xs text-gray-500 mt-1 pt-1 border-t border-gray-700">
            Includes wallet balance
          </div>
        )}
      </div>
    );
  };

  // Create Active Loans breakdown content
  const createActiveLoansContent = () => {
    if (!userPositions || userPositions.length === 0) {
      return <div className="text-gray-400">No data available</div>;
    }

    const poolLoanCounts: Record<string, number> = {};
    Object.keys(POOL_CONFIG).forEach((poolType) => {
      poolLoanCounts[poolType] = 0;
    });

    userPositions.forEach((position) => {
      if (position.borrowed > 0) {
        const poolType = getPoolTypeForAsset(position.symbol);
        if (poolType) {
          poolLoanCounts[poolType]++;
        }
      }
    });

    const poolsWithLoans = Object.entries(poolLoanCounts)
      .filter(([, count]) => count > 0)
      .map(([poolType, count]) => ({
        poolType: poolType === "MAIN_POOL" ? "Main Pool" : "Secondary Pool",
        count,
      }));

    if (poolsWithLoans.length === 0) {
      return <div className="text-gray-400">No active loans</div>;
    }

    return (
      <div className="space-y-1">
        <div className="font-medium text-gray-300">Breakdown:</div>
        {poolsWithLoans.map((pool) => (
          <div key={pool.poolType} className="flex justify-between text-xs">
            <span className="text-gray-400">{pool.poolType}:</span>
            <span className="text-white">{pool.count}</span>
          </div>
        ))}
      </div>
    );
  };

  const getWalletDisplayName = () => {
    if (!address) return "Usuario";
    
    // Use profile name if available
    if (profile && (profile.firstName || profile.lastName)) {
      const profileName = `${profile.firstName} ${profile.lastName}`.trim();
      if (profileName) return profileName;
    }
    
    // 2: Use walletName if it's not "Freighter"
    if (walletName && walletName !== "Freighter") {
      return walletName;
    }
    
    // Fallback: Use truncated address
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div className="container mx-auto px-4 md:px-6 pt-24 pb-16 max-w-6xl">
      <h1 className="text-3xl font-bold mb-2">
        {t('dashboard.title', { address: 'GABU...HE3JH' })}
      </h1>
      <p className="text-gray-400 mb-6">
        {t('dashboard.subtitle')}
      </p>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title={t('dashboard.totalSupplied')}
          value="$456,289"
          change="+1.8%"
          changeType="positive"
        />
        <StatCard
          title={t('dashboard.totalBorrowed')}
          value="$125,750"
          change="+0.5%"
          changeType="positive"
        />
        <StatCard
          title={t('dashboard.availableBalance')}
          value="$330,539"
          icon="fas fa-sack-dollar"
        />
        <StatCard
          title={t('dashboard.activeLoans')}
          value="3"
          icon="fas fa-file-contract"
        />
      </div>

      {/* Activity Chart */}
      <div className="card p-6 mb-8" style={{ height: "300px" }}>
        <h2 className="text-lg font-medium mb-4">{t('dashboard.recentActivity')}</h2>
        <div className="flex items-center justify-center h-5/6 text-gray-400">
          <div className="text-center">
            <i className="fas fa-chart-line text-4xl mb-3"></i>
            <p>{t('dashboard.activityChartLoading')}</p>
          </div>
        </div>
      </div>

      {/* Current Positions Table */}
      <div className="card p-6 mb-8">
        <h2 className="text-lg font-medium mb-4">{t('dashboard.currentPositions')}</h2>
        <div className="overflow-x-auto">
          <table className="custom-table">
            <thead>
              <tr>
                <th>{t('dashboard.asset')}</th>
                <th>{t('dashboard.quantity')}</th>
                <th>{t('dashboard.apy')}</th>
                <th>{t('dashboard.collateral')}</th>
                <th>{t('dashboard.status')}</th>
                <th>{t('dashboard.action')}</th>
              </tr>
            </thead>
            <tbody>
              {userPositions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    <div className="flex flex-col items-center">
                      <i className="fas fa-wallet text-3xl mb-3 text-gray-300"></i>
                      <p className="text-lg font-medium mb-2">
                        No positions yet
                      </p>
                      <p className="text-sm">
                        Start by supplying assets or taking out loans
                      </p>
                    </div>
                    <div>
                      <div className="font-medium">USDC</div>
                      <div className="text-xs text-gray-400">{t('dashboard.usdCoin')}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="font-medium">120,000</div>
                  <div className="text-xs text-gray-400">$120,000</div>
                </td>
                <td>
                  <div className="text-success font-medium">3.2%</div>
                </td>
                <td>
                  <div className="text-xs">-</div>
                </td>
                <td>
                  <div className="bg-green-900 bg-opacity-20 text-green-400 text-xs inline-block px-2 py-1 rounded">
                    {t('dashboard.active')}
                  </div>
                </td>
                <td>
                  <button
                    className="btn-secondary text-xs px-2 py-1"
                    onClick={handleManagePosition}
                  >
                    {t('common.manage')}
                  </button>
                </td>
              </tr>
              {/* XLM Position */}
              <tr>
                <td>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3 overflow-hidden">
                      <img
                        src="/img/tokens/xlm.png"
                        alt="XLM"
                        className="w-5 h-5 object-contain"
                      />
                    </div>
                    <div>
                      <div className="font-medium">XLM</div>
                      <div className="text-xs text-gray-400">
                        {t('dashboard.stellarLumens')}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="font-medium">550,000</div>
                  <div className="text-xs text-gray-400">$330,000</div>
                </td>
                <td>
                  <div className="text-success font-medium">2.8%</div>
                </td>
                <td>
                  <div className="text-xs">Sí (75%)</div>
                </td>
                <td>
                  <div className="bg-blue-900 bg-opacity-20 text-blue-400 text-xs inline-block px-2 py-1 rounded">
                    {t('dashboard.collateralBadge')}
                  </div>
                </td>
                <td>
                  <button
                    className="btn-secondary text-xs px-2 py-1"
                    onClick={handleManagePosition}
                  >
                    {t('common.manage')}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
