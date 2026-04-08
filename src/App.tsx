import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/components/AdminLayout";
import BrokerChatPanel from "@/components/BrokerChatPanel";
import ChatWidget from "@/components/ChatWidget";
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import BrokerRegister from "./pages/BrokerRegister.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminBrokers from "./pages/admin/AdminBrokers.tsx";
import AdminProperties from "./pages/admin/AdminProperties.tsx";
import AdminContent from "./pages/admin/AdminContent.tsx";
import AdminMessages from "./pages/admin/AdminMessages.tsx";
import AdminUsers from "./pages/admin/AdminUsers.tsx";
import AdminSettings from "./pages/admin/AdminSettings.tsx";
import AdminCompanies from "./pages/admin/AdminCompanies.tsx";
import AdminChatHistory from "./pages/admin/AdminChatHistory.tsx";
import AdminDocumentation from "./pages/admin/AdminDocumentation.tsx";
import Properties from "./pages/Properties.tsx";
import PropertyDetail from "./pages/PropertyDetail.tsx";
import NotFound from "./pages/NotFound.tsx";
import Unsubscribe from "./pages/Unsubscribe.tsx";
import LandingPage from "./pages/LandingPage.tsx";
import AnunciarImovel from "./pages/AnunciarImovel.tsx";
import BrokerDashboard from "./pages/BrokerDashboard.tsx";
import Favorites from "./pages/Favorites.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/imoveis" element={<Properties />} />
            <Route path="/imovel/:id" element={<PropertyDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/broker-register" element={<BrokerRegister />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/brokers" element={<ProtectedRoute requireAdmin><AdminLayout><AdminBrokers /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/properties" element={<ProtectedRoute requireAdmin><AdminLayout><AdminProperties /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/content" element={<ProtectedRoute requireAdmin><AdminLayout><AdminContent /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/messages" element={<ProtectedRoute requireAdmin><AdminLayout><AdminMessages /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute requireAdmin><AdminLayout><AdminUsers /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute requireAdmin><AdminLayout><AdminSettings /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/companies" element={<ProtectedRoute requireAdmin><AdminLayout><AdminCompanies /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/chat" element={<ProtectedRoute requireAdmin><AdminLayout><AdminChatHistory /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/documentation" element={<ProtectedRoute requireAdmin><AdminLayout><AdminDocumentation /></AdminLayout></ProtectedRoute>} />
            <Route path="/broker-dashboard" element={<ProtectedRoute><BrokerDashboard /></ProtectedRoute>} />
            <Route path="/favoritos" element={<Favorites />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/anunciar-imovel" element={<AnunciarImovel />} />
            <Route path="/unsubscribe" element={<Unsubscribe />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <BrokerChatPanel />
          <ChatWidget />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
