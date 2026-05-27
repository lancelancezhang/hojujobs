import { useNavigate, NavLink } from "react-router-dom";
import { Plus, LogIn, FileText, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const CITY_TABS = [
  { label: "호주 전체", path: "/" },
  { label: "시드니", path: "/sydney" },
  { label: "멜버른", path: "/melbourne" },
  { label: "브리즈번", path: "/brisbane" },
];

const INFO_TABS = [
  { label: "온세일", path: "/sales" },
  { label: "뉴스", path: "/news" },
  { label: "워홀정보", path: "/dashboard" },
];

export function Header() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

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
                  <span className="sm:hidden">공고등록</span>
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

        <div className="-mx-1">
          <nav className="flex items-end gap-1 sm:gap-2 lg:justify-between" aria-label="주요 페이지">
            <div className="grid flex-[4] grid-cols-4 items-end lg:flex-none lg:min-w-[31rem]">
              {CITY_TABS.map(({ label, path }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={path === "/"}
                  className={({ isActive }) =>
                    cn(
                      "min-w-0 px-0.5 py-2 text-center text-[11px] font-semibold border-b-2 transition-colors whitespace-nowrap sm:px-2.5 sm:text-sm",
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

            <div className="mb-2 h-5 w-px shrink-0 bg-border lg:hidden" aria-hidden="true" />

            <div className="grid flex-[3] grid-cols-3 items-end rounded-t-md bg-slate-50/90 ring-1 ring-inset ring-slate-200/70 lg:flex-none lg:min-w-[20rem]">
              {INFO_TABS.map(({ label, path }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={path === "/" || path === "/dashboard" || path === "/news"}
                  className={({ isActive }) =>
                    cn(
                      "min-w-0 px-0.5 py-2 text-center text-[11px] font-semibold border-b-2 transition-colors whitespace-nowrap sm:px-2.5 sm:text-sm",
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
          </nav>
        </div>
      </div>
    </header>
  );
}
