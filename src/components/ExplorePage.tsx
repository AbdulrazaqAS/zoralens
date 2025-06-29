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
import ExploreCoinsTable from "./ExploreCoinsTable";

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
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : (
        sections.map((section, i) => (
          <div key={i} className="mb-10">
            <h2 className="text-xl font-semibold text-indigo-600 mb-4">
              {section.label}
            </h2>
            <ExploreCoinsTable coins={section.coins} />
          </div>
        ))
      )}
    </div>
  );
}
