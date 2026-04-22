import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { useSEO } from "@/hooks/useSEO";

const CANONICAL = "https://hojujobs.com/faq";

export default function Faq() {
  const jsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Hoju Jobs는 어떤 서비스인가요?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "호주에서 일하거나 인재를 구하는 한국어권 이용자를 위한 온라인 구인·구직 게시판이며, 공식 채용 중개나 입사 보장을 하지 않습니다.",
          },
        },
        {
          "@type": "Question",
          name: "이용 요금이 있나요?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "공고 열람은 무료입니다. 공고 등록은 계정이 필요할 수 있으며 추천 노출 등 별도 옵션이 있을 수 있습니다.",
          },
        },
        {
          "@type": "Question",
          name: "공고는 어떻게 올리나요?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "상단 공고 등록 메뉴에서 입력합니다. 허위·불법 게시를 금지하며 게시자에게 책임이 있습니다.",
          },
        },
        {
          "@type": "Question",
          name: "비자 판단을 해주나요?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "아닙니다. 호주 정부 공식 출처에서 비자·근무 자격을 확인해야 합니다.",
          },
        },
        {
          "@type": "Question",
          name: "게시된 공고가 정확한가요?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "게시자가 작성하며 운영자가 모든 공고를 검증하지 않습니다. 지원 전 직접 확인하세요.",
          },
        },
        {
          "@type": "Question",
          name: "개인정보는 어떻게 다루나요?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "개인정보처리방침 페이지를 참고하세요.",
          },
        },
        {
          "@type": "Question",
          name: "문의는 어떻게 하나요?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "admin.hojujobs@gmail.com 으로 연락할 수 있습니다.",
          },
        },
      ],
    }),
    [],
  );

  useSEO({
    title: "자주 묻는 질문 (FAQ) | Hoju Jobs — 호주 한인 구인구직",
    description:
      "Hoju Jobs 이용 안내, 공고 등록, 비자·채용 관련 FAQ. Korean & English. 호주 한인 채용 정보.",
    canonical: CANONICAL,
    htmlLang: "ko",
    ogLocale: "ko_KR",
    keywords: "Hoju Jobs FAQ, 자주묻는질문, 호주 취업 질문, Korean jobs Australia help",
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
          <h1 className="text-2xl sm:text-3xl font-bold" lang="ko">
            자주 묻는 질문
          </h1>
        </header>

        <div className="space-y-8">
          <section lang="ko" className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-foreground">Hoju Jobs는 어떤 서비스인가요?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  호주(시드니, 멜번, 브리즈번, 애들레이드 등)에서 일하거나 인재를 구하는 <strong>한국어권</strong> 이용자를 위한
                  온라인 <strong>구인·구직 게시판</strong>입니다. 운영사가 직접 채용을 중개하거나 합격·입사를 보장하지 않습니다.
                </p>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-foreground">이용 요금이 있나요?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <strong>공고 열람(검색·목록·상세)</strong>은 별도 요금 없이 이용할 수 있습니다.{" "}
                  <strong>공고 등록</strong>은 계정(예: Google 로그인)이 필요할 수 있으며, 상단 노출(추천 공고) 등 별도 옵션이
                  있을 수 있습니다. 자세한 요금·문의는 <a href="mailto:admin.hojujobs@gmail.com" className="text-primary font-medium hover:underline">admin.hojujobs@gmail.com</a>로 연락해 주세요.
                </p>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-foreground">공고는 어떻게 올리나요?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  상단 <strong>공고 등록</strong> 메뉴에서 직무, 지역, 연락처 등을 입력해 등록합니다. 허위·불법·기만적인 내용을
                  게시하지 마시고, 실제 고용 당사자만 공고를 올려 주세요. 내용에 대한 법적 책임은 게시자에게 있습니다.
                </p>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-foreground">비자(워홀, 학생비자 등) 판단을 해주나요?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <strong>아닙니다.</strong> Hoju Jobs는 정부 기관이 아니며, 개별 비자 자격·조건(근무 주수, 업종, 최저임금 등)을
                  판정하거나 법률 자문을 드릴 수 없습니다.{" "}
                  <strong>호주 정부 공식</strong> 출처(예: Home Affairs)로 반드시 확인하시기 바랍니다.
                </p>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-foreground">게시된 공고가 정확한가요?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  공고는 <strong>게시자(고용주 등)</strong>가 작성하며, 운영자가 모든 항목을 사실대로 보증하거나 검증하지
                  못할 수 있습니다. 지원·입사 전에 직접 조건을 확인하시기 바랍니다. 분쟁·손해에 대해 당사는{" "}
                  <Link to="/terms" className="text-primary font-medium hover:underline">이용약관</Link>에 따른 범위 내에서
                  면책될 수 있습니다.
                </p>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-foreground">개인정보는 어떻게 다루나요?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  로그인, 저장 위치(예: Supabase) 등에 관한 내용은{" "}
                  <Link to="/privacy" className="text-primary font-medium hover:underline">개인정보처리방침</Link>을
                  참고해 주세요.
                </p>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-foreground">문의·제휴는 어떻게 하나요?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <a href="mailto:admin.hojujobs@gmail.com" className="text-primary font-medium hover:underline">
                    admin.hojujobs@gmail.com
                  </a>
                </p>
              </div>
            </div>
          </section>

          <section lang="en" className="mt-10 space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-foreground">What is Hoju Jobs?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  An online job board for <strong>Korean-speaking</strong> job seekers and employers in{" "}
                  <strong>Australia</strong> (Sydney, Melbourne, Brisbane, Adelaide, and more). We are <strong>not</strong> a
                  recruitment agency and do not guarantee employment outcomes.
                </p>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-foreground">Is there a fee to use the site?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <strong>Browsing</strong> job listings is free. <strong>Posting</strong> a listing may require a
                  registered account. Featured or promotion placements may be offered separately. For pricing, email{" "}
                  <a href="mailto:admin.hojujobs@gmail.com" className="text-primary font-medium hover:underline">
                    admin.hojujobs@gmail.com
                  </a>
                  .
                </p>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-foreground">How do I post a job?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Use the <strong>Post a job</strong> flow. Only post if you are authorised to do so, provide accurate
                  information, and do not post misleading or illegal listings. You are responsible for your posts.
                </p>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-foreground">Do you give visa or legal advice?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <strong>No.</strong> Hoju Jobs is not a government service and does not provide immigration or legal
                  advice. Always check official Australian government sources (e.g. Home Affairs) for your visa and work
                  rights.
                </p>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-foreground">Are listings verified?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Listings are created by <strong>posters</strong>. We do not verify every posting. Confirm details directly
                  with the employer before you accept an offer. See our <Link to="/terms" className="text-primary font-medium hover:underline">Terms of Service</Link> for limitations of liability.
                </p>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-foreground">How is personal data handled?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  See the <Link to="/privacy" className="text-primary font-medium hover:underline">Privacy Policy</Link>.
                </p>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-foreground">How can I contact you?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <a href="mailto:admin.hojujobs@gmail.com" className="text-primary font-medium hover:underline">
                    admin.hojujobs@gmail.com
                  </a>
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
