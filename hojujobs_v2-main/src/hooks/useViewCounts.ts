import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export async function incrementViewCount(jobId: number): Promise<number> {
  // Read current count
  const { data: existing, error: readError } = await supabase
    .from("view_counts")
    .select("count")
    .eq("job_id", jobId)
    .maybeSingle();

  if (readError) {
    console.error("Error reading view count:", readError);
    return 0;
  }

  const newCount = (existing?.count ?? 0) + 1;

  const { error: writeError } = await supabase
    .from("view_counts")
    .upsert(
      { job_id: jobId, count: newCount, updated_at: new Date().toISOString() },
      { onConflict: "job_id" }
    );

  if (writeError) {
    console.error("Error writing view count:", writeError);
    return existing?.count ?? 0;
  }

  return newCount;
}

export async function fetchAllViewCounts(): Promise<Record<number, number>> {
  const PAGE = 1000;
  const counts: Record<number, number> = {};
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from("view_counts")
      .select("job_id, count")
      .range(from, from + PAGE - 1);
    if (error) {
      console.error("Error fetching view counts:", error);
      break;
    }
    if (!data || data.length === 0) break;
    data.forEach((row) => {
      counts[row.job_id] = row.count;
    });
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return counts;
}

export function useViewCounts() {
  const [counts, setCounts] = useState<Record<number, number>>({});

  useEffect(() => {
    fetchAllViewCounts().then(setCounts);

    const channel = supabase
      .channel("view_counts_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "view_counts" },
        (payload) => {
          const row = payload.new as { job_id: number; count: number };
          if (row?.job_id != null) {
            setCounts((prev) => ({ ...prev, [row.job_id]: row.count }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const increment = useCallback(async (jobId: number) => {
    const newCount = await incrementViewCount(jobId);
    setCounts((prev) => ({ ...prev, [jobId]: newCount }));
    return newCount;
  }, []);

  const getCount = useCallback(
    (jobId: number) => counts[jobId] || 0,
    [counts]
  );

  return { counts, increment, getCount };
}
