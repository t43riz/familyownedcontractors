import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import NotFound from "./pages/NotFound";
import HomePage from "./pages/HomePage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import DoNotSell from "./pages/DoNotSell";
import Partners from "./pages/Partners";
// Home Services Landing Pages
import HomeServicesHub from "./components/home-services/HomeServicesHub";
import RoofingLander from "./components/home-services/RoofingLander";
import BathLander from "./components/home-services/BathLander";
import WindowsLander from "./components/home-services/WindowsLander";
import HVACLander from "./components/home-services/HVACLander";
import HVACLanderA from "./components/home-services/HVACLanderA";
import HVACLanderB from "./components/home-services/HVACLanderB";
import HVACLanderC from "./components/home-services/HVACLanderC";
import KitchenLander from "./components/home-services/KitchenLander";
import PlumbingLander from "./components/home-services/PlumbingLander";
import ProgressiveServicesLander from "./components/home-services/ProgressiveServicesLander";
import { initializeTracking } from "./services/analytics";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    initializeTracking();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <ScrollToTop />
          <Routes>
            {/* Homepage */}
            <Route path="/" element={<HomePage />} />
            <Route path="/home-services" element={<HomeServicesHub />} />
            <Route path="/home-services/roofing" element={<RoofingLander />} />
            <Route path="/roofing" element={<RoofingLander />} />
            <Route path="/home-services/bath" element={<BathLander />} />
            <Route path="/bath" element={<BathLander />} />
            <Route path="/home-services/windows" element={<WindowsLander />} />
            <Route path="/windows" element={<WindowsLander />} />
            <Route path="/home-services/hvac" element={<HVACLander />} />
            <Route path="/hvac" element={<HVACLander />} />
            <Route path="/home-services/hvac-a" element={<HVACLanderA />} />
            <Route path="/hvac-a" element={<HVACLanderA />} />
            <Route path="/home-services/hvac-b" element={<HVACLanderB />} />
            <Route path="/hvac-b" element={<HVACLanderB />} />
            <Route path="/home-services/hvac-c" element={<HVACLanderC />} />
            <Route path="/hvac-c" element={<HVACLanderC />} />
            <Route path="/home-services/kitchen" element={<KitchenLander />} />
            <Route path="/kitchen" element={<KitchenLander />} />
            <Route path="/home-services/plumbing" element={<PlumbingLander />} />
            <Route path="/plumbing" element={<PlumbingLander />} />
            <Route path="/home-services-progressive" element={<ProgressiveServicesLander />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/do-not-sell" element={<DoNotSell />} />
            <Route path="/partners" element={<Partners />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
