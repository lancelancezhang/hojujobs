import React, { useState, useMemo } from "react";
import { MapPin, Store, RotateCcw, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { REGION_GROUPS, SUBURB_TO_REGION } from "@/data/regionMap";

const STATE_LABELS: Record<string, string> = {
  NSW: "시드니 (NSW)",
  VIC: "멜버른 (VIC)",
  QLD: "브리즈번 (QLD)",
  SA: "애들레이드 (SA)",
  ACT: "캔버라 (ACT)",
};

interface CategorySidebarProps {
  locations: string[];
  industries: string[];
  selectedLocations: string[];
  selectedIndustry: string;
  onLocationsChange: (v: string[]) => void;
  onIndustryChange: (v: string) => void;
  onReset: () => void;
  locationCounts: Record<string, number>;
  industryCounts: Record<string, number>;
  cityFilter?: string;
}

export function CategorySidebar({
  locations, industries, selectedLocations, selectedIndustry,
  onLocationsChange, onIndustryChange, onReset, locationCounts, industryCounts, cityFilter,
}: CategorySidebarProps) {
  const hasFilters = selectedLocations.length > 0 || selectedIndustry !== "all";
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
      .sort((a, b) => {
        if (!cityFilter) {
          const stateOrder = ["NSW", "VIC", "QLD", "SA", "ACT"];
          const stateDiff = stateOrder.indexOf(a.state) - stateOrder.indexOf(b.state);
          if (stateDiff !== 0) return stateDiff;
        }
        return b.count - a.count;
      });
  }, [locations, locationCounts, locationSearch, cityFilter]);

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
      {/* Reset - always takes space to prevent layout shift */}
      <button
        onClick={onReset}
        className={cn(
          "flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors h-5",
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
          {(() => {
            const items: React.ReactNode[] = [];
            let lastState: string | null = null;
            activeRegionGroups.forEach((group) => {
              if (!cityFilter && group.state !== lastState) {
                lastState = group.state;
                items.push(
                  <li key={`divider-${group.state}`} className="pt-2 pb-0.5 first:pt-0">
                    <span className="block px-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
                      {STATE_LABELS[group.state] ?? group.state}
                    </span>
                  </li>
                );
              }

              const isExpanded = expandedRegions.has(group.region) || !!locationSearch;
              const selectedInGroup = group.suburbs.filter((s) => selectedLocations.includes(s)).length;
              const allSelected = selectedInGroup === group.suburbs.length;
              const someSelected = selectedInGroup > 0;

              items.push(
                <li key={group.region}>
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
            });
            return items;
          })()}

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
