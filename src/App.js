import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import axios from "axios";

const fontLink = document.createElement("link");
fontLink.href =
  "https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Outfit:wght@300;400;500;600;700&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

const SUGGESTIONS = [
  { label: "Phones", icon: "📱" },
  { label: "Televisions", icon: "📺" },
  { label: "Laptops", icon: "💻" },
  { label: "Generators", icon: "⚡" },
  { label: "Kitchen Appliances", icon: "🍳" },
  { label: "Headphones", icon: "🎧" },
];

function IconSearch({ size = 18, cls = "" }) {
  return (
    <svg
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 24 24"
      className={cls}>
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
      <path
        d="m21 21-4.35-4.35"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
function IconArrow() {
  return (
    <svg width="13" height="13" fill="none" viewBox="0 0 24 24">
      <path
        d="M7 17L17 7M17 7H7M17 7v10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconBolt() {
  return (
    <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24">
      <path d="M13 2L4.5 13.5H11L11 22L19.5 10.5H13L13 2Z" />
    </svg>
  );
}

function Spinner() {
  return (
    <div className="w-4 h-4 rounded-full border-2 border-black/20 border-t-black animate-spin" />
  );
}

function SkeletonCard() {
  return (
    <div className="flex flex-col rounded-xl sm:rounded-2xl overflow-hidden bg-white/[0.04] border border-white/[0.07] animate-pulse">
      <div className="h-28 sm:h-36 bg-white/[0.06]" />
      <div className="p-3 sm:p-5 flex flex-col gap-2 sm:gap-3">
        <div className="h-3.5 w-12 bg-white/[0.08] rounded-full" />
        <div className="h-2.5 bg-white/[0.08] rounded w-full" />
        <div className="h-2.5 bg-white/[0.08] rounded w-4/5" />
        <div className="h-6 w-24 bg-white/[0.08] rounded mt-1" />
        <div className="h-px bg-white/[0.06] mt-1" />
        <div className="flex items-center justify-between">
          <div className="h-2.5 w-12 bg-white/[0.08] rounded" />
          <div className="h-2.5 w-8 bg-white/[0.06] rounded" />
        </div>
      </div>
    </div>
  );
}

function StatsBar({ results }) {
  const prices = results.map((r) => r.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const stats = [
    { label: "Results", value: results.length, color: "text-white" },
    {
      label: "Cheapest",
      value: `₦${min.toLocaleString()}`,
      color: "text-emerald-400",
    },
    {
      label: "Highest",
      value: `₦${max.toLocaleString()}`,
      color: "text-red-400",
    },
    {
      label: "You Save",
      value: `₦${(max - min).toLocaleString()}`,
      color: "text-amber-400",
    },
  ];
  return (
    <div className="max-w-3xl mx-auto px-4 mb-7">
      <div className="grid grid-cols-2 sm:grid-cols-4 bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`flex flex-col items-center py-4 px-3 gap-0.5 ${i > 0 ? "border-l border-white/[0.06]" : ""}`}>
            <span className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">
              {s.label}
            </span>
            <span
              className={`font-bold text-base leading-tight ${s.color}`}
              style={{ fontFamily: "'Syne', sans-serif" }}>
              {s.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const SOURCE_STYLES = {
  jumia: "bg-orange-500/10 text-orange-400",
  konga: "bg-purple-500/10 text-purple-400",
  slot: "bg-green-500/10 text-green-400",
  jiji: "bg-amber-500/10 text-amber-400",
  pointek: "bg-cyan-500/10 text-cyan-400",
  fashpa: "bg-pink-500/10 text-pink-400",
  fouani: "bg-lime-500/10 text-lime-400",
  hubmart: "bg-teal-500/10 text-teal-400",
  payporte: "bg-rose-500/10 text-rose-400",
  spar: "bg-emerald-500/10 text-emerald-400",
  speechless: "bg-violet-500/10 text-violet-400",
  "3chub": "bg-sky-500/10 text-sky-400",
  veekeejames: "bg-fuchsia-500/10 text-fuchsia-400",
};

function ProductCard({ product, index }) {
  const isBest = !!product.best_deal;
  const src = product.source?.toLowerCase();
  const sourceStyle = SOURCE_STYLES[src] ?? "bg-blue-500/10 text-blue-400";

  const hasDiscount = product.old_price && product.old_price > product.price;
  const discountPct = hasDiscount
    ? Math.round(
        ((product.old_price - product.price) / product.old_price) * 100,
      )
    : null;

  return (
    <div
      className={`relative flex flex-col rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl ${isBest ? "bg-emerald-950/40 border border-emerald-500/30 hover:border-emerald-400/60 hover:shadow-emerald-900/30" : "bg-white/[0.04] border border-white/[0.07] hover:border-white/[0.16]"}`}
      style={{
        animation: "fadeUp .45s ease both",
        animationDelay: `${index * 45}ms`,
      }}>
      {isBest && (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.07] to-transparent pointer-events-none z-10" />
      )}

      {/* Product image */}
      <div className="relative h-28 sm:h-36 bg-white/[0.03] overflow-hidden flex-shrink-0">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.parentElement.classList.add("opacity-0");
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/10 text-3xl">
            🛒
          </div>
        )}
        {discountPct && (
          <div className="absolute top-2 left-2 z-20 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow">
            -{discountPct}%
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-3 sm:p-4">
        {isBest && (
          <div className="flex items-center gap-1.5 bg-emerald-400 text-black text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full w-fit mb-3">
            <IconBolt /> Best Price
          </div>
        )}
        <div className="flex items-center justify-between mb-2">
          <span
            className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${sourceStyle}`}>
            {product.source || "Store"}
          </span>
          <span
            className="text-[11px] text-white/20 font-bold"
            style={{ fontFamily: "'Syne',sans-serif" }}>
            #{index + 1}
          </span>
        </div>

        <p className="text-[11px] sm:text-[13px] text-white/80 leading-snug sm:leading-relaxed mb-2 sm:mb-3 line-clamp-2 flex-1 font-light">
          {product.name}
        </p>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1.5 mb-2.5">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  width="9"
                  height="9"
                  viewBox="0 0 24 24"
                  fill={star <= Math.round(product.rating) ? "#fbbf24" : "none"}
                  stroke="#fbbf24"
                  strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>
            <span className="text-[10px] text-white/30">
              {product.rating}/5
              {product.reviews ? ` (${product.reviews.toLocaleString()})` : ""}
            </span>
          </div>
        )}

        {/* Price block */}
        <div className="mb-3">
          {hasDiscount && (
            <div className="text-[11px] text-white/30 line-through mb-0.5">
              ₦{Number(product.old_price).toLocaleString()}
            </div>
          )}
          <div className="flex items-baseline gap-1">
            <span className="text-sm text-white/40 font-medium">₦</span>
            <span
              className={`text-xl sm:text-2xl font-black leading-none tracking-tight ${isBest ? "text-emerald-400" : "text-white"}`}
              style={{ fontFamily: "'Syne', sans-serif" }}>
              {Number(product.price).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
          {product.url ? (
            <a
              href={product.url}
              target="_blank"
              rel="noreferrer"
              className={`flex items-center gap-1.5 text-[12px] font-semibold transition-all duration-150 ${isBest ? "text-emerald-400 hover:text-emerald-300" : "text-blue-400 hover:text-white"}`}>
              View deal <IconArrow />
            </a>
          ) : (
            <span className="text-[11px] text-white/20">No link</span>
          )}
          <span className="text-[10px] text-white/20">{product.source}</span>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [focused, setFocused] = useState(false);
  const [activeSource, setActiveSource] = useState("All");
  const inputRef = useRef(null);

  const sources = useMemo(
    () => ["All", ...new Set(results.map((r) => r.source).filter(Boolean))],
    [results],
  );

  const filteredResults = useMemo(
    () =>
      activeSource === "All"
        ? results
        : results.filter((r) => r.source === activeSource),
    [results, activeSource],
  );

  const doSearch = useCallback(
    async (q) => {
      const term = (q ?? query).trim();
      if (!term) return;
      setLoading(true);
      setError("");
      setResults([]);
      setSearched(true);
      setActiveSource("All");
      try {
        const res = await axios.get(
          `https://priceng-backend.onrender.com/search?q=${encodeURIComponent(term)}&pages=2`,
        );
        setResults(res.data.results ?? []);
      } catch (err) {
        const detail = err.response?.data?.detail;
        const msg = Array.isArray(detail)
          ? detail.map((d) => d.msg || JSON.stringify(d)).join(", ")
          : typeof detail === "string"
            ? detail
            : err.message || "Backend unreachable — make sure it's running.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [query],
  );

  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = `
      @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      @keyframes slowShimmer { 0%{background-position:0% center} 100%{background-position:200% center} }
      @keyframes gentlePulse { 0%,100%{opacity:0.05} 50%{opacity:0.085} }
    `;
    document.head.appendChild(s);
  }, []);

  return (
    <div
      className="min-h-screen bg-[#060810] text-white flex flex-col"
      style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* Orbs — slow, gentle */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden z-0"
        aria-hidden>
        <div
          className="absolute w-[700px] h-[700px] rounded-full bg-emerald-500 blur-[150px] -top-52 -left-52"
          style={{
            opacity: 0.055,
            animation: "gentlePulse 14s ease-in-out infinite",
          }}
        />
        <div
          className="absolute w-[600px] h-[600px] rounded-full bg-blue-500 blur-[150px] -bottom-40 -right-32"
          style={{
            opacity: 0.05,
            animation: "gentlePulse 18s ease-in-out infinite",
            animationDelay: "6s",
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full bg-purple-600 blur-[130px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            opacity: 0.03,
            animation: "gentlePulse 22s ease-in-out infinite",
            animationDelay: "11s",
          }}
        />
      </div>
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.018]"
        style={{
          backgroundImage:
            "linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden
      />

      {/* Topbar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 sm:px-8 h-16 bg-black/50 backdrop-blur-2xl border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-black font-black text-sm">
            ⚡
          </div>
          <span
            className="font-black text-lg tracking-tight"
            style={{ fontFamily: "'Syne',sans-serif" }}>
            Price<span className="text-emerald-400">NG</span>
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-white/30 bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-1.5">
          <span className="text-emerald-400 animate-pulse">●</span> Live prices
        </div>
      </nav>

      {/* Hero */}
      <header className="relative z-10 max-w-2xl mx-auto w-full px-5 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[2px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-4 py-1.5 mb-7">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Nigeria's smartest price tracker
        </div>
        <h1
          className="text-[clamp(1.65rem,4.5vw,2.6rem)] font-bold leading-[1.15] tracking-[-0.5px] mb-5 text-white"
          style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
          Stop overpaying.{" "}
          <span
            className="font-extrabold bg-gradient-to-r from-emerald-300 via-teal-300 to-blue-400 bg-[length:300%] bg-clip-text text-transparent"
            style={{ animation: "slowShimmer 9s linear infinite" }}>
            Compare &amp; save.
          </span>
        </h1>
        <p className="text-white/40 text-[0.97rem] max-w-md mx-auto leading-relaxed mb-10 font-light">
          Search once — compare prices across 13 Nigerian stores including
          Jumia, Konga, Jiji, Slot, Pointek &amp; more, ranked cheapest first.
        </p>

        {/* Search */}
        <div className="max-w-xl mx-auto">
          <div
            className={`flex items-center bg-white/[0.05] rounded-[28px] px-5 py-1.5 gap-3 border transition-all duration-200 ${focused ? "border-emerald-400/70 shadow-[0_0_0_4px_rgba(52,211,153,0.12)]" : "border-white/[0.10] hover:border-white/20"}`}>
            <IconSearch size={17} cls="text-white/30 flex-shrink-0" />
            <input
              ref={inputRef}
              className="flex-1 bg-transparent outline-none border-none ring-0 shadow-none text-white placeholder-white/25 text-[0.97rem] py-2.5 min-w-0 appearance-none"
              style={{ fontFamily: "'Outfit', sans-serif" }}
              placeholder='Try "iPhone 15", "Samsung TV", "Generator"…'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && doSearch()}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
            <button
              onClick={() => doSearch()}
              disabled={loading}
              className="flex-shrink-0 flex items-center gap-2 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed text-black text-sm font-bold px-5 py-2.5 rounded-[20px] transition-all duration-150 active:scale-95"
              style={{ fontFamily: "'Outfit', sans-serif" }}>
              {loading ? <Spinner /> : <IconSearch size={14} />}
              {loading ? "Searching…" : "Search"}
            </button>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            {SUGGESTIONS.map(({ label, icon }) => (
              <button
                key={label}
                onClick={() => {
                  setQuery(label);
                  doSearch(label);
                }}
                className="flex items-center gap-1.5 text-[12px] font-medium text-white/40 hover:text-emerald-400 bg-white/[0.04] hover:bg-emerald-400/10 border border-white/[0.07] hover:border-emerald-400/30 rounded-full px-3.5 py-1.5 transition-all duration-150">
                <span>{icon}</span> {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Error */}
      {error && (
        <div className="relative z-10 max-w-xl mx-auto px-4 mb-4 w-full">
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
            <span>⚠️</span> {error}
          </div>
        </div>
      )}

      {/* Skeleton loading grid */}
      {loading && searched && (
        <div className="relative z-10 flex-1">
          <div className="max-w-6xl mx-auto px-4 pb-20 pt-2">
            <div className="flex items-center justify-between mb-5">
              <div className="h-4 w-36 bg-white/[0.07] rounded animate-pulse" />
              <div className="h-4 w-24 bg-white/[0.07] rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3.5">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && !loading && (
        <div className="relative z-10 flex-1">
          <StatsBar
            results={filteredResults.length > 0 ? filteredResults : results}
          />
          <div className="max-w-6xl mx-auto px-4 pb-20">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <p className="text-sm text-white/40">
                <span className="text-white font-semibold">
                  {results.length}
                </span>{" "}
                results for "<span className="text-white/70">{query}</span>"
              </p>
              <span className="text-[11px] text-white/25 bg-white/[0.04] border border-white/[0.06] rounded-full px-3 py-1">
                ↑ Cheapest first
              </span>
            </div>

            {/* Source filter tabs — only show when 2+ stores */}
            {sources.length > 2 && (
              <div className="flex gap-2 mb-5 flex-wrap">
                {sources.map((src) => (
                  <button
                    key={src}
                    onClick={() => setActiveSource(src)}
                    className={`text-[12px] font-semibold px-4 py-1.5 rounded-full border transition-all duration-150 ${
                      activeSource === src
                        ? "bg-emerald-400 text-black border-emerald-400"
                        : "text-white/40 bg-white/[0.04] border-white/[0.07] hover:border-white/20 hover:text-white/70"
                    }`}>
                    {src}
                    {src !== "All" && (
                      <span className="ml-1.5 opacity-60">
                        ({results.filter((r) => r.source === src).length})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3.5">
              {filteredResults.map((product, i) => (
                <ProductCard
                  key={product.url || i}
                  product={product}
                  index={i}
                />
              ))}
            </div>

            {filteredResults.length === 0 && activeSource !== "All" && (
              <div className="text-center py-16 text-white/30 text-sm">
                No results from {activeSource} for this search.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty */}
      {searched && !loading && results.length === 0 && !error && (
        <div className="relative z-10 text-center py-24 px-6">
          <div className="text-5xl mb-4">🔍</div>
          <h3
            className="text-lg font-bold text-white mb-2"
            style={{ fontFamily: "'Syne', sans-serif" }}>
            No results found
          </h3>
          <p className="text-white/35 text-sm">
            Try a different product name, or check the backend is running.
          </p>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 mt-auto border-t border-white/[0.05] px-6 py-5 flex items-center justify-between flex-wrap gap-3 text-[11px] text-white/20">
        <span>PriceNG © {new Date().getFullYear()} — Lagos, Nigeria</span>
        <div className="flex gap-1.5 flex-wrap max-w-lg">
          <span className="bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-md font-semibold">
            ● Jumia
          </span>
          <span className="bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-md font-semibold">
            ● Konga
          </span>
          <span className="bg-green-500/10 text-green-400 px-2 py-0.5 rounded-md font-semibold">
            ● Slot
          </span>
          <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-md font-semibold">
            ● Jiji
          </span>
          <span className="bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-md font-semibold">
            ● Pointek
          </span>
          <span className="bg-pink-500/10 text-pink-400 px-2 py-0.5 rounded-md font-semibold">
            ● Fashpa
          </span>
          <span className="bg-lime-500/10 text-lime-400 px-2 py-0.5 rounded-md font-semibold">
            ● Fouani
          </span>
          <span className="bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded-md font-semibold">
            ● Hubmart
          </span>
          <span className="bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-md font-semibold">
            ● PayPorte
          </span>
          <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md font-semibold">
            ● Spar
          </span>
          <span className="bg-violet-500/10 text-violet-400 px-2 py-0.5 rounded-md font-semibold">
            ● Speechless
          </span>
          <span className="bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded-md font-semibold">
            ● 3CHub
          </span>
          <span className="bg-fuchsia-500/10 text-fuchsia-400 px-2 py-0.5 rounded-md font-semibold">
            ● VeekeeJames
          </span>
        </div>
      </footer>
    </div>
  );
}
