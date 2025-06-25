import FeedCard from "@/components/FeedCard";

export default function Feed() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      <FeedCard
        creator="MemeQueen.eth"
        creatorImage="/avatars/queen.png"
        timestamp="3h ago"
        memeImage="/memes/doge-fly.png"
        description="When your meme coin takes off 🚀🐶"
        metrics={{
          holders: 314,
          price: 0.025,
          remixes: 92,
          likes: 500,
        }}
      />
    </div>
  );
}
