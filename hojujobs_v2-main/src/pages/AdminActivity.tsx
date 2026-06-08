import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";
import { cn } from "@/lib/utils";

interface UserActivityRow {
  user_id: string;
  email: string | null;
  display_name: string | null;
  country: string | null;
  total_events: number;
  job_views: number;
  rental_views: number;
  sale_views: number;
  flatmates_page_views: number;
  sales_page_views: number;
  news_page_views: number;
  dashboard_page_views: number;
  phone_clicks: number;
  email_clicks: number;
  kakao_clicks: number;
  total_contact_clicks: number;
  contact_text_selections: number;
  job_posts_started: number;
  job_posts_submitted: number;
  rental_posts_started: number;
  rental_posts_submitted: number;
  searches_performed: number;
  filters_changed: number;
  first_activity: string | null;
  last_activity: string | null;
}

function countryFlag(code: string | null): string {
  if (!code || code.length !== 2) return "";
  return [...code.toUpperCase()].map((c) => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0))).join("");
}

function Stat({ value, color }: { value: number; color: string }) {
  if (!value) return <span className="text-muted-foreground">—</span>;
  return (
    <span className={cn("inline-flex items-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold", color)}>
      {value}
    </span>
  );
}

function formatRelative(iso: string | null) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Intl.DateTimeFormat("en-AU", { month: "short", day: "numeric" }).format(new Date(iso));
}

