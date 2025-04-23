import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Notifications from "./pages/Notifications";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppWrapper = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  return <AppLayout currentPath={location.pathname}>{children}</AppLayout>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <AppWrapper>
                <Dashboard />
              </AppWrapper>
            }
          />
          <Route
            path="/inventory"
            element={
              <AppWrapper>
                <Inventory />
              </AppWrapper>
            }
          />
          <Route
            path="/notifications"
            element={
              <AppWrapper>
                <Notifications />
              </AppWrapper>
            }
          />
          <Route
            path="/analytics"
            element={
              <AppWrapper>
                <Analytics />
              </AppWrapper>
            }
          />
          <Route
            path="/deleted-items"
            element={
              <AppWrapper>
                <Inventory showDeleted={true} />
              </AppWrapper>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
