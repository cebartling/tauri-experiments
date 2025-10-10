import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import Stocks from "./pages/Stocks";
import StockChart from "./pages/StockChart";
import CandlestickChartPage from "./pages/CandlestickChartPage";
import Alerts from "./pages/Alerts";
import { MarketMovers } from "./pages/MarketMovers";
import "./App.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "about",
        element: <About />,
      },
      {
        path: "stocks",
        element: <Stocks />,
      },
      {
        path: "stock-chart",
        element: <StockChart />,
      },
      {
        path: "candlestick-chart",
        element: <CandlestickChartPage />,
      },
      {
        path: "alerts",
        element: <Alerts />,
      },
      {
        path: "market-movers",
        element: <MarketMovers />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
