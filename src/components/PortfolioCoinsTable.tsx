import type { CoinMetadata } from "@/scripts/utils";
import { Button } from "@/components/ui/button";

export default function PortfolioCoinsTable({
  coins,
}: {
  coins: CoinMetadata[];
}) {
  return (
    <div className="overflow-x-auto rounded-xl border shadow-sm">
      <table className="min-w-full table-auto text-sm text-gray-700">
        <thead className="bg-gray-50 text-left font-semibold text-gray-800">
          <tr>
            <th className="px-4 py-3">Coin</th>
            <th className="px-4 py-3">Symbol</th>
            <th className="px-4 py-3">Holding</th>
            <th className="px-4 py-3">Price (USD)</th>
            <th className="px-4 py-3">Value (USD)</th>
            <th className="px-4 py-3">24h Δ</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {coins.map((coin, i) => {
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
                <td className="px-4 py-3">{coin.price} USD</td>
                <td className="px-4 py-3">
                  {coin.value!.toString().slice(0, 7)} USD
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
