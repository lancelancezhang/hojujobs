import { useNavigate, NavLink, useLocation } from "react-router-dom";
import { Plus, LogIn, FileText, Shield, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const CITY_TABS = [
  { label: "호주 전체", path: "/" },
  { label: "시드니", path: "/sydney" },
  { label: "멜버른", path: "/melbourne" },
  { label: "브리즈번", path: "/brisbane" },
];

const INFO_TABS = [
  { label: "워홀정보", path: "/dashboard" },
  { label: "블로그", path: "/blog" },
];

export function Header() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isInfoActive = location.pathname === "/blog" || location.pathname.startsWith("/blog/") || location.pathname === "/dashboard";
  const infoLabel = (location.pathname === "/blog" || location.pathname.startsWith("/blog/")) ? "블로그" : "워홀정보";

  return (
    <header className="bg-white border-b border-border">
      <div className="max-w-6xl mx-auto px-5 sm:px-4 pt-4 sm:pt-5">
        <div className="flex items-center justify-between pb-7 sm:pb-8">
          <button
            type="button"
            className="flex items-center gap-2"
            aria-label="Hoju Jobs home"
            onClick={() => { sessionStorage.removeItem("hoju_filters"); window.location.href = "/"; }}
          >
            <img
              src="/favicon-48x48.png"
              alt=""
              className="h-8 w-8 sm:h-10 sm:w-10"
              aria-hidden="true"
            />
            <span className="translate-y-[1px] text-lg font-black uppercase leading-none tracking-[0.08em] text-[#061b43] sm:text-[2.1rem]">
              HOJU JOBS
            </span>
          </button>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {user ? (
              <>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate("/post-job")}
                  className="gap-1 px-2 text-xs sm:gap-1.5 sm:px-3 sm:text-sm"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">공고 등록</span>
                  <span className="sm:hidden">등록</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/my-posts")}
                  className="gap-1 border-border bg-white px-2 text-xs hover:border-primary/40 hover:bg-slate-50 hover:text-primary sm:gap-1.5 sm:px-3 sm:text-sm"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">내 공고</span>
                  <span className="sm:hidden">내 글</span>
                </Button>
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/admin")}
                    className="gap-1 border-border bg-white px-2 text-xs hover:border-primary/40 hover:bg-slate-50 hover:text-primary sm:gap-1.5 sm:px-3 sm:text-sm"
                  >
                    <Shield className="h-3.5 w-3.5" /> 관리
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate({ pathname: "/auth" })}
                  className="gap-1.5 border-border bg-white px-2 text-xs hover:border-primary/40 hover:bg-slate-50 hover:text-primary sm:gap-1.5 sm:px-3 sm:text-sm"
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
        <div className="-mx-1 flex items-center justify-between gap-0 sm:justify-normal">
          <nav className="contents sm:flex sm:min-w-0 sm:flex-1 sm:gap-0" aria-label="지역별 공고">
            {CITY_TABS.map(({ label, path }) => (
              <NavLink
                key={path}
                to={path}
                end={path === "/"}
                className={({ isActive }) =>
                  cn(
                    "flex-none px-1.5 py-2 text-center text-xs font-medium border-b-2 transition-colors whitespace-nowrap sm:px-2.5",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <nav className="hidden flex-none items-center gap-0 sm:flex" aria-label="정보">
            {INFO_TABS.map(({ label, path }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  cn(
                    "px-2.5 py-2 text-center text-xs font-medium border-b-2 transition-colors whitespace-nowrap",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger
              className={cn(
                "flex w-[4.5rem] flex-none items-center justify-center gap-0.5 px-1 py-1.5 text-center text-xs font-semibold transition-colors whitespace-nowrap outline-none rounded-md sm:hidden",
                isInfoActive
                  ? "text-primary bg-primary/8"
                  : "text-primary bg-primary/10 hover:bg-primary/15 hover:text-primary"
              )}
            >
              {infoLabel}
              <ChevronDown className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate("/dashboard")}>워홀정보</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/blog")}>블로그</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
