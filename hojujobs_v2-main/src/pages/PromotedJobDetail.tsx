import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { ArrowLeft, MapPin, Briefcase, Phone, Mail, Calendar, Eye, Sparkles } from "lucide-react";
import { PROMOTED_JOBS, incrementPromotedViewCount } from "@/data/promotedJobs";
import { SUBURB_EN } from "@/data/regionMap";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default function PromotedJobDetail() {
  const { id } = useParams();
  const job = PROMOTED_JOBS.find((j) => j.id === id);
  const [viewCount, setViewCount] = useState(0);

  useEffect(() => {
    if (id) setViewCount(incrementPromotedViewCount(id));
  }, [id]);

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
          <button
            onClick={() => window.history.length > 1 ? window.history.back() : window.location.assign("/")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            목록으로 돌아가기
          </button>
        </div>

        <div className="bg-amber-50 border border-amber-300 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-100 border border-amber-200 rounded px-1.5 py-0.5">
              <Sparkles className="h-2.5 w-2.5" />
              추천
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">{job.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
            {job.location.length > 0 && (
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-accent" />{job.location.join(", ")}</span>
            )}
            {job.industry && (
              <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-muted-foreground" />{job.industry}</span>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />등록일: {formatDate(job.time_posted)}</span>
            <span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" />조회 {viewCount}회</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h2 className="text-lg font-bold text-foreground mb-4">상세 내용</h2>
          <div className="text-sm text-foreground/80 whitespace-pre-line leading-relaxed">{job.description}</div>
        </div>

        {(job.contact || job.email) && (
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h2 className="text-lg font-bold text-foreground mb-4">연락처</h2>
            <div className="space-y-3">
              {job.contact && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Phone className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-foreground">{job.contact}</span>
                </div>
              )}
              {job.email && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Mail className="h-4 w-4 text-primary shrink-0" />
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
              const query = SUBURB_EN[loc] ? `${SUBURB_EN[loc]}, Australia` : `${loc}, Australia`;
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
