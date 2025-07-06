import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { fetchAllUserBalances } from "../scripts/getters";
import PortfolioChart from "./PortfolioChart";
import { type CoinMetadata } from "@/scripts/utils";
import PortfolioCoinsTable from "./PortfolioCoinsTable";
import { useNavigate, useParams } from "react-router";
import { STORAGE_KEY } from "@/hooks/useLocalUser";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [coins, setCoins] = useState<CoinMetadata[]>([]);
  const [totalValue, setTotalValue] = useState(0);

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return; // render UserNotFound

    fetchAllUserBalances(id)
      .then((bals) => {
        console.log(bals);
        setCoins(bals);
        setLoading(false);
      })
      .catch(console.error);
  }, [id]);

  useEffect(() => {
    if (coins.length <= 0) return;

    const coinsValue = coins.reduce((acc, coin) => {
      return acc + (coin.value ?? 0);
    }, 0);
    setTotalValue(coinsValue);
  }, [coins]);

  function handleExitPortfolio() {
    localStorage.removeItem(STORAGE_KEY);
    navigate("/login");
  }

  return (
    <div className="min-h-screen px-4 py-8 mx-auto">
      <div className="flex flex-row gap-4">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          {id} Zora Coins Portfolio
        </h1>
        <Button
          variant="outline"
          className="rounded-xl text-red-600 hover:ring-2 hover:ring-red-400"
          onClick={handleExitPortfolio}
        >
          Exit Portfolio
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : coins.length === 0 ? (
        <div>
          <div className="text-gray-500">
            User don't hold any Zora Coins yet.
          </div>
          <Button
            variant="outline"
            className="mt-4 w-fit hover:ring-2 hover:ring-yellow-400 text-indigo-600"
            onClick={() => window.open(`https://zora.co/@${id}`, "_blank")}
          >
            Buy/Create Coins on Zora
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {!loading && coins.length > 0 && (
            <div className="flex flex-col md:flex-row gap-6 items-center bg-white rounded-xl shadow p-6">
              <div className="flex flex-col items-start space-y-2 min-w-[200px]">
              <span className="text-gray-500 text-sm">Coins Held</span>
              <span className="text-2xl font-semibold text-indigo-700">{coins.length}</span>
              <span className="text-gray-500 text-sm mt-4">Portfolio Value</span>
              <span className="text-2xl font-semibold text-green-600">
                ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
              </div>
              <div className="flex-1 w-full">
              <PortfolioChart
                coins={coins.map((coin) => ({
                name: coin.coin!.symbol,
                value: Number(coin.value),
                }))}
              />
              </div>
            </div>
          )}
          <PortfolioCoinsTable coins={coins} />
        </div>
      )}
    </div>
  );
}
