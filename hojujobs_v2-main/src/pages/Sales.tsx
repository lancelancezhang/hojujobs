import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ExternalLink, RotateCcw, ShoppingBag, Tags, Truck } from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useSEO } from "@/hooks/useSEO";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Deal {
  id: string;
  title: string;
  price: string;
  originalPrice?: string;
  delivery?: string;
  productType: string;
  retailer: string;
  retailerDomain: string;
  sourceUrl: string;
  description: string[];
  imageUrl?: string;
  dealUrl: string;
}

function faviconUrl(domain: string) {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

function priceNumber(value?: string) {
  if (!value) return null;
  const parsed = Number(value.replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function discountPercent(price: string, originalPrice?: string) {
  const current = priceNumber(price);
  const original = priceNumber(originalPrice);
  if (!current || !original || current >= original) return null;
  return Math.round(((original - current) / original) * 100);
}

function summariseDeal(deal: Deal) {
  const detail = deal.description.find((line) => line.startsWith("화면:")) ?? deal.description[0] ?? "";
  return detail.replace(/^화면:\s*/, "");
}

export default function Sales() {
  useSEO({ title: "세일중 | Hoju Jobs", description: "관리자용 현재 세일 정보", noindex: true });
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loadingDeals, setLoadingDeals] = useState(true);
  const [dealsError, setDealsError] = useState<string | null>(null);
  const [selectedProductType, setSelectedProductType] = useState("all");

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
        .select("id, title_ko, price, original_price, delivery_ko, product_type_ko, retailer, retailer_domain, source_url, description_ko, image_url, deal_url")
        .eq("is_active", true)
        .order("posted_at", { ascending: false });

      if (error) {
        setDeals([]);
        setDealsError("딜 정보를 불러올 수 없습니다.");
        setLoadingDeals(false);
        return;
      }

      setDeals((data ?? []).map((deal) => ({
        id: deal.id,
        title: deal.title_ko,
        price: deal.price,
        originalPrice: deal.original_price ?? undefined,
        delivery: deal.delivery_ko ?? undefined,
        productType: deal.product_type_ko,
        retailer: deal.retailer,
        retailerDomain: deal.retailer_domain,
        sourceUrl: deal.source_url,
        description: deal.description_ko,
        imageUrl: deal.image_url ?? undefined,
        dealUrl: deal.deal_url,
      })));
      setLoadingDeals(false);
    };

    fetchDeals();
  }, [user, isAdmin]);

  const productTypes = useMemo(() => [...new Set(deals.map((deal) => deal.productType))].sort(), [deals]);
  const productTypeCounts = useMemo(() => {
    return deals.reduce<Record<string, number>>((counts, deal) => {
      counts[deal.productType] = (counts[deal.productType] || 0) + 1;
      return counts;
    }, {});
  }, [deals]);
  const filteredDeals = useMemo(() => {
    if (selectedProductType === "all") return deals;
    return deals.filter((deal) => deal.productType === selectedProductType);
  }, [deals, selectedProductType]);

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
            ) : filteredDeals.map((deal) => {
              const discount = discountPercent(deal.price, deal.originalPrice);

              return (
              <article key={deal.id} className="overflow-hidden rounded-md border bg-card">
                <div className="grid gap-3 p-3 sm:grid-cols-[minmax(0,1fr)_150px]">
                  <div className="min-w-0">
                    <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                      <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[11px] font-semibold text-primary">{deal.productType}</span>
                      <img src={faviconUrl(deal.retailerDomain)} alt="" className="h-3.5 w-3.5 rounded-sm" />
                      <span className="text-xs font-semibold text-blue-700">{deal.retailerDomain}</span>
                      <span className="text-xs text-muted-foreground">판매처 {deal.retailer}</span>
                      <a href={deal.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-blue-700 hover:underline">
                        원문 보기
                      </a>
                    </div>

                    <h2 className="text-base font-bold leading-snug text-foreground sm:text-lg">{deal.title}</h2>

                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                      {summariseDeal(deal)}
                    </p>

                    <div className="mt-3 flex flex-wrap items-end gap-x-4 gap-y-2">
                      <div>
                        <p className="text-[11px] font-semibold text-muted-foreground">할인가</p>
                        <p className="text-xl font-bold text-primary">{deal.price}</p>
                      </div>
                      {deal.originalPrice && (
                        <div>
                          <p className="text-[11px] font-semibold text-muted-foreground">정가</p>
                          <p className="text-sm font-semibold text-muted-foreground line-through">{deal.originalPrice}</p>
                        </div>
                      )}
                      {discount !== null && (
                        <span className="rounded-md bg-red-50 px-2 py-1 text-xs font-bold text-red-700">
                          {discount}% 할인
                        </span>
                      )}
                      {deal.delivery && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                          <Truck className="h-3 w-3" />
                          {deal.delivery}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-md border bg-white">
                      {deal.imageUrl ? (
                        <img src={deal.imageUrl} alt={deal.title} className="h-full w-full object-contain" />
                      ) : (
                        <ShoppingBag className="h-10 w-10 text-muted-foreground/50" />
                      )}
                    </div>
                    <Button asChild size="sm" className="h-8 gap-1.5 text-xs">
                      <a href={deal.dealUrl} target="_blank" rel="noopener noreferrer">
                        딜 보러가기
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </div>
              </article>
              );
            })}
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
