import { setApiKey } from "@zoralabs/coins-sdk";
import { Toaster } from "sonner";
import { Routes, Route } from "react-router";

import NavBar from "./components/Navbar";
import PortfolioPage from "./components/PortfolioPage";
import ExplorePage from "./components/ExplorePage";
import LoginForm from "./components/LoginForm";
import CompareCoinsPage from "./components/CompareCoinsPage";

// Set up your API key before making any SDK requests
setApiKey(import.meta.env.VITE_ZORA_API_KEY);

function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/:id" element={<PortfolioPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/compare/:ids" element={<CompareCoinsPage />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
