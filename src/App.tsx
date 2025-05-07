
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";

import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Notifications from "./pages/Notifications";
import Analytics from "./pages/Analytics";
import FoodItemDetails from "./pages/FoodItemDetails";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

const queryClient = new QueryClient();

// Mock auth check - in a real app, this would check if the user is authenticated
const isAuthenticated = () => {
  // This is just a placeholder for now
  return localStorage.getItem('authenticated') === 'true';
};

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Request notification permission on app load
const requestNotificationPermission = () => {
  if ('Notification' in window) {
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          toast.success('Notifications enabled', {
            description: 'You will now receive alerts about expiring food items'
          });
        }
      });
    }
  }
};

const App = () => {
  useEffect(() => {
    // Request notification permission when app loads
    if (isAuthenticated()) {
      requestNotificationPermission();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Inventory />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Notifications />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Analytics />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/deleted-items"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Inventory showDeleted={true} />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            {/* Food item details */}
            <Route
              path="/item/:id"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <FoodItemDetails />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
