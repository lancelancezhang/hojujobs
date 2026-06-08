import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, ImagePlus, X } from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { LocationPicker } from "@/components/LocationPicker";
import { REGION_GROUPS } from "@/data/regionMap";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/trackEvent";

const MAX_PHOTOS = 10;
const STORAGE_BUCKET = "realestate-photos";
const STATE_OPTIONS = ["NSW", "VIC", "QLD", "SA", "WA", "ACT", "TAS"];

type GenderRestriction = "none" | "female_only" | "male_only";

interface FormState {
  title: string;
  description: string;
  price: string;
  state_location: string;
  private_room: boolean;
  private_bathroom: boolean;
  gender_restriction: GenderRestriction;
  contact_number: string;
  enquiry_email: string;
  kakaoid: string;
}

const INITIAL_FORM: FormState = {
  title: "",
  description: "",
  price: "",
  state_location: "NSW",
  private_room: false,
  private_bathroom: false,
  gender_restriction: "none",
  contact_number: "",
  enquiry_email: "",
  kakaoid: "",
};

function ToggleButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-9 rounded-md border px-3 text-xs font-bold transition-colors",
        active ? "border-primary bg-primary text-primary-foreground" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      )}
    >
      {children}
    </button>
  );
}

export default function FlatmatesPost() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user === null) {
      navigate("/auth?next=/flatmates/post");
    }
  }, [user, navigate]);

  useEffect(() => {
    trackEvent("rental_post_started");
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [suburbSelection, setSuburbSelection] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allSuburbs = useMemo(() => REGION_GROUPS.flatMap((g) => g.suburbs), []);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Single-select: keep only the most recently added suburb
  const handleSuburbChange = (locs: string[]) => {
    const newLoc = locs.find((l) => !suburbSelection.includes(l));
    setSuburbSelection(newLoc ? [newLoc] : []);
  };

  const handlePhotos = (files: FileList | null) => {
    if (!files) return;
    const remaining = MAX_PHOTOS - photoFiles.length;
    const newFiles = Array.from(files).slice(0, remaining);
    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
    setPhotoFiles((prev) => [...prev, ...newFiles]);
    setPhotoPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(photoPreviews[index]);
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const hasContact = form.contact_number.trim() || form.enquiry_email.trim() || form.kakaoid.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (!form.title.trim()) { setError("제목을 입력해주세요."); return; }
    if (!suburbSelection[0]) { setError("지역 (Suburb)을 선택해주세요."); return; }
    if (!hasContact) { setError("전화번호, 이메일, 카카오톡 ID 중 하나 이상 입력해주세요."); return; }

    setSubmitting(true);
    setError(null);

    try {
      const uploadedUrls: string[] = [];
      for (const file of photoFiles) {
        const ext = file.name.split(".").pop();
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(path, file, { cacheControl: "3600", upsert: false });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
        uploadedUrls.push(urlData.publicUrl);
      }

      const { error: insertError } = await supabase
        .from("hojunara_realestate_share")
        .insert({
          title: form.title.trim(),
          description: form.description.trim() || null,
          price: form.price ? Number(form.price) : null,
          suburb: suburbSelection[0],
          state_location: form.state_location,
          private_room: form.private_room,
          private_bathroom: form.private_bathroom,
          gender_restriction: form.gender_restriction,
          contact_number: form.contact_number.trim() || null,
          enquiry_email: form.enquiry_email.trim() || null,
          kakaoid: form.kakaoid.trim() || null,
          post_photo: uploadedUrls.length > 0 ? uploadedUrls : null,
          image_url: uploadedUrls[0] ?? null,
          uploaded_at: new Date().toISOString(),
          time_posted: new Date().toISOString(),
          user_id: user!.id,
        });

      if (insertError) throw insertError;
      trackEvent("rental_post_submitted", {
        listing_type: "rental",
        metadata: { suburb: suburbSelection[0] ?? undefined },
      });
      navigate("/flatmates");
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "등록 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex w-full min-h-0 flex-1 flex-col bg-[#f7f8fb]">
      <Header />

      <main className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-8">
        <div className="mb-5">
          <button
            type="button"
            onClick={() => navigate("/flatmates")}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            플렛메이트 목록
          </button>
        </div>

        <h1 className="mb-6 text-2xl font-black text-slate-950">렌트 등록</h1>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Photos */}
          <section className="rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-bold text-slate-950">사진 <span className="font-normal text-slate-500">(최대 {MAX_PHOTOS}장)</span></h2>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {photoPreviews.map((src, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-lg border bg-slate-100">
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {photoFiles.length < MAX_PHOTOS && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 text-slate-400 hover:border-primary hover:text-primary transition-colors"
                >
                  <ImagePlus className="h-5 w-5" />
                  <span className="text-[10px] font-bold">사진 추가</span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handlePhotos(e.target.files)}
            />
          </section>

          {/* Basic info */}
          <section className="rounded-xl border bg-white p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-950">기본 정보</h2>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-slate-700">제목 <span className="text-red-500">*</span></span>
              <Input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="예: 스트라스필드 역 근처 여성 전용 독방"
                maxLength={120}
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="mb-1.5 block text-xs font-bold text-slate-700">지역 (Suburb) <span className="text-red-500">*</span></span>
                <LocationPicker
                  availableLocations={allSuburbs}
                  selectedLocations={suburbSelection}
                  onLocationsChange={handleSuburbChange}
                  allowCustom={true}
                />
              </div>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-slate-700">주 (State)</span>
                <select
                  value={form.state_location}
                  onChange={(e) => set("state_location", e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  {STATE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-slate-700">주 렌트 ($)</span>
              <Input
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder="예: 300"
              />
            </label>
          </section>

          {/* Room details */}
          <section className="rounded-xl border bg-white p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-950">방 조건</h2>

            <div>
              <span className="mb-2 block text-xs font-bold text-slate-700">독방 여부</span>
              <div className="flex gap-2">
                <ToggleButton active={form.private_room} onClick={() => set("private_room", true)}>독방</ToggleButton>
                <ToggleButton active={!form.private_room} onClick={() => set("private_room", false)}>쉐어룸</ToggleButton>
              </div>
            </div>

            <div>
              <span className="mb-2 block text-xs font-bold text-slate-700">개인 화장실</span>
              <div className="flex gap-2">
                <ToggleButton active={!form.private_bathroom} onClick={() => set("private_bathroom", false)}>없음</ToggleButton>
                <ToggleButton active={form.private_bathroom} onClick={() => set("private_bathroom", true)}>있음</ToggleButton>
              </div>
            </div>

            <div>
              <span className="mb-2 block text-xs font-bold text-slate-700">성별 조건</span>
              <div className="flex gap-2">
                <ToggleButton active={form.gender_restriction === "none"} onClick={() => set("gender_restriction", "none")}>없음</ToggleButton>
                <ToggleButton active={form.gender_restriction === "female_only"} onClick={() => set("gender_restriction", "female_only")}>여성전용</ToggleButton>
                <ToggleButton active={form.gender_restriction === "male_only"} onClick={() => set("gender_restriction", "male_only")}>남성전용</ToggleButton>
              </div>
            </div>
          </section>

          {/* Description */}
          <section className="rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-bold text-slate-950">상세 내용</h2>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="렌트에 대한 상세 정보를 입력해주세요."
              rows={6}
              className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </section>

          {/* Contact */}
          <section className="rounded-xl border bg-white p-5 shadow-sm space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-950">연락처</h2>
              <p className="mt-0.5 text-xs text-slate-500">전화번호, 이메일, 카카오톡 ID 중 하나 이상 입력해주세요.</p>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-slate-700">전화번호</span>
              <Input
                type="tel"
                value={form.contact_number}
                onChange={(e) => set("contact_number", e.target.value)}
                placeholder="예: 0412 345 678"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-slate-700">이메일</span>
              <Input
                type="email"
                value={form.enquiry_email}
                onChange={(e) => set("enquiry_email", e.target.value)}
                placeholder="예: example@email.com"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-slate-700">카카오톡 ID</span>
              <Input
                value={form.kakaoid}
                onChange={(e) => set("kakaoid", e.target.value)}
                placeholder="예: kakao123"
              />
            </label>

            {attempted && !hasContact && (
              <p className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs font-medium text-amber-700">
                연락처를 하나 이상 입력해야 렌트을 등록할 수 있습니다.
              </p>
            )}
          </section>

          {error && (
            <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" disabled={submitting} className="w-full" size="lg">
            {submitting ? "등록 중..." : "렌트 등록하기"}
          </Button>
        </form>
      </main>
    </div>
  );
}
