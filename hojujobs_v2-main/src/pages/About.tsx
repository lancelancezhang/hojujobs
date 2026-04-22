import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { useSEO } from "@/hooks/useSEO";

const CANONICAL = "https://hojujobs.com/about";

export default function About() {
  const jsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: "Hoju Jobs 소개 — 호주에서 일자리를 찾는 한인",
      url: CANONICAL,
      description:
        "호주 시드니, 멜번, 브리즈번 등에서 한국어권·이중언어 구인·구직 정보를 모은 Hoju Jobs 안내 페이지입니다.",
      isPartOf: {
        "@type": "WebSite",
        name: "Hoju Jobs",
        url: "https://hojujobs.com/",
        inLanguage: "ko",
      },
      inLanguage: "ko",
    }),
    [],
  );

  useSEO({
    title: "소개 | Hoju Jobs — 호주 한인 취업·구인구직 (시드니·멜번·전국)",
    description:
      "Hoju Jobs는 호주에 거주·유학·워홀·취업 중인 한인을 위한 구인구직 보드입니다. Korean jobs in Australia, Sydney, Melbourne, Brisbane.",
    canonical: CANONICAL,
    htmlLang: "ko",
    ogLocale: "ko_KR",
    keywords:
      "호주 한인 취업, Hoju Jobs 소개, Korean jobs Australia, 한인 구인구직, 호주 워홀, 시드니 구직, 멜번 취업, working holiday, 한국어 구인",
    jsonLd,
  });

  return (
    <div className="flex w-full min-h-0 flex-1 flex-col bg-background">
      <Header />
      <div className="max-w-2xl mx-auto w-full space-y-8 px-4 py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          홈으로
        </Link>

        <header>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Hoju Jobs 소개</h1>
        </header>

        <section lang="ko" className="space-y-6">
          <p className="text-sm font-medium text-foreground/90 leading-relaxed">
            호주에 살고, 유학·워홀·취업을 준비하는 <strong>한인</strong>이 더 빨리 맞는 일을 찾을 수 있도록 돕는{" "}
            <strong>구인·구직 보드</strong>입니다.
          </p>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">무엇을 하나요</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground/90">Hoju Jobs</strong>는 <strong>호주에서 일하는 한국어권</strong>{" "}
              구직자와 고용주를 연결하는 커뮤니티 게시판입니다. 음식·리테일·사무·전문직·기술직 등{" "}
              <strong>다양한 업종</strong>의 공고를 올리고, 지역·업종으로 검색해 볼 수 있습니다.{" "}
              <strong>워홀(417/462)</strong>, <strong>학생비자</strong>, <strong>스킬드·스폰서십</strong> 등 어떤 경로이든, 이미
              정착하신 분도 이용하실 수 있습니다.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">호주에서 한인으로 취업하기</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              많은 한인 분들이 <strong>한인 채용</strong>을 찾는 이유는 직장 언어와 네트워크가 익숙하기 때문입니다.{" "}
              <strong>시드니, 멜번, 브리즈번, 애들레이드</strong> 등 지역별 공고를 한곳에 모아, 그룹·카페를 옮겨 다니며
              찾는 시간을 줄이고자 합니다.
            </p>
            <ul className="list-inside list-disc space-y-1.5 text-sm text-muted-foreground leading-relaxed">
              <li>한국어·이중언어 지원이 가능한 일자리</li>
              <li>도시·주(주)로 찾을 수 있는 위치 태그</li>
              <li>고용주가 남긴 연락처로 바로 지원</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Hoju Jobs가 하지 않는 것</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              저희는 <strong>채용 알선 회사</strong>가 아니라 <strong>게시판(목록) 서비스</strong>입니다. 구직자를 직접
              연결·배정하지 않으며, 모든 공고의 내용을 일일이 검증하지는 못합니다. <strong>비자·노동 조건</strong>은{" "}
              <strong>호주 정부 공식 안내</strong>로 반드시 확인하시기 바랍니다.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">문의</h2>
            <p className="text-sm text-muted-foreground">
              제휴·문의:{" "}
              <a href="mailto:admin.hojujobs@gmail.com" className="font-medium text-primary hover:underline">
                admin.hojujobs@gmail.com
              </a>
            </p>
          </div>
        </section>

        <section lang="en" className="mt-10 space-y-8">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Supporting Koreans who live, study, or work in Australia—so you can find the right job faster, in Korean and
            in English.
          </p>

          <div className="space-y-3" aria-labelledby="mission-heading">
            <h2 id="mission-heading" className="text-lg font-semibold">
              What we do
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground/90">Hoju Jobs</strong> is a community job board focused on{" "}
              <strong>employment in Australia for Korean speakers</strong>. Employers post roles across hospitality,
              retail, professional services, trades, and more. Job seekers can browse by city and industry—whether you
              are on a <strong>working holiday (417/462)</strong>, a <strong>student visa</strong>, a{" "}
              <strong>skilled / employer-sponsored</strong> pathway, or already permanent in Australia.
            </p>
          </div>

          <div className="space-y-3" aria-labelledby="au-kr-heading">
            <h2 id="au-kr-heading" className="text-lg font-semibold">
              Finding a job in Australia as a Korean
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Many Korean residents and new arrivals look for <strong>한인 채용 (Korean community hiring)</strong> because
              the workplace language and network feel more familiar. We bring those listings into one place—
              <strong> Sydney, Melbourne, Brisbane, Adelaide</strong>, and other regions—so you spend less time jumping
              between groups and forums.
            </p>
            <ul className="list-inside list-disc space-y-1.5 text-sm text-muted-foreground leading-relaxed">
              <li>Local roles that often welcome Korean or bilingual candidates</li>
              <li>Clear location tags so you can target cities and states (NSW, VIC, QLD, etc.)</li>
              <li>Direct contact options where employers list them, to help you apply quickly</li>
            </ul>
          </div>

          <div className="space-y-3" aria-labelledby="not-heading">
            <h2 id="not-heading" className="text-lg font-semibold">
              What Hoju Jobs is not
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We are a <strong>listing platform</strong>, not a recruitment agency. We do not place candidates or verify
              every opening. Always confirm visa rules with official Australian government sources, and do your own checks
              before accepting work.
            </p>
          </div>

          <div className="space-y-3" aria-labelledby="contact-heading">
            <h2 id="contact-heading" className="text-lg font-semibold">
              Contact
            </h2>
            <p className="text-sm text-muted-foreground">
              Questions or partnership ideas:{" "}
              <a href="mailto:admin.hojujobs@gmail.com" className="font-medium text-primary hover:underline">
                admin.hojujobs@gmail.com
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
