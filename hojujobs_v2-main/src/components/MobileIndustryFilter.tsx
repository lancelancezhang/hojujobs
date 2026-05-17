import { useMemo, useState } from "react";
import { Briefcase, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface MobileIndustryFilterProps {
  industries: string[];
  selectedIndustry: string;
  onIndustryChange: (v: string) => void;
  industryCounts: Record<string, number>;
}

export function MobileIndustryFilter({
  industries,
  selectedIndustry,
  onIndustryChange,
  industryCounts,
}: MobileIndustryFilterProps) {
  const [open, setOpen] = useState(false);

  const totalCount = useMemo(
    () => Object.values(industryCounts).reduce((a, b) => a + b, 0),
    [industryCounts]
  );

  const label = selectedIndustry === "all" ? "전체 업종" : selectedIndustry;

  const selectIndustry = (value: string) => {
    onIndustryChange(value);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className={cn(
            "w-full flex items-center justify-between px-3 py-2 rounded-md border text-sm",
            selectedIndustry !== "all"
              ? "border-primary/50 bg-primary/5 text-primary"
              : "border-input bg-muted/40 text-muted-foreground"
          )}
        >
          <span className="flex items-center gap-2 truncate">
            <Briefcase className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{label}</span>
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
        </button>
      </SheetTrigger>

      <SheetContent side="bottom" className="flex max-h-[85dvh] flex-col rounded-t-2xl" onOpenAutoFocus={(e) => e.preventDefault()}>
        <SheetHeader className="pb-2">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Briefcase className="h-4 w-4 text-accent" />
            업종 선택
          </SheetTitle>
        </SheetHeader>

        <div className="overflow-y-auto -mx-2 px-2 pb-4 space-y-0.5">
          <IndustryOption
            label="전체 업종"
            count={totalCount}
            active={selectedIndustry === "all"}
            onClick={() => selectIndustry("all")}
          />
          {industries.map((industry) => (
            <IndustryOption
              key={industry}
              label={industry}
              count={industryCounts[industry] || 0}
              active={selectedIndustry === industry}
              onClick={() => selectIndustry(industry)}
            />
          ))}
        </div>

        <div className="pt-3 border-t border-border mt-auto">
          <Button className="w-full" size="lg" onClick={() => setOpen(false)}>
            닫기
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function IndustryOption({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors",
        active ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground"
      )}
    >
      <span className="flex h-4 w-4 shrink-0 items-center justify-center">
        {active && <Check className="h-4 w-4" />}
      </span>
      <span className="truncate flex-1 text-left">{label}</span>
      <span className={cn("text-xs tabular-nums shrink-0", active ? "text-primary" : "text-muted-foreground/60")}>
        {count}
      </span>
    </button>
  );
}
