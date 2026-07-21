"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  Building2,
  Briefcase,
  Clock,
  Send,
  MapPin,
  ArrowRight,
  Wifi,
  WifiOff,
  Loader2,
  ExternalLink,
} from "lucide-react";

const API_BASE = "http://localhost:3001";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  employmentType: string | null;
  remote: boolean | null;
  experienceLevel: string | null;
  applyUrl: string | null;
  postedAt: string | null;
  source: string;
  skills: { skill: { name: string } }[];
}

interface JobsResponse {
  data: Job[];
  total: number;
  page: number;
  limit: number;
}

// --- Currency helpers ---
function getCurrencySymbol(currency?: string | null, location?: string | null): string {
  if (currency === "INR") return "₹";
  if (currency === "GBP") return "£";
  if (currency === "EUR") return "€";
  if (currency === "USD") return "$";
  if (currency) return currency + " ";

  // Fallback: infer from location
  if (!location) return "₹";
  const loc = location.toLowerCase();
  if (
    loc.includes("india") || loc.includes("mumbai") ||
    loc.includes("bangalore") || loc.includes("bengaluru") ||
    loc.includes("pune") || loc.includes("delhi") ||
    loc.includes("hyderabad") || loc.includes("chennai")
  ) return "₹";
  if (loc.includes("uk") || loc.includes("london") || loc.includes("gb")) return "£";
  if (loc.includes("europe") || loc.includes("germany") || loc.includes("france")) return "€";
  return "$";
}

function formatSalary(job: Job): string {
  const sym = getCurrencySymbol(job.currency, job.location);
  if (job.salaryMin && job.salaryMax) {
    const isINR = sym === "₹";
    const fmt = (n: number) =>
      isINR
        ? n >= 100000
          ? `${(n / 100000).toFixed(1)}L`
          : `${(n / 1000).toFixed(0)}K`
        : n >= 1000
        ? `${(n / 1000).toFixed(0)}K`
        : String(n);
    return `${sym}${fmt(job.salaryMin)} – ${sym}${fmt(job.salaryMax)}/yr`;
  }
  if (job.salaryMin) {
    const sym2 = getCurrencySymbol(job.currency, job.location);
    return `From ${sym2}${job.salaryMin.toLocaleString()}/yr`;
  }
  return "Competitive";
}

function getLogoColors(company?: string | null): { bg: string; text: string } {
  const colors = [
    { bg: "bg-blue-600", text: "text-white" },
    { bg: "bg-emerald-600", text: "text-white" },
    { bg: "bg-violet-600", text: "text-white" },
    { bg: "bg-orange-500", text: "text-white" },
    { bg: "bg-rose-600", text: "text-white" },
    { bg: "bg-cyan-600", text: "text-white" },
    { bg: "bg-amber-500", text: "text-white" },
    { bg: "bg-indigo-600", text: "text-white" },
  ];
  if (!company) return colors[0];
  const idx = company.charCodeAt(0) % colors.length;
  return colors[idx];
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "Recently";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function formatUrl(url: string | null): string {
  if (!url) return "#";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
}

// --- Skeleton ---
function JobCardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5]/50 shadow-sm animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-zinc-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-zinc-200 rounded w-3/4" />
          <div className="h-3 bg-zinc-100 rounded w-1/2" />
          <div className="h-3 bg-zinc-100 rounded w-1/3" />
        </div>
        <div className="h-7 w-20 bg-zinc-100 rounded-lg" />
      </div>
    </div>
  );
}

