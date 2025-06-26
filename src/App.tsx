import { useState } from "react";
import { setApiKey } from "@zoralabs/coins-sdk";
import { NavItems } from "./scripts/utils";
import { Toaster } from "sonner";

import NavBar from "./components/Navbar";
import PortfolioPage from "./components/PortfolioPage";
import ExplorePage from "./components/ExplorePage";
import { useLocalUser } from "./hooks/useLocalUser";

// Set up your API key before making any SDK requests
setApiKey(import.meta.env.VITE_ZORA_API_KEY);

function App() {
  const [currentPage, setCurrentPage] = useState<keyof typeof NavItems>(
    NavItems.portfolio as keyof typeof NavItems
  );

  const {username, user, isSigningIn, login, logout } = useLocalUser();

  return (
    <>
      <NavBar currentPage={currentPage} setCurrentPage={setCurrentPage} user={user} logout={logout}/>
      {currentPage === NavItems.portfolio && <PortfolioPage user={user} prevUsername={username} isSigningIn={isSigningIn} login={login} setCurrentPage={setCurrentPage} />}
      {currentPage === NavItems.explore && <ExplorePage />}
      <Toaster />
    </>
  );
}

export default App;
