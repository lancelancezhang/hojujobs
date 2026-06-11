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
  job_card_clicks: number;
  rental_card_clicks: number;
  sale_card_clicks: number;
  deal_outbound_clicks: number;
  map_clicks: number;
  news_article_clicks: number;
  navigation_clicks: number;
  post_cta_clicks: number;
  my_posts_clicks: number;
  admin_clicks: number;
  promote_cta_clicks: number;
  auth_events: number;
  sales_filters_changed: number;
  first_activity: string | null;
  last_activity: string | null;
}

interface AnonymousActivityRow {
  event_name: string;
  listing_type: string | null;
  listing_id: string | null;
  label: string | null;
  surface: string | null;
  source: string | null;
  page_path: string | null;
  country: string | null;
  total_events: number;
  unique_visitors: number;
  first_activity: string | null;
  last_activity: string | null;
}

const EVENT_LABELS: Record<string, string> = {
  job_listing_viewed: "Job detail viewed",
  rental_listing_viewed: "Rental detail viewed",
  sale_listing_viewed: "Deal detail viewed",
  contact_number_clicked: "Phone number clicked",
  email_clicked: "Email clicked",
  kakao_clicked: "Kakao clicked",
  text_selected_contact: "Contact text selected",
  job_post_started: "Job post started",
  job_post_submitted: "Job post submitted",
  rental_post_started: "Rental post started",
  rental_post_submitted: "Rental post submitted",
  job_card_clicked: "Job card clicked",
  rental_card_clicked: "Rental card clicked",
  sale_card_clicked: "Deal card opened",
  deal_outbound_clicked: "External deal link clicked",
  map_clicked: "Map clicked",
  news_article_clicked: "News article clicked",
  navigation_clicked: "Navigation clicked",
  post_cta_clicked: "Upload CTA clicked",
  my_posts_clicked: "My profile clicked",
  admin_clicked: "Admin clicked",
  promote_cta_clicked: "Promote CTA clicked",
  auth_login_clicked: "Login clicked",
  auth_signup_clicked: "Signup clicked",
  auth_google_clicked: "Google login clicked",
  auth_mode_toggled: "Auth mode toggled",
  search_performed: "Search performed",
  filter_changed: "Filter changed",
  sales_filter_changed: "Sales filter changed",
  flatmates_page_viewed: "Flatmates page viewed",
  sales_page_viewed: "Sales page viewed",
  news_page_viewed: "News page viewed",
  dashboard_page_viewed: "Dashboard page viewed",
};

function eventLabel(eventName: string) {
  return EVENT_LABELS[eventName] ?? eventName.replaceAll("_", " ");
}

function anonymousDisplayLabel(row: AnonymousActivityRow) {
  if (row.label && row.label !== row.event_name) return row.label;
  if (row.listing_type && row.listing_id) return `${row.listing_type} #${row.listing_id}`;
  return eventLabel(row.event_name);
}

function getUserActivityStats(row: Partial<UserActivityRow>) {
  const listingViews = (row.job_views ?? 0) + (row.rental_views ?? 0) + (row.sale_views ?? 0);
  const cardOpens = (row.job_card_clicks ?? 0) + (row.rental_card_clicks ?? 0) + (row.sale_card_clicks ?? 0);
  const pageViews = (row.flatmates_page_views ?? 0) + (row.sales_page_views ?? 0) + (row.news_page_views ?? 0) + (row.dashboard_page_views ?? 0);
  const contact = (row.total_contact_clicks ?? 0) + (row.contact_text_selections ?? 0);
  const intent =
    (row.deal_outbound_clicks ?? 0) + (row.map_clicks ?? 0) + (row.news_article_clicks ?? 0) + (row.navigation_clicks ?? 0) +
    (row.post_cta_clicks ?? 0) + (row.my_posts_clicks ?? 0) + (row.admin_clicks ?? 0) +
    (row.promote_cta_clicks ?? 0) + (row.auth_events ?? 0);
  const posts = (row.job_posts_started ?? 0) + (row.job_posts_submitted ?? 0) + (row.rental_posts_started ?? 0) + (row.rental_posts_submitted ?? 0);
  const search = (row.searches_performed ?? 0) + (row.filters_changed ?? 0) + (row.sales_filters_changed ?? 0);
  const total =
    (row.job_views ?? 0) + (row.rental_views ?? 0) + (row.sale_views ?? 0) +
    (row.flatmates_page_views ?? 0) + (row.sales_page_views ?? 0) +
    (row.news_page_views ?? 0) + (row.dashboard_page_views ?? 0) +
    (row.total_contact_clicks ?? 0) + (row.contact_text_selections ?? 0) +
    (row.job_posts_started ?? 0) + (row.job_posts_submitted ?? 0) +
    (row.rental_posts_started ?? 0) + (row.rental_posts_submitted ?? 0) +
    (row.searches_performed ?? 0) + (row.filters_changed ?? 0) +
    (row.job_card_clicks ?? 0) + (row.rental_card_clicks ?? 0) + (row.sale_card_clicks ?? 0) +
    (row.deal_outbound_clicks ?? 0) + (row.map_clicks ?? 0) + (row.news_article_clicks ?? 0) +
    (row.navigation_clicks ?? 0) + (row.post_cta_clicks ?? 0) + (row.my_posts_clicks ?? 0) +
    (row.admin_clicks ?? 0) + (row.promote_cta_clicks ?? 0) + (row.auth_events ?? 0) +
    (row.sales_filters_changed ?? 0);

  return { total, listingViews, cardOpens, pageViews, browsing: listingViews + cardOpens + pageViews, contact, intent, posts, search };
}

