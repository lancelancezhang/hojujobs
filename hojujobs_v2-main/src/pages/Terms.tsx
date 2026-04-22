import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { useSEO } from "@/hooks/useSEO";

const CANONICAL = "https://hojujobs.com/terms";

export default function Terms() {
  const jsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "이용약관 (Terms of Service) | Hoju Jobs",
      url: CANONICAL,
      description: "Hoju Jobs 서비스 이용조건—한국어 요약 뒤 영문 전문. Korean summary then English terms.",
      inLanguage: ["ko", "en"],
    }),
    [],
  );

  useSEO({
    title: "이용약관 | Hoju Jobs — 호주 한인 구인구직",
    description:
      "이용약관(한국어·English). Hoju Jobs는 호주 한인 구인구직 보드입니다. Terms of Service in Korean and English.",
    canonical: CANONICAL,
    htmlLang: "ko",
    ogLocale: "ko_KR",
    keywords:
      "이용약관, Hoju Jobs terms, terms of service, 호주 구인구직, user agreement, Australian job board, Korean community jobs",
    jsonLd,
  });

  return (
    <div className="flex w-full min-h-0 flex-1 flex-col bg-background">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          홈으로
        </Link>

        <header>
          <h1 className="text-2xl font-bold" lang="ko">
            이용약관
          </h1>
        </header>

        <div className="space-y-8">
          <section lang="ko" className="space-y-6">
            <section className="space-y-3">
              <h3 className="text-base font-semibold">1. 약관의 동의</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Hoju Jobs(이하 &quot;서비스&quot;)를 이용하면 아래 약관에 동의한 것으로 봅니다. 동의하지 않으면 이용하지 마십시오.
              </p>
            </section>
            <section className="space-y-3">
              <h3 className="text-base font-semibold">2. 서비스의 성격</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                본 서비스는 <strong>호주</strong>에서 근로하거나 인력을 구하는 <strong>한국어권</strong> 이용자를 위한 온라인
                <strong> 구인·구직 게시판</strong>입니다. 구인·구직 정보의 게시·열람에 사용하실 수 있습니다.
              </p>
            </section>
            <section className="space-y-3">
              <h3 className="text-base font-semibold">3. 이용자의 의무</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 leading-relaxed">
                <li>공고에 <strong>사실에 부합하는 정보</strong>를 기재해야 합니다.</li>
                <li>사기, 불법, 중대한 오해의 소지가 있는 공고를 게시해서는 안 됩니다.</li>
                <li>게시한 콘텐츠에 대한 책임은 <strong>게시자</strong>에게 있습니다.</li>
              </ul>
            </section>
            <section className="space-y-3">
              <h3 className="text-base font-semibold">4. 계정 정지·해지</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                약관 위반이나 부적절한 게시, 부정 이용이 확인되면 <strong>사전 통지 없이</strong> 서비스 이용을 제한하거나 계정을
                종료할 수 있습니다(관련 법령·정책이 허용하는 범위).
              </p>
            </section>
            <section className="space-y-3">
              <h3 className="text-base font-semibold">5. 면책</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                서비스는 <strong>있는 그대로</strong> 제공됩니다. 공고 내용의 정확성·최신성을 보장하지 않으며, 본 사이트를
                통한 구인·취업 결정에 따른 결과에 대해 책임을 지지 않는 경우가 있습니다. 법이 허용하는 한 이에 제한·면책
                조항이 적용될 수 있습니다.
              </p>
            </section>
            <section className="space-y-3">
              <h3 className="text-base font-semibold">6. 문의</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                약관 관련 문의:{" "}
                <a href="mailto:admin.hojujobs@gmail.com" className="text-primary font-medium hover:underline">
                  admin.hojujobs@gmail.com
                </a>
              </p>
            </section>
          </section>

          <section lang="en" className="mt-10 space-y-6">
            <div className="space-y-6">
              <section className="space-y-3">
                <h3 className="text-base font-semibold">1. Acceptance of Terms</h3>
                <p className="text-sm text-muted-foreground">
                  By using Hoju Jobs, you agree to these Terms of Service. If you do not agree, please do not use the site.
                </p>
              </section>
              <section className="space-y-3">
                <h3 className="text-base font-semibold">2. Use of the Service</h3>
                <p className="text-sm text-muted-foreground">
                  Hoju Jobs is a job board connecting Korean-speaking job seekers and employers in Australia. You may use
                  this service to post and browse job listings.
                </p>
              </section>
              <section className="space-y-3">
                <h3 className="text-base font-semibold">3. User Responsibilities</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>You must provide accurate information in your job listings</li>
                  <li>You must not post fraudulent, misleading, or illegal job listings</li>
                  <li>You are responsible for any content you post on the platform</li>
                </ul>
              </section>
              <section className="space-y-3">
                <h3 className="text-base font-semibold">4. Account Termination</h3>
                <p className="text-sm text-muted-foreground">
                  We reserve the right to suspend or terminate accounts that violate these terms or post inappropriate
                  content.
                </p>
              </section>
              <section className="space-y-3">
                <h3 className="text-base font-semibold">5. Disclaimer</h3>
                <p className="text-sm text-muted-foreground">
                  Hoju Jobs is provided &quot;as is&quot;. We do not guarantee the accuracy of job listings and are not
                  responsible for any employment decisions made based on listings found on this site.
                </p>
              </section>
              <section className="space-y-3">
                <h3 className="text-base font-semibold">6. Contact</h3>
                <p className="text-sm text-muted-foreground">
                  For any questions regarding these terms, contact us at{" "}
                  <a href="mailto:admin.hojujobs@gmail.com" className="text-primary font-medium hover:underline">
                    admin.hojujobs@gmail.com
                  </a>
                  .
                </p>
              </section>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
