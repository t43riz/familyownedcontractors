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
import HVACLanderCall from "./components/home-services/HVACLanderCall";
import KitchenLander from "./components/home-services/KitchenLander";
import PlumbingLander from "./components/home-services/PlumbingLander";
import ProgressiveServicesLander from "./components/home-services/ProgressiveServicesLander";
import ThumbtackLander from "./components/home-services/ThumbtackLander";
import RoofingLanderWaterfall from "./components/home-services/RoofingLanderWaterfall";
import HVACLanderWaterfall from "./components/home-services/HVACLanderWaterfall";
import WindowsLanderWaterfall from "./components/home-services/WindowsLanderWaterfall";
import { THUMBTACK_SERVICES } from "./services/thumbtackConfig";
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
            <Route path="/home-services/hvac-call" element={<HVACLanderCall />} />
            <Route path="/hvac-call" element={<HVACLanderCall />} />
            <Route path="/home-services/kitchen" element={<KitchenLander />} />
            <Route path="/kitchen" element={<KitchenLander />} />
            <Route path="/home-services/plumbing" element={<PlumbingLander />} />
            <Route path="/plumbing" element={<PlumbingLander />} />
            <Route path="/home-services-progressive" element={<ProgressiveServicesLander />} />
            {/* Thumbtack-powered pages */}
            <Route path="/windows-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.windows} />} />
            <Route path="/home-services/windows-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.windows} />} />
            <Route path="/roofing-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.roofing} />} />
            <Route path="/home-services/roofing-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.roofing} />} />
            <Route path="/hvac-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.hvac} />} />
            <Route path="/home-services/hvac-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.hvac} />} />
            {/* Strict-category Thumbtack landers — new descriptive slugs */}
            <Route path="/roofing-installation-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.roofing_install} />} />
            <Route path="/home-services/roofing-installation-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.roofing_install} />} />
            <Route path="/kitchen-remodeling-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.kitchen_remodel} />} />
            <Route path="/home-services/kitchen-remodeling-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.kitchen_remodel} />} />
            <Route path="/bathroom-remodeling-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.bath_remodel} />} />
            <Route path="/home-services/bathroom-remodeling-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.bath_remodel} />} />
            <Route path="/hot-tub-installation-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.hot_tub} />} />
            <Route path="/home-services/hot-tub-installation-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.hot_tub} />} />
            <Route path="/walk-in-tub-installation-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.walk_in_tub} />} />
            <Route path="/home-services/walk-in-tub-installation-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.walk_in_tub} />} />
            <Route path="/siding-installation-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.siding_install} />} />
            <Route path="/home-services/siding-installation-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.siding_install} />} />
            <Route path="/heating-air-conditioning-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.hvac_install} />} />
            <Route path="/home-services/heating-air-conditioning-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.hvac_install} />} />
            <Route path="/water-heater-installation-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.water_heater} />} />
            <Route path="/home-services/water-heater-installation-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.water_heater} />} />
            <Route path="/basement-remodeling-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.basement_remodel} />} />
            <Route path="/home-services/basement-remodeling-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.basement_remodel} />} />
            <Route path="/roofing-repair-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.roofing_repair} />} />
            <Route path="/home-services/roofing-repair-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.roofing_repair} />} />
            <Route path="/deck-addition-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.deck_addition} />} />
            <Route path="/home-services/deck-addition-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.deck_addition} />} />
            <Route path="/flooring-installation-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.flooring_install} />} />
            <Route path="/home-services/flooring-installation-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.flooring_install} />} />
            <Route path="/basement-waterproofing-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.waterproofing} />} />
            <Route path="/home-services/basement-waterproofing-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.waterproofing} />} />
            <Route path="/interior-painting-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.interior_painting} />} />
            <Route path="/home-services/interior-painting-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.interior_painting} />} />
            <Route path="/mold-remediation-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.mold_remediation} />} />
            <Route path="/home-services/mold-remediation-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.mold_remediation} />} />
            <Route path="/patio-remodel-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.patio_addition} />} />
            <Route path="/home-services/patio-remodel-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.patio_addition} />} />
            <Route path="/fence-gate-installation-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.fence_install} />} />
            <Route path="/home-services/fence-gate-installation-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.fence_install} />} />
            <Route path="/gutters-installation-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.gutters_install} />} />
            <Route path="/home-services/gutters-installation-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.gutters_install} />} />
            <Route path="/tree-trimming-removal-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.tree_service} />} />
            <Route path="/home-services/tree-trimming-removal-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.tree_service} />} />
            <Route path="/plumbing-installation-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.plumbing_install} />} />
            <Route path="/home-services/plumbing-installation-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.plumbing_install} />} />
            <Route path="/windows-installation-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.windows_install} />} />
            <Route path="/home-services/windows-installation-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.windows_install} />} />
            <Route path="/epoxy-floor-coating-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.epoxy_floor} />} />
            <Route path="/home-services/epoxy-floor-coating-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.epoxy_floor} />} />
            <Route path="/garage-door-installation-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.garage_door} />} />
            <Route path="/home-services/garage-door-installation-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.garage_door} />} />
            <Route path="/deck-porch-repair-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.deck_repair} />} />
            <Route path="/home-services/deck-porch-repair-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.deck_repair} />} />
            <Route path="/insulation-installation-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.insulation} />} />
            <Route path="/home-services/insulation-installation-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.insulation} />} />
            <Route path="/cabinet-installation-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.cabinet_install} />} />
            <Route path="/home-services/cabinet-installation-tt" element={<ThumbtackLander config={THUMBTACK_SERVICES.cabinet_install} />} />
            {/* Waterfall landers (ping/post -> RTB -> Thumbtack) */}
            <Route path="/roofing-w" element={<RoofingLanderWaterfall />} />
            <Route path="/home-services/roofing-w" element={<RoofingLanderWaterfall />} />
            <Route path="/hvac-w" element={<HVACLanderWaterfall />} />
            <Route path="/home-services/hvac-w" element={<HVACLanderWaterfall />} />
            <Route path="/windows-w" element={<WindowsLanderWaterfall />} />
            <Route path="/home-services/windows-w" element={<WindowsLanderWaterfall />} />
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
