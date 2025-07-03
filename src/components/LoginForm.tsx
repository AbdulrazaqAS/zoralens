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
    <div className="h-[70vh] flex flex-col gap-7 items-center justify-center bg-white px-4">
      <div className="text-center w-full px-4">
        <p className="text-gray-500 md:max-w-1/2 mx-auto text-2xl">
          🔍 View the coin portfolio of any Zora user by entering their
          username. Instantly explore their holdings, prices, and coin stats in
          one place.
        </p>
      </div>

      <Card className="w-full max-w-md p-6 rounded-2xl shadow-md border border-gray-200">
        <CardContent className="space-y-6">
          <h1 className="text-lg font-bold text-center text-gray-500 font-orbitron">
            Enter Portfolio username
          </h1>

          <Input
            placeholder="Username"
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
            {isSigningIn
              ? `Loading ${prevUsername} portfolio`
              : "View Portfolio"}
          </Button>

          <div className="flex justify-between pt-2 text-sm text-gray-500">
            <button
              onClick={() => {
                navigate("/");
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
              Create Zora Account
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
