import type { CoinMetadata } from "@/scripts/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";
import type { Address } from "viem";
import { handleError } from "@/scripts/actions";

type SortKey = "holding" | "price" | "value" | "change";
type SortDirection = "asc" | "desc";

interface Props {
  coins: CoinMetadata[];
  compareCoins: Address[];
  setCompareCoins: Function;
  maxCompareCoins: number;
  showCompareCheckbox: boolean;
}

/**
 * Portfolio coins table component with sortable columns
 * Displays user's coin holdings with value calculations and Zora links
 */
export default function PortfolioCoinsTable({
  coins,
  compareCoins,
  setCompareCoins,
  maxCompareCoins,
  showCompareCheckbox,
}: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("value");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  /**
   * Handles column sorting - toggles direction if same column, sets new column with desc default
   */
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  };

  /**
   * Returns appropriate sort icon for column headers
   */
  const getSortIcon = (key: SortKey) => {
    if (key !== sortKey) return null;
    return sortDirection === "asc" ? (
      <ArrowUp className="inline-block w-4 h-4 ml-1" />
    ) : (
      <ArrowDown className="inline-block w-4 h-4 ml-1" />
    );
  };

  /**
   * Sorts coins array based on selected column and direction
   */
  const sortedCoins = [...coins].sort((a, b) => {
    const aVal =
      sortKey === "holding"
        ? parseFloat(a.balanceEther!)
        : sortKey === "price"
        ? parseFloat(a.price!.toString())
        : sortKey === "value"
        ? parseFloat(a.value!.toString())
        : parseFloat(a.coin?.marketCapDelta24h || "0");

    const bVal =
      sortKey === "holding"
        ? parseFloat(b.balanceEther!)
        : sortKey === "price"
        ? parseFloat(b.price!.toString())
        : sortKey === "value"
        ? parseFloat(b.value!.toString())
        : parseFloat(b.coin?.marketCapDelta24h || "0");

    return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
  });

  /**
   * Handles marking a coin for comparison
   * Adds to compareCoins if not already included, removes if already selected
   */
  const handleMarkForComparison = (coinAddr: Address) => {
    if (compareCoins.includes(coinAddr)) {
      setCompareCoins((prev: Address[]) =>
        prev.filter((addr) => addr !== coinAddr)
      );
    } else {
      if (compareCoins.length >= maxCompareCoins)
        return handleError(new Error(`Max selection is ${maxCompareCoins}`));
      setCompareCoins((prev: Address[]) => {
        return [...prev, coinAddr];
      });
    }
  };

  return (
    <div className="overflow-x-auto bg-white">
      <table className="min-w-full table-auto">
        <thead>
          <tr className="bg-gradient-to-r from-slate-50 via-gray-50 to-slate-50 border-b-2 border-gray-200">
            <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"></th>
            <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Coin</th>
            <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Symbol</th>
            <th
              className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer select-none hover:text-emerald-600 hover:bg-emerald-50/50 transition-all duration-200 rounded-lg"
              onClick={() => handleSort("holding")}
            >
              <div className="flex items-center space-x-1">
                <span>Holdings</span>
                {getSortIcon("holding")}
              </div>
            </th>
            <th
              className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer select-none hover:text-emerald-600 hover:bg-emerald-50/50 transition-all duration-200 rounded-lg"
              onClick={() => handleSort("price")}
            >
              <div className="flex items-center space-x-1">
                <span>Price (USD)</span>
                {getSortIcon("price")}
              </div>
            </th>
            <th
              className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer select-none hover:text-emerald-600 hover:bg-emerald-50/50 transition-all duration-200 rounded-lg"
              onClick={() => handleSort("value")}
            >
              <div className="flex items-center space-x-1">
                <span>Total Value</span>
                {getSortIcon("value")}
              </div>
            </th>
            <th
              className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer select-none hover:text-emerald-600 hover:bg-emerald-50/50 transition-all duration-200 rounded-lg"
              onClick={() => handleSort("change")}
            >
              <div className="flex items-center space-x-1">
                <span>24h Change</span>
                {getSortIcon("change")}
              </div>
            </th>
            <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {sortedCoins.map((coin, i) => {
            const marketCapDelta = parseFloat(
              coin.coin?.marketCapDelta24h || "0"
            );
            const isUp = marketCapDelta > 0;
            const holdingValue = Number(coin.value);
            const holdingAmount = Number(coin.balanceEther);
            
            return (
              <tr
                key={i}
                className="hover:bg-gradient-to-r hover:from-emerald-50/30 hover:to-teal-50/30 transition-all duration-300 group border-l-4 border-transparent hover:border-emerald-400"
              >
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <span className="inline-flex items-center justify-center w-9 h-9 bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700 rounded-xl text-sm font-bold shadow-sm group-hover:shadow-md transition-shadow">
                      {i + 1}
                    </span>
                    {showCompareCheckbox && (
                      <input
                        type="checkbox"
                        name="compare"
                        onChange={() =>
                          handleMarkForComparison(coin.coin?.address! as Address)
                        }
                        checked={compareCoins.includes(coin.coin?.address! as Address)}
                        className="w-5 h-5 text-emerald-600 bg-gray-100 border-gray-300 rounded-md focus:ring-emerald-500 focus:ring-2 transition-all"
                      />
                    )}
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="flex items-center">
                    {/* <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                      <span className="text-white font-bold text-base">{coin.coin?.symbol?.charAt(0)}</span>
                    </div> */}
                    <div className="ml-4">
                      <div className="text-base font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                        {coin.coin?.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {coin.coin?.symbol}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300">
                    {coin.coin?.name !== coin.coin?.symbol
                      ? `$${coin.coin?.symbol}`
                      : "--"}
                  </span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-900">
                    {holdingAmount.toFixed(2)}
                  </div>
                  <div className="text-xs text-emerald-600 mt-1 font-medium">
                    💰 {coin.coin?.symbol} tokens
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-900">
                    ${Number(coin.price)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    per token
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="text-base font-bold text-gray-900">
                    ${holdingValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    ${(holdingValue / holdingAmount).toFixed(4)} avg cost
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-sm font-semibold">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold shadow-sm ${
                    isUp 
                      ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200" 
                      : "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200"
                  }`}>
                    <span className="mr-1">{isUp ? "📈" : "📉"}</span>
                    {isUp ? "+" : ""}{marketCapDelta.toFixed(2)}%
                  </span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-gradient-to-r from-white to-emerald-50 hover:from-emerald-50 hover:to-emerald-100 border-emerald-200 text-emerald-600 hover:text-emerald-700 hover:border-emerald-300 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                    onClick={() =>
                      window.open(
                        `https://zora.co/coin/base:${coin.coin?.address}`,
                        "_blank"
                      )
                    }
                  >
                    <span className="mr-1">🔗</span>
                    View on Zora
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
