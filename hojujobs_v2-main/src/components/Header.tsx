import { useLocation, useNavigate, NavLink } from "react-router-dom";
import { ChevronDown, FileText, LogIn, MapPin, Plus, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { clearListingCaches } from "@/lib/listingCache";
import { cn } from "@/lib/utils";

const CITY_DROPDOWN_TABS = [
  { label: "호주 전체", path: "/" },
  { label: "시드니", path: "/sydney" },
  { label: "멜버른", path: "/melbourne" },
  { label: "브리즈번", path: "/brisbane" },
];

const INFO_TABS = [
  {
    label: "온세일",
    path: "/sales",
    idleClassName: "text-slate-950 hover:bg-emerald-50",
    activeClassName: "bg-emerald-100 text-slate-950",
  },
  {
    label: "뉴스",
    path: "/news",
    idleClassName: "text-slate-950 hover:bg-blue-50",
    activeClassName: "bg-blue-100 text-slate-950",
  },
  {
    label: "플렛메이트",
    path: "/flatmates",
    idleClassName: "text-slate-950 hover:bg-sky-50",
    activeClassName: "bg-sky-100 text-slate-950",
  },
  {
    label: "워홀정보",
    path: "/dashboard",
    idleClassName: "text-slate-950 hover:bg-white",
    activeClassName: "bg-primary/10 text-slate-950",
  },
];

export function Header() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const activeCity = CITY_DROPDOWN_TABS.find((tab) =>
    tab.path === "/" ? location.pathname === "/" : location.pathname === tab.path
  ) ?? CITY_DROPDOWN_TABS[0];
  const cityDropdownActive = location.pathname === "/" || CITY_DROPDOWN_TABS.some((t) => t.path !== "/" && location.pathname === t.path);
  const onFlatmates = location.pathname.startsWith("/flatmates");
  const postPath = onFlatmates ? "/flatmates/post" : "/post-job";
  const postLabel = "업로드";
  const postLabelShort = "업로드";
  const refreshHomeListings = () => {
    clearListingCaches();
    sessionStorage.removeItem("hoju_filters");
  };

  return (
    <header className="bg-white border-b border-border">
      <div className="max-w-6xl mx-auto px-5 sm:px-4 pt-4 sm:pt-5">
        <div className="flex items-center justify-between pb-7 sm:pb-8">
          <button
            type="button"
            className="flex items-center gap-2"
            aria-label="Hoju Jobs home"
            onClick={() => { refreshHomeListings(); window.location.href = "/"; }}
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
                  onClick={() => navigate(postPath)}
                  className="gap-1 px-2 text-xs sm:gap-1.5 sm:px-3 sm:text-sm"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{postLabel}</span>
                  <span className="sm:hidden">{postLabelShort}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/my-posts")}
                  className="gap-1 border-border bg-white px-2 text-xs hover:border-primary/40 hover:bg-slate-50 hover:text-primary sm:gap-1.5 sm:px-3 sm:text-sm"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>내 프로필</span>
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
                  onClick={() => navigate(onFlatmates ? "/flatmates/post" : "/auth?next=/post-job")}
                  className="gap-1 px-2 text-xs sm:gap-1.5 sm:px-3 sm:text-sm"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{postLabel}</span>
                  <span className="sm:hidden">{postLabelShort}</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="w-full border-t border-slate-200 bg-white">
        <nav className="mx-auto grid w-full max-w-6xl grid-cols-5 items-center gap-0.5 px-2 py-1 sm:gap-1 sm:px-4" aria-label="주요 페이지">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger
              className={cn(
                "inline-flex h-10 w-full min-w-0 items-center justify-center gap-0.5 rounded px-0.5 text-[14px] font-black text-slate-950 [text-shadow:0.12px_0_0_currentColor] outline-none transition-colors whitespace-nowrap hover:bg-slate-100 focus:ring-2 focus:ring-ring focus:ring-offset-1 sm:gap-1 sm:px-2 sm:text-base",
                cityDropdownActive && "bg-primary/10 text-slate-950 hover:bg-primary/10"
              )}
            >
              <MapPin className="hidden h-3.5 w-3.5 sm:block" />
              <span className="truncate">{activeCity.label}</span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[10rem]">
              {CITY_DROPDOWN_TABS.map(({ label, path }) => {
                const isActive = path === "/" ? location.pathname === "/" : location.pathname === path;
                return (
                  <DropdownMenuItem
                    key={path}
                    onSelect={() => { if (path === "/") refreshHomeListings(); navigate(path); }}
                    className={cn("justify-between text-sm font-black text-slate-950 [text-shadow:0.1px_0_0_currentColor]", isActive && "bg-primary/10")}
                  >
                    {label}
                    {isActive && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {INFO_TABS.map(({ label, path, idleClassName, activeClassName }) => (
            <NavLink
              key={path}
              to={path}
              end
              className={({ isActive }) =>
                cn(
                  "inline-flex h-10 min-w-0 items-center justify-center rounded px-0.5 text-center text-[12px] font-black [text-shadow:0.12px_0_0_currentColor] transition-colors whitespace-nowrap sm:px-1 sm:text-[15px] lg:px-2 lg:text-base",
                  isActive ? activeClassName : idleClassName
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
