import { useState } from "react";
import { Menu, X } from "lucide-react";
import { NavItems } from "../scripts/utils";

import ConnectWallet from './ConnectWallet'

interface Props {
  currentPage: string;
  setCurrentPage: Function;
}

export default function Navbar({currentPage, setCurrentPage} : Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white mb-5 border-b border-gray-200 text-gray-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <div className="text-2xl font-heading font-bold text-indigo-600">Rememe</div>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6">
          {Object.values(NavItems).map((item) => (
            <Button
              key={item}
              onClick={() => setCurrentPage(item)}
              className={`transition-colors hover:text-yellow-400 ${
                currentPage === item ? "text-yellow-400 font-semibold" : "text-gray-800"
              }`}
              variant="ghost"
            >
              {item}
            </Button>
          ))}
        </div>

        {/* Connect Button */}
        <div className="hidden md:block">
          <ConnectWallet />
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-800">
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 space-y-3 bg-white border-t border-gray-200">
          {Object.values(NavItems).map((item) => (
            <button
              key={item}
              onClick={() => {
                setCurrentPage(item);
                setMenuOpen(false);
              }}
              className={`block w-full text-left transition-colors text-gray-800 hover:text-yellow-400 ${
                currentPage === item ? "text-yellow-400 font-semibold" : ""
              }`}
            >
              {item}
            </button>
          ))}
          <ConnectWallet />
        </div>
      )}
    </nav>
  );
}