function PopularJobSkeleton() {
  return (
    <div className="p-5 flex items-center justify-between animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-zinc-200 shrink-0" />
        <div className="space-y-2">
          <div className="h-3 bg-zinc-200 rounded w-32" />
          <div className="h-2.5 bg-zinc-100 rounded w-24" />
        </div>
      </div>
      <div className="h-6 w-16 bg-zinc-100 rounded-md" />
    </div>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [locationTerm, setLocationTerm] = useState(searchParams.get("location") || "");
  const [employmentFilter, setEmploymentFilter] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [popularJobs, setPopularJobs] = useState<Job[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiOnline, setApiOnline] = useState(true);
  const [showAllRecent, setShowAllRecent] = useState(false);
  const [showAllPopular, setShowAllPopular] = useState(false);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const fetchJobs = useCallback(async (q: string, loc: string, emp: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: "50", page: "1" });
      if (q) params.set("search", q); // use search instead of q to match backend
      if (loc) params.set("location", loc);
      if (emp) params.set("employmentType", emp);

      const res = await fetch(`${API_BASE}/jobs?${params}`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const data: JobsResponse = await res.json();
      setApiOnline(true);
      setTotalJobs(data.total);

      const all = data.data;
      setRecentJobs(all); // we'll slice in render
      setPopularJobs(
        [...all].sort((a, b) => (b.remote ? 1 : 0) - (a.remote ? 1 : 0))
      );
    } catch (err: unknown) {
      setApiOnline(false);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchJobs(debouncedSearch, locationTerm, employmentFilter);
  }, [debouncedSearch, locationTerm, employmentFilter, fetchJobs]);

  const categories = [
    { name: "Companies", count: `${Math.floor(totalJobs / 3)}+`, icon: Building2, color: "text-blue-500 bg-blue-50", filter: "" },
    { name: "Full-Time", count: `${Math.floor(totalJobs * 0.7)}+`, icon: Briefcase, color: "text-emerald-500 bg-emerald-50", filter: "FULL_TIME" },
    { name: "Part-Time", count: `${Math.floor(totalJobs * 0.15)}+`, icon: Clock, color: "text-amber-500 bg-amber-50", filter: "PART_TIME" },
    { name: "Freelance", count: `${Math.floor(totalJobs * 0.1)}+`, icon: Send, color: "text-purple-500 bg-purple-50", filter: "CONTRACT" },
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col gap-1.5 text-left">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#364153]">
            Find Your Dream Job!
          </h1>
          {/* API Status indicator */}
          <span
            title={apiOnline ? "API connected" : "API offline"}
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
              apiOnline
                ? "bg-emerald-50 text-emerald-600"
                : "bg-red-50 text-red-500"
            }`}
          >
            {apiOnline ? (
              <><Wifi className="w-3 h-3" /> Live</>
            ) : (
              <><WifiOff className="w-3 h-3" /> Offline</>
            )}
          </span>
        </div>
        <p className="text-sm text-[#6A7282]">
          {totalJobs > 0
            ? `${totalJobs} active roles from India and worldwide — matched to your skills.`
            : "Let our Intelligence Layer scan and match you with active roles."}
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="flex gap-4">
        <div className="flex-1 bg-white rounded-2xl border border-[#E5E5E5]/60 px-4 py-3.5 flex items-center gap-3 shadow-sm focus-within:ring-2 focus-within:ring-[#1976D2]/50 transition-all">
          {loading ? (
            <Loader2 className="w-5 h-5 text-[#1976D2] animate-spin shrink-0" />
          ) : (
            <Search className="w-5 h-5 text-[#6A7282] shrink-0" />
          )}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for job titles, skills, or companies..."
            className="flex-1 bg-transparent border-none outline-none text-[#364153] placeholder-zinc-400 font-semibold"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-zinc-400 hover:text-zinc-600 text-lg leading-none mr-2"
            >
              ×
            </button>
          )}
          <div className="w-px h-6 bg-zinc-200 hidden md:block" />
          <MapPin className="w-5 h-5 text-[#6A7282] shrink-0 hidden md:block ml-2" />
          <input
            type="text"
            value={locationTerm}
            onChange={(e) => setLocationTerm(e.target.value)}
            placeholder="Location..."
            className="w-32 md:w-40 bg-transparent border-none outline-none text-[#364153] placeholder-zinc-400 font-semibold hidden md:block"
          />
        </div>
        <button className="bg-white border border-[#E5E5E5]/60 hover:bg-zinc-50 p-4 rounded-2xl flex items-center justify-center transition-colors shadow-sm shrink-0">
          <SlidersHorizontal className="w-5 h-5 text-[#364153]" />
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>Could not connect to API. Make sure the backend is running on port 3001.</span>
        </div>
      )}

      {/* Browse by Category */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[#364153] text-left">Browse by Category</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <div
                key={i}
                onClick={() => setEmploymentFilter(employmentFilter === cat.filter ? "" : cat.filter)}
                className={`p-5 rounded-2xl border ${employmentFilter === cat.filter ? 'border-[#1976D2] ring-1 ring-[#1976D2]' : 'border-[#E5E5E5]/50'} shadow-sm flex items-center gap-4 hover:shadow-md transition-all cursor-pointer group bg-white`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cat.color} transition-transform group-hover:scale-110`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-[#364153] text-sm group-hover:text-[#1976D2] transition-colors">{cat.name}</h4>
                  <p className="text-xs text-[#6A7282]">{loading ? "—" : cat.count}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: Recently Added */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#364153]">
              {debouncedSearch ? `Results for "${debouncedSearch}"` : "Recently Added Jobs"}
            </h3>
            {recentJobs.length > 5 && (
              <button onClick={() => setShowAllRecent(!showAllRecent)} className="text-xs font-bold text-[#1976D2] hover:underline flex items-center gap-1">
                {showAllRecent ? "Show Less" : "View All"} <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <JobCardSkeleton key={i} />)
            ) : recentJobs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E5E5E5]/50 p-10 text-center text-[#6A7282]">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="font-semibold">No jobs found{debouncedSearch ? ` for "${debouncedSearch}"` : ""}.</p>
                <p className="text-xs mt-1">Try different keywords or clear the search.</p>
              </div>
            ) : (
              (showAllRecent ? recentJobs : recentJobs.slice(0, 5)).map((job) => {
                const logo = getLogoColors(job.company);
                const salaryStr = formatSalary(job);
                const isIndia = getCurrencySymbol(job.currency, job.location) === "₹";
                return (
                  <div
                    key={job.id}
                    className="bg-white p-6 rounded-2xl border border-[#E5E5E5]/50 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md hover:border-[#1976D2]/30 transition-all group"
                  >
                    <div className="flex items-start sm:items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl ${logo.bg} ${logo.text} flex items-center justify-center font-extrabold text-lg shrink-0`}>
                        {job.company ? job.company.charAt(0).toUpperCase() : "?"}
                      </div>
                      <div className="text-left">
                        <h4 className="font-bold text-[#364153] text-base group-hover:text-[#1976D2] transition-colors cursor-pointer">
                          {job.title || "Unknown Position"}
                        </h4>
                        <p className="text-xs text-[#6A7282]">{job.company || "Unknown Company"}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          {job.location && (
                            <div className="flex items-center gap-1 text-[11px] text-[#6A7282]">
                              <MapPin className="w-3 h-3" /> {job.location}
                            </div>
                          )}
                          {job.remote && (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                              Remote
                            </span>
                          )}
                          {job.employmentType && (
                            <span className="text-[10px] font-semibold text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded-md">
                              {job.employmentType.replace("_", "-")}
                            </span>
                          )}
                          <span className="text-[10px] text-zinc-400">{timeAgo(job.postedAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-100 shrink-0">
                      <span className={`text-sm font-bold ${isIndia ? "text-orange-600" : "text-emerald-700"}`}>
                        {salaryStr}
                      </span>
                      {job.applyUrl ? (
                        <a
                          href={formatUrl(job.applyUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-[#1976D2] bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-[#1976D2] hover:text-white transition-all mt-1 flex items-center gap-1"
                        >
                          Apply <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <button className="text-xs font-bold text-[#1976D2] bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-[#1976D2] hover:text-white transition-all mt-1">
                          Quick Apply
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Popular Jobs */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#364153]">Popular Remote Jobs</h3>
            {popularJobs.length > 5 && (
              <button onClick={() => setShowAllPopular(!showAllPopular)} className="text-xs font-bold text-[#1976D2] hover:underline flex items-center gap-1">
                {showAllPopular ? "Show Less" : "View All"} <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E5E5]/50 shadow-sm overflow-hidden divide-y divide-zinc-100">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <PopularJobSkeleton key={i} />)
            ) : popularJobs.length === 0 ? (
              <div className="p-8 text-center text-[#6A7282] text-sm">No jobs yet.</div>
            ) : (
              (showAllPopular ? popularJobs : popularJobs.slice(0, 5)).map((job) => {
                const logo = getLogoColors(job.company);
                const salaryStr = formatSalary(job);
                const isIndia = getCurrencySymbol(job.currency, job.location) === "₹";
                return (
                  <div
                    key={job.id}
                    className="p-5 flex items-center justify-between hover:bg-zinc-50/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl ${logo.bg} ${logo.text} flex items-center justify-center font-black text-sm shrink-0`}>
                        {job.company ? job.company.charAt(0).toUpperCase() : "?"}
                      </div>
                      <div className="text-left min-w-0">
                        <h4 className="font-bold text-[#364153] text-sm group-hover:text-[#1976D2] transition-colors cursor-pointer truncate">
                          {job.title || "Unknown Position"}
                        </h4>
                        <p className="text-xs text-[#6A7282] truncate">
                          {job.company || "Unknown Company"}
                          {job.location ? ` • ${job.location}` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-3">
                      <span className={`text-xs font-black px-2.5 py-1 rounded-md ${
                        isIndia
                          ? "text-orange-700 bg-orange-50"
                          : "text-emerald-700 bg-emerald-50"
                      }`}>
                        {salaryStr}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Sync Button */}
          <button
            onClick={async () => {
              setLoading(true);
              try {
                await fetch(`${API_BASE}/jobs/sync?query=${encodeURIComponent(debouncedSearch)}&location=${encodeURIComponent(locationTerm)}`, { method: "POST" });
                await fetchJobs(debouncedSearch, locationTerm, employmentFilter);
              } catch {
                setLoading(false);
              }
            }}
            className="w-full text-xs font-bold text-[#6A7282] bg-white border border-[#E5E5E5]/60 px-4 py-2.5 rounded-xl hover:bg-zinc-50 hover:text-[#1976D2] transition-all flex items-center justify-center gap-2"
          >
            <Loader2 className="w-3.5 h-3.5" />
            Refresh Jobs from All Sources
          </button>
        </div>

      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#1976D2]" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}
