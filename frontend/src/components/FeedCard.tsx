import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Users } from "lucide-react";

interface MemeProps {
  creator: string;
  creatorImage: string;
  timestamp: string;
  memeImage: string;
  description: string;
  metrics: {
    holders: number;
    price: number;
    remixes: number;
    likes: number;
  };
}

export default function FeedCard({
  creator,
  creatorImage,
  timestamp,
  memeImage,
  description,
  metrics,
}: MemeProps) {
  const [showMetrics, setShowMetrics] = useState(false);

  return (
    <Card className="bg-white rounded-2xl border border-gray-200 shadow-md hover:scale-[1.01] transition w-full max-w-xl mx-auto mb-6">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={creatorImage} alt={creator} />
              <AvatarFallback>{creator[0]}</AvatarFallback>
            </Avatar>
            <span className="text-gray-800 font-medium">{creator}</span>
          </div>
          <span className="text-sm text-gray-400">{timestamp}</span>
        </div>

        {/* Meme Image (click to toggle metrics) */}
        <div
          className="relative w-full overflow-hidden rounded-xl border border-gray-100 shadow-sm cursor-pointer"
          onClick={() => setShowMetrics(!showMetrics)}
        >
          <img
            src={memeImage}
            alt="Meme"
            className={`w-full transition-all duration-300 ${
              showMetrics ? "opacity-20 blur-sm" : "opacity-100"
            }`}
          />

          {/* Metrics Overlay */}
          {showMetrics && (
            <div className="absolute inset-0 bg-white bg-opacity-90 flex flex-col justify-center items-center gap-3 p-6 text-center transition-opacity duration-300">
              <h3 className="text-xl font-bold text-indigo-600 font-heading">Meme Stats</h3>
              <div className="text-gray-800 font-medium space-y-1 text-sm">
                <p>🧑‍🤝‍🧑 Holders: {metrics.holders}</p>
                <p>💰 Price: {metrics.price} ETH</p>
                <p>🔁 Remixes: {metrics.remixes}</p>
                <p>❤️ Likes: {metrics.likes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-700 mt-3 text-sm">{description}</p>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-wrap gap-3">
          <Button className="rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white ring-2 ring-transparent hover:ring-yellow-400 transition font-semibold">
            Buy & Remix
          </Button>
          <Button
            variant="ghost"
            className="text-indigo-600 hover:text-yellow-400 flex items-center gap-1 text-sm"
          >
            <MessageCircle className="w-4 h-4" />
            Comment
          </Button>
          <Button
            variant="ghost"
            className="text-gray-600 hover:text-yellow-400 flex items-center gap-1 text-sm"
          >
            <Users className="w-4 h-4" />
            Holders
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
