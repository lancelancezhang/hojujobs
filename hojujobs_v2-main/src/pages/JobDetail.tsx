import { useParams, Link } from "react-router-dom";
import hojuJobsLogo from "@/assets/hoju-jobs-logo.png";
import { useEffect, useState, useMemo } from "react";
import { ArrowLeft, MapPin, Building2, Briefcase, Clock, DollarSign, Phone, Mail, CheckCircle2, Eye, Calendar, ExternalLink } from "lucide-react";
import { incrementViewCount } from "@/hooks/useViewCounts";
import { supabase } from "@/integrations/supabase/client";
import { SUBURB_EN } from "@/data/regionMap";
import { useSEO } from "@/hooks/useSEO";

const typeEmoji: Record<string, string> = {
  "풀타임": "💼",
  "파트타임": "🕒",
  "컨트랙": "📄",
  "캐주얼": "⚡",
  "리모트": "🌍",
};

const typeColor: Record<string, string> = {
  "풀타임": "bg-primary/10 text-primary",
  "파트타임": "bg-amber-100 text-amber-700",
  "컨트랙": "bg-emerald-100 text-emerald-700",
  "캐주얼": "bg-orange-100 text-orange-700",
  "리모트": "bg-violet-100 text-violet-700",
};

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

interface Job {
  id: number;
  title: string;
  company: string;
  location: string[];
  industry: string;
  type: string;
  summary: string;
  pay: string | null;
  requirements: string[] | null;
  hours: string | null;
  contact: string | null;
  email: string | null;
  description: string | null;
  address: string | null;
  created_at: string;
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
        .select("*")
        .eq("id", Number(id))
        .single();

      if (!error && data) {
        setJob(data as Job);
        // Avoid obvious duplicate counts by throttling per browser for 30 minutes
        const storageKey = `job_viewed_${data.id}`;
        const lastViewedRaw = window.localStorage.getItem(storageKey);
        const now = Date.now();
        const THIRTY_MINUTES = 30 * 60 * 1000;

        if (lastViewedRaw) {
          const lastViewed = Number(lastViewedRaw);
          if (!Number.isNaN(lastViewed) && now - lastViewed < THIRTY_MINUTES) {
            // Recently viewed in this browser: just load the current count without incrementing
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
    const ld: Record<string, unknown> = {
      "@context": "https://schema.org/",
      "@type": "JobPosting",
      title: job.title,
      description: job.description || job.summary,
      datePosted: job.created_at,
      hiringOrganization: {
        "@type": "Organization",
        name: job.company,
      },
      jobLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressLocality: job.location.join(", "),
          addressCountry: "AU",
        },
      },
      employmentType: job.type,
      industry: job.industry,
    };
    if (job.pay) ld.baseSalary = job.pay;
    return ld;
  }, [job]);

  useSEO({
    title: job ? `${job.title} - ${job.company} | Hoju Jobs` : "Hoju Jobs - 호주 한인 구인구직",
    description: job ? (job.summary || job.description || "").slice(0, 155) : "호주 한인 커뮤니티 구인구직 게시판",
    canonical: job ? `https://hojujobs.lovable.app/job/${job.id}` : undefined,
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
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6 space-y-4">
          <Link to="/">
            <img src={hojuJobsLogo} alt="Hoju Jobs" className="h-8 hover:opacity-80 transition-opacity" />
          </Link>
          <button onClick={() => window.history.length > 1 ? window.history.back() : window.location.assign("/")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            목록으로 돌아가기
          </button>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">{job.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Building2 className="h-4 w-4 text-primary" />{job.company}</span>
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-accent" />{job.location.join(", ")}</span>
                <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-muted-foreground" />{job.industry}</span>
              </div>
            </div>
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap ${typeColor[job.type] || "bg-secondary text-secondary-foreground"}`}>
              {typeEmoji[job.type] || "💼"} {job.type}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />등록일: {formatDate(job.created_at)}</span>
            <span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" />조회 {viewCount}회</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {job.pay && (
              <div className="bg-emerald-50 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium mb-1"><DollarSign className="h-3.5 w-3.5" />급여</div>
                <p className="text-sm font-semibold text-emerald-800">{job.pay}</p>
              </div>
            )}
            {job.hours && (
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium mb-1"><Clock className="h-3.5 w-3.5" />근무시간</div>
                <p className="text-sm font-semibold text-blue-800">{job.hours}</p>
              </div>
            )}
            <div className="bg-violet-50 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-xs text-violet-600 font-medium mb-1"><MapPin className="h-3.5 w-3.5" />지역</div>
              <p className="text-sm font-semibold text-violet-800">{job.location.join(", ")}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h2 className="text-lg font-bold text-foreground mb-4">상세 내용</h2>
          <div className="text-sm text-foreground/80 whitespace-pre-line leading-relaxed">{job.description || job.summary}</div>
        </div>

        {job.requirements && job.requirements.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h2 className="text-lg font-bold text-foreground mb-4">지원 조건</h2>
            <ul className="space-y-2.5">
              {job.requirements.map((req: string, i: number) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/80">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  {req}
                </li>
              ))}
            </ul>
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
        {/* Map Section */}
        {job.location.length > 0 && (
          <div className="bg-card border border-border rounded-xl overflow-hidden mb-6">
            <h2 className="text-lg font-bold text-foreground px-6 pt-6 pb-3 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-accent" />
              위치
            </h2>
            {job.location.map((loc) => {
              const englishName = SUBURB_EN[loc] || loc;
              const mapsQuery = job.address 
                ? `${job.address}, Australia`
                : `${job.company}, ${englishName}, Australia`;
              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`;
              const embedQuery = job.address
                ? `${job.address}, Australia`
                : `${job.company}, ${englishName}, Australia`;
              const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(embedQuery)}&z=15&output=embed`;

              return (
                <div key={loc} className="px-6 pb-4">
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
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
