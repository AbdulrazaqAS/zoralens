import { useState } from 'react'
import { setApiKey } from "@zoralabs/coins-sdk";
import { NavItems } from "./scripts/utils";
import { Toaster } from 'sonner';

import NavBar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import CreateMemePage from "./components/CreateMemePage";

import LogViewer from './LogViewer';

// Set up your API key before making any SDK requests
setApiKey(import.meta.env.VITE_ZORA_API_KEY);

function App() {
  const [currentPage, setCurrentPage] = useState<keyof typeof NavItems>(NavItems.feed as keyof typeof NavItems);

  return (
    <>
      <NavBar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      {currentPage === NavItems.feed && <LandingPage />}
      {currentPage === NavItems.createMeme && <CreateMemePage />}
      {currentPage === NavItems.logs && <LogViewer />}

      <Toaster />
    </>
  )
}

export default App
