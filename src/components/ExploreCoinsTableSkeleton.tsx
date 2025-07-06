import { Skeleton } from "@/components/ui/skeleton";

export default function ExploreCoinsTableSkeleton() {
  return (
    <div className="overflow-x-auto rounded-xl border shadow-sm">
      <table className="min-w-full table-auto text-sm text-gray-700">
        <thead className="bg-gray-50 text-left font-semibold text-gray-800">
          <tr>
            <th className="px-4 py-3">Coin</th>
            <th className="px-4 py-3">Symbol</th>
            <th className="px-4 py-3">Holders</th>
            <th className="px-4 py-3">Price (USD)</th>
            <th className="px-4 py-3">Market Cap (USD)</th>
            <th className="px-4 py-3">24h Market Cap</th>
            <th className="px-4 py-3">24h Vol</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 15 }).map((_, i) => (
            <tr key={i} className="border-t">
              {Array.from({ length: 8 }).map((_, j) => (
                <td key={j} className="px-4 py-3">
                  <Skeleton className="h-4 w-full" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
