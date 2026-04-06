import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string[];
  industry: string;
  type: string;
  summary: string;
  pay: string | null;
  requirements: string[] | null;
  hours: string | null;
  contact: string | null;
  email: string | null;
  description: string | null;
  address: string | null;
  created_at: string;
}

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("uploaded_at", { ascending: false });

      if (error) {
        console.error("Error fetching jobs:", error);
      } else {
        setJobs((data as Job[]) || []);
      }
      setLoading(false);
    }
    fetchJobs();
  }, []);

  return { jobs, loading };
}

export async function fetchJobById(id: number): Promise<Job | null> {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching job:", error);
    return null;
  }
  return data as Job;
}
