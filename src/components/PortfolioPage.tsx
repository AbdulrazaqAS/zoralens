import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { fetchAllUserBalances } from "../scripts/getters";
import PortfolioChart from "./PortfolioChart";
import LoginForm from "./LoginForm";
import { type CoinMetadata, type ProfileData } from "@/scripts/utils";
import CoinsTable from "./CoinsTable";

const mockCoins = [
  {
    name: "DogeVibes",
    symbol: "VIBE",
    logo: "🐶",
    amountHeld: 2500,
    price: 0.00021,
    change24h: +12.3,
  },
];

interface Props {
  user?: ProfileData;
  login: Function;
  prevUsername?: string;
  isSigningIn: boolean;
  setCurrentPage: Function;
}

export default function DashboardPage({
  user,
  prevUsername,
  isSigningIn,
  setCurrentPage,
  login,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [coins, setCoins] = useState<CoinMetadata[]>([]);

  useEffect(() => {
    // fetchUserProfile("AbdulrazaqAS").then(console.log).catch(console.error);
    // fetchUserProfile("0x46a7747626ca744fbade35c9f5e16d1b789cb16e")
    //   .then(console.log)
    //   .catch(console.error);
  }, []);

  useEffect(() => {
    if (!user || !user.handle) return;

    fetchAllUserBalances(user.handle)
      .then((bals) => {
        console.log(bals);
        setCoins(bals);
        setLoading(false);
      })
      .catch(console.error);
  }, [user]);

  return (
    <div className="min-h-screen px-4 py-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">My Zora Coins</h1>

      {!user ? (
        <div className="">
          <LoginForm
            login={login}
            prevUsername={prevUsername}
            isSigningIn={isSigningIn}
            setCurrentPage={setCurrentPage}
          />
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : coins.length === 0 ? (
        <div>
          <div className="text-gray-500">
            You don't hold any Zora Coins yet.
          </div>
          <Button
            variant="outline"
            className="mt-4 w-fit hover:ring-2 hover:ring-yellow-400 text-indigo-600"
            onClick={() =>
              window.open(`https://zora.co/@${user.handle}`, "_blank")
            }
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <CoinsTable coins={coins} />
          </div>
        </div>
      )}
    </div>
  );
}
