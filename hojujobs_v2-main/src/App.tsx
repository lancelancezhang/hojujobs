import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { MainLayout } from "@/components/MainLayout";
import Index from "./pages/Index";
import JobDetail from "./pages/JobDetail";
import Auth from "./pages/Auth";
import PostJob from "./pages/PostJob";
import MyPosts from "./pages/MyPosts";
import EditJob from "./pages/EditJob";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import Privacy from "./pages/Privacy";
import About from "./pages/About";
import Faq from "./pages/Faq";
import Terms from "./pages/Terms";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Index key="all" />} />
              <Route path="/sydney" element={<Index key="NSW" cityFilter="NSW" />} />
              <Route path="/melbourne" element={<Index key="VIC" cityFilter="VIC" />} />
              <Route path="/brisbane" element={<Index key="QLD" cityFilter="QLD" />} />
              <Route path="/adelaide" element={<Index key="SA" cityFilter="SA" />} />
              <Route path="/job/:id" element={<JobDetail />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/post-job" element={<PostJob />} />
              <Route path="/my-posts" element={<MyPosts />} />
              <Route path="/edit-job/:id" element={<EditJob />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/about" element={<About />} />
              <Route path="/faq" element={<Faq />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
