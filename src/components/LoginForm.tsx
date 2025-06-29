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
    } else handleError(new Error("Ïnvalid username"));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <Card className="w-full max-w-md p-6 rounded-2xl shadow-md border border-gray-200">
        <CardContent className="space-y-6">
          <h1 className="text-lg font-bold text-center text-gray-800 font-orbitron">
            Login to your Zora Coins Portfolio
          </h1>

          <Input
            placeholder="Your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="rounded-xl border-gray-300 focus:ring-2 focus:ring-indigo-500"
          />

          <Button
            onClick={() => handleLogin(username)}
            disabled={isSigningIn}
            className="w-full bg-indigo-600 text-white hover:bg-indigo-700 rounded-2xl shadow-md hover:shadow-lg transition disabled:cursor-not-allowed"
          >
            <Sparkles className="w-4 h-4 mr-2" />{" "}
            {isSigningIn ? `Signing in as ${prevUsername}` : "Sign in"}
          </Button>

          <div className="flex justify-between pt-2 text-sm text-gray-500">
            <button
              onClick={() => {
                navigate("/explore");
              }}
              className="hover:text-indigo-600 transition font-medium"
            >
              Go to Explore
            </button>
            <a
              href="https://zora.co"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-yellow-500 transition font-medium"
            >
              Create Account
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
