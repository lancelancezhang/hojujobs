import hojuJobsLogo from "@/assets/hoju-jobs-logo.png";
import { useNavigate, NavLink } from "react-router-dom";
import { Plus, LogIn, LogOut, FileText, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const CITY_TABS = [
  { label: "호주 전체", path: "/" },
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
        <div className="flex items-center justify-between pb-7 sm:pb-8">
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
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/auth")}
                  className="gap-1.5 border-border bg-white px-2 text-xs hover:bg-muted/50 sm:gap-1.5 sm:px-3 sm:text-sm"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  로그인
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate("/auth?next=/post-job")}
                  className="gap-1 px-2 text-xs sm:gap-1.5 sm:px-3 sm:text-sm"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">공고 등록</span>
                  <span className="sm:hidden">등록</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* City tabs */}
        <div className="flex gap-0 -mx-1">
          {CITY_TABS.map(({ label, path }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
              className={({ isActive }) =>
                cn(
                  "flex-1 sm:flex-none text-center px-2.5 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap",
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
