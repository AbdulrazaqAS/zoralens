import type { Zora20Token } from "@/scripts/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";
import { getCoinPrice } from "@/scripts/getters";
import type { Address } from "viem";
import { handleError } from "@/scripts/actions";

type SortKey = "holders" | "price" | "marketCap" | "change" | "vol24";
type SortDirection = "asc" | "desc";

interface Props {
  coins: Zora20Token[];
  compareCoins: Address[];
  setCompareCoins: Function;
  maxCompareCoins: number;
  showCompareCheckbox: boolean;
}

export default function ExploreCoinsTable({
  coins,
  compareCoins,
  setCompareCoins,
  maxCompareCoins,
  showCompareCheckbox,
}: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("marketCap");
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
    if (sortKey !== key) return null;
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
    if (!a || !b) return 0;

    const aVal =
      sortKey === "holders"
        ? Number(a.uniqueHolders)
        : sortKey === "price"
        ? getCoinPrice(a)
        : sortKey === "marketCap"
        ? parseFloat(a.marketCap || "0")
        : sortKey === "vol24"
        ? parseFloat(a.volume24h || "0")
        : parseFloat(a.marketCapDelta24h || "0");

    const bVal =
      sortKey === "holders"
        ? Number(b.uniqueHolders)
        : sortKey === "price"
        ? getCoinPrice(b)
        : sortKey === "marketCap"
        ? parseFloat(b.marketCap || "0")
        : sortKey === "vol24"
        ? parseFloat(b.volume24h || "0")
        : parseFloat(b.marketCapDelta24h || "0");

    return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
  });

  /**
   * Handles marking a coin for comparison
   * Adds to compareCoins if not already included, removes if already selected
   */
  const handleMarkForComaparison = (coinAddr: Address) => {
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
              className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer select-none hover:text-indigo-600 hover:bg-indigo-50/50 transition-all duration-200 rounded-lg"
              onClick={() => handleSort("holders")}
            >
              <div className="flex items-center space-x-1">
                <span>Holders</span>
                {getSortIcon("holders")}
              </div>
            </th>
            <th
              className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer select-none hover:text-indigo-600 hover:bg-indigo-50/50 transition-all duration-200 rounded-lg"
              onClick={() => handleSort("price")}
            >
              <div className="flex items-center space-x-1">
                <span>Price (USD)</span>
                {getSortIcon("price")}
              </div>
            </th>
            <th
              className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer select-none hover:text-indigo-600 hover:bg-indigo-50/50 transition-all duration-200 rounded-lg"
              onClick={() => handleSort("marketCap")}
            >
              <div className="flex items-center space-x-1">
                <span>Market Cap</span>
                {getSortIcon("marketCap")}
              </div>
            </th>
            <th
              className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer select-none hover:text-indigo-600 hover:bg-indigo-50/50 transition-all duration-200 rounded-lg"
              onClick={() => handleSort("change")}
            >
              <div className="flex items-center space-x-1">
                <span>24h Change</span>
                {getSortIcon("change")}
              </div>
            </th>
            <th
              className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer select-none hover:text-indigo-600 hover:bg-indigo-50/50 transition-all duration-200 rounded-lg"
              onClick={() => handleSort("vol24")}
            >
              <div className="flex items-center space-x-1">
                <span>24h Volume</span>
                {getSortIcon("vol24")}
              </div>
            </th>
            <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {sortedCoins.map((coin, i) => {
            const marketCapDelta = parseFloat(coin?.marketCapDelta24h || "0");
            const isUp = marketCapDelta > 0;

            return (
              <tr
                key={i}
                className="hover:bg-gradient-to-r hover:from-indigo-50/30 hover:to-purple-50/30 transition-all duration-300 group border-l-4 border-transparent hover:border-indigo-400"
              >
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <span className="inline-flex items-center justify-center w-9 h-9 bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 rounded-xl text-sm font-bold shadow-sm group-hover:shadow-md transition-shadow">
                      {i + 1}
                    </span>
                    {showCompareCheckbox && (
                      <input
                        type="checkbox"
                        name="compare"
                        onChange={() =>
                          handleMarkForComaparison(coin?.address! as Address)
                        }
                        checked={compareCoins.includes(coin?.address! as Address)}
                        className="w-5 h-5 text-indigo-600 bg-gray-100 border-gray-300 rounded-md focus:ring-indigo-500 focus:ring-2 transition-all"
                      />
                    )}
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="flex items-center">
                    {/* <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                      <span className="text-white font-bold text-base">{coin?.symbol?.charAt(0)}</span>
                    </div> */}
                    <div className="ml-4">
                      <div className="text-base font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">
                        {coin?.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {coin?.symbol}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300">
                    {coin?.name !== coin?.symbol ? `$${coin?.symbol}` : "--"}
                  </span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-900">
                    {coin?.uniqueHolders?.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    holders
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-900">
                    ${getCoinPrice(coin)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    USD
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-900">
                    ${parseFloat(coin?.marketCap || "0").toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    market cap
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
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-900">
                    ${parseFloat(coin?.volume24h || "0").toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    24h volume
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-gradient-to-r from-white to-indigo-50 hover:from-indigo-50 hover:to-indigo-100 border-indigo-200 text-indigo-600 hover:text-indigo-700 hover:border-indigo-300 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                    onClick={() =>
                      window.open(
                        `https://zora.co/coin/base:${coin?.address}`,
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
