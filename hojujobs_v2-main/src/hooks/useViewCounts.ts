import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export async function incrementViewCount(jobId: number): Promise<number> {
  const { data, error } = await supabase.rpc("increment_view_count", {
    p_job_id: jobId,
  });
  if (error) {
    console.error("Error incrementing view count:", error);
    return 0;
  }
  return data as number;
}

export async function fetchAllViewCounts(): Promise<Record<number, number>> {
  const { data, error } = await supabase
    .from("view_counts")
    .select("job_id, count");
  if (error) {
    console.error("Error fetching view counts:", error);
    return {};
  }
  const counts: Record<number, number> = {};
  data?.forEach((row) => {
    counts[row.job_id] = row.count;
  });
  return counts;
}

export function useViewCounts() {
  const [counts, setCounts] = useState<Record<number, number>>({});

  useEffect(() => {
    fetchAllViewCounts().then(setCounts);

    const channel = supabase
      .channel('view_counts_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'view_counts' },
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
