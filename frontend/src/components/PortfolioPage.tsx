import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { fetchSingleCoin, fetchUserProfile, fetchAllUserBalances } from "../scripts/getters";

const mockCoins = [
  {
    name: "DogeVibes",
    symbol: "VIBE",
    logo: "🐶",
    amountHeld: 2500,
    price: 0.00021,
    change24h: +12.3,
  },
  {
    name: "MemeFuel",
    symbol: "FUEL",
    logo: "🔥",
    amountHeld: 980,
    price: 0.00095,
    change24h: -7.8,
  },
  {
    name: "CatFi",
    symbol: "CAT",
    logo: "😼",
    amountHeld: 1420,
    price: 0.0012,
    change24h: +2.6,
  },
];

export default function DashboardPage() {
  const { address } = useAccount();
  const [loading, setLoading] = useState(true);
  const [coins, setCoins] = useState<typeof mockCoins>([]);
  
  useEffect(() => {
    // fetchUserProfile("AbdulrazaqAS").then(console.log).catch(console.error);
    fetchAllUserBalances("AbdulrazaqAS").then(bals => {
      const balsStr = JSON.stringify(bals);
      alert(balsStr);
    }).catch(console.error);
    // fetchSingleCoin("0x445e9c0a296068dc4257767b5ed354b77cf513de", base.id).then(console.log).catch(console.error);
  }, []);
  
  useEffect(() => {
    // Simulate loading delay — replace with real fetch later
    setTimeout(() => {
      setCoins(mockCoins);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="min-h-screen px-4 py-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">My Zora Coins</h1>

      {!address ? (
        <div className="text-gray-500">Please connect your wallet to view your dashboard.</div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : coins.length === 0 ? (
        <div className="text-gray-500">You don't hold any Zora Coins yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {coins.map((coin, i) => (
            <Card key={i} className="rounded-2xl border shadow-sm">
              <CardContent className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{coin.logo}</div>
                    <div>
                      <h2 className="text-lg font-semibold">{coin.name}</h2>
                      <p className="text-sm text-gray-500">${coin.symbol}</p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      coin.change24h > 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {coin.change24h > 0 ? "+" : ""}
                    {coin.change24h.toFixed(2)}%
                  </span>
                </div>

                <div className="text-sm text-gray-700">
                  Holding: <strong>{coin.amountHeld}</strong>
                </div>
                <div className="text-sm text-gray-700">
                  Current Price: <strong>{coin.price} ETH</strong>
                </div>
                <div className="text-sm text-gray-700">
                  Value:{" "}
                  <strong>
                    {(coin.amountHeld * coin.price).toFixed(4)} ETH
                  </strong>
                </div>

                <Button variant="outline" className="mt-2 w-fit hover:ring-2 hover:ring-yellow-400">
                  View on Zora
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}