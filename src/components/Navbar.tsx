import { useState } from "react";
import { Menu, X } from "lucide-react";
import { NavItems } from "../scripts/utils";

import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentNavItem = location.pathname.includes("/explore")
    ? NavItems.explore
    : NavItems.portfolio;

  function handleNavigate(navItem: string) {
    if (navItem === NavItems.explore) navigate("/explore");
    else if (navItem === NavItems.portfolio) navigate("/"); // relogin
  }

  return (
    <nav className="bg-white mb-2 border-b border-gray-200 text-gray-900 shadow-sm">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <div className="text-2xl font-heading font-bold text-indigo-600">
          ZoraLens
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6">
          {Object.values(NavItems).map((item) => (
            <Button
              key={item}
              onClick={() => handleNavigate(item as keyof typeof NavItems)}
              className={`transition-colors hover:text-yellow-400 ${
                currentNavItem === item
                  ? "text-yellow-400 font-semibold"
                  : "text-gray-800"
              }`}
              variant="ghost"
            >
              {item}
            </Button>
          ))}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-800"
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
        <div className="md:hidden px-4 pb-4 space-y-3 bg-white border-t border-gray-200">
          {Object.values(NavItems).map((item) => (
            <button
              key={item}
              onClick={() => {
                handleNavigate(item as keyof typeof NavItems);
                setMenuOpen(false);
              }}
              className={`block w-full text-left transition-colors text-gray-800 hover:text-yellow-400 ${
                currentNavItem === item ? "text-yellow-400 font-semibold" : ""
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
