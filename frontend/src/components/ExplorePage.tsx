import { useEffect, useState } from "react";
import {
  getCoinsTopGainers,
  getCoinsTopVolume24h,
  getCoinsMostValuable,
  getCoinsNew,
} from "@zoralabs/coins-sdk";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

type Coin = {
  name: string;
  symbol: string;
  image?: string;
  price: string;
  volume24h: string;
  marketCap: string;
  contractAddress: string;
};

const fetchData = async (
  label: string,
  fn: () => Promise<any>
): Promise<{ label: string; coins: Coin[] }> => {
  const res = await fn();
  const data = res.data?.coins || [];
  return {
    label,
    coins: data.map((c: any) => ({
      name: c.name,
      symbol: c.symbol,
      image: c.media?.previewImage || "🪙",
      price: c.price,
      volume24h: c.volume24h,
      marketCap: c.marketCap,
      contractAddress: c.contractAddress,
    })),
  };
};

export default function ExplorePage() {
  const [sections, setSections] = useState<{ label: string; coins: Coin[] }[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const result = await Promise.all([
        fetchData("Top Gainers", getCoinsTopGainers),
        fetchData("Most Valuable", getCoinsMostValuable),
        fetchData("New Coins", getCoinsNew),
        fetchData("High Volume", getCoinsTopVolume24h),
      ]);
      setSections(result);
      setLoading(false);
    };
    load();
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
              {section.coins.map((coin, j) => (
                <Card
                  key={j}
                  className="rounded-2xl shadow-sm border hover:shadow-lg transition"
                >
                  <CardContent className="p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="text-2xl">{coin.image}</div>
                        <div>
                          <div className="font-bold">{coin.name}</div>
                          <div className="text-sm text-gray-500">
                            ${coin.symbol}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-700">
                      Price: <strong>{coin.price || "0"} ETH</strong>
                    </div>
                    <div className="text-sm text-gray-700">
                      24h Volume: <strong>{coin.volume24h || "0"}</strong>
                    </div>
                    <div className="text-sm text-gray-700">
                      Market Cap: <strong>{coin.marketCap || "0"}</strong>
                    </div>

                    <Button
                      variant="outline"
                      className="mt-2 w-fit hover:ring-2 hover:ring-yellow-400 text-indigo-600"
                      onClick={() =>
                        window.open(
                          `https://zora.co/collect/zora:${coin.contractAddress}`,
                          "_blank"
                        )
                      }
                    >
                      View on Zora
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
