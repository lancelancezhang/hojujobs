import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, ExternalLink, Ticket } from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

interface DealDetail {
  rank: number;
  title: string;
  category: string;
  description?: string;
  imageUrl?: string;
  externalUrl?: string;
  uploadedAt: string;
  promoCodes: string[];
}

function formatUploadedAt(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Australia/Sydney",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function parsePromoCodes(value: Json): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && !Array.isArray(item)) {
        const code = item.code ?? item.promo_code ?? item.promoCode;
        return typeof code === "string" ? code : null;
      }
      return null;
    })
    .filter((code): code is string => Boolean(code?.trim()));
}

export default function SaleDetail() {
  const { rank } = useParams<{ rank: string }>();
  const [deal, setDeal] = useState<DealDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useSEO({
    title: deal ? `${deal.title} | Hoju Jobs` : "딜 상세 | Hoju Jobs",
    description: deal?.title ?? "호주 세일 딜 상세 정보",
    noindex: true,
  });

  useEffect(() => {
    if (!rank) return;
    const fetchDeal = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("ozbargain_deals")
        .select("rank, title, category, description, image_url, external_url, uploaded_at, promo_codes")
        .eq("rank", Number(rank))
        .single();

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setDeal({
        rank: data.rank,
        title: data.title,
        category: data.category,
        description: data.description ?? undefined,
        imageUrl: data.image_url ?? undefined,
        externalUrl: data.external_url ?? undefined,
        uploadedAt: data.uploaded_at,
        promoCodes: parsePromoCodes(data.promo_codes),
      });
      setLoading(false);
    };

    fetchDeal();
  }, [rank]);

  return (
    <div className="flex w-full min-h-0 flex-1 flex-col bg-background">
      <Header />
      <main className="mx-auto w-full max-w-3xl px-4 pb-12 pt-4">
        <Link
          to="/sales"
          className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          딜 목록으로
        </Link>

        {loading ? (
          <div className="rounded-lg border bg-card px-4 py-16 text-center text-sm text-muted-foreground">
            불러오는 중...
          </div>
        ) : notFound ? (
          <div className="rounded-lg border bg-card px-4 py-16 text-center text-sm text-muted-foreground">
            딜을 찾을 수 없습니다.
          </div>
        ) : deal ? (
          <article className="rounded-lg border bg-card overflow-hidden">
            {deal.imageUrl && (
              <div className="w-full bg-muted max-h-72 overflow-hidden flex items-center justify-center">
                <img
                  src={deal.imageUrl}
                  alt={deal.title}
                  className="w-full object-contain max-h-72"
                  onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }}
                />
              </div>
            )}

            <div className="p-5 sm:p-6">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  {deal.category}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatUploadedAt(deal.uploadedAt)} 업로드
                </span>
              </div>

              <h1 className="text-xl font-bold leading-snug text-foreground sm:text-2xl">
                {deal.title}
              </h1>

              {deal.promoCodes.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {deal.promoCodes.map((code) => (
                    <span
                      key={code}
                      className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-primary/40 bg-primary/5 px-3 py-1.5 text-sm font-bold text-primary"
                    >
                      <Ticket className="h-3.5 w-3.5" />
                      프로모 코드: {code}
                    </span>
                  ))}
                </div>
              )}

              {deal.externalUrl && (
                <div className="mt-4">
                  <Button asChild className="gap-2">
                    <a href={deal.externalUrl} target="_blank" rel="noopener noreferrer">
                      딜 보러가기
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              )}

              {deal.description && (
                <div className="mt-6 border-t pt-5">
                  <div className="prose prose-sm max-w-none text-foreground/80
                    prose-headings:text-foreground prose-headings:font-bold
                    prose-strong:text-foreground prose-strong:font-semibold
                    prose-ul:my-2 prose-li:my-0.5
                    prose-p:leading-relaxed prose-p:my-2">
                    <ReactMarkdown>{deal.description}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </article>
        ) : null}
      </main>
    </div>
  );
}
