import { handleError } from "@/scripts/actions";
import { fetchUserProfile } from "@/scripts/getters";
import { type ProfileData } from "@/scripts/utils";
import { useEffect, useState } from "react";

/** Storage key for persisting username in localStorage */
export const STORAGE_KEY = "zora-username";

/** Hook for managing local user authentication and profile data */
export function useLocalUser() {
  const [username, setUsername] = useState<string>();
  const [user, setUser] = useState<ProfileData>();
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setUsername(stored);
    }
  }, []);

  useEffect(() => {
    if (user || !username) return;

    setIsSigningIn(true);
    fetchUserProfile(username)
      .then((profile) => {
        if (!profile) return handleError(new Error("Account does not exist"));
        localStorage.setItem(STORAGE_KEY, username);
        setUser(profile);
        console.log("Üser profile", profile);
      })
      .catch(handleError)
      .finally(() => setIsSigningIn(false));
  }, [username]);

  /** Logs in user with provided username */
  const login = (name: string) => {
    if (!name.trim()) {
      handleError(new Error("Invalid username"));
      return;
    }

    setUsername(name);
  };

  /** Clears user data and logs out */
  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUsername(undefined);
    setUser(undefined);
  };

  return { username, user, isSigningIn, login, logout };
}
