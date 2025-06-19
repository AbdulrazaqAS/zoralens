import { useState } from 'react'
import { setApiKey } from "@zoralabs/coins-sdk";
import { NavItems } from "./scripts/utils";

import NavBar from "./components/NavBar";
import LandingPage from "./components/LandingPage";
import CreateMemePage from "./components/CreateMemePage";

// Set up your API key before making any SDK requests
setApiKey(import.meta.env.VITE_ZORA_API_KEY);

function App() {
  const [currentPage, setCurrentPage] = useState("Feed");

  return (
    <>
      <NavBar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      {currentPage === NavItems[feed] && <LandingPage />}
      {currentPage === NavItems[createMeme] && <currentCreateMemePage />}
    </>
  )
}

export default App
