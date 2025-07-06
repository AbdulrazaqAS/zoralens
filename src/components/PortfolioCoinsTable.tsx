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
    <div className="overflow-x-auto rounded-xl border shadow-sm">
      <table className="min-w-full table-auto text-sm text-gray-700">
        <thead className="bg-gray-50 text-left font-semibold text-gray-800">
          <tr>
            <th className="px-4 py-3"></th>
            <th className="px-4 py-3">Coin</th>
            <th className="px-4 py-3">Symbol</th>
            <th
              className="px-4 py-3 cursor-pointer select-none"
              onClick={() => handleSort("holding")}
            >
              Holding {getSortIcon("holding")}
            </th>
            <th
              className="px-4 py-3 cursor-pointer select-none"
              onClick={() => handleSort("price")}
            >
              Price (USD) {getSortIcon("price")}
            </th>
            <th
              className="px-4 py-3 cursor-pointer select-none"
              onClick={() => handleSort("value")}
            >
              Value (USD) {getSortIcon("value")}
            </th>
            <th
              className="px-4 py-3 cursor-pointer select-none"
              onClick={() => handleSort("change")}
            >
              24h Δ {getSortIcon("change")}
            </th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {sortedCoins.map((coin, i) => {
            const marketCapDelta = parseFloat(
              coin.coin?.marketCapDelta24h || "0"
            );
            const isUp = marketCapDelta > 0;
            return (
              <tr
                key={i}
                className="border-t hover:bg-gray-50 transition-all duration-150"
              >
                <td className="flex flex-row px-4 py-3 font-medium">
                  <p>{i + 1}</p>
                  {showCompareCheckbox && (
                    <input
                      type="checkbox"
                      name="compare"
                      onChange={() =>
                        handleMarkForComparison(coin.coin?.address! as Address)
                      }
                      checked={compareCoins.includes(coin.coin?.address! as Address)}
                      className="ml-2"
                    />
                  )}
                </td>
                <td className="px-4 py-3 font-medium">{coin.coin?.name}</td>
                <td className="px-4 py-3 text-gray-500">
                  {coin.coin?.name !== coin.coin?.symbol
                    ? `$${coin.coin?.symbol}`
                    : "--"}
                </td>
                <td className="px-4 py-3">
                  {Number(coin.balanceEther).toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  {Number(coin.price).toString()}
                </td>
                <td className="px-4 py-3">
                  {Number(coin.value).toLocaleString()}
                </td>
                <td
                  className={`px-4 py-3 font-semibold ${
                    isUp ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {isUp ? "+" : ""}
                  {marketCapDelta.toFixed(2)}%
                </td>
                <td className="px-4 py-3">
                  <Button
                    variant="outline"
                    className="rounded-xl hover:ring-2 hover:ring-yellow-400 text-indigo-600"
                    onClick={() =>
                      window.open(
                        `https://zora.co/coin/base:${coin.coin?.address}`,
                        "_blank"
                      )
                    }
                  >
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
