import { useState, useEffect, useMemo } from "react";
import hojuJobsLogo from "@/assets/hoju-jobs-logo.png";
import { useNavigate, Link } from "react-router-dom";
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

export default function PostJob() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    company: "",
    industry: "",
    customIndustry: "",
    type: "풀타임",
    pay: "",
    hours: "",
    contact: "",
    email: "",
    address: "",
    description: "",
  });
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [requirements, setRequirements] = useState<string[]>([""]);
  const [existingJobs, setExistingJobs] = useState<{ location: string[]; industry: string }[]>([]);

  useEffect(() => {
    async function fetchOptions() {
      const { data } = await supabase
        .from("jobs")
        .select("location, industry");
      if (data) setExistingJobs(data);
    }
    fetchOptions();
  }, []);

  const locations = useMemo(() => [...new Set(existingJobs.flatMap((j) => j.location))].sort(), [existingJobs]);
  const industries = useMemo(() => [...new Set(existingJobs.map((j) => j.industry))].sort(), [existingJobs]);

  if (!user) {
    navigate("/auth");
    return null;
  }

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
    setLoading(true);

    const finalIndustry = form.industry === "__custom" ? form.customIndustry : form.industry;

    if (selectedLocations.length === 0 || !finalIndustry) {
      toast.error("지역과 업종을 선택해주세요.");
      setLoading(false);
      return;
    }

    const filteredReqs = requirements.filter((r) => r.trim());
    const summary = form.description?.slice(0, 100) || form.title;

    const { error } = await supabase.from("jobs").insert({
      title: form.title,
      company: form.company,
      location: selectedLocations,
      industry: finalIndustry,
      type: form.type,
      pay: form.pay,
      hours: form.hours,
      contact: form.contact,
      email: form.email,
      address: form.address || null,
      description: form.description,
      summary,
      requirements: filteredReqs,
      user_id: user.id,
    });

    if (error) {
      toast.error("공고 등록 실패: " + error.message);
    } else {
      toast.success("공고가 등록되었습니다!");
      navigate("/my-posts");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6 space-y-4">
          <Link to="/">
            <img src={hojuJobsLogo} alt="Hoju Jobs" className="h-8 hover:opacity-80 transition-opacity" />
          </Link>
          <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            홈으로
          </Link>
        </div>

        <h2 className="text-xl font-bold text-foreground mb-6">새 공고 등록</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>제목 *</Label>
              <Input value={form.title} onChange={(e) => updateField("title", e.target.value)} required placeholder="예: 주방 보조" />
            </div>
            <div className="space-y-2">
              <Label>회사명 *</Label>
              <Input value={form.company} onChange={(e) => updateField("company", e.target.value)} required placeholder="예: 이스트우드 식당" />
            </div>
            <div className="space-y-2">
              <Label>지역 *</Label>
              <LocationPicker
                availableLocations={locations}
                selectedLocations={selectedLocations}
                onLocationsChange={setSelectedLocations}
              />
            </div>
            <div className="space-y-2">
              <Label>업종 *</Label>
              <Select value={form.industry} onValueChange={(v) => updateField("industry", v)}>
                <SelectTrigger><SelectValue placeholder="업종 선택" /></SelectTrigger>
                <SelectContent>
                  {industries.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                  <SelectItem value="__custom">직접 입력</SelectItem>
                </SelectContent>
              </Select>
              {form.industry === "__custom" && (
                <Input value={form.customIndustry} onChange={(e) => updateField("customIndustry", e.target.value)} placeholder="예: 요식업" className="mt-2" />
              )}
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
              <Input value={form.pay} onChange={(e) => updateField("pay", e.target.value)} placeholder="예: 시급 $25" />
            </div>
            <div className="space-y-2">
              <Label>근무시간</Label>
              <Input value={form.hours} onChange={(e) => updateField("hours", e.target.value)} placeholder="예: 월~금 9:00AM-5:00PM" />
            </div>
            <div className="space-y-2">
              <Label>연락처</Label>
              <Input value={form.contact} onChange={(e) => updateField("contact", e.target.value)} placeholder="예: 0412 345 678" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>이메일</Label>
            <Input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} placeholder="예: jobs@example.com" />
          </div>

          <div className="space-y-2">
            <Label>주소</Label>
            <Input value={form.address} onChange={(e) => updateField("address", e.target.value)} placeholder="예: 123 Main St, Chatswood NSW 2067" />
            <p className="text-xs text-muted-foreground">공고 상세페이지에 지도가 자동으로 표시됩니다</p>
          </div>

          <div className="space-y-2">
            <Label>상세 내용</Label>
            <Textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} placeholder="상세한 공고 내용을 입력해주세요" rows={6} />
          </div>

          <div className="space-y-2">
            <Label>지원 조건</Label>
            {requirements.map((req, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input value={req} onChange={(e) => updateRequirement(i, e.target.value)} placeholder="예: 경력 무관" />
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

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "등록 중..." : "공고 등록하기"}
          </Button>
        </form>
      </div>
    </div>
  );
}
