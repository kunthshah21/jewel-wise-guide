import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { DateFilterProvider } from "./contexts/DateFilterContext";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import BraceletDeepDive from "./pages/BraceletDeepDive";
import RingDeepDive from "./pages/RingDeepDive";
import NecklaceDeepDive from "./pages/NecklaceDeepDive";
import BangleDeepDive from "./pages/BangleDeepDive";
import EarringDeepDive from "./pages/EarringDeepDive";
import PendantDeepDive from "./pages/PendantDeepDive";
import Market from "./pages/Market";
import Keywords from "./pages/Keywords";
import Predictions from "./pages/Predictions";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DateFilterProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/inventory/bracelets" element={<BraceletDeepDive />} />
              <Route path="/inventory/rings" element={<RingDeepDive />} />
              <Route path="/inventory/necklaces" element={<NecklaceDeepDive />} />
              <Route path="/inventory/bangles" element={<BangleDeepDive />} />
              <Route path="/inventory/earrings" element={<EarringDeepDive />} />
              <Route path="/inventory/pendants" element={<PendantDeepDive />} />
              <Route path="/market" element={<Market />} />
              <Route path="/keywords" element={<Keywords />} />
              <Route path="/predictions" element={<Predictions />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </DateFilterProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
