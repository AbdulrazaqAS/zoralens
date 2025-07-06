import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  fetchLastTradedCoins,
  fetchLastTradedUniqueCoins,
  fetchMostValuableCoins,
  fetchNewCoins,
  fetchTopGainers,
  fetchTopVolumeCoins,
} from "@/scripts/getters";
import type { Zora20Token } from "@/scripts/utils";
import ExploreCoinsTable from "./ExploreCoinsTable";
import ExploreCoinsTableSkeleton from "./ExploreCoinsTableSkeleton";
import { type Address } from "viem";
import { useNavigate } from "react-router";
import { handleError } from "@/scripts/actions";

type Categories =
  | "Top Gainers"
  | "Most Valuable"
  | "New Coins"
  | "High Volume"
  | "Recently Traded"
  | "Recently Traded Unique";

const descriptions: Record<Categories, string> = {
  "Top Gainers":
    "📈 These coins have experienced the largest percentage increase in market cap over the past 24 hours, signaling strong recent growth.",
  "Most Valuable":
    "💰 These are the top coins ranked by total market capitalization, representing the most valuable assets on the platform.",
  "New Coins":
    "🆕 Freshly launched coins that are newly minted and starting to gain traction in the ecosystem.",
  "High Volume":
    "🔊 Coins that have seen the highest trading activity in the past 24 hours, often indicating strong interest or volatility.",
  "Recently Traded":
    "💹 Coins that have been actively bought or sold most recently, showing what’s currently catching traders’ attention.",
  "Recently Traded Unique":
    "🧍‍♂️ Coins that were recently traded by a high number of unique wallets, highlighting community engagement and diversity of interest.",
};

export default function ExplorePage() {
  const [sections, setSections] = useState<Record<Categories, Zora20Token[]>>({
    "Top Gainers": [],
    "Most Valuable": [],
    "New Coins": [],
    "High Volume": [],
    "Recently Traded": [],
    "Recently Traded Unique": [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Categories>("Top Gainers");
  const [coinCount, setCoinCount] = useState(25);
  const [inputValue, setInputValue] = useState(coinCount.toString());
  const [compareCoins, setCompareCoins] = useState<Address[]>([]);
  const [showCompareCheckbox, setShowCompareCheckbox] = useState(false);

  const navigate = useNavigate();
  const maxCompareCoins = 5;

  const categories: Categories[] = [
    "Top Gainers",
    "Most Valuable",
    "High Volume",
    "New Coins",
    "Recently Traded",
    "Recently Traded Unique",
  ];

  const fetch = async (tab: Categories, amount: number) => {
    if (sections[tab].length === amount) return;

    setLoading(true);
    try {
      let coins: Zora20Token[];

      switch (tab) {
        case "Top Gainers":
          coins = (await fetchTopGainers(amount)) ?? sections["Top Gainers"];
          break;
        case "Most Valuable":
          coins =
            (await fetchMostValuableCoins(amount)) ?? sections["Most Valuable"];
          break;
        case "High Volume":
          coins =
            (await fetchTopVolumeCoins(amount)) ?? sections["High Volume"];
          break;
        case "New Coins":
          coins = (await fetchNewCoins(amount)) ?? sections["New Coins"];
          break;
        case "Recently Traded":
          coins =
            (await fetchLastTradedCoins(amount)) ?? sections["Recently Traded"];
          break;
        case "Recently Traded Unique":
          coins =
            (await fetchLastTradedUniqueCoins(amount)) ??
            sections["Recently Traded Unique"];
          break;
      }

      setSections((prev) => {
        return { ...prev, [tab]: coins };
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!activeTab) return;

    fetch(activeTab, coinCount);
  }, [activeTab, coinCount]);

  const handleRefresh = () => {
    const num = parseInt(inputValue);
    if (!isNaN(num) && num > 0) {
      setCoinCount(num);
    }
  };

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
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Explore Coins
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover trending coins, analyze market movements, and find your next investment opportunity
          </p>
        </div>

        <Tabs
          defaultValue={activeTab}
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as Categories)}
          className="w-full"
        >
          {/* Controls Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
            <div className="flex flex-col lg:flex-row lg:justify-between gap-6">
              {/* Category Tabs */}
              <TabsList className="bg-gray-100 p-1 rounded-xl flex-wrap justify-start lg:justify-center">
                {categories.map((label) => (
                  <TabsTrigger
                    key={label}
                    value={label}
                    className="rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-indigo-600 hover:bg-white/50"
                  >
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Action Controls */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-sm font-medium text-gray-700 mr-2">Coins:</span>
                  <Input
                    type="number"
                    min="5"
                    max="100"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-20 h-8 text-sm border-0 bg-white rounded-r-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <Button
                    variant="outline"
                    onClick={handleRefresh}
                    className="h-8 px-3 text-sm rounded-l-none border-l-0 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
                  >
                    Refresh
                  </Button>
                </div>
                
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
              </div>
            </div>
          </div>

          {/* Category Description */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 mb-6 border border-indigo-100">
            <div className="text-indigo-800 font-medium text-base leading-relaxed">
              {descriptions[activeTab]}
            </div>
          </div>

          {/* Content Section */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            {categories.map((label) => (
              <TabsContent key={label} value={label} className="m-0">
                {loading ? (
                  <div className="p-6">
                    <ExploreCoinsTableSkeleton />
                  </div>
                ) : (
                  <ExploreCoinsTable
                    coins={sections[label]}
                    compareCoins={compareCoins}
                    setCompareCoins={setCompareCoins}
                    showCompareCheckbox={showCompareCheckbox}
                    maxCompareCoins={maxCompareCoins}
                  />
                )}
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </div>
  );
}
