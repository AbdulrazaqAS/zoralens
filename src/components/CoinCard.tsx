import type { CoinMetadata } from "@/scripts/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CoinCard({ coin }: { coin: CoinMetadata }) {
  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardContent className="p-4 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">{coin.coin?.name}</h2>
            {coin.coin?.name !== coin.coin?.symbol && (
              <p className="text-sm text-gray-500">${coin.coin?.symbol}</p>
            )}
          </div>
          {/* <span
                    className={`text-sm font-medium ${
                      coin.change24h > 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {coin.change24h > 0 ? "+" : ""}
                    {coin.change24h.toFixed(2)}%
                  </span> */}
          <span
            className={`text-sm font-medium ${
              +coin.coin!.marketCapDelta24h > 0
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {+coin.coin!.marketCapDelta24h > 0 ? "+" : ""}
            {Number(coin.coin?.marketCapDelta24h).toFixed(2)}%
          </span>
        </div>

        <div className="text-sm text-gray-700">
          Holding: <strong>{Number(coin.balanceEther).toFixed(2)}</strong>
        </div>
        <div className="text-sm text-gray-700">
          Current Price: <strong>{coin.price.toLocaleString()} USD</strong>
        </div>
        <div className="text-sm text-gray-700">
          Value: <strong>{coin.value.toString().slice(0, 7)} USD</strong>
        </div>

        <Button
          variant="outline"
          onClick={() =>
            window.open(
              `https://zora.co/coin/base:${coin.coin?.address}`,
              "_blank"
            )
          }
          className="mt-2 w-fit hover:ring-2 hover:ring-yellow-400"
        >
          View on Zora
        </Button>
      </CardContent>
    </Card>
  );
}
