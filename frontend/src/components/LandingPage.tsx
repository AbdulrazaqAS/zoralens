import { useEffect } from "react";
import { Button } from "@/components/ui/button"
import { baseSepolia, base } from "viem/chains";
import { fetchSingleCoin, fetchUserProfile, fetchAllUserBalances } from "../scripts/getters";

export default function LandingPage() {
  useEffect(() => {
    // fetchUserProfile("AbdulrazaqAS").then(console.log).catch(console.error);
    // fetchAllUserBalances("AbdulrazaqAS").then(console.log).catch(console.error);
    // fetchSingleCoin("0x445e9c0a296068dc4257767b5ed354b77cf513de", base.id).then(console.log).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-secondary text-black font-body relative overflow-hidden">
      {/* Glowing BG circles */}
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-accent opacity-30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-primary opacity-20 rounded-full blur-2xl animate-ping"></div>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-20">
        <h1 className="text-5xl md:text-6xl font-heading drop-shadow-lg">
          CoinQuest
        </h1>
        <p className="mt-4 text-lg text-gray-light max-w-xl">
          Complete social media quests, earn real rewards. No middlemen. Just you, your fans, and the blockchain.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Button>Start Questing</Button>
          <Button>Create a Quest</Button>
        </div>
      </div>

      {/* How it Works */}
      <section className="relative z-10 mt-20 px-6 max-w-4xl mx-auto">
        <h2 className="text-3xl font-heading mb-8 text-center">
          How CoinQuest Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="bg-gray-dark p-6 rounded-2xl shadow-lg hover:shadow-yellow-400/30 transition">
            <h3 className="font-heading text-xl mb-2">🧙‍♂️ Creators Launch</h3>
            <p>Create quests like “Like this tweet” or “Remix my video” and set the reward.</p>
          </div>
          <div className="bg-gray-dark p-6 rounded-2xl shadow-lg hover:shadow-yellow-400/30 transition">
            <h3 className="font-heading text-xl mb-2">⚔️ Fans Participate</h3>
            <p>Fans complete the quest and submit proof (tweet, video, etc.)</p>
          </div>
          <div className="bg-gray-dark p-6 rounded-2xl shadow-lg hover:shadow-yellow-400/30 transition">
            <h3 className="font-heading text-xl mb-2">💰 Earn Coins</h3>
            <p>Approved fans instantly receive Zora Coins as reward — no delay, no gas fees.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-20 text-center text-gray-400 text-sm py-6">
        Built for Zora Coinathon • Powered by Ethereum • Made with ❤️
      </footer>
    </div>
  )
}
