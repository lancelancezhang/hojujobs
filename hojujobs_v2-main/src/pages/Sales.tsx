import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ExternalLink, ShoppingBag, Truck } from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useSEO } from "@/hooks/useSEO";
import { supabase } from "@/integrations/supabase/client";

interface Deal {
  id: string;
  title: string;
  price: string;
  originalPrice?: string;
  delivery?: string;
  retailer: string;
  retailerDomain: string;
  sourceUrl: string;
  postedBy: string;
  postedAt: string;
  score: number;
  comments: number;
  description: string[];
  imageUrl?: string;
  dealUrl: string;
}

function faviconUrl(domain: string) {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

function formatPostedAt(value: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Australia/Sydney",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

export default function Sales() {
  useSEO({ title: "세일중 | Hoju Jobs", description: "관리자용 현재 세일 정보", noindex: true });
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loadingDeals, setLoadingDeals] = useState(true);
  const [dealsError, setDealsError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/");
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (!user || !isAdmin) return;

    const fetchDeals = async () => {
      setLoadingDeals(true);
      setDealsError(null);
      const { data, error } = await supabase
        .from("sales_deals")
        .select("id, title_ko, price, original_price, delivery_ko, retailer, retailer_domain, source_url, posted_by, posted_at, score, comments_count, description_ko, image_url, deal_url")
        .eq("is_active", true)
        .order("posted_at", { ascending: false });

      if (error) {
        setDeals([]);
        setDealsError("딜 정보를 불러올 수 없습니다. sales_deals 테이블 마이그레이션을 확인해 주세요.");
        setLoadingDeals(false);
        return;
      }

      setDeals((data ?? []).map((deal) => ({
        id: deal.id,
        title: deal.title_ko,
        price: deal.price,
        originalPrice: deal.original_price ?? undefined,
        delivery: deal.delivery_ko ?? undefined,
        retailer: deal.retailer,
        retailerDomain: deal.retailer_domain,
        sourceUrl: deal.source_url,
        postedBy: deal.posted_by ?? "",
        postedAt: formatPostedAt(deal.posted_at),
        score: deal.score,
        comments: deal.comments_count,
        description: deal.description_ko,
        imageUrl: deal.image_url ?? undefined,
        dealUrl: deal.deal_url,
      })));
      setLoadingDeals(false);
    };

    fetchDeals();
  }, [user, isAdmin]);

  if (loading) {
    return (
      <div className="flex w-full min-h-0 flex-1 items-center justify-center bg-background text-muted-foreground">
        로딩 중...
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="flex w-full min-h-0 flex-1 flex-col bg-background">
      <Header />
      <main className="mx-auto w-full max-w-4xl space-y-5 px-4 pb-8 pt-4">
        <section className="rounded-lg border bg-card px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-bold text-foreground">세일중</h1>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">현재 확인 중인 딜을 관리자만 볼 수 있습니다.</p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          {loadingDeals ? (
            <div className="rounded-lg border bg-card px-4 py-12 text-center text-sm text-muted-foreground">
              딜 정보를 불러오는 중...
            </div>
          ) : dealsError ? (
            <div className="rounded-lg border bg-card px-4 py-12 text-center text-sm text-muted-foreground">
              {dealsError}
            </div>
          ) : deals.length === 0 ? (
            <div className="rounded-lg border bg-card px-4 py-12 text-center text-sm text-muted-foreground">
              현재 등록된 딜이 없습니다.
            </div>
          ) : deals.map((deal) => (
            <article key={deal.id} className="overflow-hidden rounded-lg border bg-card">
              <div className="grid gap-4 p-4 sm:grid-cols-[72px_minmax(0,1fr)_180px]">
                <div className="flex sm:block">
                  <div className="grid h-[72px] w-[72px] shrink-0 overflow-hidden rounded-md border bg-white text-center">
                    <div className="flex items-center justify-center text-lg font-bold text-green-600">{deal.score}+</div>
                    <div className="flex items-center justify-center border-t text-sm font-semibold text-red-600">{deal.comments}-</div>
                  </div>
                </div>

                <div className="min-w-0">
                  <h2 className="text-xl font-bold leading-tight text-foreground sm:text-2xl">
                    {deal.title} <span className="text-primary">{deal.price}</span>
                    {deal.originalPrice && (
                      <span className="font-semibold text-muted-foreground"> 정가 {deal.originalPrice}</span>
                    )}
                    {deal.delivery && (
                      <span className="font-semibold text-foreground"> + 배송 ({deal.delivery})</span>
                    )}
                    <span className="font-semibold text-foreground"> 판매처 {deal.retailer}</span>
                  </h2>

                  <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                    <span className="font-semibold text-blue-700">{deal.postedBy}</span>
                    <span>등록 {deal.postedAt}</span>
                    <img src={faviconUrl(deal.retailerDomain)} alt="" className="h-4 w-4 rounded-sm" />
                    <span className="font-semibold text-blue-700">{deal.retailerDomain}</span>
                    <a href={deal.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-700 hover:underline">
                      원문 보기
                    </a>
                  </div>

                  <div className="mt-3 space-y-1 text-sm leading-relaxed text-foreground sm:text-base">
                    {deal.description.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-md border bg-white">
                    {deal.imageUrl ? (
                      <img src={deal.imageUrl} alt={deal.title} className="h-full w-full object-contain" />
                    ) : (
                      <ShoppingBag className="h-10 w-10 text-muted-foreground/50" />
                    )}
                  </div>
                  <Button asChild className="gap-1.5">
                    <a href={deal.dealUrl} target="_blank" rel="noopener noreferrer">
                      딜 보러가기
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                  {deal.delivery && (
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <Truck className="h-3.5 w-3.5" />
                      {deal.delivery}
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
