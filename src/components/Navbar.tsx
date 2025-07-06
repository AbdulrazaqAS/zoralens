import { useState } from "react";
import { Menu, X } from "lucide-react";
import { NavItems } from "../scripts/utils";

import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentNavItem = location.pathname === '/'
    ? NavItems.explore
    : NavItems.portfolio;

  function handleNavigate(navItem: string) {
    if (navItem === NavItems.explore) navigate("/");
    else if (navItem === NavItems.portfolio) navigate("/login"); // relogin
  }

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200/50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">Z</span>
          </div>
          <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            ZoraLens
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-2">
          {Object.values(NavItems).map((item) => (
            <Button
              key={item}
              onClick={() => handleNavigate(item as keyof typeof NavItems)}
              className={`px-6 py-2.5 rounded-full transition-all duration-200 font-medium ${
                currentNavItem === item
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                  : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 hover:shadow-md"
              }`}
              variant="ghost"
            >
              {item === NavItems.explore && "🔍"} {item === NavItems.portfolio && "💼"} {item}
            </Button>
          ))}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200"
          >
            {menuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-6 space-y-2 bg-white/95 backdrop-blur-md border-t border-gray-200/50">
          {Object.values(NavItems).map((item) => (
            <button
              key={item}
              onClick={() => {
                handleNavigate(item as keyof typeof NavItems);
                setMenuOpen(false);
              }}
              className={`block w-full text-left px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                currentNavItem === item
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
              }`}
            >
              {item === NavItems.explore && "🔍"} {item === NavItems.portfolio && "💼"} {item}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
