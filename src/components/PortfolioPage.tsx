import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { fetchAllUserBalances } from "../scripts/getters";
import PortfolioChart from "./PortfolioChart";
import { type CoinMetadata } from "@/scripts/utils";
import PortfolioCoinsTable from "./PortfolioCoinsTable";
import { useParams } from "react-router";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [coins, setCoins] = useState<CoinMetadata[]>([]);

  const { id } = useParams();

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

  return (
    <div className="min-h-screen px-4 py-8 mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">{id} Zora Coins</h1>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
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
            <PortfolioChart
              coins={coins.map((coin) => ({
                name: coin.coin!.symbol,
                value: Number(coin.value),
              }))}
            />
          )}
          <PortfolioCoinsTable coins={coins} />
        </div>
      )}
    </div>
  );
}
