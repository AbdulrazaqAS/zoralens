import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchMultipleCoins, getCoinPrice } from "@/scripts/getters";
import type { Zora20Token } from "@/scripts/utils";
import { ArrowLeft, ArrowUpDown } from "lucide-react";
import type { Address } from "viem";
import { handleError } from "@/scripts/actions";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const ChainId: number = import.meta.env.VITE_CHAIN!;

export default function CompareCoinsPage() {
  const [coins, setCoins] = useState<Zora20Token[]>([]);
  const [loading, setLoading] = useState(true);

  const { ids } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!ids || typeof ids !== "string") return;

    const coinIds = ids.split(",").slice(0, 5) as Address[];
    fetchMultipleCoins(coinIds, ChainId)
      .then((coins) => {
        if (!coins) return handleError(new Error("Error fetching coins"));
        console.log(coins);
        setCoins(coins);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [ids]);

  const attributes = [
    { label: "Name", key: "name" },
    { label: "Symbol", key: "symbol" },
    { label: "Holders", key: "uniqueHolders" },
    { label: "Price (USD)", key: "priceUsd" },
    { label: "Market Cap", key: "marketCap" },
    { label: "24h Δ", key: "marketCapDelta24h" },
  ];

  const chartData = coins.map((coin) => ({
    name: coin!.name,
    Holders: Number(coin!.uniqueHolders),
    Price: getCoinPrice(coin!),
    MarketCap: Number(coin!.marketCap),
    Change24h: parseFloat(coin!.marketCapDelta24h || "0"),
  }));

  return (
    <div className="min-h-screen max-w-6xl mx-auto p-4">
      <div className="mb-6 space-y-3">
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Explore
        </Button>
        <h1 className="text-2xl font-bold text-gray-800">Coin Comparison</h1>
      </div>

      {loading ? (
        <Skeleton className="w-full h-[300px] rounded-xl" />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border shadow-sm mb-10">
            <table className="min-w-full table-auto text-sm text-gray-800">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Attribute</th>
                  {coins.map((_, i) => (
                    <th key={i} className="px-4 py-3 text-left">
                      <div className="font-semibold">Coin {i + 1} </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {attributes.map(({ label, key }) => (
                  <tr
                    key={key}
                    className="border-t hover:bg-gray-50 transition-all duration-150"
                  >
                    <td className="px-4 py-3 font-medium text-gray-600">
                      {label}
                    </td>
                    {coins.map((coin, i) => {
                      let value: React.ReactNode =
                        coin![key as keyof Zora20Token];
                      if (key === "marketCapDelta24h") {
                        const num = parseFloat(value as string);
                        const isUp = num > 0;
                        value = (
                          <span
                            className={isUp ? "text-green-600" : "text-red-500"}
                          >
                            {isUp ? "+" : ""}
                            {num.toFixed(2)}%
                          </span>
                        );
                      }
                      if (key === "priceUsd") value = getCoinPrice(coin);
                      return (
                        <td key={i} className="px-4 py-3">
                          {typeof value === "string" ||
                          typeof value === "number"
                            ? value.toString()
                            : value}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr className="border-t">
                  <td className="px-4 py-3 font-medium text-gray-600">
                    Actions
                  </td>
                  {coins.map((coin, i) => (
                    <td key={i} className="px-4 py-3">
                      <Button
                        variant="outline"
                        className="rounded-xl hover:ring-2 hover:ring-yellow-400 text-indigo-600"
                        onClick={() =>
                          window.open(
                            `https://zora.co/coin/base:${coin!.address}`,
                            "_blank"
                          )
                        }
                      >
                        View on Zora
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="space-y-10">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Chart Comparison
            </h2>
            <div className="w-full h-[300px] bg-white rounded-xl p-4 shadow">
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Holders
              </h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Holders" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full h-[300px] bg-white rounded-xl p-4 shadow">
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Market Cap
              </h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="MarketCap" fill="#facc15" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full h-[300px] bg-white rounded-xl p-4 shadow">
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                24h Change %
              </h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Change24h" fill="#34d399" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
