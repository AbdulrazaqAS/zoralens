import { useState } from "react";
import { setApiKey } from "@zoralabs/coins-sdk";
import { NavItems } from "./scripts/utils";
import { Toaster } from "sonner";

import NavBar from "./components/Navbar";
import PortfolioPage from "./components/PortfolioPage";
import ExplorePage from "./components/ExplorePage";
import CreateMemePage from "./components/CreateMemePage";

//import LogViewer from './LogViewer';

// Set up your API key before making any SDK requests
setApiKey(import.meta.env.VITE_ZORA_API_KEY);

function App() {
  const [currentPage, setCurrentPage] = useState<keyof typeof NavItems>(
    NavItems.feed as keyof typeof NavItems
  );

  return (
    <>
      <NavBar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      {currentPage === NavItems.feed && <PortfolioPage />}
      (currentPage === NavItems.explore && <ExplorePage />)
      {currentPage === NavItems.logs && <p>No logs</p>}
      <Toaster />
    </>
  );
}

export default App;
