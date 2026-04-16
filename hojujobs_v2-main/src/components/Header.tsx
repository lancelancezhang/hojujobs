import hojuJobsLogo from "@/assets/hoju-jobs-logo.png";
import { useNavigate } from "react-router-dom";
import { Plus, LogIn, LogOut, FileText, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-border">
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-5">
        <div className="flex items-center justify-between">
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
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">🇦🇺 호주 한인 구인구직 게시판</p>
      </div>
    </header>
  );
}
