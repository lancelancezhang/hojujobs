import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { BLOG_POSTS } from "@/data/blogPosts";
import { useSEO } from "@/hooks/useSEO";

const CANONICAL = "https://hojujobs.com/blog";

export default function Blog() {
  const jsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "Blog",
      name: "Hoju Jobs Blog",
      url: CANONICAL,
      description: "Guides and SEO landing articles for Korean job seekers and employers in Australia.",
      inLanguage: ["ko", "en-AU"],
      isPartOf: {
        "@type": "WebSite",
        name: "Hoju Jobs",
        url: "https://hojujobs.com/",
      },
    }),
    [],
  );

  useSEO({
    title: "Blog | Hoju Jobs — 호주 한인 구인구직 가이드",
    description:
      "호주 워홀러를 위한 카페 알바, 멜버른·시드니 한인 카페 구인, 호주 한인 일자리 가이드.",
    canonical: CANONICAL,
    htmlLang: "ko",
    ogLocale: "ko_KR",
    keywords:
      "Hoju Jobs blog, 호주 취업 블로그, Korean jobs Australia guide, 시드니 구인구직, 멜번 구인구직",
    jsonLd,
  });

  return (
    <div className="flex w-full min-h-0 flex-1 flex-col bg-background">
      <Header />
      <main className="mx-auto w-full max-w-4xl space-y-8 px-4 py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          홈으로
        </Link>

        <header className="space-y-3">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            호주 워홀 카페 일자리 찾는 법
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            멜버른과 시드니에서 카페 알바를 찾는 워홀러를 위해 쉽게 정리했어요.
            어디서 공고를 보고, 어떻게 연락하고, 왜 지원이 잘 안 되는지까지 차근차근 알려드립니다.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-3" aria-label="Blog posts">
          {BLOG_POSTS.map((post) => (
            <article key={post.slug} className="flex h-full flex-col rounded-xl border border-border bg-white p-5 shadow-sm">
              <div className="flex-1 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Guide</p>
                <h2 className="text-lg font-semibold text-foreground">{post.title}</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">{post.description}</p>
              </div>
              <Link
                to={`/blog/${post.slug}`}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                글 읽기
                <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
