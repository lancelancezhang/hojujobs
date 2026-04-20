import React, { useState, useMemo, useEffect } from "react";
import { MapPin, ChevronDown, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { REGION_GROUPS, SUBURB_TO_REGION, SUBURB_EN } from "@/data/regionMap";

const STATE_LABELS: Record<string, string> = {
  NSW: "시드니 (NSW)",
  VIC: "멜버른 (VIC)",
  QLD: "브리즈번 (QLD)",
  SA: "애들레이드 (SA)",
  ACT: "캔버라 (ACT)",
};

const INLINE_STATES = ["NSW", "VIC", "QLD", "SA"];

interface MobileLocationFilterProps {
  locations: string[];
  selectedLocations: string[];
  onLocationsChange: (v: string[]) => void;
  locationCounts: Record<string, number>;
  cityFilter?: string;
}

export function MobileLocationFilter({
  locations, selectedLocations, onLocationsChange, locationCounts, cityFilter,
}: MobileLocationFilterProps) {
  const [open, setOpen] = useState(false);
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set());
  const [locationSearch, setLocationSearch] = useState("");
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [maxSheetHeight, setMaxSheetHeight] = useState("85dvh");

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      const offset = Math.max(0, window.innerHeight - vv.height - (vv.offsetTop || 0));
      setKeyboardOffset(offset);
      setMaxSheetHeight(`${Math.floor(vv.height * 0.9)}px`);
    };
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

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
      onLocationsChange([...new Set([...selectedLocations, ...suburbs])]);
    }
  };

  const label = selectedLocations.length === 0
    ? "전체 지역"
    : selectedLocations.length <= 2
      ? selectedLocations.join(", ")
      : `${selectedLocations.length}개 지역 선택`;

  const renderSuburbButton = (s: string) => (
    <button
      key={s}
      onClick={() => toggleLocation(s)}
      className={cn(
        "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
        selectedLocations.includes(s) ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground"
      )}
    >
      <Checkbox checked={selectedLocations.includes(s)} className="pointer-events-none h-4 w-4" tabIndex={-1} />
      <span className="truncate flex-1 text-left">{s}</span>
      <span className={cn("text-xs tabular-nums shrink-0", selectedLocations.includes(s) ? "text-primary" : "text-muted-foreground/60")}>
        {locationCounts[s] || 0}
      </span>
    </button>
  );

  const renderGroup = (group: typeof activeRegionGroups[number]) => {
    const isExpanded = expandedRegions.has(group.region) || !!locationSearch;
    const selectedInGroup = group.suburbs.filter((s) => selectedLocations.includes(s)).length;
    const allSelected = selectedInGroup === group.suburbs.length;
    const someSelected = selectedInGroup > 0;
    return (
      <div key={group.region}>
        <div className="flex items-center">
          <button
            onClick={() => toggleAllSuburbsInRegion(group.suburbs)}
            className={cn("flex items-center gap-2 py-2.5 pl-3 pr-1.5 transition-colors", someSelected ? "text-primary" : "text-muted-foreground")}
          >
            <Checkbox checked={allSelected ? true : someSelected ? "indeterminate" : false} className="pointer-events-none h-4 w-4" tabIndex={-1} />
          </button>
          <button
            onClick={() => toggleRegion(group.region)}
            className={cn("flex-1 flex items-center justify-between pr-3 py-2.5 text-sm transition-colors", someSelected ? "text-primary font-semibold" : "text-foreground")}
          >
            <span className="truncate text-left">{group.region}</span>
            <span className="flex items-center gap-1.5">
              <span className={cn("text-xs tabular-nums", someSelected ? "text-primary" : "text-muted-foreground/60")}>{group.count}</span>
              <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
            </span>
          </button>
        </div>
        {isExpanded && (
          <div className="ml-4 border-l border-border/50 pl-2 space-y-0">
            {group.suburbs.map(renderSuburbButton)}
          </div>
        )}
      </div>
    );
  };

  // Build list with city dividers (호주 전체 only) and inline fallbacks
  const listItems = useMemo(() => {
    const unmappedByState: Record<string, string[]> = {};
    const unmappedBottom: string[] = [];
    unmappedSuburbs.forEach((s) => {
      const en = SUBURB_EN[s] ?? "";
      const st = INLINE_STATES.find((x) => en.endsWith(` ${x}`));
      if (!cityFilter && st) {
        (unmappedByState[st] ??= []).push(s);
      } else {
        unmappedBottom.push(s);
      }
    });

    const items: React.ReactNode[] = [];

    if (!cityFilter) {
      let lastState: string | null = null;
      activeRegionGroups.forEach((group) => {
        if (group.state !== lastState) {
          if (lastState && unmappedByState[lastState]) {
            unmappedByState[lastState].forEach((l) => items.push(renderSuburbButton(l)));
          }
          lastState = group.state;
          items.push(
            <div key={`divider-${group.state}`} className="pt-3 pb-1 first:pt-0">
              <span className="block px-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
                {STATE_LABELS[group.state] ?? group.state}
              </span>
            </div>
          );
        }
        items.push(renderGroup(group));
      });
      if (lastState && unmappedByState[lastState]) {
        unmappedByState[lastState].forEach((l) => items.push(renderSuburbButton(l)));
      }
      INLINE_STATES.forEach((st) => {
        if (unmappedByState[st] && !activeRegionGroups.some((g) => g.state === st)) {
          items.push(
            <div key={`divider-${st}`} className="pt-3 pb-1">
              <span className="block px-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
                {STATE_LABELS[st] ?? st}
              </span>
            </div>
          );
          unmappedByState[st].forEach((l) => items.push(renderSuburbButton(l)));
        }
      });
    } else {
      activeRegionGroups.forEach((group) => items.push(renderGroup(group)));
    }

    unmappedBottom.forEach((l) => items.push(renderSuburbButton(l)));
    return items;
  }, [activeRegionGroups, unmappedSuburbs, cityFilter, selectedLocations, locationCounts, expandedRegions, locationSearch]);

  return (
    <Sheet open={open} onOpenChange={(o) => { setOpen(o); if (!o) setKeyboardOffset(0); }}>
      <SheetTrigger asChild>
        <button className={cn(
          "w-full flex items-center justify-between px-3 py-2 rounded-md border text-sm",
          selectedLocations.length > 0
            ? "border-primary/50 bg-primary/5 text-primary"
            : "border-input bg-background text-muted-foreground"
        )}>
          <span className="flex items-center gap-2 truncate">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {label}
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="flex flex-col rounded-t-2xl" style={{ maxHeight: maxSheetHeight, bottom: `${keyboardOffset}px` }} onOpenAutoFocus={(e) => e.preventDefault()}>
        <SheetHeader className="pb-2">
          <SheetTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-4 w-4 text-accent" />
            지역 선택
            {selectedLocations.length > 0 && (
              <span className="text-xs font-normal text-primary">({selectedLocations.length})</span>
            )}
          </SheetTitle>
          {selectedLocations.length > 0 && (
            <Button variant="outline" size="sm" className="text-xs text-muted-foreground h-7 px-3 w-fit" onClick={() => onLocationsChange([])}>
              초기화
            </Button>
          )}
        </SheetHeader>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="지역 검색..."
            value={locationSearch}
            onChange={(e) => setLocationSearch(e.target.value)}
            className="pl-9 pr-8 h-9 text-sm"
            autoFocus={false}
            tabIndex={-1}
          />
          {locationSearch && (
            <button onClick={() => setLocationSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="overflow-y-auto -mx-2 px-2 pb-4 space-y-0.5">
          {listItems}
        </div>

        <div className="pt-3 border-t border-border mt-auto">
          <Button className="w-full" size="lg" onClick={() => setOpen(false)}>
            {selectedLocations.length > 0 ? `${selectedLocations.length}개 지역 선택 완료` : "닫기"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
