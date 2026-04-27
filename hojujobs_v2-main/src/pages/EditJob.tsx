import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LocationPicker } from "@/components/LocationPicker";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

export default function EditJob() {
  useSEO({ title: "공고 수정 | Hoju Jobs", description: "Hoju Jobs 공고 수정", noindex: true });
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const fromAdmin = new URLSearchParams(window.location.search).get("from") === "admin";
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "", industry: "", contact: "", email: "", kakaoid: "", google_search: "", description: "",
  });
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    fetchJob();
  }, [user, id]);

  const fetchJob = async () => {
    const { data: allJobs } = await supabase.from("jobs").select("location");
    if (allJobs) {
      setAvailableLocations([...new Set(allJobs.flatMap((j) => j.location ?? []))].sort());
    }

    let query = supabase
      .from("jobs")
      .select("id, title, location, industry, contact, email, kakaoid, google_search, description")
      .eq("id", Number(id));

    if (!isAdmin) {
      query = query.eq("user_id", user!.id);
    }

    const { data, error } = await query.single();

    if (error || !data) {
      toast.error("공고를 찾을 수 없습니다.");
      navigate("/my-posts");
      return;
    }

    setForm({
      title: data.title || "",
      industry: data.industry || "",
      contact: data.contact || "",
      email: data.email || "",
      kakaoid: data.kakaoid || "",
      google_search: data.google_search || "",
      description: data.description || "",
    });
    setSelectedLocations(Array.isArray(data.location) ? data.location : []);
    setLoading(false);
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    let updateQuery = supabase
      .from("jobs")
      .update({
        title: form.title,
        industry: form.industry,
        contact: form.contact || null,
        email: form.email || null,
        kakaoid: form.kakaoid || null,
        google_search: form.google_search || null,
        description: form.description || null,
        location: selectedLocations,
      })
      .eq("id", Number(id));

    if (!isAdmin) {
      updateQuery = updateQuery.eq("user_id", user!.id);
    }

    const { error } = await updateQuery;

    if (error) {
      toast.error("수정 실패: " + error.message);
    } else {
      toast.success("공고가 수정되었습니다!");
      navigate(fromAdmin ? "/admin" : "/my-posts");
    }
    setSaving(false);
  };

  if (!user) return null;
  if (loading) return <div className="flex w-full min-h-0 flex-1 items-center justify-center bg-background"><p className="text-muted-foreground">불러오는 중...</p></div>;

  return (
    <div className="flex w-full min-h-0 flex-1 flex-col bg-background">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to={fromAdmin ? "/admin" : "/my-posts"} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            {fromAdmin ? "관리자 대시보드로 돌아가기" : "내 공고로 돌아가기"}
          </Link>
        </div>

        <h2 className="text-xl font-bold text-foreground mb-6">공고 수정</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>제목 *</Label>
              <Input value={form.title} onChange={(e) => updateField("title", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>지역 *</Label>
              <LocationPicker
                availableLocations={availableLocations}
                selectedLocations={selectedLocations}
                onLocationsChange={setSelectedLocations}
              />
            </div>
            <div className="space-y-2">
              <Label>업종 *</Label>
              <Input value={form.industry} onChange={(e) => updateField("industry", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>연락처</Label>
              <Input value={form.contact} onChange={(e) => updateField("contact", e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>이메일</Label>
            <Input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>카카오톡 ID</Label>
            <Input value={form.kakaoid} onChange={(e) => updateField("kakaoid", e.target.value)} placeholder="예: kakao123" />
          </div>

          <div className="space-y-2">
            <Label>구글 지도 검색어</Label>
            <Input value={form.google_search} onChange={(e) => updateField("google_search", e.target.value)} placeholder="예: 이스트우드 카페, Eastwood NSW" />
            <p className="text-xs text-muted-foreground">공고 상세페이지에 지도가 자동으로 표시됩니다</p>
          </div>

          <div className="space-y-2">
            <Label>상세 내용</Label>
            <Textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} rows={6} />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={saving}>
            {saving ? "수정 중..." : "공고 수정하기"}
          </Button>
        </form>
      </div>
    </div>
  );
}
