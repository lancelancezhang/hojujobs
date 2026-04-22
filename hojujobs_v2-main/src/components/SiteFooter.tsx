import { Link } from "react-router-dom";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/50 bg-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-6 text-[11px] text-muted-foreground/70">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3">
          <Link to="/about" className="hover:text-muted-foreground transition-colors">소개</Link>
          <span className="opacity-30">·</span>
          <Link to="/privacy" className="hover:text-muted-foreground transition-colors">개인정보처리방침</Link>
          <span className="opacity-30">·</span>
          <Link to="/terms" className="hover:text-muted-foreground transition-colors">이용약관</Link>
          <span className="opacity-30">·</span>
          <Link to="/faq" className="hover:text-muted-foreground transition-colors">FAQ</Link>
          <span className="opacity-30">·</span>
          <a href="mailto:admin.hojujobs@gmail.com" className="hover:text-muted-foreground transition-colors">admin.hojujobs@gmail.com</a>
        </div>
        <p>© {new Date().getFullYear()} Hoju Jobs. All rights reserved.</p>
      </div>
    </footer>
  );
}
