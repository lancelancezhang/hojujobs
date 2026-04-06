import { useState, useMemo } from "react";
import { MapPin, ChevronDown, Search, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { REGION_GROUPS, SUBURB_TO_REGION } from "@/data/regionMap";

interface LocationPickerProps {
  /** All available location strings */
  availableLocations: string[];
  /** Currently selected locations */
  selectedLocations: string[];
  onLocationsChange: (locations: string[]) => void;
  /** Allow typing a custom location */
  allowCustom?: boolean;
}

export function LocationPicker({
  availableLocations,
  selectedLocations,
  onLocationsChange,
  allowCustom = true,
}: LocationPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set());

  const activeRegionGroups = useMemo(() => {
    const locSet = new Set(availableLocations);
    const q = search.toLowerCase();
    return REGION_GROUPS.map((g) => {
      const subs = g.suburbs.filter(
        (s) => locSet.has(s) && (!q || s.toLowerCase().includes(q) || g.region.toLowerCase().includes(q))
      );
      return { ...g, suburbs: subs };
    }).filter((g) => g.suburbs.length > 0);
  }, [availableLocations, search]);

  const unmapped = useMemo(() => {
    const q = search.toLowerCase();
    return availableLocations.filter(
      (l) => !SUBURB_TO_REGION[l] && (!q || l.toLowerCase().includes(q))
    );
  }, [availableLocations, search]);

  const toggleLocation = (loc: string) => {
    if (selectedLocations.includes(loc)) {
      onLocationsChange(selectedLocations.filter((l) => l !== loc));
    } else {
      onLocationsChange([...selectedLocations, loc]);
    }
  };

  const toggleRegion = (region: string) => {
    setExpandedRegions((prev) => {
      const next = new Set(prev);
      next.has(region) ? next.delete(region) : next.add(region);
      return next;
    });
  };

  const toggleAllInRegion = (suburbs: string[]) => {
    const allSelected = suburbs.every((s) => selectedLocations.includes(s));
    if (allSelected) {
      onLocationsChange(selectedLocations.filter((l) => !suburbs.includes(l)));
    } else {
      onLocationsChange([...new Set([...selectedLocations, ...suburbs])]);
    }
  };

  const addCustom = () => {
    const trimmed = customInput.trim();
    if (trimmed && !selectedLocations.includes(trimmed)) {
      onLocationsChange([...selectedLocations, trimmed]);
      setCustomInput("");
    }
  };

  const label =
    selectedLocations.length === 0
      ? "지역 선택"
      : selectedLocations.length <= 2
        ? selectedLocations.join(", ")
        : `${selectedLocations.length}개 지역 선택`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "w-full flex items-center justify-between px-3 py-2 rounded-md border text-sm h-10",
            selectedLocations.length > 0
              ? "border-primary/50 bg-primary/5 text-primary"
              : "border-input bg-background text-muted-foreground"
          )}
        >
          <span className="flex items-center gap-2 truncate">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {label}
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        {/* Search */}
        <div className="relative p-2 border-b border-border">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="지역 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-8 h-8 text-sm"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* List */}
        <div className="max-h-[280px] overflow-y-auto p-1">
          {activeRegionGroups.map((group) => {
            const isExpanded = expandedRegions.has(group.region) || !!search;
            const selectedCount = group.suburbs.filter((s) => selectedLocations.includes(s)).length;
            const allSelected = selectedCount === group.suburbs.length;
            const someSelected = selectedCount > 0;

            return (
              <div key={group.region}>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => toggleAllInRegion(group.suburbs)}
                    className={cn(
                      "flex items-center gap-1.5 py-1.5 pl-2 pr-1 transition-colors",
                      someSelected ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    <Checkbox
                      checked={allSelected ? true : someSelected ? "indeterminate" : false}
                      className="pointer-events-none h-3.5 w-3.5"
                      tabIndex={-1}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleRegion(group.region)}
                    className={cn(
                      "flex-1 flex items-center justify-between pr-2 py-1.5 text-sm transition-colors",
                      someSelected ? "text-primary font-semibold" : "text-foreground"
                    )}
                  >
                    <span className="truncate text-left">{group.region}</span>
                    <ChevronDown
                      className={cn(
                        "h-3 w-3 text-muted-foreground transition-transform",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </button>
                </div>
                {isExpanded && (
                  <div className="ml-4 border-l border-border/50 pl-1">
                    {group.suburbs.map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => toggleLocation(s)}
                        className={cn(
                          "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors",
                          selectedLocations.includes(s)
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:bg-muted"
                        )}
                      >
                        <Checkbox
                          checked={selectedLocations.includes(s)}
                          className="pointer-events-none h-3.5 w-3.5"
                          tabIndex={-1}
                        />
                        <span className="truncate text-left">{s}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {unmapped.map((l) => (
            <button
              type="button"
              key={l}
              onClick={() => toggleLocation(l)}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors",
                selectedLocations.includes(l)
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <Checkbox
                checked={selectedLocations.includes(l)}
                className="pointer-events-none h-3.5 w-3.5"
                tabIndex={-1}
              />
              <span className="truncate text-left">{l}</span>
            </button>
          ))}

          {activeRegionGroups.length === 0 && unmapped.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">검색 결과 없음</p>
          )}
        </div>

        {/* Custom input */}
        {allowCustom && (
          <div className="border-t border-border p-2 flex gap-1.5">
            <Input
              placeholder="직접 입력..."
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }}
              className="h-8 text-sm flex-1"
            />
            <button
              type="button"
              onClick={addCustom}
              disabled={!customInput.trim()}
              className="px-2 h-8 rounded-md bg-primary text-primary-foreground text-xs font-medium disabled:opacity-40 hover:bg-primary/90 transition-colors"
            >
              추가
            </button>
          </div>
        )}

        {/* Selected tags */}
        {selectedLocations.length > 0 && (
          <div className="border-t border-border p-2 flex flex-wrap gap-1">
            {selectedLocations.map((loc) => (
              <span
                key={loc}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium"
              >
                {loc}
                <button type="button" onClick={() => toggleLocation(loc)} className="hover:text-primary/70">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
