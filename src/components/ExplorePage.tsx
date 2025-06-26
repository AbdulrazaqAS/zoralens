import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  fetchMostValuableCoins,
  fetchNewCoins,
  fetchTopGainers,
  fetchTopVolumeCoins,
} from "@/scripts/getters";
import type { Zora20Token } from "@/scripts/utils";

type Categories = "Top Gainers" | "Most Valuable" | "New Coins" | "High Volume";

export default function ExplorePage() {
  const [sections, setSections] = useState<
    { label: Categories; coins: Zora20Token[] }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [coinsAmount, setCoinsAmount] = useState(5);

  useEffect(() => {
    fetchTopGainers(coinsAmount)
      .then((coins) => {
        if (!coins)
          setSections((prev) => [...prev, { label: "Top Gainers", coins: [] }]);
        else setSections((prev) => [...prev, { label: "Top Gainers", coins }]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    fetchMostValuableCoins(coinsAmount)
      .then((coins) => {
        if (!coins)
          setSections((prev) => [
            ...prev,
            { label: "Most Valuable", coins: [] },
          ]);
        else
          setSections((prev) => [...prev, { label: "Most Valuable", coins }]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    fetchTopVolumeCoins(coinsAmount)
      .then((coins) => {
        if (!coins)
          setSections((prev) => [...prev, { label: "High Volume", coins: [] }]);
        else setSections((prev) => [...prev, { label: "High Volume", coins }]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    fetchNewCoins(coinsAmount)
      .then((coins) => {
        if (!coins)
          setSections((prev) => [...prev, { label: "New Coins", coins: [] }]);
        else setSections((prev) => [...prev, { label: "New Coins", coins }]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen p-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Explore Coins</h1>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : (
        sections.map((section, i) => (
          <div key={i} className="mb-10">
            <h2 className="text-xl font-semibold text-indigo-600 mb-4">
              {section.label}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {section.coins.map(
                (coin, j) =>
                  coin && (
                    <Card
                      key={j}
                      className="rounded-2xl shadow-sm border hover:shadow-lg transition"
                    >
                      <CardContent className="p-4 flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            {/* <div className="text-2xl">{coin.image}</div> */}
                            <div>
                              <div className="font-bold">{coin.name}</div>
                              <div className="text-sm text-gray-500">
                                ${coin.symbol}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="text-sm text-gray-700">
                          Price:{" "}
                          <strong>
                            {+coin.marketCap / +coin.totalSupply || "0"} USD
                          </strong>
                        </div>
                        <div className="text-sm text-gray-700">
                          24h Volume:{" "}
                          <strong>{coin.volume24h || "0"} USD</strong>
                        </div>
                        <div className="text-sm text-gray-700">
                          24h Change:{" "}
                          <strong>
                            {parseFloat(coin.marketCapDelta24h).toFixed(2)}%
                          </strong>
                        </div>
                        <div className="text-sm text-gray-700">
                          Market Cap:{" "}
                          <strong>{coin.marketCap || "0"} USD</strong>
                        </div>
                        <div className="text-sm text-gray-700">
                          Holders: <strong>{coin.uniqueHolders}</strong>
                        </div>

                        <Button
                          variant="outline"
                          className="mt-2 w-fit hover:ring-2 hover:ring-yellow-400 text-indigo-600"
                          onClick={() =>
                            window.open(
                              `https://zora.co/coin/base:${coin.address}`,
                              "_blank"
                            )
                          }
                        >
                          View on Zora
                        </Button>
                      </CardContent>
                    </Card>
                  )
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
