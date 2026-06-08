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

function UserRow({ row }: { row: UserActivityRow }) {
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
    <tr className="hover:bg-muted/30 transition-colors">
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

function sumRows(rows: UserActivityRow[]) {
  const z = () => 0;
  return {
    job_views: rows.reduce((s, r) => s + (r.job_views ?? 0), z()),
    rental_views: rows.reduce((s, r) => s + (r.rental_views ?? 0), z()),
    sale_views: rows.reduce((s, r) => s + (r.sale_views ?? 0), z()),
    flatmates_page_views: rows.reduce((s, r) => s + (r.flatmates_page_views ?? 0), z()),
    sales_page_views: rows.reduce((s, r) => s + (r.sales_page_views ?? 0), z()),
    news_page_views: rows.reduce((s, r) => s + (r.news_page_views ?? 0), z()),
    dashboard_page_views: rows.reduce((s, r) => s + (r.dashboard_page_views ?? 0), z()),
    total_contact_clicks: rows.reduce((s, r) => s + (r.total_contact_clicks ?? 0), z()),
    contact_text_selections: rows.reduce((s, r) => s + (r.contact_text_selections ?? 0), z()),
    job_posts_started: rows.reduce((s, r) => s + (r.job_posts_started ?? 0), z()),
    job_posts_submitted: rows.reduce((s, r) => s + (r.job_posts_submitted ?? 0), z()),
    rental_posts_started: rows.reduce((s, r) => s + (r.rental_posts_started ?? 0), z()),
    rental_posts_submitted: rows.reduce((s, r) => s + (r.rental_posts_submitted ?? 0), z()),
    searches_performed: rows.reduce((s, r) => s + (r.searches_performed ?? 0), z()),
    filters_changed: rows.reduce((s, r) => s + (r.filters_changed ?? 0), z()),
  };
}

type TimeFilter = "24h" | "3d" | "7d" | "30d" | "all";

const TIME_FILTERS: { label: string; value: TimeFilter }[] = [
  { label: "24h", value: "24h" },
  { label: "3 days", value: "3d" },
  { label: "7 days", value: "7d" },
  { label: "1 month", value: "30d" },
  { label: "All time", value: "all" },
];

function sinceFromFilter(f: TimeFilter): string | null {
  if (f === "all") return null;
  const ms = { "24h": 1, "3d": 3, "7d": 7, "30d": 30 }[f] * 24 * 60 * 60 * 1000;
  return new Date(Date.now() - ms).toISOString();
}

export default function AdminActivity() {
  useSEO({ title: "User Activity | Admin", description: "User activity summary", noindex: true });
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<UserActivityRow[]>([]);
  const [adminUserIds, setAdminUserIds] = useState<Set<string>>(new Set());
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("7d");

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate("/");
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (!user || !isAdmin) return;
    fetchData(timeFilter);
  }, [user, isAdmin, timeFilter]);

  const fetchData = async (tf: TimeFilter = timeFilter) => {
    setFetching(true);
    const since = sinceFromFilter(tf);
    const [activityRes, rolesRes] = await Promise.all([
      supabase.rpc("get_user_activity_summary", { since: since ?? null }) as unknown as { data: UserActivityRow[] | null },
      supabase.from("user_roles").select("user_id").eq("role", "admin"),
    ]);
    if (activityRes.data) setRows(activityRes.data);
    if (rolesRes.data) setAdminUserIds(new Set(rolesRes.data.map((r) => r.user_id)));
    setFetching(false);
  };

  const filtered = rows.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (r.email ?? "").toLowerCase().includes(q) || (r.display_name ?? "").toLowerCase().includes(q);
  });

  const regularUsers = filtered.filter((r) => !adminUserIds.has(r.user_id));
  const adminUsers = filtered.filter((r) => adminUserIds.has(r.user_id));
  const totals = sumRows(regularUsers);
  const totalsRowTotal =
    totals.job_views + totals.rental_views + totals.sale_views +
    totals.flatmates_page_views + totals.sales_page_views +
    totals.news_page_views + totals.dashboard_page_views +
    totals.total_contact_clicks + totals.contact_text_selections +
    totals.job_posts_started + totals.job_posts_submitted +
    totals.rental_posts_started + totals.rental_posts_submitted +
    totals.searches_performed + totals.filters_changed;

  const totalEvents = rows.filter((r) => !adminUserIds.has(r.user_id)).reduce((s, r) => s + (r.total_events ?? 0), 0);

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
              <span className="font-semibold text-foreground">{regularUsers.length}</span> users ·{" "}
              <span className="font-semibold text-foreground">{totalEvents.toLocaleString()}</span> events (excl. admins)
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            {/* Time filter */}
            <div className="flex items-center gap-1 rounded-lg border bg-muted/40 p-1">
              {TIME_FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setTimeFilter(f.value)}
                  className={cn(
                    "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                    timeFilter === f.value
                      ? "bg-white shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search email or name"
                className="h-8 w-52 rounded-md border border-input bg-background px-3 text-xs outline-none focus:ring-2 focus:ring-ring"
              />
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => fetchData(timeFilter)} disabled={fetching}>
                Refresh
              </Button>
            </div>
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
                {/* Regular users */}
                {regularUsers.map((row) => <UserRow key={row.user_id} row={row} />)}

                {/* Totals row for regular users */}
                {regularUsers.length > 0 && (
                  <tr className="bg-slate-50 font-semibold border-t-2 border-slate-300">
                    <td className="px-3 py-2 text-[11px] text-slate-600">
                      Total ({regularUsers.length} users)
                    </td>
                    <td className="px-2 py-2 text-center">
                      <Stat value={totalsRowTotal} color="bg-slate-200 text-slate-800" />
                    </td>
                    <td className="px-2 py-2 text-center border-l"><Stat value={totals.job_views} color="bg-blue-100 text-blue-800" /></td>
                    <td className="px-2 py-2 text-center"><Stat value={totals.rental_views} color="bg-rose-100 text-rose-800" /></td>
                    <td className="px-2 py-2 text-center"><Stat value={totals.sale_views} color="bg-emerald-100 text-emerald-800" /></td>
                    <td className="px-2 py-2 text-center border-l"><Stat value={totals.flatmates_page_views} color="bg-pink-100 text-pink-800" /></td>
                    <td className="px-2 py-2 text-center"><Stat value={totals.sales_page_views} color="bg-teal-100 text-teal-800" /></td>
                    <td className="px-2 py-2 text-center"><Stat value={totals.news_page_views} color="bg-indigo-100 text-indigo-800" /></td>
                    <td className="px-2 py-2 text-center"><Stat value={totals.dashboard_page_views} color="bg-amber-100 text-amber-800" /></td>
                    <td className="px-2 py-2 text-center border-l"><Stat value={totals.total_contact_clicks} color="bg-orange-100 text-orange-800" /></td>
                    <td className="px-2 py-2 text-center"><Stat value={totals.contact_text_selections} color="bg-orange-100 text-orange-700" /></td>
                    <td className="px-2 py-2 text-center border-l"><Stat value={totals.job_posts_started + totals.rental_posts_started} color="bg-slate-100 text-slate-600" /></td>
                    <td className="px-2 py-2 text-center"><Stat value={totals.job_posts_submitted} color="bg-violet-100 text-violet-800" /></td>
                    <td className="px-2 py-2 text-center"><Stat value={totals.rental_posts_submitted} color="bg-fuchsia-100 text-fuchsia-800" /></td>
                    <td className="px-2 py-2 text-center border-l"><Stat value={totals.searches_performed + totals.filters_changed} color="bg-sky-100 text-sky-800" /></td>
                    <td className="px-3 py-2 border-l" />
                  </tr>
                )}

                {/* Admin separator */}
                {adminUsers.length > 0 && (
                  <tr>
                    <td colSpan={16} className="px-3 py-1.5 bg-muted/60 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border-t-2 border-dashed border-slate-300">
                      Admins
                    </td>
                  </tr>
                )}

                {/* Admin users */}
                {adminUsers.map((row) => <UserRow key={row.user_id} row={row} />)}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
