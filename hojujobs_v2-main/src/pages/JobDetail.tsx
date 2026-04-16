import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { ArrowLeft, MapPin, Briefcase, Phone, Mail, Eye, Calendar, ExternalLink } from "lucide-react";
import { incrementViewCount } from "@/hooks/useViewCounts";
import { supabase } from "@/integrations/supabase/client";
import { SUBURB_EN } from "@/data/regionMap";
import { useSEO } from "@/hooks/useSEO";

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

interface Job {
  id: number;
  title: string;
  location: string[];
  industry: string;
  contact: string | null;
  email: string | null;
  description: string | null;
  address: string | null;
  google_search: string | null;
  uploaded_at: string;
}

export default function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewCount, setViewCount] = useState(0);

  useEffect(() => {
    async function fetchJob() {
      const { data, error } = await supabase
        .from("jobs")
        .select("id, title, location, industry, contact, email, description, address, google_search, uploaded_at")
        .eq("id", Number(id))
        .single();

      if (!error && data) {
        setJob(data as Job);
        const storageKey = `job_viewed_${data.id}`;
        const lastViewedRaw = window.localStorage.getItem(storageKey);
        const now = Date.now();
        const THIRTY_MINUTES = 30 * 60 * 1000;

        if (lastViewedRaw) {
          const lastViewed = Number(lastViewedRaw);
          if (!Number.isNaN(lastViewed) && now - lastViewed < THIRTY_MINUTES) {
            const { data: vcRow } = await supabase
              .from("view_counts")
              .select("count")
              .eq("job_id", data.id)
              .maybeSingle();
            setViewCount(vcRow?.count ?? 0);
            setLoading(false);
            return;
          }
        }

        const newCount = await incrementViewCount(data.id);
        setViewCount(newCount);
        window.localStorage.setItem(storageKey, String(now));
      }
      setLoading(false);
    }
    fetchJob();
  }, [id]);

  const jobJsonLd = useMemo(() => {
    if (!job) return undefined;
    return {
      "@context": "https://schema.org/",
      "@type": "JobPosting",
      title: job.title,
      description: job.description || "",
      datePosted: job.uploaded_at,
      jobLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressLocality: job.location.join(", "),
          addressCountry: "AU",
        },
      },
      industry: job.industry,
    };
  }, [job]);

  useSEO({
    title: job ? `${job.title} | Hoju Jobs` : "Hoju Jobs - 호주 한인 구인구직",
    description: job ? (job.description || "").slice(0, 155) : "호주 한인 커뮤니티 구인구직 게시판",
    canonical: job ? `https://hojujobs.com/job/${job.id}` : undefined,
    jsonLd: jobJsonLd,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">불러오는 중...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">해당 공고를 찾을 수 없습니다.</p>
          <Link to="/" className="text-primary hover:underline">목록으로 돌아가기</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button onClick={() => window.history.length > 1 ? window.history.back() : window.location.assign("/")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            목록으로 돌아가기
          </button>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-3">{job.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
            {job.location && job.location.length > 0 && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-accent" />{job.location.join(", ")}</span>}
            {job.industry && <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-muted-foreground" />{job.industry}</span>}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />등록일: {formatDate(job.uploaded_at)}</span>
            <span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" />조회 {viewCount}회</span>
          </div>
        </div>

        {job.description && (
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h2 className="text-lg font-bold text-foreground mb-4">상세 내용</h2>
            <div className="text-sm text-foreground/80 whitespace-pre-line leading-relaxed">{job.description}</div>
          </div>
        )}

        {(job.contact || job.email) && (
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h2 className="text-lg font-bold text-foreground mb-4">연락처</h2>
            <div className="space-y-3">
              {job.contact && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="text-foreground">{job.contact}</span>
                </div>
              )}
              {job.email && job.email !== "정보없음" && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Mail className="h-4 w-4 text-primary" />
                  <a href={`mailto:${job.email}`} className="text-primary hover:underline">{job.email}</a>
                </div>
              )}
            </div>
          </div>
        )}

        {job.location.length > 0 && (
          <div className="bg-card border border-border rounded-xl overflow-hidden mb-6">
            <h2 className="text-lg font-bold text-foreground px-6 pt-6 pb-3 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-accent" />
              위치
            </h2>
            {job.location.map((loc) => {
              const englishName = SUBURB_EN[loc] || loc;
              const query = job.google_search
                || (job.address ? `${job.address}, ${englishName}, Australia` : `${englishName}, Australia`);
              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
              const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`;

              return (
                <div key={loc} className="px-6 pb-4">
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="block group">
                    <div className="rounded-lg overflow-hidden border border-border relative">
                      <iframe
                        src={embedUrl}
                        className="w-full h-48 pointer-events-none"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title={`${loc} 지도`}
                      />
                      <div className="absolute inset-0 bg-transparent group-hover:bg-black/5 transition-colors flex items-end justify-end p-3">
                        <span className="flex items-center gap-1.5 text-xs font-medium bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-border text-foreground">
                          <ExternalLink className="h-3 w-3" />
                          {loc} · Google Maps에서 보기
                        </span>
                      </div>
                    </div>
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
