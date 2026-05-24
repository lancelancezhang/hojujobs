import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { RotateCcw, Tags, Ticket } from "lucide-react";
import { Header } from "@/components/Header";
import { useSEO } from "@/hooks/useSEO";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";

interface Deal {
  rank: number;
  title: string;
  category: string;
  teaserDescription?: string;
  imageUrl?: string;
  externalUrl?: string;
  uploadedAt: string;
  promoCodes: string[];
}

function formatUploadedAt(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Australia/Sydney",
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

function cleanTeaserText(value: string) {
  return value
    .replace(/\*\*|__|\*|_|#{1,6}\s|`|\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^[*-]\s/gm, "• ");
}

function highlightPrices(value: string) {
  const pricePattern = /(?:A\$|\$)\d[\d,]*(?:\.\d{1,2})?/g;
  const parts: Array<string | JSX.Element> = [];
  let lastIndex = 0;

  for (const match of value.matchAll(pricePattern)) {
    const matchIndex = match.index ?? 0;
    if (matchIndex > lastIndex) {
      parts.push(value.slice(lastIndex, matchIndex));
    }
    parts.push(
      <span key={`${match[0]}-${matchIndex}`} className="font-bold text-emerald-700">
        {match[0]}
      </span>
    );
    lastIndex = matchIndex + match[0].length;
  }

  if (lastIndex < value.length) {
    parts.push(value.slice(lastIndex));
  }

  return parts.length > 0 ? parts : value;
}

export default function Sales() {
  useSEO({ title: "세일중 | Hoju Jobs", description: "호주 생활에 유용한 최신 세일과 할인 코드", noindex: true });
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loadingDeals, setLoadingDeals] = useState(true);
  const [dealsError, setDealsError] = useState<string | null>(null);
  const [selectedProductType, setSelectedProductType] = useState("all");

  useEffect(() => {
    const fetchDeals = async () => {
      setLoadingDeals(true);
      setDealsError(null);

      const { data, error } = await supabase
        .from("ozbargain_deals")
        .select("rank, title, category, teaser_description, image_url, external_url, uploaded_at, promo_codes")
        .order("rank", { ascending: true });

      if (error) {
        setDeals([]);
        setDealsError("딜 정보를 불러올 수 없습니다.");
        setLoadingDeals(false);
        return;
      }

      setDeals((data ?? []).map((deal) => ({
        rank: deal.rank,
        title: deal.title,
        category: deal.category,
        teaserDescription: (deal as Record<string, unknown>).teaser_description as string | undefined ?? undefined,
        imageUrl: deal.image_url ?? undefined,
        externalUrl: deal.external_url ?? undefined,
        uploadedAt: deal.uploaded_at,
        promoCodes: parsePromoCodes(deal.promo_codes),
      })));
      setLoadingDeals(false);
    };

    fetchDeals();
  }, []);

  const productTypes = useMemo(() => [...new Set(deals.map((deal) => deal.category))].sort(), [deals]);
  const productTypeCounts = useMemo(() => {
    return deals.reduce<Record<string, number>>((counts, deal) => {
      counts[deal.category] = (counts[deal.category] || 0) + 1;
      return counts;
    }, {});
  }, [deals]);
  const filteredDeals = useMemo(() => {
    if (selectedProductType === "all") return deals;
    return deals.filter((deal) => deal.category === selectedProductType);
  }, [deals, selectedProductType]);

  return (
    <div className="flex w-full min-h-0 flex-1 flex-col bg-background">
      <Header />
      <main className="mx-auto w-full max-w-6xl px-4 pb-8 pt-4">
        <div className="grid gap-5 lg:grid-cols-[200px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <button
              onClick={() => setSelectedProductType("all")}
              className={cn(
                "flex h-5 items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground",
                selectedProductType === "all" && "invisible pointer-events-none"
              )}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              필터 초기화
            </button>

            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
                <Tags className="h-4 w-4 text-accent" />
                상품 종류
              </h3>
              <ul className="space-y-0.5">
                <SalesFilterItem
                  label="전체 상품"
                  count={deals.length}
                  active={selectedProductType === "all"}
                  onClick={() => setSelectedProductType("all")}
                />
                {productTypes.map((productType) => (
                  <SalesFilterItem
                    key={productType}
                    label={productType}
                    count={productTypeCounts[productType] || 0}
                    active={selectedProductType === productType}
                    onClick={() => setSelectedProductType(productType)}
                  />
                ))}
              </ul>
            </div>
          </aside>

          <section className="space-y-2.5">
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
            ) : filteredDeals.length === 0 ? (
              <div className="rounded-lg border bg-card px-4 py-12 text-center text-sm text-muted-foreground">
                선택한 상품 종류에 해당하는 딜이 없습니다.
              </div>
            ) : filteredDeals.map((deal) => (
              <article key={deal.rank} className="overflow-hidden rounded-md border bg-card transition-shadow hover:shadow-sm">
                <Link to={`/sales/${deal.rank}`} className="flex gap-0">
                  {deal.imageUrl && (
                    <div className="shrink-0 w-24 sm:w-32 bg-muted">
                      <img
                        src={deal.imageUrl}
                        alt={deal.title}
                        className="h-full w-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }}
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1 p-3">
                    <div className="mb-1 flex flex-wrap items-center gap-1.5">
                      <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[11px] font-semibold text-primary">{deal.category}</span>
                      <span className="text-xs text-muted-foreground">{formatUploadedAt(deal.uploadedAt)}</span>
                    </div>

                    <h2 className="text-sm font-bold leading-snug text-foreground sm:text-base line-clamp-2">{highlightPrices(deal.title)}</h2>

                    {deal.teaserDescription && (
                      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {highlightPrices(cleanTeaserText(deal.teaserDescription))}
                      </p>
                    )}

                    {deal.promoCodes.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {deal.promoCodes.map((promoCode) => (
                          <span key={promoCode} className="inline-flex items-center gap-1 rounded-md border border-dashed border-primary/40 bg-primary/5 px-2 py-0.5 text-xs font-bold text-primary">
                            <Ticket className="h-3 w-3" />
                            {promoCode}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              </article>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}

function SalesFilterItem({ label, count, active, onClick }: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        onClick={onClick}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-lg px-3 text-sm transition-colors",
          active
            ? "bg-primary/10 font-semibold text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <span className="truncate">{label}</span>
        <span className={cn("text-xs tabular-nums", active ? "text-primary" : "text-muted-foreground/60")}>{count}</span>
      </button>
    </li>
  );
}
