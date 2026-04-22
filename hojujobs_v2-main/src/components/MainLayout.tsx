import { Outlet } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { SiteFooter } from "@/components/SiteFooter";

/**
 * Pushes the footer to the bottom of the viewport on short pages while keeping
 * it below content on long pages.
 */
export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ScrollToTop />
      <div className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </div>
      <SiteFooter />
    </div>
  );
}