export default function AdminActivity() {
  useSEO({ title: "User Activity | Admin", description: "User activity summary", noindex: true });
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<UserActivityRow[]>([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate("/");
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (!user || !isAdmin) return;
    fetchData();
  }, [user, isAdmin]);

  const fetchData = async () => {
    setFetching(true);
    const { data } = await supabase
      .from("user_activity_summary" as "jobs")
      .select("*")
      .order("last_activity", { ascending: false }) as unknown as { data: UserActivityRow[] | null };
    if (data) setRows(data);
    setFetching(false);
  };

  const filtered = rows.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (r.email ?? "").toLowerCase().includes(q) || (r.display_name ?? "").toLowerCase().includes(q);
  });

  const totalEvents = rows.reduce((s, r) => s + (r.total_events ?? 0), 0);

  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground text-sm">Loading...</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <Link to="/admin" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Admin
          </Link>
        </div>

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold text-foreground">
              <Users className="h-5 w-5 text-blue-500" />
              User Activity Summary
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              <span className="font-semibold text-foreground">{rows.length}</span> users ·{" "}
              <span className="font-semibold text-foreground">{totalEvents.toLocaleString()}</span> events
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search email or name"
              className="h-8 w-52 rounded-md border border-input bg-background px-3 text-xs outline-none focus:ring-2 focus:ring-ring"
            />
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={fetchData} disabled={fetching}>
              Refresh
            </Button>
          </div>
        </div>

        {fetching ? (
          <div className="py-20 text-center text-sm text-muted-foreground">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border bg-card px-4 py-16 text-center text-sm text-muted-foreground">
            {search ? "No results found." : "No activity data yet."}
          </div>
        ) : (
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-[11px]">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr className="border-b">
                  <th className="px-3 py-2 text-left font-semibold" rowSpan={2}>User</th>
                  <th className="px-2 py-2 text-center font-semibold" rowSpan={2}>Total</th>
                  <th className="px-2 py-1.5 text-center font-semibold border-l" colSpan={3}>Listing Views</th>
                  <th className="px-2 py-1.5 text-center font-semibold border-l" colSpan={4}>Page Visits</th>
                  <th className="px-2 py-1.5 text-center font-semibold border-l" colSpan={2}>Contact</th>
                  <th className="px-2 py-1.5 text-center font-semibold border-l" colSpan={3}>Posts</th>
                  <th className="px-2 py-1.5 text-center font-semibold border-l" rowSpan={2}>Search &amp;<br/>Filter</th>
                  <th className="px-3 py-1.5 text-right font-semibold border-l" rowSpan={2}>Last Active</th>
                </tr>
                <tr className="border-b text-[10px]">
                  <th className="px-2 pb-1.5 text-center border-l text-muted-foreground/80">Jobs</th>
                  <th className="px-2 pb-1.5 text-center text-muted-foreground/80">Rentals</th>
                  <th className="px-2 pb-1.5 text-center text-muted-foreground/80">Deals</th>
                  <th className="px-2 pb-1.5 text-center border-l text-muted-foreground/80">Flatmates</th>
                  <th className="px-2 pb-1.5 text-center text-muted-foreground/80">On Sale</th>
                  <th className="px-2 pb-1.5 text-center text-muted-foreground/80">News</th>
                  <th className="px-2 pb-1.5 text-center text-muted-foreground/80">Dashboard</th>
                  <th className="px-2 pb-1.5 text-center border-l text-muted-foreground/80">Clicks</th>
                  <th className="px-2 pb-1.5 text-center text-muted-foreground/80">Text Sel.</th>
                  <th className="px-2 pb-1.5 text-center border-l text-muted-foreground/80">Started</th>
                  <th className="px-2 pb-1.5 text-center text-muted-foreground/80">Job</th>
                  <th className="px-2 pb-1.5 text-center text-muted-foreground/80">Rental</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((row) => {
                  const rowTotal =
                    (row.job_views ?? 0) + (row.rental_views ?? 0) + (row.sale_views ?? 0) +
                    (row.flatmates_page_views ?? 0) + (row.sales_page_views ?? 0) +
                    (row.news_page_views ?? 0) + (row.dashboard_page_views ?? 0) +
                    (row.total_contact_clicks ?? 0) + (row.contact_text_selections ?? 0) +
                    (row.job_posts_started ?? 0) + (row.job_posts_submitted ?? 0) +
                    (row.rental_posts_started ?? 0) + (row.rental_posts_submitted ?? 0) +
                    (row.searches_performed ?? 0) + (row.filters_changed ?? 0);
                  const searchFilter = (row.searches_performed ?? 0) + (row.filters_changed ?? 0);
                  const postStarts = (row.job_posts_started ?? 0) + (row.rental_posts_started ?? 0);

                  return (
                    <tr key={row.user_id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-3 py-2">
                        <p className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                          {countryFlag(row.country) && <span className="text-base leading-none">{countryFlag(row.country)}</span>}
                          {row.display_name ?? <span className="italic text-muted-foreground font-normal">No name</span>}
                        </p>
                        <p className="text-[11px] text-muted-foreground">{row.email ?? "—"}</p>
                      </td>
                      <td className="px-2 py-2 text-center"><Stat value={rowTotal} color="bg-slate-100 text-slate-700" /></td>
                      <td className="px-2 py-2 text-center border-l"><Stat value={row.job_views} color="bg-blue-50 text-blue-700" /></td>
                      <td className="px-2 py-2 text-center"><Stat value={row.rental_views} color="bg-rose-50 text-rose-700" /></td>
                      <td className="px-2 py-2 text-center"><Stat value={row.sale_views} color="bg-emerald-50 text-emerald-700" /></td>
                      <td className="px-2 py-2 text-center border-l"><Stat value={row.flatmates_page_views} color="bg-pink-50 text-pink-700" /></td>
                      <td className="px-2 py-2 text-center"><Stat value={row.sales_page_views} color="bg-teal-50 text-teal-700" /></td>
                      <td className="px-2 py-2 text-center"><Stat value={row.news_page_views} color="bg-indigo-50 text-indigo-700" /></td>
                      <td className="px-2 py-2 text-center"><Stat value={row.dashboard_page_views} color="bg-amber-50 text-amber-700" /></td>
                      <td className="px-2 py-2 text-center border-l"><Stat value={row.total_contact_clicks} color="bg-orange-50 text-orange-700" /></td>
                      <td className="px-2 py-2 text-center"><Stat value={row.contact_text_selections} color="bg-orange-50 text-orange-600" /></td>
                      <td className="px-2 py-2 text-center border-l"><Stat value={postStarts} color="bg-slate-50 text-slate-500" /></td>
                      <td className="px-2 py-2 text-center"><Stat value={row.job_posts_submitted} color="bg-violet-50 text-violet-700" /></td>
                      <td className="px-2 py-2 text-center"><Stat value={row.rental_posts_submitted} color="bg-fuchsia-50 text-fuchsia-700" /></td>
                      <td className="px-2 py-2 text-center border-l"><Stat value={searchFilter} color="bg-sky-50 text-sky-700" /></td>
                      <td className="px-3 py-2 text-right border-l text-muted-foreground whitespace-nowrap">{formatRelative(row.last_activity)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
