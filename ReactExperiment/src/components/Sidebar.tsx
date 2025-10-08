import { useState } from "react";
import { Link } from "react-router-dom";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside
      className={`bg-gray-800 text-white transition-all duration-500 flex flex-col ${
        isOpen ? "w-64" : "w-16"
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 text-left bg-gray-800 hover:bg-gray-700 w-16 focus:outline-none"
      >
        <span className="text-xl">{isOpen ? "◀" : "▶"}</span>
      </button>

      {/* Navigation Links */}
      <nav className="flex-1 p-4">
        <div className="flex flex-col gap-4">
          <Link
            to="/"
            className="hover:bg-gray-700 p-2 rounded transition-colors"
          >
            {isOpen ? "Home" : "🏠"}
          </Link>
          <Link
            to="/about"
            className="hover:bg-gray-700 p-2 rounded transition-colors"
          >
            {isOpen ? "About" : "ℹ️"}
          </Link>
          <Link
            to="/services"
            className="hover:bg-gray-700 p-2 rounded transition-colors"
          >
            {isOpen ? "Services" : "⚙️"}
          </Link>
          <Link
            to="/stocks"
            className="hover:bg-gray-700 p-2 rounded transition-colors"
          >
            {isOpen ? "Stocks" : "📈"}
          </Link>
          <Link
            to="/stock-chart"
            className="hover:bg-gray-700 p-2 rounded transition-colors"
          >
            {isOpen ? "Stock Chart" : "📊"}
          </Link>
        </div>
      </nav>
    </aside>
  );
}

export default Sidebar;
