import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Bath, BedSingle, Calendar, ChevronLeft, ChevronRight, Mail, MapPin, MessageSquare, Phone, ShieldCheck } from "lucide-react";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useSEO } from "@/hooks/useSEO";
import { cn } from "@/lib/utils";

type FlatmateListing = {
  id: number;
  url: string | null;
  title: string | null;
  description: string | null;
  price: number | null;
  contact_number: string | null;
  enquiry_email: string | null;
  kakao_id: string | null;
  state_location: string | null;
  time_posted: string | null;
  uploaded_at: string | null;
  image_url: string | null;
  post_photo: string[] | null;
  private_room: boolean | null;
  gender_restriction: string | null;
  private_bathroom: boolean | null;
  suburb: string | null;
};

function formatPrice(price: number | null) {
  if (typeof price !== "number") return "문의";
  return `$${new Intl.NumberFormat("en-AU").format(price)}`;
}

function formatDate(value: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Australia/Sydney",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

function genderLabel(value: string | null) {
  if (value === "female_only") return "여성전용";
  if (value === "male_only") return "남성전용";
  if (value && value !== "none") return "성별제한";
  return "성별무관";
}

function listingPhotos(listing: FlatmateListing) {
  const photos = [
    ...(Array.isArray(listing.post_photo) ? listing.post_photo : []),
    listing.image_url,
  ].filter((photo): photo is string => Boolean(photo?.trim()));

  return [...new Set(photos)];
}

export default function FlatmateDetail() {
  const { id } = useParams();
  const [listing, setListing] = useState<FlatmateListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchListing() {
      if (!id) return;
      setLoading(true);
      setNotFound(false);

      const { data, error } = await supabase
        .from("hojunara_realestate_share")
        .select("id, url, title, description, price, contact_number, enquiry_email, state_location, time_posted, uploaded_at, image_url, post_photo, private_room, gender_restriction, private_bathroom, suburb")
        .eq("id", Number(id))
        .maybeSingle();

      if (cancelled) return;

      if (error || !data) {
        setListing(null);
        setNotFound(true);
        setLoading(false);
        return;
      }

      setListing(data as FlatmateListing);
      setLoading(false);
    }

    fetchListing();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const description = useMemo(() => listing?.description?.trim() ?? "", [listing]);

  useSEO({
    title: listing ? `${listing.title ?? "플렛메이트"} | Hoju Jobs` : "플렛메이트 | Hoju Jobs",
    description: listing?.description?.slice(0, 155) ?? "호주 한인 쉐어하우스와 플렛메이트 매물 상세 정보",
    canonical: listing ? `https://hojujobs.com/flatmates/${listing.id}` : undefined,
    htmlLang: "ko",
    ogLocale: "ko_KR",
  });

  if (loading) {
    return (
      <div className="flex w-full min-h-0 flex-1 items-center justify-center bg-background">
        <p className="text-muted-foreground">불러오는 중...</p>
      </div>
    );
  }

  if (notFound || !listing) {
    return (
      <div className="flex w-full min-h-0 flex-1 items-center justify-center bg-background">
        <div className="text-center">
          <p className="mb-4 text-muted-foreground">해당 플렛메이트 매물을 찾을 수 없습니다.</p>
          <Link to="/flatmates" className="text-primary hover:underline">목록으로 돌아가기</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-0 flex-1 flex-col bg-[#f7f8fb]">
      <Header />

      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-8">
        <div className="mb-5">
          <Link to="/flatmates" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            플렛메이트 목록
          </Link>
        </div>

        <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <PhotoGallery listing={listing} />

          <div className="p-5 sm:p-6">
            <div className="mb-3 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
                <MapPin className="h-3.5 w-3.5" />
                {listing.suburb ?? "지역 미기재"}
              </span>
              {listing.private_room === true && (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
                  <BedSingle className="h-3.5 w-3.5" />
                  독방
                </span>
              )}
              {listing.private_bathroom === true && (
                <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">
                  <Bath className="h-3.5 w-3.5" />
                  개인 화장실
                </span>
              )}
              {(listing.gender_restriction === "female_only" || listing.gender_restriction === "male_only") && (
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {genderLabel(listing.gender_restriction)}
                </span>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_10rem]">
              <div className="min-w-0">
                <h1 className="text-2xl font-black leading-tight text-slate-950 sm:text-3xl">{listing.title ?? "제목 없음"}</h1>
                <p className="mt-3 flex items-center gap-1.5 text-sm text-slate-500">
                  <Calendar className="h-4 w-4" />
                  {formatDate(listing.time_posted ?? listing.uploaded_at)}
                </p>
              </div>
              <div className="rounded-lg border bg-slate-50 p-4 text-right">
                <p className="flex items-baseline justify-end gap-1.5">
                  <span className="text-3xl font-black text-slate-950">{formatPrice(listing.price)}</span>
                  <span className="text-sm font-semibold text-slate-500">/ 주</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {description && (
          <section className="mt-5 rounded-xl border bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-4 text-lg font-black text-slate-950">상세 내용</h2>
            <div className="whitespace-pre-line break-words text-sm leading-relaxed text-slate-700 [overflow-wrap:anywhere]">
              {description}
            </div>
          </section>
        )}

        {(listing.contact_number || listing.enquiry_email || listing.kakao_id) && (
          <section className="mt-5 rounded-xl border bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-4 text-lg font-black text-slate-950">연락처</h2>
            <div className="space-y-3">
              {listing.contact_number && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Phone className="h-4 w-4 shrink-0 text-primary" />
                  <span className="font-semibold text-slate-800">{listing.contact_number}</span>
                </div>
              )}
              {listing.enquiry_email && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Mail className="h-4 w-4 shrink-0 text-primary" />
                  <a href={`mailto:${listing.enquiry_email}`} className="font-semibold text-primary hover:underline">
                    {listing.enquiry_email}
                  </a>
                </div>
              )}
              {listing.kakao_id && (
                <div className="flex items-center gap-2.5 text-sm">
                  <MessageSquare className="h-4 w-4 shrink-0 text-yellow-500" />
                  <span className="font-semibold text-slate-800">카카오 {listing.kakao_id}</span>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function PhotoGallery({ listing }: { listing: FlatmateListing }) {
  const photos = listingPhotos(listing);
  const [photoIndex, setPhotoIndex] = useState(0);
  const currentPhoto = photos[photoIndex];
  const hasMultiplePhotos = photos.length > 1;

  const showPrevious = () => {
    setPhotoIndex((current) => (current === 0 ? photos.length - 1 : current - 1));
  };

  const showNext = () => {
    setPhotoIndex((current) => (current + 1) % photos.length);
  };

  return (
    <div>
      <div className="relative h-72 overflow-hidden bg-slate-100 sm:h-[30rem]">
        {currentPhoto ? (
          <img
            src={currentPhoto}
            alt={listing.title ?? "플렛메이트 매물"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-bold text-slate-400">
            사진 없음
          </div>
        )}

        {hasMultiplePhotos && (
          <>
            <button
              type="button"
              onClick={showPrevious}
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
              aria-label="이전 사진"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={showNext}
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
              aria-label="다음 사진"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {hasMultiplePhotos && (
        <div className="flex gap-2 overflow-x-auto border-t bg-white p-3">
          {photos.map((photo, index) => (
            <button
              key={`${photo}-${index}`}
              type="button"
              onClick={() => setPhotoIndex(index)}
              className={cn(
                "h-16 w-20 shrink-0 overflow-hidden rounded-md border transition-colors",
                index === photoIndex ? "border-primary ring-2 ring-primary/25" : "border-slate-200"
              )}
              aria-label={`${index + 1}번째 사진`}
            >
              <img src={photo} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
