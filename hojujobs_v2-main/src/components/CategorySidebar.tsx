import { MapPin, Briefcase, Store, RotateCcw, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { REGION_GROUPS, SUBURB_TO_REGION } from "@/data/regionMap";
import { useState, useMemo } from "react";

interface CategorySidebarProps {
  locations: string[];
  jobTypes: string[];
  industries: string[];
  selectedLocations: string[];
  selectedType: string;
  selectedIndustry: string;
  onLocationsChange: (v: string[]) => void;
  onTypeChange: (v: string) => void;
  onIndustryChange: (v: string) => void;
  onReset: () => void;
  locationCounts: Record<string, number>;
  typeCounts: Record<string, number>;
  industryCounts: Record<string, number>;
}

const typeEmoji: Record<string, string> = {
  "풀타임": "💼",
  "파트타임": "🕒",
  "컨트랙": "📄",
  "캐주얼": "⚡",
  "리모트": "🌍",
};

export function CategorySidebar({
  locations, jobTypes, industries, selectedLocations, selectedType, selectedIndustry,
  onLocationsChange, onTypeChange, onIndustryChange, onReset, locationCounts, typeCounts, industryCounts,
}: CategorySidebarProps) {
  const hasFilters = selectedLocations.length > 0 || selectedType !== "all" || selectedIndustry !== "all";
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set());
  const [locationSearch, setLocationSearch] = useState("");

  // Build region groups that actually have listings
  const activeRegionGroups = useMemo(() => {
    const locationSet = new Set(locations);
    const search = locationSearch.toLowerCase();
    return REGION_GROUPS
      .map((g) => {
        const activeSuburbs = g.suburbs.filter((s) => locationSet.has(s) && (!search || s.toLowerCase().includes(search) || g.region.toLowerCase().includes(search)));
        const regionCount = activeSuburbs.reduce((sum, s) => sum + (locationCounts[s] || 0), 0);
        return { ...g, suburbs: activeSuburbs, count: regionCount };
      })
      .filter((g) => g.suburbs.length > 0)
      .sort((a, b) => b.count - a.count);
  }, [locations, locationCounts, locationSearch]);

  // Suburbs not mapped to any region
  const unmappedSuburbs = useMemo(() => {
    const search = locationSearch.toLowerCase();
    return locations.filter((l) => !SUBURB_TO_REGION[l] && (!search || l.toLowerCase().includes(search)));
  }, [locations, locationSearch]);

  const toggleRegion = (region: string) => {
    setExpandedRegions((prev) => {
      const next = new Set(prev);
      if (next.has(region)) next.delete(region);
      else next.add(region);
      return next;
    });
  };

  const toggleLocation = (loc: string) => {
    if (selectedLocations.includes(loc)) {
      onLocationsChange(selectedLocations.filter((l) => l !== loc));
    } else {
      onLocationsChange([...selectedLocations, loc]);
    }
  };

  const toggleAllSuburbsInRegion = (suburbs: string[]) => {
    const allSelected = suburbs.every((s) => selectedLocations.includes(s));
    if (allSelected) {
      onLocationsChange(selectedLocations.filter((l) => !suburbs.includes(l)));
    } else {
      const newSet = new Set([...selectedLocations, ...suburbs]);
      onLocationsChange([...newSet]);
    }
  };

  return (
    <aside className="space-y-6">
      {/* Reset */}
      <button
        onClick={onReset}
        className={cn(
          "flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors",
          !hasFilters && "invisible pointer-events-none"
        )}
      >
        <RotateCcw className="h-3.5 w-3.5" />
        필터 초기화
      </button>

      {/* Location - grouped by region */}
      <div>
        <h3 className="flex items-center gap-2 text-sm font-bold text-foreground mb-2">
          <MapPin className="h-4 w-4 text-accent" />
          지역
          {selectedLocations.length > 0 && (
            <span className="text-xs font-normal text-primary">({selectedLocations.length})</span>
          )}
        </h3>
        <div className="relative mb-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="지역 검색..."
            value={locationSearch}
            onChange={(e) => setLocationSearch(e.target.value)}
            className="pl-8 pr-7 h-8 text-xs"
          />
          {locationSearch && (
            <button
              onClick={() => setLocationSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <ul className="space-y-1">
          {activeRegionGroups.map((group) => {
            const isExpanded = expandedRegions.has(group.region) || !!locationSearch;
            const selectedInGroup = group.suburbs.filter((s) => selectedLocations.includes(s)).length;
            const allSelected = selectedInGroup === group.suburbs.length;
            const someSelected = selectedInGroup > 0;

            return (
              <li key={group.region}>
                {/* Region header */}
                <div className="flex items-center">
                  <button
                    onClick={() => toggleAllSuburbsInRegion(group.suburbs)}
                    className={cn(
                      "flex items-center gap-2 h-9 pl-3 pr-1.5 transition-colors",
                      someSelected ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Checkbox
                      checked={allSelected ? true : someSelected ? "indeterminate" : false}
                      className="pointer-events-none h-3.5 w-3.5"
                      tabIndex={-1}
                    />
                  </button>
                  <button
                    onClick={() => toggleRegion(group.region)}
                    className={cn(
                      "flex-1 flex items-center justify-between pr-3 h-9 rounded-r-lg text-sm transition-colors",
                      someSelected
                        ? "text-primary font-semibold"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    <span className="truncate text-left">{group.region}</span>
                    <span className="flex items-center gap-1">
                      <span className={cn(
                        "text-xs tabular-nums",
                        someSelected ? "text-primary" : "text-muted-foreground/60"
                      )}>{group.count}</span>
                      <ChevronDown className={cn(
                        "h-3.5 w-3.5 text-muted-foreground transition-transform",
                        isExpanded && "rotate-180"
                      )} />
                    </span>
                  </button>
                </div>

                {/* Suburb list (expanded) */}
                {isExpanded && (
                  <ul className="ml-3 border-l border-border/50 pl-1 space-y-0">
                    {group.suburbs.map((s) => (
                      <LocationCheckItem
                        key={s}
                        label={s}
                        count={locationCounts[s] || 0}
                        checked={selectedLocations.includes(s)}
                        onClick={() => toggleLocation(s)}
                      />
                    ))}
                  </ul>
                )}
              </li>
            );
          })}

          {/* Unmapped suburbs */}
          {unmappedSuburbs.map((l) => (
            <LocationCheckItem
              key={l}
              label={l}
              count={locationCounts[l] || 0}
              checked={selectedLocations.includes(l)}
              onClick={() => toggleLocation(l)}
            />
          ))}
        </ul>
      </div>

      {/* Industry */}
      <div>
        <h3 className="flex items-center gap-2 text-sm font-bold text-foreground mb-3">
          <Store className="h-4 w-4 text-accent" />
          업종
        </h3>
        <ul className="space-y-0.5">
          <SidebarItem
            label="전체 업종"
            count={Object.values(industryCounts).reduce((a, b) => a + b, 0)}
            active={selectedIndustry === "all"}
            onClick={() => onIndustryChange("all")}
          />
          {industries.map((i) => (
            <SidebarItem
              key={i}
              label={i}
              count={industryCounts[i] || 0}
              active={selectedIndustry === i}
              onClick={() => onIndustryChange(i)}
            />
          ))}
        </ul>
      </div>

      {/* Job Type */}
      <div>
        <h3 className="flex items-center gap-2 text-sm font-bold text-foreground mb-3">
          <Briefcase className="h-4 w-4 text-primary" />
          근무타입
        </h3>
        <ul className="space-y-0.5">
          <SidebarItem
            label="전체 타입"
            count={Object.values(typeCounts).reduce((a, b) => a + b, 0)}
            active={selectedType === "all"}
            onClick={() => onTypeChange("all")}
          />
          {jobTypes.map((t) => (
            <SidebarItem
              key={t}
              label={`${typeEmoji[t] || "💼"} ${t}`}
              count={typeCounts[t] || 0}
              active={selectedType === t}
              onClick={() => onTypeChange(t)}
            />
          ))}
        </ul>
      </div>
    </aside>
  );
}

function LocationCheckItem({ label, count, checked, onClick }: {
  label: string; count: number; checked: boolean; onClick: () => void;
}) {
  return (
    <li>
      <button
        onClick={onClick}
        className={cn(
          "w-full h-8 flex items-center gap-2.5 px-3 rounded-lg text-sm transition-colors",
          checked
            ? "bg-primary/10 text-primary font-semibold"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <Checkbox checked={checked} className="pointer-events-none h-3.5 w-3.5" tabIndex={-1} />
        <span className="truncate flex-1 text-left">{label}</span>
        <span className={cn(
          "text-xs tabular-nums shrink-0",
          checked ? "text-primary" : "text-muted-foreground/60"
        )}>{count}</span>
      </button>
    </li>
  );
}

function SidebarItem({ label, count, active, onClick }: {
  label: string; count: number; active: boolean; onClick: () => void;
}) {
  return (
    <li>
      <button
        onClick={onClick}
        className={cn(
          "w-full h-9 flex items-center justify-between px-3 rounded-lg text-sm transition-colors",
          active
            ? "bg-primary/10 text-primary font-semibold"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <span className="truncate">{label}</span>
        <span className={cn(
          "text-xs tabular-nums ml-2 shrink-0",
          active ? "text-primary" : "text-muted-foreground/60"
        )}>{count}</span>
      </button>
    </li>
  );
}
