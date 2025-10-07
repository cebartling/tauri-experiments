import { useState } from "react";
import { Link, Outlet } from "react-router-dom";

function Layout() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside
        className={`bg-gray-800 text-white transition-all duration-300 flex flex-col ${
          isOpen ? "w-64" : "w-16"
        }`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-4 hover:bg-gray-700 text-left"
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
              to="/contact"
              className="hover:bg-gray-700 p-2 rounded transition-colors"
            >
              {isOpen ? "Contact" : "📧"}
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;
