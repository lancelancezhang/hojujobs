import hojuJobsLogo from "@/assets/hoju-jobs-logo.png";
import { useNavigate, NavLink } from "react-router-dom";
import { Plus, LogIn, LogOut, FileText, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const CITY_TABS = [
  { label: "시드니", path: "/sydney" },
  { label: "멜버른", path: "/melbourne" },
  { label: "브리즈번", path: "/brisbane" },
  { label: "애들레이드", path: "/adelaide" },
];

export function Header() {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-border">
      <div className="max-w-6xl mx-auto px-4 pt-4 sm:pt-5">
        <div className="flex items-center justify-between pb-3 sm:pb-4">
          <img
            src={hojuJobsLogo}
            alt="Hoju Jobs"
            className="h-8 sm:h-10 cursor-pointer"
            onClick={() => { sessionStorage.removeItem("hoju_filters"); window.location.href = "/"; }}
          />
          <div className="flex items-center gap-1.5 sm:gap-2">
            {user ? (
              <>
                <Button variant="outline" size="sm" onClick={() => navigate("/post-job")} className="gap-1 sm:gap-1.5 text-xs sm:text-sm px-2 sm:px-3">
                  <Plus className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">공고 등록</span>
                  <span className="sm:hidden">등록</span>
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate("/my-posts")} className="gap-1 sm:gap-1.5 text-xs sm:text-sm px-2 sm:px-3">
                  <FileText className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">내 공고</span>
                  <span className="sm:hidden">내 글</span>
                </Button>
                {isAdmin && (
                  <Button variant="outline" size="sm" onClick={() => navigate("/admin")} className="gap-1 sm:gap-1.5 text-xs sm:text-sm px-2 sm:px-3">
                    <Shield className="h-3.5 w-3.5" /> 관리
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground hover:text-foreground px-2 sm:px-3 gap-1">
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="text-xs">로그아웃</span>
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => navigate("/auth")} className="gap-1.5">
                <LogIn className="h-3.5 w-3.5" /> 로그인
              </Button>
            )}
          </div>
        </div>

        {/* City tabs */}
        <div className="flex gap-0 -mx-1">
          {CITY_TABS.map(({ label, path }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                cn(
                  "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      </div>
    </header>
  );
}