function getAnonymousActivityStats(rows: AnonymousActivityRow[]) {
  const sum = (events: string[]) =>
    rows
      .filter((row) => events.includes(row.event_name))
      .reduce((total, row) => total + (row.total_events ?? 0), 0);

  const listingViews = sum(["job_listing_viewed", "rental_listing_viewed", "sale_listing_viewed"]);
  const cardOpens = sum(["job_card_clicked", "rental_card_clicked", "sale_card_clicked"]);
  const pageViews = sum(["flatmates_page_viewed", "sales_page_viewed", "news_page_viewed", "dashboard_page_viewed"]);
  const contact = sum(["contact_number_clicked", "email_clicked", "kakao_clicked", "text_selected_contact"]);
  const mapClicks = sum(["map_clicked"]);
  const intent = sum([
    "deal_outbound_clicked",
    "map_clicked",
    "news_article_clicked",
    "navigation_clicked",
    "post_cta_clicked",
    "my_posts_clicked",
    "admin_clicked",
    "promote_cta_clicked",
    "auth_login_clicked",
    "auth_signup_clicked",
    "auth_google_clicked",
    "auth_mode_toggled",
  ]);
  const posts = sum(["job_post_started", "job_post_submitted", "rental_post_started", "rental_post_submitted"]);
  const search = sum(["search_performed", "filter_changed", "sales_filter_changed"]);
  const total = rows.reduce((count, row) => count + (row.total_events ?? 0), 0);
  const uniqueVisitors = rows.reduce((count, row) => count + (row.unique_visitors ?? 0), 0);

  return { total, uniqueVisitors, listingViews, cardOpens, pageViews, browsing: listingViews + cardOpens + pageViews, contact, mapClicks, intent, posts, search };
}



function UserSummaryRow({
  row,
  selected,
  isAdminUser,
  onSelect,
}: {
  row: UserActivityRow;
  selected: boolean;
  isAdminUser: boolean;
  onSelect: () => void;
}) {
  const stats = getUserActivityStats(row);
  const postStarts = (row.job_posts_started ?? 0) + (row.rental_posts_started ?? 0);
  return (
    <tr
      onClick={onSelect}
      className={cn("cursor-pointer transition-colors hover:bg-muted/30", selected && "bg-blue-50/70 hover:bg-blue-50")}
    >
      <td className="px-3 py-3">
        <button type="button" className="block min-w-0 text-left">
          <span className="flex items-center gap-1.5 font-semibold text-foreground text-sm">
            {countryFlag(row.country) && <span className="text-base leading-none">{countryFlag(row.country)}</span>}
            <span className="truncate">{row.display_name ?? "No name"}</span>
            {isAdminUser && <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">Admin</span>}
          </span>
          <span className="block truncate text-[11px] text-muted-foreground">{row.email ?? "—"}</span>
        </button>
      </td>
      <td className="px-3 py-3 text-center"><Stat value={stats.total} color="bg-slate-100 text-slate-700" /></td>
      <td className="border-l px-3 py-3 text-center"><Stat value={row.job_views} color="bg-blue-50 text-blue-700" /></td>
      <td className="px-3 py-3 text-center"><Stat value={row.rental_views} color="bg-rose-50 text-rose-700" /></td>
      <td className="px-3 py-3 text-center"><Stat value={row.sale_views} color="bg-emerald-50 text-emerald-700" /></td>
      <td className="border-l px-3 py-3 text-center"><Stat value={row.flatmates_page_views} color="bg-pink-50 text-pink-700" /></td>
      <td className="px-3 py-3 text-center"><Stat value={row.sales_page_views} color="bg-teal-50 text-teal-700" /></td>
      <td className="px-3 py-3 text-center"><Stat value={row.news_page_views} color="bg-indigo-50 text-indigo-700" /></td>
      <td className="px-3 py-3 text-center"><Stat value={row.dashboard_page_views} color="bg-amber-50 text-amber-700" /></td>
      <td className="border-l px-3 py-3 text-center"><Stat value={row.total_contact_clicks} color="bg-orange-50 text-orange-700" /></td>
      <td className="px-3 py-3 text-center"><Stat value={row.contact_text_selections} color="bg-orange-50 text-orange-600" /></td>
      <td className="border-l px-3 py-3 text-center"><Stat value={row.deal_outbound_clicks} color="bg-emerald-50 text-emerald-700" /></td>
      <td className="px-3 py-3 text-center"><Stat value={row.map_clicks} color="bg-cyan-50 text-cyan-700" /></td>
      <td className="border-l px-3 py-3 text-center"><Stat value={postStarts} color="bg-slate-100 text-slate-700" /></td>
      <td className="px-3 py-3 text-center"><Stat value={row.job_posts_submitted} color="bg-violet-50 text-violet-700" /></td>
      <td className="px-3 py-3 text-center"><Stat value={row.rental_posts_submitted} color="bg-fuchsia-50 text-fuchsia-700" /></td>
      <td className="border-l px-3 py-3 text-center"><Stat value={stats.search} color="bg-sky-50 text-sky-700" /></td>
      <td className="px-3 py-3 text-right text-xs text-muted-foreground whitespace-nowrap">{formatRelative(row.last_activity)}</td>
    </tr>
  );
}

function AnonymousRow({ row }: { row: AnonymousActivityRow }) {
  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="px-3 py-2">
        <p className="font-semibold text-foreground text-sm">{eventLabel(row.event_name)}</p>
        <p className="text-[11px] text-muted-foreground">{row.event_name}</p>
      </td>
      <td className="px-2 py-2 text-center"><Stat value={row.total_events} color="bg-slate-100 text-slate-700" /></td>
      <td className="px-2 py-2 text-center"><Stat value={row.unique_visitors} color="bg-blue-50 text-blue-700" /></td>
      <td className="max-w-[18rem] px-3 py-2 text-xs text-muted-foreground">
        <span className="block truncate font-medium text-foreground">{anonymousDisplayLabel(row)}</span>
        <span className="block truncate">{row.listing_type ?? "No type"}{row.listing_id ? ` #${row.listing_id}` : ""}</span>
      </td>
      <td className="px-3 py-2 text-xs text-muted-foreground">
        {countryFlag(row.country) || row.country || "—"}
      </td>
      <td className="max-w-[12rem] truncate px-3 py-2 text-xs text-muted-foreground">
        {row.surface ?? row.listing_type ?? "—"}
      </td>
      <td className="max-w-[16rem] truncate px-3 py-2 text-xs text-muted-foreground">
        {row.page_path ?? "—"}
      </td>
      <td className="max-w-[16rem] truncate px-3 py-2 text-xs text-muted-foreground">
        {row.source ?? "—"}
      </td>
      <td className="px-3 py-2 text-right text-xs text-muted-foreground whitespace-nowrap">{formatRelative(row.last_activity)}</td>
    </tr>
  );
}

