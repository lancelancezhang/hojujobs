import { useState, useEffect } from "react";
import hojuJobsLogo from "@/assets/hoju-jobs-logo.png";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LocationPicker } from "@/components/LocationPicker";
import { toast } from "sonner";
import { ArrowLeft, Plus, X } from "lucide-react";

const JOB_TYPES = ["풀타임", "파트타임", "컨트랙", "캐주얼", "리모트"];

export default function EditJob() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const fromAdmin = new URLSearchParams(window.location.search).get("from") === "admin";
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "", company: "", industry: "", type: "풀타임",
    summary: "", pay: "", hours: "", contact: "", email: "", address: "", description: "",
  });
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [requirements, setRequirements] = useState<string[]>([""]);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    fetchJob();
  }, [user, id]);

  const fetchJob = async () => {
    // Fetch available locations
    const { data: allJobs } = await supabase.from("jobs").select("location");
    if (allJobs) {
      setAvailableLocations([...new Set(allJobs.flatMap((j) => j.location))].sort());
    }

    let query = supabase
      .from("jobs")
      .select("*")
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
      title: data.title || "", company: data.company || "",
      industry: data.industry || "", type: data.type || "풀타임", summary: data.summary || "",
      pay: data.pay || "", hours: data.hours || "", contact: data.contact || "",
      email: data.email || "", address: data.address || "", description: data.description || "",
    });
    setSelectedLocations(Array.isArray(data.location) ? data.location : [data.location || ""]);
    setRequirements(data.requirements?.length ? data.requirements : [""]);
    setLoading(false);
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addRequirement = () => setRequirements((prev) => [...prev, ""]);
  const removeRequirement = (i: number) => setRequirements((prev) => prev.filter((_, idx) => idx !== i));
  const updateRequirement = (i: number, val: string) => {
    setRequirements((prev) => prev.map((r, idx) => (idx === i ? val : r)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const filteredReqs = requirements.filter((r) => r.trim());

    let updateQuery = supabase
      .from("jobs")
      .update({ ...form, location: selectedLocations, requirements: filteredReqs })
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
  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">불러오는 중...</p></div>;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6 space-y-4">
          <Link to="/">
            <img src={hojuJobsLogo} alt="Hoju Jobs" className="h-8 hover:opacity-80 transition-opacity" />
          </Link>
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
              <Label>회사명 *</Label>
              <Input value={form.company} onChange={(e) => updateField("company", e.target.value)} required />
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
              <Label>근무타입 *</Label>
              <Select value={form.type} onValueChange={(v) => updateField("type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>급여</Label>
              <Input value={form.pay} onChange={(e) => updateField("pay", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>근무시간</Label>
              <Input value={form.hours} onChange={(e) => updateField("hours", e.target.value)} />
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
            <Label>주소</Label>
            <Input value={form.address} onChange={(e) => updateField("address", e.target.value)} placeholder="예: 123 Main St, Chatswood NSW 2067" />
            <p className="text-xs text-muted-foreground">공고 상세페이지에 지도가 자동으로 표시됩니다</p>
          </div>

          <div className="space-y-2">
            <Label>요약 *</Label>
            <Input value={form.summary} onChange={(e) => updateField("summary", e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label>상세 내용</Label>
            <Textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} rows={6} />
          </div>

          <div className="space-y-2">
            <Label>지원 조건</Label>
            {requirements.map((req, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input value={req} onChange={(e) => updateRequirement(i, e.target.value)} />
                {requirements.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeRequirement(i)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addRequirement}>
              <Plus className="h-3.5 w-3.5 mr-1" /> 조건 추가
            </Button>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={saving}>
            {saving ? "수정 중..." : "공고 수정하기"}
          </Button>
        </form>
      </div>
    </div>
  );
}
