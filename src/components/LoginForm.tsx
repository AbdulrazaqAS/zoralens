import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { handleError } from "@/scripts/actions";
import { useLocalUser } from "@/hooks/useLocalUser";
import { useNavigate } from "react-router";

export default function LoginForm() {
  const [username, setUsername] = useState("");

  const {
    username: prevUsername,
    user: prevUser,
    isSigningIn,
    login,
  } = useLocalUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!prevUsername) return;

    handleLogin(prevUsername);
  }, [prevUsername]);

  useEffect(() => {
    if (!prevUser) return;
    navigate(`/${prevUser.handle}`);
  }, [prevUser]);

  const handleLogin = (username: string) => {
    if (username.trim().length > 0) {
      login(username.trim());
    } else handleError(new Error("Invalid username"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col items-center justify-center px-6 py-12">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full opacity-30 blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-xl mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Portfolio Explorer
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed max-w-xl mx-auto">
            🔍 Discover and analyze any Zora user's coin portfolio. Enter a username to instantly explore their holdings, track values, and dive deep into their crypto journey.
          </p>
        </div>

        {/* Login Card */}
        <Card className="bg-white/80 backdrop-blur-md border-0 shadow-2xl rounded-3xl overflow-hidden">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Enter Username
                </h2>
                <p className="text-gray-600 text-sm">
                  Search by Zora handle or wallet address
                </p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <Input
                    placeholder="e.g. username or 0x..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-14 text-lg rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 pl-12"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    🔍
                  </div>
                </div>

                <Button
                  onClick={() => handleLogin(username)}
                  disabled={isSigningIn}
                  className="w-full h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none"
                >
                  {isSigningIn ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading {prevUsername} portfolio...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-5 h-5" />
                      <span>Explore Portfolio</span>
                    </div>
                  )}
                </Button>
              </div>

              {/* Action Links */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <button
                  onClick={() => navigate("/")}
                  className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200"
                >
                  <span>🚀</span>
                  <span>Explore Trending Coins</span>
                </button>
                <a
                  href="https://zora.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200"
                >
                  <span>✨</span>
                  <span>Join Zora</span>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features showcase */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="text-3xl mb-3">💰</div>
            <h3 className="font-semibold text-gray-800 mb-2">Real-time Values</h3>
            <p className="text-sm text-gray-600">Track portfolio value and individual coin prices in real-time</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold text-gray-800 mb-2">Detailed Analytics</h3>
            <p className="text-sm text-gray-600">View comprehensive stats, charts, and portfolio breakdowns</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="text-3xl mb-3">🔗</div>
            <h3 className="font-semibold text-gray-800 mb-2">Direct Zora Links</h3>
            <p className="text-sm text-gray-600">Seamlessly navigate to Zora for trading and transactions</p>
          </div>
        </div>
      </div>
    </div>
  );
}