function safeCount(value: number | null | undefined) {
  return value ?? 0;
}

function MetricPill({ label, value, tone = "bg-slate-100 text-slate-700" }: { label: string; value: number | null | undefined; tone?: string }) {
  if (!value) return null;
  return (
    <div className={cn("rounded-md px-2 py-1", tone)}>
      <p className="text-[10px] font-medium opacity-75">{label}</p>
      <p className="text-sm font-bold leading-tight">{safeCount(value).toLocaleString()}</p>
    </div>
  );
}

function MetricGroup({ title, items }: { title: string; items: [string, number | undefined, string][] }) {
  const visible = items.filter(([, value]) => value);
  return (
    <div className="rounded-lg border bg-background p-3">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{title}</p>
      {visible.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {visible.map(([label, value, tone]) => (
            <MetricPill key={label} label={label} value={value ?? 0} tone={tone} />
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No activity</p>
      )}
    </div>
  );
}

function UserDetailStat({ label, value, tone }: { label: string; value: number | null | undefined; tone: string }) {
  return (
    <div className="min-w-0 border-r px-4 py-3 last:border-r-0">
      <p className="truncate text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-xl font-black leading-none", tone)}>{safeCount(value).toLocaleString()}</p>
    </div>
  );
}

function UserDetailGroup({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: { label: string; value: number | null | undefined; tone: string }[];
}) {
  return (
    <div className="border-t px-4 py-4">
      <div className="mb-3">
        <h3 className="text-xs font-bold uppercase tracking-wide text-foreground">{title}</h3>
        <p className="mt-0.5 text-[11px] text-muted-foreground">{description}</p>
      </div>
      <div className="grid gap-x-5 gap-y-2 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-3 border-b border-dashed py-1.5 last:border-b sm:last:border-b">
            <span className="min-w-0 truncate text-xs text-muted-foreground">{item.label}</span>
            <span className={cn("shrink-0 text-sm font-bold", item.tone)}>{safeCount(item.value).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function userDisplayName(row: UserActivityRow) {
  return row.display_name || row.email || "No name";
}

type SummaryRow = {
  label: string;
  loggedIn: number | string;
  anonymous?: number | string;
};

function SummaryTable({ title, rows }: { title: string; rows: SummaryRow[] }) {
  return (
    <section className="rounded-xl border bg-card">
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-bold text-foreground">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr className="border-b">
              <th className="px-3 py-2 text-left font-semibold">Metric</th>
              <th className="px-3 py-2 text-right font-semibold">Logged-in Users</th>
              {rows.some((row) => row.anonymous !== undefined) && (
                <th className="px-3 py-2 text-right font-semibold">Anonymous Users</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((row) => (
              <tr key={row.label} className="hover:bg-muted/30">
                <td className="px-3 py-2 font-medium text-foreground">{row.label}</td>
                <td className="px-3 py-2 text-right text-muted-foreground">{formatSummaryValue(row.loggedIn)}</td>
                {row.anonymous !== undefined && (
                  <td className="px-3 py-2 text-right text-muted-foreground">{formatSummaryValue(row.anonymous)}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function formatSummaryValue(value: number | string) {
  return typeof value === "number" ? value.toLocaleString() : value;
}

function RankedUsersTable({
  title,
  rows,
  valueFor,
  onSelect,
}: {
  title: string;
  rows: UserActivityRow[];
  valueFor: (row: UserActivityRow) => number;
  onSelect: (userId: string) => void;
}) {
  const ranked = rows
    .map((row) => ({ row, value: valueFor(row) }))
    .filter(({ value }) => value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return (
    <section className="rounded-xl border bg-card">
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-bold text-foreground">{title}</h2>
      </div>
      <table className="w-full text-[11px]">
        <thead className="bg-muted/50 text-muted-foreground">
          <tr className="border-b">
            <th className="px-3 py-2 text-left font-semibold">User</th>
            <th className="px-3 py-2 text-right font-semibold">Count</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {ranked.length > 0 ? ranked.map(({ row, value }, index) => (
            <tr key={row.user_id} onClick={() => onSelect(row.user_id)} className="cursor-pointer hover:bg-muted/30">
              <td className="px-3 py-2">
                <p className="truncate font-semibold text-foreground">{index + 1}. {countryFlag(row.country)} {userDisplayName(row)}</p>
                <p className="truncate text-[10px] text-muted-foreground">{row.email ?? "—"}</p>
              </td>
              <td className="px-3 py-2 text-right font-semibold text-foreground">{value.toLocaleString()}</td>
            </tr>
          )) : (
            <tr>
              <td colSpan={2} className="px-3 py-6 text-center text-xs text-muted-foreground">No activity in this bucket.</td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}

function SelectedUserDetail({ row }: { row: UserActivityRow | null }) {
  if (!row) {
    return (
      <section className="rounded-xl border bg-card p-4">
        <h2 className="text-sm font-bold text-foreground">Selected User Detail</h2>
        <p className="mt-2 text-xs text-muted-foreground">Select a user from the overview table to inspect their full activity breakdown.</p>
      </section>
    );
  }

  const stats = getUserActivityStats(row);
  const otherExternalClicks =
    (row.map_clicks ?? 0) + (row.navigation_clicks ?? 0) + (row.post_cta_clicks ?? 0) + (row.my_posts_clicks ?? 0) +
    (row.admin_clicks ?? 0) + (row.promote_cta_clicks ?? 0) + (row.auth_events ?? 0);

  return (
    <section className="rounded-xl border bg-card">
      <div className="flex items-start justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-1.5 truncate text-sm font-bold text-foreground">
            {countryFlag(row.country) && <span className="text-base leading-none">{countryFlag(row.country)}</span>}
            <span className="truncate">Selected User Activity: {userDisplayName(row)}</span>
          </h2>
          <p className="truncate text-xs text-muted-foreground">
            {row.email ?? "—"} · First seen {formatRelative(row.first_activity)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-black leading-none text-foreground">{stats.total.toLocaleString()}</p>
          <p className="mt-1 text-[10px] text-muted-foreground">Last active {formatRelative(row.last_activity)}</p>
        </div>
      </div>

      <div className="grid border-b bg-muted/20 sm:grid-cols-3 xl:grid-cols-6">
        <UserDetailStat label="Listing & page browsing" value={stats.browsing} tone="text-blue-700" />
        <UserDetailStat label="Contact actions" value={stats.contact} tone="text-orange-700" />
        <UserDetailStat label="External/nav clicks" value={stats.intent} tone="text-amber-700" />
        <UserDetailStat label="Post actions" value={stats.posts} tone="text-violet-700" />
        <UserDetailStat label="Search & filters" value={stats.search} tone="text-teal-700" />
        <UserDetailStat label="Submitted posts" value={(row.job_posts_submitted ?? 0) + (row.rental_posts_submitted ?? 0)} tone="text-fuchsia-700" />
      </div>

      <div className="grid lg:grid-cols-2">
        <UserDetailGroup
          title="Browsing"
          description="What this user opened or viewed inside listings and main site pages."
          items={[
            { label: "Job detail page views", value: row.job_views, tone: "text-blue-700" },
            { label: "Rental detail page views", value: row.rental_views, tone: "text-rose-700" },
            { label: "Deal detail page views", value: row.sale_views, tone: "text-emerald-700" },
            { label: "Job card clicks from a list", value: row.job_card_clicks, tone: "text-blue-700" },
            { label: "Rental card clicks from a list", value: row.rental_card_clicks, tone: "text-rose-700" },
            { label: "Deal card clicks from a list", value: row.sale_card_clicks, tone: "text-emerald-700" },
          ]}
        />
        <UserDetailGroup
          title="Main Page Visits"
          description="Top-level pages the user visited, separate from individual listing detail pages."
          items={[
            { label: "Flatmates page visits", value: row.flatmates_page_views, tone: "text-pink-700" },
            { label: "On Sale page visits", value: row.sales_page_views, tone: "text-teal-700" },
            { label: "News page visits", value: row.news_page_views, tone: "text-indigo-700" },
            { label: "User dashboard page visits", value: row.dashboard_page_views, tone: "text-amber-700" },
          ]}
        />
        <UserDetailGroup
          title="Contact And External Clicks"
          description="High-intent actions such as contacting a poster or leaving HojuJobs for a deal/news link."
          items={[
            { label: "Phone, email, or Kakao contact clicks", value: row.total_contact_clicks, tone: "text-orange-700" },
            { label: "Contact text selected/copied", value: row.contact_text_selections, tone: "text-orange-700" },
            { label: "External deal link clicks", value: row.deal_outbound_clicks, tone: "text-emerald-700" },
            { label: "Google Maps clicks", value: row.map_clicks, tone: "text-cyan-700" },
            { label: "News article outbound clicks", value: row.news_article_clicks, tone: "text-indigo-700" },
            { label: "Other navigation, CTA, and auth clicks", value: otherExternalClicks, tone: "text-slate-700" },
          ]}
        />
        <UserDetailGroup
          title="Creation, Search And Filters"
          description="Actions that show the user is trying to post, search, or narrow down results."
          items={[
            { label: "Job post form started", value: row.job_posts_started, tone: "text-violet-700" },
            { label: "Job post submitted", value: row.job_posts_submitted, tone: "text-violet-700" },
            { label: "Rental post form started", value: row.rental_posts_started, tone: "text-fuchsia-700" },
            { label: "Rental post submitted", value: row.rental_posts_submitted, tone: "text-fuchsia-700" },
            { label: "Searches performed", value: row.searches_performed, tone: "text-sky-700" },
            { label: "Job/rental filters changed", value: row.filters_changed, tone: "text-teal-700" },
            { label: "Sales filters changed", value: row.sales_filters_changed, tone: "text-teal-800" },
          ]}
        />
      </div>
    </section>
  );
}

function UserActivityCard({ row }: { row: UserActivityRow }) {
  const cardOpens = (row.job_card_clicks ?? 0) + (row.rental_card_clicks ?? 0) + (row.sale_card_clicks ?? 0);
  const listingViews = (row.job_views ?? 0) + (row.rental_views ?? 0) + (row.sale_views ?? 0);
  const pageViews = (row.flatmates_page_views ?? 0) + (row.sales_page_views ?? 0) + (row.news_page_views ?? 0) + (row.dashboard_page_views ?? 0);
  const intentClicks =
    (row.deal_outbound_clicks ?? 0) + (row.map_clicks ?? 0) + (row.news_article_clicks ?? 0) + (row.navigation_clicks ?? 0) +
    (row.post_cta_clicks ?? 0) + (row.my_posts_clicks ?? 0) + (row.admin_clicks ?? 0) +
    (row.promote_cta_clicks ?? 0) + (row.auth_events ?? 0);
  const postActivity = (row.job_posts_started ?? 0) + (row.job_posts_submitted ?? 0) + (row.rental_posts_started ?? 0) + (row.rental_posts_submitted ?? 0);
  const searchActivity = (row.searches_performed ?? 0) + (row.filters_changed ?? 0) + (row.sales_filters_changed ?? 0);
  const total =
    listingViews + pageViews + (row.total_contact_clicks ?? 0) + (row.contact_text_selections ?? 0) +
    postActivity + searchActivity + cardOpens + intentClicks;

  return (
    <article className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 truncate text-sm font-bold text-foreground">
            {countryFlag(row.country) && <span className="shrink-0 text-base leading-none">{countryFlag(row.country)}</span>}
            <span className="truncate">{row.display_name ?? "No name"}</span>
          </p>
          <p className="truncate text-xs text-muted-foreground">{row.email ?? "—"}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-black leading-none text-foreground">{total.toLocaleString()}</p>
          <p className="mt-1 text-[10px] text-muted-foreground">{formatRelative(row.last_activity)}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <MetricPill label="Views" value={listingViews} tone="bg-blue-50 text-blue-700" />
        <MetricPill label="Cards" value={cardOpens} tone="bg-sky-50 text-sky-700" />
        <MetricPill label="Pages" value={pageViews} tone="bg-indigo-50 text-indigo-700" />
        <MetricPill label="Contact" value={row.total_contact_clicks ?? 0} tone="bg-orange-50 text-orange-700" />
        <MetricPill label="External/Nav" value={intentClicks} tone="bg-amber-50 text-amber-700" />
        <MetricPill label="Posts" value={postActivity} tone="bg-violet-50 text-violet-700" />
        <MetricPill label="Search" value={searchActivity} tone="bg-teal-50 text-teal-700" />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 border-t pt-3 text-[11px] text-muted-foreground">
        <span>External deal clicks: <strong className="text-foreground">{row.deal_outbound_clicks ?? 0}</strong></span>
        <span>Map clicks: <strong className="text-foreground">{row.map_clicks ?? 0}</strong></span>
        <span>News article clicks: <strong className="text-foreground">{row.news_article_clicks ?? 0}</strong></span>
        <span>Job submit: <strong className="text-foreground">{row.job_posts_submitted ?? 0}</strong></span>
        <span>Rental submit: <strong className="text-foreground">{row.rental_posts_submitted ?? 0}</strong></span>
      </div>
    </article>
  );
}

function AnonymousActivityCard({ row }: { row: AnonymousActivityRow }) {
  return (
    <article className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-foreground">{eventLabel(row.event_name)}</p>
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{anonymousDisplayLabel(row)}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-lg font-black leading-none text-foreground">{row.total_events.toLocaleString()}</p>
          <p className="mt-1 text-[10px] text-muted-foreground">clicks</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <MetricPill label="Visitors" value={row.unique_visitors ?? 0} tone="bg-blue-50 text-blue-700" />
        <MetricPill label="Clicks" value={row.total_events ?? 0} tone="bg-slate-100 text-slate-700" />
      </div>
      <div className="mt-3 space-y-1 border-t pt-3 text-[11px] text-muted-foreground">
        <p className="truncate">Raw event: <strong className="text-foreground">{row.event_name}</strong></p>
        <p className="truncate">Listing: <strong className="text-foreground">{row.listing_type ?? "—"}{row.listing_id ? ` #${row.listing_id}` : ""}</strong></p>
        <p className="truncate">Surface: <strong className="text-foreground">{row.surface ?? "—"}</strong></p>
        <p className="truncate">Country: <strong className="text-foreground">{countryFlag(row.country) || row.country || "—"}</strong></p>
        <p className="truncate">Page path: <strong className="text-foreground">{row.page_path ?? "—"}</strong></p>
        <p className="truncate">Source / external URL: <strong className="text-foreground">{row.source ?? "—"}</strong></p>
        <p>First seen: <strong className="text-foreground">{formatRelative(row.first_activity)}</strong></p>
        <p>Last seen: <strong className="text-foreground">{formatRelative(row.last_activity)}</strong></p>
      </div>
    </article>
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
    job_card_clicks: rows.reduce((s, r) => s + (r.job_card_clicks ?? 0), z()),
    rental_card_clicks: rows.reduce((s, r) => s + (r.rental_card_clicks ?? 0), z()),
    sale_card_clicks: rows.reduce((s, r) => s + (r.sale_card_clicks ?? 0), z()),
    deal_outbound_clicks: rows.reduce((s, r) => s + (r.deal_outbound_clicks ?? 0), z()),
    map_clicks: rows.reduce((s, r) => s + (r.map_clicks ?? 0), z()),
    news_article_clicks: rows.reduce((s, r) => s + (r.news_article_clicks ?? 0), z()),
    navigation_clicks: rows.reduce((s, r) => s + (r.navigation_clicks ?? 0), z()),
    post_cta_clicks: rows.reduce((s, r) => s + (r.post_cta_clicks ?? 0), z()),
    my_posts_clicks: rows.reduce((s, r) => s + (r.my_posts_clicks ?? 0), z()),
    admin_clicks: rows.reduce((s, r) => s + (r.admin_clicks ?? 0), z()),
    promote_cta_clicks: rows.reduce((s, r) => s + (r.promote_cta_clicks ?? 0), z()),
    auth_events: rows.reduce((s, r) => s + (r.auth_events ?? 0), z()),
    sales_filters_changed: rows.reduce((s, r) => s + (r.sales_filters_changed ?? 0), z()),
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
  const [anonymousRows, setAnonymousRows] = useState<AnonymousActivityRow[]>([]);
  const [adminUserIds, setAdminUserIds] = useState<Set<string>>(new Set());
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("7d");
  const [rpcError, setRpcError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate("/");
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (!user || !isAdmin) return;
    fetchData(timeFilter);
  }, [user, isAdmin, timeFilter]);

  const fetchData = async (tf: TimeFilter = timeFilter) => {
    setFetching(true);
    setRpcError(null);
    try {
      const since = sinceFromFilter(tf);
      const [activityRes, anonymousRes, rolesRes] = await Promise.all([
        supabase.rpc("get_user_activity_summary", { since: since ?? null }) as unknown as { data: UserActivityRow[] | null; error: { message: string } | null },
        supabase.rpc("get_anonymous_activity_summary", { since: since ?? null }) as unknown as { data: AnonymousActivityRow[] | null; error: { message: string } | null },
        supabase.from("user_roles").select("user_id").eq("role", "admin"),
      ]);
      if (activityRes.error) setRpcError(activityRes.error.message);
      if (anonymousRes.error) setRpcError((current) => [current, anonymousRes.error?.message].filter(Boolean).join(" | "));
      if (rolesRes.error) setRpcError((current) => [current, rolesRes.error?.message].filter(Boolean).join(" | "));
      if (activityRes.data) {
        setRows(activityRes.data);
        setSelectedUserId((current) => current ?? activityRes.data?.[0]?.user_id ?? null);
      }
      if (anonymousRes.data) setAnonymousRows(anonymousRes.data);
      if (rolesRes.data) setAdminUserIds(new Set(rolesRes.data.map((r) => r.user_id)));
    } catch (error) {
      setRpcError(error instanceof Error ? error.message : "Failed to load activity data.");
    } finally {
      setFetching(false);
    }
  };

  const filtered = rows.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (r.email ?? "").toLowerCase().includes(q) || (r.display_name ?? "").toLowerCase().includes(q);
  });

  const regularUsers = filtered.filter((r) => !adminUserIds.has(r.user_id));
  const adminUsers = filtered.filter((r) => adminUserIds.has(r.user_id));
  const totals = sumRows(regularUsers);
  const totalStats = getUserActivityStats(totals);
  const anonymousStats = getAnonymousActivityStats(anonymousRows);
  const totalEvents = rows.filter((r) => !adminUserIds.has(r.user_id)).reduce((s, r) => s + (r.total_events ?? 0), 0);
  const anonymousTotalEvents = anonymousRows.reduce((s, r) => s + (r.total_events ?? 0), 0);
  const submittedPosts = totals.job_posts_submitted + totals.rental_posts_submitted;
  const selectedUser =
    filtered.find((row) => row.user_id === selectedUserId) ??
    regularUsers[0] ??
    adminUsers[0] ??
    null;
  const summaryRows: SummaryRow[] = [
    { label: "People / visitor touches", loggedIn: regularUsers.length, anonymous: anonymousStats.uniqueVisitors },
    { label: "Total events", loggedIn: totalEvents, anonymous: anonymousStats.total },
    { label: "Listing detail views", loggedIn: totalStats.listingViews, anonymous: anonymousStats.listingViews },
    { label: "Card opens", loggedIn: totalStats.cardOpens, anonymous: anonymousStats.cardOpens },
    { label: "Page visits", loggedIn: totalStats.pageViews, anonymous: anonymousStats.pageViews },
    { label: "Contact clicks or text selections", loggedIn: totalStats.contact, anonymous: anonymousStats.contact },
    { label: "Map clicks", loggedIn: totals.map_clicks, anonymous: anonymousStats.mapClicks },
    { label: "External deal / news / nav clicks", loggedIn: totalStats.intent, anonymous: anonymousStats.intent },
    { label: "Post actions", loggedIn: totalStats.posts, anonymous: anonymousStats.posts },
    { label: "Searches and filters", loggedIn: totalStats.search, anonymous: anonymousStats.search },
    { label: "Submitted posts", loggedIn: submittedPosts, anonymous: "—" },
  ];

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
              <span className="font-semibold text-foreground">{rows.length}</span> registered users ·{" "}
              <span className="font-semibold text-foreground">{regularUsers.length}</span> regular ·{" "}
              <span className="font-semibold text-foreground">{adminUsers.length}</span> admins ·{" "}
              <span className="font-semibold text-foreground">{totalEvents.toLocaleString()}</span> logged-in events ·{" "}
              <span className="font-semibold text-foreground">{anonymousTotalEvents.toLocaleString()}</span> anonymous events
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

        {rpcError && (
          <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs text-destructive font-mono">
            RPC error: {rpcError}
          </div>
        )}

        {fetching ? (
          <div className="py-20 text-center text-sm text-muted-foreground">Loading...</div>
        ) : filtered.length === 0 && anonymousRows.length === 0 ? (
          <div className="rounded-xl border bg-card px-4 py-16 text-center text-sm text-muted-foreground">
            {search ? "No results found." : "No activity data yet."}
          </div>
        ) : (
          <div className="space-y-6">
            <SummaryTable title="Activity Summary" rows={summaryRows} />

            {filtered.length > 0 && (
              <section className="grid gap-3 xl:grid-cols-4">
                <RankedUsersTable
                  title="Top External Deal Clickers"
                  rows={regularUsers}
                  valueFor={(row) => row.deal_outbound_clicks ?? 0}
                  onSelect={setSelectedUserId}
                />
                <RankedUsersTable
                  title="Top Contact Clickers"
                  rows={regularUsers}
                  valueFor={(row) => (row.total_contact_clicks ?? 0) + (row.contact_text_selections ?? 0)}
                  onSelect={setSelectedUserId}
                />
                <RankedUsersTable
                  title="Top Post Creators"
                  rows={regularUsers}
                  valueFor={(row) => (row.job_posts_submitted ?? 0) + (row.rental_posts_submitted ?? 0) + (row.job_posts_started ?? 0) + (row.rental_posts_started ?? 0)}
                  onSelect={setSelectedUserId}
                />
                <RankedUsersTable
                  title="Top Active Users"
                  rows={regularUsers}
                  valueFor={(row) => getUserActivityStats(row).total}
                  onSelect={setSelectedUserId}
                />
              </section>
            )}

            {filtered.length === 0 ? (
              <div className="rounded-xl border bg-card px-4 py-12 text-center text-sm text-muted-foreground">
                {search ? "No matching logged-in users." : "No logged-in activity data yet."}
              </div>
            ) : (
          <>
          <section className="space-y-4">
            <SelectedUserDetail row={selectedUser} />
            <div className="rounded-xl border bg-card">
              <div className="border-b px-4 py-3">
                <h2 className="text-sm font-bold text-foreground">Logged-in User Overview</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Full registered-user scan. Select a row to update the detail panel above.
                </p>
              </div>
              <div className="max-h-[34rem] overflow-auto">
                <table className="min-w-[1420px] w-full text-[11px]">
                  <thead className="sticky top-0 z-10 bg-muted/95 text-muted-foreground backdrop-blur">
                    <tr className="border-b">
                      <th className="px-3 py-2 text-left font-semibold" rowSpan={2}>User</th>
                      <th className="px-3 py-2 text-center font-semibold" rowSpan={2}>Total</th>
                      <th className="border-l px-3 py-1.5 text-center font-semibold" colSpan={3}>Listing Views</th>
                      <th className="border-l px-3 py-1.5 text-center font-semibold" colSpan={4}>Page Visits</th>
                      <th className="border-l px-3 py-1.5 text-center font-semibold" colSpan={2}>Contact</th>
                      <th className="border-l px-3 py-1.5 text-center font-semibold" colSpan={2}>External Clicks</th>
                      <th className="border-l px-3 py-1.5 text-center font-semibold" colSpan={3}>Posts</th>
                      <th className="border-l px-3 py-2 text-center font-semibold" rowSpan={2}>Search &amp;<br />Filter</th>
                      <th className="px-3 py-2 text-right font-semibold" rowSpan={2}>Last Active</th>
                    </tr>
                    <tr className="border-b text-[10px]">
                      <th className="border-l px-3 pb-1.5 text-center font-semibold">Jobs</th>
                      <th className="px-3 pb-1.5 text-center font-semibold">Rentals</th>
                      <th className="px-3 pb-1.5 text-center font-semibold">Deals</th>
                      <th className="border-l px-3 pb-1.5 text-center font-semibold">Flatmates</th>
                      <th className="px-3 pb-1.5 text-center font-semibold">On Sale</th>
                      <th className="px-3 pb-1.5 text-center font-semibold">News</th>
                      <th className="px-3 pb-1.5 text-center font-semibold">Dashboard</th>
                      <th className="border-l px-3 pb-1.5 text-center font-semibold">Clicks</th>
                      <th className="px-3 pb-1.5 text-center font-semibold">Text Sel.</th>
                      <th className="border-l px-3 pb-1.5 text-center font-semibold">Deal Links</th>
                      <th className="px-3 pb-1.5 text-center font-semibold">Map</th>
                      <th className="border-l px-3 pb-1.5 text-center font-semibold">Started</th>
                      <th className="px-3 pb-1.5 text-center font-semibold">Job</th>
                      <th className="px-3 pb-1.5 text-center font-semibold">Rental</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {regularUsers.length > 0 && (
                      <tr className="bg-slate-50 font-semibold">
                        <td className="px-3 py-2 text-[11px] text-slate-600">Total ({regularUsers.length} users)</td>
                        <td className="px-3 py-2 text-center"><Stat value={totalStats.total} color="bg-slate-200 text-slate-800" /></td>
                        <td className="border-l px-3 py-2 text-center"><Stat value={totals.job_views} color="bg-blue-100 text-blue-800" /></td>
                        <td className="px-3 py-2 text-center"><Stat value={totals.rental_views} color="bg-rose-100 text-rose-800" /></td>
                        <td className="px-3 py-2 text-center"><Stat value={totals.sale_views} color="bg-emerald-100 text-emerald-800" /></td>
                        <td className="border-l px-3 py-2 text-center"><Stat value={totals.flatmates_page_views} color="bg-pink-100 text-pink-800" /></td>
                        <td className="px-3 py-2 text-center"><Stat value={totals.sales_page_views} color="bg-teal-100 text-teal-800" /></td>
                        <td className="px-3 py-2 text-center"><Stat value={totals.news_page_views} color="bg-indigo-100 text-indigo-800" /></td>
                        <td className="px-3 py-2 text-center"><Stat value={totals.dashboard_page_views} color="bg-amber-100 text-amber-800" /></td>
                        <td className="border-l px-3 py-2 text-center"><Stat value={totals.total_contact_clicks} color="bg-orange-100 text-orange-800" /></td>
                        <td className="px-3 py-2 text-center"><Stat value={totals.contact_text_selections} color="bg-orange-100 text-orange-700" /></td>
                        <td className="border-l px-3 py-2 text-center"><Stat value={totals.deal_outbound_clicks} color="bg-emerald-100 text-emerald-800" /></td>
                        <td className="px-3 py-2 text-center"><Stat value={totals.map_clicks} color="bg-cyan-100 text-cyan-800" /></td>
                        <td className="border-l px-3 py-2 text-center"><Stat value={totals.job_posts_started + totals.rental_posts_started} color="bg-slate-100 text-slate-700" /></td>
                        <td className="px-3 py-2 text-center"><Stat value={totals.job_posts_submitted} color="bg-violet-100 text-violet-800" /></td>
                        <td className="px-3 py-2 text-center"><Stat value={totals.rental_posts_submitted} color="bg-fuchsia-100 text-fuchsia-800" /></td>
                        <td className="border-l px-3 py-2 text-center"><Stat value={totalStats.search} color="bg-sky-100 text-sky-800" /></td>
                        <td className="px-3 py-2" />
                      </tr>
                    )}
                    {regularUsers.map((row) => (
                      <UserSummaryRow
                        key={row.user_id}
                        row={row}
                        selected={selectedUser?.user_id === row.user_id}
                        isAdminUser={false}
                        onSelect={() => setSelectedUserId(row.user_id)}
                      />
                    ))}
                    {adminUsers.length > 0 && (
                      <tr>
                        <td colSpan={18} className="border-t-2 border-dashed border-slate-300 bg-muted/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Admins
                        </td>
                      </tr>
                    )}
                    {adminUsers.map((row) => (
                      <UserSummaryRow
                        key={row.user_id}
                        row={row}
                        selected={selectedUser?.user_id === row.user_id}
                        isAdminUser
                        onSelect={() => setSelectedUserId(row.user_id)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
          </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
