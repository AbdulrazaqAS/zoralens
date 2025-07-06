import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchMultipleCoins, getCoinPrice } from "@/scripts/getters";
import type { Zora20Token } from "@/scripts/utils";
import { ArrowLeft } from "lucide-react";
import type { Address } from "viem";
import { handleError } from "@/scripts/actions";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
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
    // { label: "Name", key: "name" },
    // { label: "Symbol", key: "symbol" },
    { label: "Holders", key: "uniqueHolders" },
    { label: "Price (USD)", key: "priceUsd" },
    { label: "Market Cap", key: "marketCap" },
    { label: "24h Δ", key: "marketCapDelta24h" },
    { label: "24h Vol", key: "volume24h" },
  ];

  const chartData = coins.map((coin) => ({
    name: coin!.name,
    Holders: Number(coin!.uniqueHolders),
    Price: getCoinPrice(coin!),
    MarketCap: Number(coin!.marketCap),
    Change24h: parseFloat(coin!.marketCapDelta24h || "0"),
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="mb-6 gap-2 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Explore
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Coin Comparison
            </h1>
            <p className="text-gray-600 text-lg">
              📊 Compare {coins.length} coins side by side with detailed metrics and visual analytics
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            <Skeleton className="w-full h-[400px] rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Skeleton className="h-[300px] rounded-2xl" />
              <Skeleton className="h-[300px] rounded-2xl" />
              <Skeleton className="h-[300px] rounded-2xl" />
            </div>
          </div>
        ) : (
          <>
            {/* Comparison Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 mb-12">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  📋 Detailed Comparison Table
                </h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-gray-700">Attribute</th>
                      {coins.map((coin, i) => (
                        <th key={i} className="px-6 py-4 text-left">
                          <div className="space-y-2">
                            <div className="font-semibold text-indigo-600">
                              {coin!.name}
                            </div>
                            <div className="text-xs text-gray-500 font-mono">
                              ${coin!.symbol}
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {attributes.map(({ label, key }) => (
                      <tr
                        key={key}
                        className="hover:bg-indigo-50/50 transition-all duration-200"
                      >
                        <td className="px-6 py-4 font-medium text-gray-800 bg-gray-50/50">
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
                                className={`font-semibold ${
                                  isUp ? "text-green-600" : "text-red-500"
                                }`}
                              >
                                {isUp ? "+" : ""}
                                {num.toFixed(2)}
                              </span>
                            );
                          }
                          if (key === "priceUsd") {
                            value = (
                              <span className="font-mono text-indigo-600">
                                ${getCoinPrice(coin).toFixed(6)}
                              </span>
                            );
                          }
                          if (key === "marketCap") {
                            value = (
                              <span className="font-mono">
                                ${Number(value).toLocaleString()}
                              </span>
                            );
                          }
                          if (key === "uniqueHolders") {
                            value = (
                              <span className="font-semibold text-purple-600">
                                {Number(value).toLocaleString()}
                              </span>
                            );
                          }

                          if (key === "volume24h") {
                            value = (
                              <span className="font-mono">
                                ${Number(value).toLocaleString()}
                              </span>
                            );
                          }
                          
                          return (
                            <td key={i} className="px-6 py-4">
                              {typeof value === "string" ||
                              typeof value === "number"
                                ? String(value)
                                : value}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    <tr className="bg-gradient-to-r from-indigo-50 to-purple-50">
                      <td className="px-6 py-4 font-semibold text-gray-800">
                        🔗 Actions
                      </td>
                      {coins.map((coin, i) => (
                        <td key={i} className="px-6 py-4">
                          <Button
                            variant="outline"
                            className="rounded-xl hover:bg-indigo-600 hover:text-white border-indigo-300 text-indigo-600 transition-all duration-200"
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
            </div>

            {/* Charts Section */}
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Visual Analytics
                </h2>
                <p className="text-gray-600">Interactive charts comparing key metrics across selected coins</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Holders Chart */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      👥 Unique Holders
                    </h3>
                    <p className="text-blue-100 text-sm mt-1">Community size comparison</p>
                  </div>
                  <div className="p-6">
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <XAxis 
                            dataKey="name" 
                            tick={{ fontSize: 12 }}
                            axisLine={{ stroke: '#e5e7eb' }}
                          />
                          <YAxis 
                            tick={{ fontSize: 12 }}
                            axisLine={{ stroke: '#e5e7eb' }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#f8fafc', 
                              border: '1px solid #e2e8f0', 
                              borderRadius: '12px',
                              boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                            }}
                          />
                          <Bar 
                            dataKey="Holders" 
                            fill="#3b82f6" 
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Market Cap Chart */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      💰 Market Cap
                    </h3>
                    <p className="text-emerald-100 text-sm mt-1">Total market valuation</p>
                  </div>
                  <div className="p-6">
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <XAxis 
                            dataKey="name" 
                            tick={{ fontSize: 12 }}
                            axisLine={{ stroke: '#e5e7eb' }}
                          />
                          <YAxis 
                            tick={{ fontSize: 12 }}
                            axisLine={{ stroke: '#e5e7eb' }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#f8fafc', 
                              border: '1px solid #e2e8f0', 
                              borderRadius: '12px',
                              boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                            }}
                            formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Market Cap']}
                          />
                          <Bar 
                            dataKey="MarketCap" 
                            fill="#10b981" 
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Price Chart */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      💎 Price (USD)
                    </h3>
                    <p className="text-purple-100 text-sm mt-1">Current trading prices</p>
                  </div>
                  <div className="p-6">
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <XAxis 
                            dataKey="name" 
                            tick={{ fontSize: 12 }}
                            axisLine={{ stroke: '#e5e7eb' }}
                          />
                          <YAxis 
                            tick={{ fontSize: 12 }}
                            axisLine={{ stroke: '#e5e7eb' }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#f8fafc', 
                              border: '1px solid #e2e8f0', 
                              borderRadius: '12px',
                              boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                            }}
                            formatter={(value) => [`$${Number(value).toFixed(6)}`, 'Price']}
                          />
                          <Bar 
                            dataKey="Price" 
                            fill="#a855f7" 
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* 24h Change Chart */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      📈 24h Change (%)
                    </h3>
                    <p className="text-amber-100 text-sm mt-1">Recent performance trends</p>
                  </div>
                  <div className="p-6">
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <XAxis 
                            dataKey="name" 
                            tick={{ fontSize: 12 }}
                            axisLine={{ stroke: '#e5e7eb' }}
                          />
                          <YAxis 
                            tick={{ fontSize: 12 }}
                            axisLine={{ stroke: '#e5e7eb' }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#f8fafc', 
                              border: '1px solid #e2e8f0', 
                              borderRadius: '12px',
                              boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                            }}
                            formatter={(value) => [`${Number(value).toFixed(2)}%`, '24h Change']}
                          />
                          <Bar 
                            dataKey="Change24h" 
                            fill="#f59e0b" 
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
