import type { CoinMetadata } from "@/scripts/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";

type SortKey = "holding" | "price" | "value" | "change";
type SortDirection = "asc" | "desc";

export default function PortfolioCoinsTable({
  coins,
}: {
  coins: CoinMetadata[];
}) {
  const [sortKey, setSortKey] = useState<SortKey>("value");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  };

  const getSortIcon = (key: SortKey) => {
    if (key !== sortKey) return null;
    return sortDirection === "asc" ? (
      <ArrowUp className="inline-block w-4 h-4 ml-1" />
    ) : (
      <ArrowDown className="inline-block w-4 h-4 ml-1" />
    );
  };

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

  return (
    <div className="overflow-x-auto rounded-xl border shadow-sm">
      <table className="min-w-full table-auto text-sm text-gray-700">
        <thead className="bg-gray-50 text-left font-semibold text-gray-800">
          <tr>
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
                  {Number(coin.price).toString()} USD
                </td>
                <td className="px-4 py-3">
                  {Number(coin.value).toLocaleString()} USD
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
