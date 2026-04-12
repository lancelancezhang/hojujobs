import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import JobDetail from "./pages/JobDetail";
import Auth from "./pages/Auth";
import PostJob from "./pages/PostJob";
import MyPosts from "./pages/MyPosts";
import EditJob from "./pages/EditJob";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import Privacy from "./pages/Privacy";
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
            <Route path="/" element={<Index />} />
            <Route path="/job/:id" element={<JobDetail />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/post-job" element={<PostJob />} />
            <Route path="/my-posts" element={<MyPosts />} />
            <Route path="/edit-job/:id" element={<EditJob />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
