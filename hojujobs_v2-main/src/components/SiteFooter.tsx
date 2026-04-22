import { Link } from "react-router-dom";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12 text-xs text-muted-foreground">
        <div className="grid gap-8 text-center sm:grid-cols-2 sm:text-left">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">Hoju Jobs</p>
            <p className="leading-relaxed">
              문의:{" "}
              <a
                href="mailto:admin.hojujobs@gmail.com"
                className="break-all font-medium text-primary hover:underline"
              >
                admin.hojujobs@gmail.com
              </a>
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">회사 및 법률</p>
            <ul className="space-y-1.5">
              <li>
                <Link to="/about" className="text-primary hover:underline" title="Hoju Jobs 소개 / About us">
                  소개
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-primary hover:underline" title="개인정보처리방침 / Privacy Policy">
                  개인정보처리방침
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-primary hover:underline" title="이용약관 / Terms of Service">
                  이용약관
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-primary hover:underline" title="자주 묻는 질문 / FAQ">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-8 border-t border-border/60 pt-6 text-center text-[11px] text-muted-foreground/80 sm:text-left">
          © {new Date().getFullYear()} Hoju Jobs. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
