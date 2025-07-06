import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { fetchAllUserBalances } from "../scripts/getters";
import PortfolioChart from "./PortfolioChart";
import { type CoinMetadata } from "@/scripts/utils";
import PortfolioCoinsTable from "./PortfolioCoinsTable";
import { useNavigate, useParams } from "react-router";
import { STORAGE_KEY } from "@/hooks/useLocalUser";
import { type Address } from "viem";
import { handleError } from "@/scripts/actions";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [coins, setCoins] = useState<CoinMetadata[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [compareCoins, setCompareCoins] = useState<Address[]>([]);
  const [showCompareCheckbox, setShowCompareCheckbox] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();
  const maxCompareCoins = 5;

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

  function handleCompare(): void {
    if (showCompareCheckbox) {
      if (compareCoins.length === 0) setShowCompareCheckbox(false);
      else if (
        compareCoins.length === 1 ||
        compareCoins.length > maxCompareCoins
      ) {
        handleError(new Error("Select 2 to 5 coins"));
        return;
      } else {
        const ids = compareCoins.join(",");
        navigate(`/compare/${ids}`);
      }
    } else setShowCompareCheckbox(true);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {id}'s Portfolio
              </h1>
              <p className="text-gray-600 text-lg">
                💼 Complete overview of Zora coin holdings and portfolio performance
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant={showCompareCheckbox ? "default" : "outline"}
                onClick={handleCompare}
                className={`transition-all duration-200 ${
                  showCompareCheckbox 
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md" 
                    : "hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300"
                }`}
              >
                {!showCompareCheckbox
                  ? "🔗 Compare Coins"
                  : `📊 Compare ${compareCoins.length}/${maxCompareCoins}`}
              </Button>
              
              <Button
                variant="outline"
                className="rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors"
                onClick={handleExitPortfolio}
              >
                Exit Portfolio
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        ) : coins.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
            <div className="text-6xl mb-4">🪙</div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              No Coins Found
            </h3>
            <div className="text-gray-600 mb-8 max-w-md mx-auto">
              This user doesn't hold any Zora Coins yet. Start exploring and trading on Zora to build your portfolio!
            </div>
            <Button
              variant="outline"
              className="rounded-xl hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
              onClick={() => window.open(`https://zora.co/@${id}`, "_blank")}
            >
              🚀 Discover Coins on Zora
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Portfolio Overview Card */}
            {!loading && coins.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    📊 Portfolio Overview
                  </h2>
                </div>
                
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-8 items-center">
                    {/* Stats Section */}
                    <div className="flex flex-col space-y-6 min-w-[280px]">
                      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
                        <div className="text-sm font-medium text-indigo-600 mb-2">Total Coins Held</div>
                        <div className="text-3xl font-bold text-indigo-700">{coins.length}</div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100">
                        <div className="text-sm font-medium text-emerald-600 mb-2">Portfolio Value</div>
                        <div className="text-3xl font-bold text-emerald-700">
                          ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                    
                    {/* Chart Section */}
                    <div className="flex-1 w-full min-h-[300px]">
                      <PortfolioChart
                        coins={coins.map((coin) => ({
                          name: coin.coin!.symbol,
                          value: Number(coin.value),
                        }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Portfolio Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  💰 Coin Holdings
                </h2>
              </div>
              
              <PortfolioCoinsTable 
                coins={coins}
                compareCoins={compareCoins}
                setCompareCoins={setCompareCoins}
                showCompareCheckbox={showCompareCheckbox}
                maxCompareCoins={maxCompareCoins}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
