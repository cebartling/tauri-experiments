import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { Toast } from "./Toast";
import { startAlertPolling, stopAlertPolling } from "../services/alertService";
import { AlertTrigger } from "../types/alert";

function Layout() {
  const [activeToast, setActiveToast] = useState<AlertTrigger | null>(null);

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Start alert polling when the app loads
    startAlertPolling((trigger) => {
      // Show toast notification in-app
      setActiveToast(trigger);

      // Show desktop notification
      if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification(`${trigger.symbol} Price Alert`, {
          body: `${trigger.symbol} is now $${trigger.currentPrice.toFixed(2)} (${trigger.condition} $${trigger.threshold.toFixed(2)})`,
          icon: '/tauri.svg',
          tag: trigger.alertId, // Prevents duplicate notifications
        });

        // Auto-close desktop notification after 10 seconds
        setTimeout(() => notification.close(), 10000);
      }
    });

    // Cleanup on unmount
    return () => {
      stopAlertPolling();
    };
  }, []);

  return (
    <div className="flex h-screen">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Outlet />
        </div>
      </main>

      {/* Toast Notification */}
      {activeToast && (
        <Toast
          message={`${activeToast.symbol} has reached your alert threshold!`}
          symbol={activeToast.symbol}
          currentPrice={activeToast.currentPrice}
          threshold={activeToast.threshold}
          condition={activeToast.condition}
          onClose={() => setActiveToast(null)}
        />
      )}
    </div>
  );
}

export default Layout;
