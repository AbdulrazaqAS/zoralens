import { useState } from 'react'
import { setApiKey } from "@zoralabs/coins-sdk";

import LandingPage from "./components/LandingPage";

// Set up your API key before making any SDK requests
setApiKey(import.meta.env.VITE_ZORA_API_KEY);

function App() {

  return (
    <>
      <LandingPage />
    </>
  )
}

export default App
