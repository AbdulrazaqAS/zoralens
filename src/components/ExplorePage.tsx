"use client";

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
    <div className="min-h-screen p-4 mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Explore Coins</h1>

      <Tabs
        defaultValue={activeTab}
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as Categories)}
        className="w-full"
      >
        <div className="flex flex-col md:flex-row md:justify-between gap-3">
          <TabsList className="">
            {categories.map((label) => (
              <TabsTrigger
                key={label}
                value={label}
                className="rounded-xl px-4 py-2 text-sm font-semibold data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex items-center">
            <p className="mr-2">Coins:</p>
            <Input
              type="number"
              min="5"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-20 p-1 text-sm rounded-r-none"
            />
            <Button
              variant="outline"
              onClick={handleRefresh}
              className="hover:ring-2 p-1 hover:ring-yellow-400 rounded-l-none"
            >
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={handleCompare}
              className="hover:ring-2 p-1 hover:ring-yellow-400"
            >
              {!showCompareCheckbox
                ? "Compare Coins"
                : `Compare ${compareCoins.length}/${maxCompareCoins}`}
            </Button>
          </div>
        </div>

        <div key={activeTab} className="text-gray-600 text-md">
          {descriptions[activeTab]}
        </div>

        {categories.map((label) => (
          <TabsContent key={label} value={label}>
            {loading ? (
              <ExploreCoinsTableSkeleton />
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
      </Tabs>
    </div>
  );
}
