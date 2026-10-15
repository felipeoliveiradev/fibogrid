"use client";

import React, {
  startTransition,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import {
  FiboGrid,
  GridRegistryProvider,
  useGridEvents,
  useGridRegistry,
  enUS,
  ptBR,
  esES,
  type ColumnDef,
  type GridApi,
  type GridManagerBuilder,
  type FiboGridLocale,
} from "fibogrid";

/* ============================================================================
   DETERMINISTIC SEEDED GENERATOR (Zero SSR/Client Hydration Mismatch)
   ============================================================================ */

function createSeededRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/* ============================================================================
   1. HERO VISUAL — REAL MOUNTED <FiboGrid /> IN NOIR DARK FRAME
   ============================================================================ */

export interface OrderbookRow {
  id: string;
  symbol: string;
  venue: string;
  side: "BUY" | "SELL";
  bid: number;
  spreadBps: number;
  volume: number;
  latencyMs: number;
}

const HERO_SYMBOLS = [
  "NVDA.OQ", "ASML.AS", "MSFT.OQ", "NESN.SW", "AAPL.OQ", "NOVN.SW",
  "TSM.NY", "AVGO.OQ", "SAP.DE", "ROG.SW", "AMZN.OQ", "ABBN.SW",
  "SIE.DE", "META.OQ", "UBSG.SW", "PETR4.SA", "VALE3.SA", "ITUB4.SA",
];

const HERO_VENUES = ["NASDAQ", "SIX-ZRH", "XETRA", "LSE-LDN", "B3-SP"];

function generateHeroOrderbook(count = 48): OrderbookRow[] {
  const rng = createSeededRng(16180339);
  const rows: OrderbookRow[] = new Array(count);
  for (let i = 0; i < count; i++) {
    const base = 48 + rng() * 640;
    rows[i] = {
      id: `ORD-${String(i + 1).padStart(4, "0")}`,
      symbol: HERO_SYMBOLS[i % HERO_SYMBOLS.length],
      venue: HERO_VENUES[i % HERO_VENUES.length],
      side: rng() > 0.46 ? "BUY" : "SELL",
      bid: Math.round(base * 100) / 100,
      spreadBps: Math.round((0.4 + rng() * 3.8) * 10) / 10,
      volume: Math.floor(150 + rng() * 16500),
      latencyMs: Math.round((0.32 + rng() * 2.1) * 100) / 100,
    };
  }
  return rows;
}

interface TelemetryLog {
  id: string;
  time: string;
  event: string;
  detail: string;
}

function formatNowTimestamp(): string {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  const ms = String(d.getMilliseconds()).padStart(3, "0");
  return `${hh}:${mm}:${ss}.${ms}`;
}

function HeroEventTape({ gridId, streaming = false }: { gridId: string; streaming?: boolean }) {
  const events = useGridEvents<OrderbookRow>(gridId);
  const [logs, setLogs] = useState<TelemetryLog[]>([
    {
      id: "init-1",
      time: "00:00:00.000",
      event: "gridReady",
      detail: `Mounted real <FiboGrid gridId="${gridId}" /> · double-click any cell to edit`,
    },
  ]);

  const pushLog = useCallback((event: string, detail: string) => {
    queueMicrotask(() => {
      setLogs((prev) => [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          time: formatNowTimestamp(),
          event,
          detail,
        },
        ...prev.slice(0, 1),
      ]);
    });
  }, []);

  useEffect(() => {
    const u1 = events.onRowClicked().listen((ev: any) => {
      if (!ev?.rowNode) return;
      pushLog(
        "rowClicked",
        `${ev.rowNode.data.symbol} (${ev.rowNode.data.venue}) · $${Number(ev.rowNode.data.bid).toFixed(2)}`
      );
    });
    // Skip cellValueChanged while streaming — feed ticks would flood the tape and block emit gate.
    const u2 = streaming
      ? null
      : events.onCellValueChanged().listen((ev: any) => {
          pushLog(
            "cellValueChanged",
            `${ev?.field}: ${JSON.stringify(ev?.oldValue)} → ${JSON.stringify(ev?.newValue)}`
          );
        });
    const u3 = events.onSortChanged().listen((ev: any) => {
      const desc =
        (ev?.sortModel || [])
          .map((s: any) => `${s.field}:${s.direction}`)
          .join(", ") || "none";
      pushLog("sortChanged", `sort=[${desc}]`);
    });
    const u4 = events.onFilterChanged().listen((ev: any) => {
      pushLog("filterChanged", `filters=${(ev?.filterModel || []).length}`);
    });
    return () => {
      if (typeof u1 === "function") u1();
      if (typeof u2 === "function") u2();
      if (typeof u3 === "function") u3();
      if (typeof u4 === "function") u4();
    };
  }, [events, pushLog, streaming]);

  return (
    <div className="hero-event-strip" aria-live="polite">
      {logs.map((item) => (
        <div key={item.id} className="hero-event-row">
          <span>{item.time}</span>
          <span className="hero-event-name">{item.event}</span>
          <span>{item.detail}</span>
        </div>
      ))}
    </div>
  );
}

/** Stream cadence target: one batch per animation frame. Real rate is measured, never hardcoded. */
const WORKBENCH_STREAM_UPDATES_PER_FRAME = 24;
const HERO_STREAM_UPDATES_PER_FRAME = 12;
const STREAM_HUD_SAMPLE_MS = 500;

type StreamPatch<T> = Partial<T> & { id: string };

/** `batchUpdate` is optional at runtime (not in the public GridManagerBuilder type yet). */
type ManagerWithBatch<T> = GridManagerBuilder<T> & {
  batchUpdate?: (patches: StreamPatch<T>[]) => unknown;
};

/**
 * Flush partial patches. Prefers manager().batchUpdate when the runtime provides it,
 * otherwise falls back to manager().update(patches).execute(). Returns flush duration in ms.
 */
function flushStreamPatches<T>(api: GridApi<T>, patches: StreamPatch<T>[]): number {
  const t0 = performance.now();
  const manager = api.manager() as ManagerWithBatch<T>;
  const batched = manager.batchUpdate?.(patches);
  if (batched !== undefined) {
    // batchUpdate may return a builder (needs execute) or apply immediately.
    const maybeExec = (batched as { execute?: () => unknown } | null)?.execute;
    if (typeof maybeExec === "function") maybeExec.call(batched);
  } else {
    manager.update(patches as unknown as T[]).execute();
  }
  return performance.now() - t0;
}

interface StreamHud {
  hz: number | null;
  patchesPerFrame: number | null;
  flushMs: number | null;
}

const EMPTY_HUD: StreamHud = { hz: null, patchesPerFrame: null, flushMs: null };

/** Measures flush frames/patches/ms from the rAF loop; publishes a snapshot every 500ms. */
function useStreamMetrics(active: boolean) {
  const acc = useRef({ frames: 0, patches: 0, lastMs: 0, sampleAt: 0 });
  const [hud, setHud] = useState<StreamHud>(EMPTY_HUD);

  const record = useCallback((patchCount: number, flushMs: number) => {
    const a = acc.current;
    a.frames += 1;
    a.patches += patchCount;
    a.lastMs = flushMs;
  }, []);

  useEffect(() => {
    if (!active) {
      setHud(EMPTY_HUD);
      return;
    }
    const a = acc.current;
    a.frames = 0;
    a.patches = 0;
    a.lastMs = 0;
    a.sampleAt = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      const dt = now - a.sampleAt;
      if (dt <= 0) return;
      setHud({
        hz: (a.frames * 1000) / dt,
        patchesPerFrame: a.frames > 0 ? a.patches / a.frames : 0,
        flushMs: a.frames > 0 ? a.lastMs : null,
      });
      a.frames = 0;
      a.patches = 0;
      a.sampleAt = now;
    }, STREAM_HUD_SAMPLE_MS);
    return () => window.clearInterval(id);
  }, [active]);

  return { hud, record };
}

function streamButtonLabel(streaming: boolean, hud: StreamHud, idle: string): string {
  if (!streaming) return idle;
  return hud.hz === null ? "Stop" : `Stop ${hud.hz.toFixed(0)} Hz`;
}

function StreamHudReadout({ hud }: { hud: StreamHud }) {
  return (
    <span className="stream-hud" aria-live="off" data-testid="stream-hud">
      {hud.hz === null
        ? "flush — Hz · — patches/frame · — ms"
        : `flush ${hud.hz.toFixed(1)} Hz · ${(hud.patchesPerFrame ?? 0).toFixed(1)} patches/frame · ${(hud.flushMs ?? 0).toFixed(2)} ms`}
    </span>
  );
}

export function HeroOrderbookSpecimen() {
  const gridId = "fg-hero-orderbook";
  const initialRows = useMemo(() => generateHeroOrderbook(48), []);
  const gridApiRef = useRef<GridApi<OrderbookRow> | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [fastFilter, setFastFilter] = useState(false);
  const [rowHeight, setRowHeight] = useState<28 | 36 | 46>(36);
  const counterRef = useRef(500);
  const { hud: heroHud, record: recordHeroFlush } = useStreamMetrics(streaming);

  const columns = useMemo<ColumnDef<OrderbookRow>[]>(
    () => [
      {
        field: "symbol",
        headerName: "Instrument",
        flex: 1.35,
        minWidth: 92,
        sortable: true,
        filterable: true,
        editable: true,
        cellRenderer: (params) => (
          <span style={{ fontWeight: 600, color: "#F4F4F6", letterSpacing: "0.02em" }}>
            {String(params.value ?? "")}
          </span>
        ),
      },
      {
        field: "venue",
        headerName: "Venue",
        flex: 1,
        minWidth: 72,
        sortable: true,
        filterable: true,
        editable: true,
        cellEditor: "select",
        cellEditorParams: { values: HERO_VENUES },
      },
      {
        field: "side",
        headerName: "Side",
        flex: 0.75,
        minWidth: 64,
        sortable: true,
        filterable: true,
        editable: true,
        cellEditor: "select",
        cellEditorParams: { values: ["BUY", "SELL"] },
        cellRenderer: (params) => {
          const isBuy = params.value === "BUY";
          return (
            <span
              style={{
                padding: "2px 8px",
                borderRadius: 999,
                fontSize: "10px",
                fontWeight: 600,
                background: isBuy ? "rgba(52,211,153,0.12)" : "rgba(248,113,113,0.12)",
                color: isBuy ? "#34D399" : "#F87171",
                border: `1px solid ${isBuy ? "rgba(52,211,153,0.28)" : "rgba(248,113,113,0.28)"}`,
              }}
            >
              {String(params.value)}
            </span>
          );
        },
      },
      {
        field: "bid",
        headerName: "Bid (USD)",
        flex: 1.1,
        minWidth: 84,
        sortable: true,
        filterable: true,
        filterType: "number",
        editable: true,
        cellEditor: "number",
        cellRenderer: (params) => (
          <span style={{ fontWeight: 600, color: "#F4F4F6" }}>
            ${Number(params.value ?? 0).toFixed(2)}
          </span>
        ),
      },
      {
        field: "volume",
        headerName: "Qty",
        flex: 0.85,
        minWidth: 64,
        sortable: true,
        filterType: "number",
        cellRenderer: (params) => (
          <span>{Number(params.value ?? 0).toLocaleString("en-US")}</span>
        ),
      },
      {
        field: "latencyMs",
        headerName: "Latency",
        flex: 1,
        minWidth: 76,
        sortable: true,
        filterable: true,
        filterType: "number",
        cellRenderer: (params) => {
          const v = Number(params.value ?? 0);
          return (
            <span style={{ color: v < 1.0 ? "#34D399" : "#A1A1AC" }}>
              {v.toFixed(2)} ms
            </span>
          );
        },
      },
    ],
    []
  );

  useEffect(() => {
    if (!streaming) return;
    const api = gridApiRef.current;
    // Live book: sort by bid so ticks re-rank rows (values-only updates leave order intact).
    if (api) {
      const current = api.getSortModel?.() ?? [];
      const live = current.length === 1 && current[0]?.field === "bid";
      if (!live) {
        api.setSortModel([{ field: "bid", direction: "desc" }]);
      }
    }
    let raf = 0;
    let alive = true;
    const tick = () => {
      if (!alive) return;
      const gridApi = gridApiRef.current;
      if (gridApi) {
        const displayed = gridApi.getDisplayedRows();
        const windowSize = Math.min(40, displayed.length);
        if (windowSize > 0) {
          const byId = new Map<string, StreamPatch<OrderbookRow>>();
          for (let i = 0; i < HERO_STREAM_UPDATES_PER_FRAME; i++) {
            const pick = displayed[Math.floor(Math.random() * windowSize)];
            if (!pick) continue;
            const data = pick.data;
            const delta = (Math.random() - 0.48) * 3.5;
            byId.set(data.id, {
              id: data.id,
              bid: Math.max(1, Math.round((data.bid + delta) * 100) / 100),
              latencyMs: Math.round((0.3 + Math.random() * 1.8) * 100) / 100,
            });
          }
          if (byId.size) {
            const patches = Array.from(byId.values());
            const ms = flushStreamPatches(gridApi, patches);
            recordHeroFlush(patches.length, ms);
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }, [streaming, recordHeroFlush]);

  const handleUpAddExecution = () => {
    const gridApi = gridApiRef.current;
    if (!gridApi) return;
    counterRef.current += 1;
    const n = counterRef.current;
    const newRow: OrderbookRow = {
      id: `EXEC-${n}`,
      symbol: HERO_SYMBOLS[n % HERO_SYMBOLS.length],
      venue: "SIX-ZRH",
      side: n % 2 === 0 ? "BUY" : "SELL",
      bid: Math.round((180 + Math.random() * 240) * 100) / 100,
      spreadBps: 0.6,
      volume: 2500,
      latencyMs: 0.42,
    };
    gridApi.manager().upAdd([newRow]).execute();
  };

  const handleToggleFastFilter = () => {
    const gridApi = gridApiRef.current;
    if (!gridApi) return;
    const next = !fastFilter;
    setFastFilter(next);
    if (next) {
      gridApi
        .params()
        .setFilterModel([
          {
            field: "latencyMs",
            filterType: "number",
            operator: "lessThan",
            value: 1.2,
          },
        ])
        .execute();
    } else {
      gridApi.params().removeAllFilter().execute();
    }
  };

  const handleResetHero = () => {
    const gridApi = gridApiRef.current;
    if (!gridApi) return;
    setFastFilter(false);
    setStreaming(false);
    gridApi.manager().replaceAll(initialRows).execute();
    gridApi.params().resetState().resetEdits().execute();
  };

  return (
    <div className="hero-visual-stage" id="hero-specimen">
      <div className="hero-stage-bar">
        <p className="hero-stage-label">
          {streaming ? <span className="live-pulse" aria-hidden="true" /> : null}
          Order book
        </p>

        <div className="hero-stage-pills" role="toolbar" aria-label="Hero FiboGrid controls">
          <button type="button" className="stage-pill-btn" onClick={handleUpAddExecution}>
            + upAdd()
          </button>
          <button
            type="button"
            className={`stage-pill-btn${streaming ? " is-active" : ""}`}
            onClick={() => setStreaming((s) => !s)}
          >
            {streamButtonLabel(streaming, heroHud, "Stream")}
          </button>
          <button
            type="button"
            className={`stage-pill-btn${fastFilter ? " is-active" : ""}`}
            onClick={handleToggleFastFilter}
          >
            &lt; 1.2ms
          </button>
          <button
            type="button"
            className="stage-pill-btn"
            onClick={() =>
              setRowHeight((h) => (h === 36 ? 28 : h === 28 ? 46 : 36))
            }
          >
            {rowHeight}px
          </button>
          <button type="button" className="stage-pill-btn" onClick={handleResetHero}>
            Reset
          </button>
        </div>
        {streaming ? (
          <div className="hero-stage-hud">
            <StreamHudReadout hud={heroHud} />
          </div>
        ) : null}
      </div>

      <FiboGrid<OrderbookRow>
        gridId={gridId}
        rowData={initialRows}
        columnDefs={columns}
        getRowId={(r) => r.id}
        height={340}
        rowHeight={rowHeight}
        headerHeight={40}
        rowSelection="single"
        rangeCellSelection
        theme="dark"
        className="fibogrid-theme-noir"
        onGridReady={(ev) => {
          gridApiRef.current = ev.api;
          ev.api.setSortModel([{ field: "bid", direction: "desc" }]);
        }}
        configs={{
          header: {
            show: false,
            filterRow: false,
          },
          center: {
            stripes: true,
            borders: false,
          },
          footer: {
            show: true,
            layout: ["status-info", "status-selected", "spacer"],
          },
        }}
      />

      <HeroEventTape gridId={gridId} streaming={streaming} />
    </div>
  );
}

/* ============================================================================
   2. "LIMITLESS POSSIBILITIES WITH FIBOGRID" — ASYMMETRIC 3-COLUMN WORKBENCH
      Clean, Spacious, Zero Filter-Row Clutter
   ============================================================================ */

export interface WorkbenchStockRow {
  id: string;
  ticker: string;
  company: string;
  sector: string;
  exchange: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  pe: number;
  isChild?: boolean;
}

const WB_TICKERS = [
  "NVDA", "ASML", "MSFT", "AAPL", "NESN", "NOVN", "ROG", "ABBN",
  "TSM", "AVGO", "SAP", "SIE", "AMZN", "GOOGL", "META", "ORCL",
  "AMD", "INTC", "CRM", "ADBE", "JPM", "V", "UBSG", "ZURN",
];

const WB_COMPANIES = [
  "NVIDIA Corp.", "ASML Holding", "Microsoft Corp.", "Apple Inc.",
  "Nestlé S.A.", "Novartis AG", "Roche Holding", "ABB Ltd.",
  "TSMC Ltd.", "Broadcom Inc.", "SAP SE", "Siemens AG",
  "Amazon.com Inc.", "Alphabet Inc.", "Meta Platforms", "Oracle Corp.",
  "AMD Inc.", "Intel Corp.", "Salesforce Inc.", "Adobe Inc.",
  "JPMorgan Chase", "Visa Inc.", "UBS Group AG", "Zurich Insurance",
];

const WB_SECTORS = [
  "Semiconductors",
  "Cloud & AI",
  "Swiss Industrials",
  "Quant Finance",
  "Life Sciences",
  "Energy Systems",
];

const WB_EXCHANGES = [
  "SIX Swiss",
  "NASDAQ",
  "XETRA",
  "NYSE",
  "LSE London",
  "B3 São Paulo",
];

function generateWorkbenchRows(count: number): WorkbenchStockRow[] {
  const rng = createSeededRng(20261014 + count);
  const rows: WorkbenchStockRow[] = new Array(count);
  const tLen = WB_TICKERS.length;
  const sLen = WB_SECTORS.length;
  const eLen = WB_EXCHANGES.length;

  for (let i = 0; i < count; i++) {
    const basePrice = 28 + rng() * 890;
    const change = (rng() - 0.47) * 24;
    const tickerBase = WB_TICKERS[i % tLen];
    rows[i] = {
      id: `FG-${i + 1}`,
      ticker: i < tLen ? tickerBase : `${tickerBase}.${i + 1}`,
      company: i < tLen ? WB_COMPANIES[i] : `${WB_COMPANIES[i % tLen]} #${i + 1}`,
      sector: WB_SECTORS[i % sLen],
      exchange: WB_EXCHANGES[i % eLen],
      price: Math.round(basePrice * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round((change / basePrice) * 10000) / 100,
      volume: Math.floor(150000 + rng() * 42000000),
      marketCap: Math.floor(12 + rng() * 2800),
      pe: Math.round((8 + rng() * 54) * 100) / 100,
    };
  }
  return rows;
}

type LocalePreset = "enUS" | "ptBR" | "esES";
type WorkbenchModeId = "virtualization" | "grouping" | "editing" | "density" | "streaming";

interface WorkbenchModeMeta {
  id: WorkbenchModeId;
  label: string;
  title: string;
  copy: string;
}

const WORKBENCH_MODES: WorkbenchModeMeta[] = [
  {
    id: "virtualization",
    label: "100K Virtualization",
    title: "How FiboGrid Renders 100,000 Rows Smoothly",
    copy: "Virtualization is no longer an afterthought. FiboGrid computes visible row and column windows in O(1) using prefix-sum offsets, mounting ≤ 44 DOM nodes regardless of dataset size.",
  },
  {
    id: "grouping",
    label: "Row Grouping",
    title: "Multi-Level Grouping & Real-Time Aggregations",
    copy: "Group 100,000 rows by Sector or Venue on the fly. Summary headers compute Σ Volume, Σ Market Cap, and μ P/E ratios automatically across every collapsed or expanded group.",
  },
  {
    id: "editing",
    label: "Transactional API",
    title: "Fluent Mutations via gridApi.manager()",
    copy: "Double-click any cell to edit inline or execute transactional delta batches with gridApi.manager().upAdd().update().remove().execute() without re-rendering parent React state.",
  },
  {
    id: "density",
    label: "Fibonacci Scale",
    title: "Proportioned on the Golden Ratio (φ = 1.618)",
    copy: "Every row height (28px compact, 38px canonical, 50px comfort), cell inset (13px), and header cadence follows Fibonacci proportions for effortless visual scanning.",
  },
  {
    id: "streaming",
    label: "Live Market Feed",
    title: "Live Tick Updates, Re-Ranked Every Frame",
    copy: "Stream partial price patches at animation-frame cadence while the book stays sorted by price. The HUD next to the button shows the measured flush rate, patches per frame and last flush time on your machine.",
  },
];

const LOCALE_MAP: Record<LocalePreset, FiboGridLocale> = {
  enUS,
  ptBR,
  esES,
};

export function MainWorkbenchSpecimen() {
  const gridId = "fg-main-workbench";

  const [activeMode, setActiveMode] = useState<WorkbenchModeId>("virtualization");
  const [rowCount, setRowCount] = useState<number>(10000);
  const [localeKey, setLocaleKey] = useState<LocalePreset>("enUS");
  const [groupByFields, setGroupByFields] = useState<string[] | undefined>(undefined);
  const [rowHeight, setRowHeight] = useState<28 | 38 | 50>(38);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const { hud: wbHud, record: recordWbFlush } = useStreamMetrics(isStreaming);

  const gridApiRef = useRef<GridApi<WorkbenchStockRow> | null>(null);

  const rows = useMemo(() => generateWorkbenchRows(rowCount), [rowCount]);

  const handleSelectMode = (mode: WorkbenchModeId) => {
    setActiveMode(mode);
    if (mode === "virtualization") {
      setGroupByFields(undefined);
      setRowHeight(38);
      setIsStreaming(false);
      startTransition(() => setRowCount(100000));
    } else if (mode === "grouping") {
      setGroupByFields(["sector"]);
      setRowHeight(38);
      setIsStreaming(false);
    } else if (mode === "editing") {
      setGroupByFields(undefined);
      setRowHeight(38);
      setIsStreaming(false);
      const gridApi = gridApiRef.current;
      if (gridApi) {
        const stamp = Math.floor(100 + Math.random() * 899);
        gridApi
          .manager()
          .upAdd([
            {
              id: `FG-NEW-${Date.now()}`,
              ticker: `FIB.${stamp}`,
              company: `Fibonacci Quant #${stamp}`,
              sector: "Cloud & AI",
              exchange: "SIX Swiss",
              price: 161.8,
              change: 6.18,
              changePercent: 3.97,
              volume: 1618000,
              marketCap: 340,
              pe: 21.0,
            },
          ])
          .execute();
      }
    } else if (mode === "density") {
      setGroupByFields(undefined);
      setRowHeight((h) => (h === 38 ? 28 : h === 28 ? 50 : 38));
      setIsStreaming(false);
    } else if (mode === "streaming") {
      setGroupByFields(undefined);
      setIsStreaming((s) => !s);
    }
  };

  const columns = useMemo<ColumnDef<WorkbenchStockRow>[]>(
    () => [
      {
        field: "ticker",
        headerName: "Ticker",
        width: 112,
        sortable: true,
        filterable: true,
        editable: true,
        cellRenderer: (params) => (
          <span style={{ fontWeight: 600, color: "#F4F4F6", letterSpacing: "0.02em" }}>
            {String(params.value ?? "")}
          </span>
        ),
      },
      {
        field: "company",
        headerName: "Entity",
        width: 175,
        sortable: true,
        filterable: true,
        editable: true,
      },
      {
        field: "sector",
        headerName: "Sector",
        width: 145,
        sortable: true,
        filterable: true,
        editable: true,
        cellEditor: "select",
        cellEditorParams: { values: WB_SECTORS },
      },
      {
        field: "price",
        headerName: "Price",
        width: 105,
        sortable: true,
        filterType: "number",
        editable: true,
        cellEditor: "number",
        cellRenderer: (params) => (
          <span style={{ fontWeight: 600, color: "#F4F4F6" }}>
            ${Number(params.value ?? 0).toFixed(2)}
          </span>
        ),
      },
      {
        field: "changePercent",
        headerName: "Delta",
        width: 98,
        sortable: true,
        filterType: "number",
        cellRenderer: (params) => {
          const v = Number(params.value ?? 0);
          const pos = v >= 0;
          return (
            <span
              style={{
                padding: "2px 8px",
                borderRadius: 999,
                fontSize: "10.5px",
                fontWeight: 600,
                background: pos ? "rgba(52,211,153,0.12)" : "rgba(248,113,113,0.12)",
                color: pos ? "#34D399" : "#F87171",
              }}
            >
              {pos ? "+" : ""}
              {v.toFixed(2)}%
            </span>
          );
        },
      },
      {
        field: "volume",
        headerName: "Volume",
        width: 108,
        sortable: true,
        filterType: "number",
        aggFunc: "sum",
        cellRenderer: (params) => {
          const v = Number(params.value ?? 0);
          if (v >= 1_000_000) return <span>{(v / 1_000_000).toFixed(1)}M</span>;
          if (v >= 1_000) return <span>{(v / 1_000).toFixed(0)}K</span>;
          return <span>{v}</span>;
        },
      },
      {
        field: "exchange",
        headerName: "Venue",
        width: 115,
        sortable: true,
        filterable: true,
        editable: true,
        cellEditor: "select",
        cellEditorParams: { values: WB_EXCHANGES },
      },
    ],
    []
  );

  useEffect(() => {
    if (!isStreaming) return;
    const api = gridApiRef.current;
    // Rank by live price so stream ticks re-order the book (unsorted = in-place value flicker only).
    if (api) {
      const current = api.getSortModel?.() ?? [];
      const live = current.length === 1 && current[0]?.field === "price";
      if (!live) {
        api.setSortModel([{ field: "price", direction: "desc" }]);
      }
    }
    let raf = 0;
    let alive = true;
    const tick = () => {
      if (!alive) return;
      const gridApi = gridApiRef.current;
      if (gridApi) {
        const visible = gridApi.getDisplayedRows();
        const windowSize = Math.min(60, visible.length);
        if (windowSize > 0) {
          const byId = new Map<string, StreamPatch<WorkbenchStockRow>>();
          for (let i = 0; i < WORKBENCH_STREAM_UPDATES_PER_FRAME; i++) {
            const node = visible[Math.floor(Math.random() * windowSize)];
            if (!node) continue;
            const data = node.data;
            const delta = (Math.random() - 0.48) * 6;
            const nextPrice = Math.max(1, Math.round((data.price + delta) * 100) / 100);
            const nextChange = Math.round((data.change + delta) * 100) / 100;
            byId.set(data.id, {
              id: data.id,
              price: nextPrice,
              change: nextChange,
              changePercent: Math.round((nextChange / nextPrice) * 10000) / 100,
            });
          }
          if (byId.size) {
            const patches = Array.from(byId.values());
            const ms = flushStreamPatches(gridApi, patches);
            recordWbFlush(patches.length, ms);
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }, [isStreaming, recordWbFlush]);

  const handleAddRow = () => {
    const gridApi = gridApiRef.current;
    if (!gridApi) return;
    const stamp = Math.floor(100 + Math.random() * 899);
    const newRow: WorkbenchStockRow = {
      id: `FG-NEW-${Date.now()}`,
      ticker: `FIB.${stamp}`,
      company: `Fibonacci Quant #${stamp}`,
      sector: "Cloud & AI",
      exchange: "SIX Swiss",
      price: 161.8,
      change: 6.18,
      changePercent: 3.97,
      volume: 1618000,
      marketCap: 340,
      pe: 21.0,
    };
    gridApi.manager().upAdd([newRow]).execute();
  };

  const handleResetAll = () => {
    const gridApi = gridApiRef.current;
    if (!gridApi) return;
    gridApi.manager().replaceAll(rows).execute();
    gridApi.params().resetState().resetEdits().execute();
    setGroupByFields(undefined);
    setIsStreaming(false);
    setSearchQuery("");
  };

  const handleSetRowCount = (cnt: number) => {
    if (cnt >= 100000) {
      startTransition(() => setRowCount(cnt));
    } else {
      setRowCount(cnt);
    }
  };

  return (
    <section className="possibilities-section" id="workbench" aria-labelledby="wb-heading">
      <div className="noir-wrap">
        <div className="possibilities-heading">
          <h2 className="noir-h2" id="wb-heading">
            LIMITLESS POSSIBILITIES
            <br />
            WITH FIBOGRID
          </h2>
        </div>

        <div className="possibilities-layout">
          {/* Left Column: Minimal Vertical Mode Selector */}
          <div className="possibilities-tabs" role="tablist" aria-label="Workbench modes">
            {WORKBENCH_MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={activeMode === m.id}
                className={`pos-tab-btn${activeMode === m.id ? " is-active" : ""}`}
                onClick={() => handleSelectMode(m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Center Column: Clean, Uncluttered Real <FiboGrid /> Frame */}
          <div className="possibilities-center-frame">
            {/* Single Sleek Control Bar (replaces the 3 stacked button rows + noisy inner toolbar) */}
            <div className="wb-clean-bar">
              <div className="wb-search-box">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter 100k rows..."
                  aria-label="Filter rows"
                />
              </div>

              <div className="wb-clean-pills">
                {[1000, 10000, 100000].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    className={`stage-pill-btn${rowCount === cnt ? " is-active" : ""}`}
                    onClick={() => handleSetRowCount(cnt)}
                  >
                    {cnt >= 1000 ? `${cnt / 1000}K` : cnt}
                  </button>
                ))}

                <span className="wb-bar-sep" aria-hidden="true" />

                <button
                  type="button"
                  className={`stage-pill-btn${groupByFields?.[0] === "sector" ? " is-active" : ""}`}
                  onClick={() =>
                    setGroupByFields((g) => (g?.[0] === "sector" ? undefined : ["sector"]))
                  }
                >
                  Group Sector
                </button>

                <button type="button" className="stage-pill-btn" onClick={handleAddRow}>
                  + upAdd()
                </button>

                <button
                  type="button"
                  className={`stage-pill-btn${isStreaming ? " is-active" : ""}`}
                  onClick={() => setIsStreaming((v) => !v)}
                >
                  {streamButtonLabel(isStreaming, wbHud, "Stream")}
                </button>

                <button
                  type="button"
                  className="stage-pill-btn"
                  onClick={() =>
                    gridApiRef.current?.exportToCsv({ fileName: "fibogrid-export.csv" })
                  }
                >
                  CSV
                </button>

                <button type="button" className="stage-pill-btn" onClick={handleResetAll}>
                  Reset
                </button>
              </div>
              {isStreaming ? (
                <div className="wb-stream-hud">
                  <StreamHudReadout hud={wbHud} />
                </div>
              ) : null}
            </div>

            <FiboGrid<WorkbenchStockRow>
              gridId={gridId}
              rowData={rows}
              columnDefs={columns}
              getRowId={(r) => r.id}
              height={420}
              rowHeight={rowHeight}
              headerHeight={42}
              quickFilterText={deferredSearchQuery}
              groupByFields={groupByFields}
              rowSelection="single"
              rangeCellSelection
              shortcuts
              theme="dark"
              lang={LOCALE_MAP[localeKey]}
              className="fibogrid-theme-noir"
              onGridReady={(ev) => {
                gridApiRef.current = ev.api;
              }}
              configs={{
                header: {
                  show: false,
                  filterRow: false,
                },
                center: {
                  stripes: true,
                  borders: false,
                },
                footer: {
                  show: true,
                  layout: ["status-info", "status-selected", "spacer"],
                },
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   3. INTER-GRID REGISTRY BUS — 2 LINKED REAL <FiboGrid /> INSTANCES
   ============================================================================ */

interface DeskMasterRow {
  id: string;
  deskCode: string;
  deskName: string;
  headTrader: string;
  varLimitM: number;
}

interface DeskOrderRow {
  id: string;
  deskId: string;
  instrument: string;
  strategy: string;
  notionalK: number;
  pnlUsd: number;
}

const DESK_MASTER_DATA: DeskMasterRow[] = [
  { id: "DESK-ZRH", deskCode: "ZRH-01", deskName: "Zurich Swiss Equities", headTrader: "M. Keller", varLimitM: 42 },
  { id: "DESK-NYC", deskCode: "NYC-02", deskName: "New York AI Semis", headTrader: "J. Vance", varLimitM: 85 },
  { id: "DESK-FRA", deskCode: "FRA-03", deskName: "Frankfurt Euro Rates", headTrader: "L. Weber", varLimitM: 64 },
  { id: "DESK-SAO", deskCode: "SAO-04", deskName: "São Paulo B3 Macro", headTrader: "F. Oliveira", varLimitM: 38 },
  { id: "DESK-LDN", deskCode: "LDN-05", deskName: "London G10 FX Vol", headTrader: "A. Sterling", varLimitM: 55 },
];

const DESK_ORDERS_DATA: DeskOrderRow[] = [
  { id: "POS-101", deskId: "DESK-ZRH", instrument: "NESN.SW", strategy: "StatArb MeanRev", notionalK: 1420, pnlUsd: 38400 },
  { id: "POS-102", deskId: "DESK-ZRH", instrument: "NOVN.SW", strategy: "Gamma Scalp", notionalK: 980, pnlUsd: 19200 },
  { id: "POS-103", deskId: "DESK-ZRH", instrument: "ABBN.SW", strategy: "Index Basis", notionalK: 2150, pnlUsd: -6400 },
  { id: "POS-201", deskId: "DESK-NYC", instrument: "NVDA.OQ", strategy: "Delta One Momentum", notionalK: 5400, pnlUsd: 184500 },
  { id: "POS-202", deskId: "DESK-NYC", instrument: "ASML.OQ", strategy: "Dispersion Pair", notionalK: 3100, pnlUsd: 62100 },
  { id: "POS-203", deskId: "DESK-NYC", instrument: "AVGO.OQ", strategy: "Vol Surface Skew", notionalK: 2750, pnlUsd: 41900 },
  { id: "POS-301", deskId: "DESK-FRA", instrument: "BUND-10Y", strategy: "Curve Steepener", notionalK: 8900, pnlUsd: 53200 },
  { id: "POS-302", deskId: "DESK-FRA", instrument: "SAP.DE", strategy: "DAX Cash-Future", notionalK: 1900, pnlUsd: 14800 },
  { id: "POS-401", deskId: "DESK-SAO", instrument: "DI1F29", strategy: "Selic Belly Carry", notionalK: 4200, pnlUsd: 91300 },
  { id: "POS-402", deskId: "DESK-SAO", instrument: "PETR4.SA", strategy: "Brent Cross-Hedge", notionalK: 1850, pnlUsd: 27600 },
  { id: "POS-403", deskId: "DESK-SAO", instrument: "VALE3.SA", strategy: "Iron Ore Basis", notionalK: 1640, pnlUsd: -4200 },
  { id: "POS-501", deskId: "DESK-LDN", instrument: "GBP/CHF", strategy: "SNB Corridor", notionalK: 6300, pnlUsd: 44700 },
  { id: "POS-502", deskId: "DESK-LDN", instrument: "EUR/USD", strategy: "ECB Event Vol", notionalK: 7500, pnlUsd: 31500 },
];

export function LinkedRegistrySpecimen() {
  const { getGridApi } = useGridRegistry();
  const [activeDesk, setActiveDesk] = useState<string>("All Desks");

  const masterColumns = useMemo<ColumnDef<DeskMasterRow>[]>(
    () => [
      { field: "deskCode", headerName: "Desk", width: 95, sortable: true },
      { field: "deskName", headerName: "Mandate", width: 185, sortable: true },
      { field: "headTrader", headerName: "Lead", width: 115, sortable: true },
      {
        field: "varLimitM",
        headerName: "VaR",
        width: 90,
        sortable: true,
        cellRenderer: (p) => <span style={{ fontWeight: 600 }}>${String(p.value)}M</span>,
      },
    ],
    []
  );

  const detailColumns = useMemo<ColumnDef<DeskOrderRow>[]>(
    () => [
      { field: "instrument", headerName: "Symbol", width: 110, sortable: true },
      { field: "deskId", headerName: "Desk ID", width: 105, sortable: true },
      { field: "strategy", headerName: "Strategy", width: 165, sortable: true },
      {
        field: "notionalK",
        headerName: "Notional",
        width: 105,
        sortable: true,
        cellRenderer: (p) => <span>${Number(p.value ?? 0).toLocaleString("en-US")}K</span>,
      },
      {
        field: "pnlUsd",
        headerName: "Net PnL",
        width: 115,
        sortable: true,
        editable: true,
        cellEditor: "number",
        cellRenderer: (p) => {
          const v = Number(p.value ?? 0);
          const pos = v >= 0;
          return (
            <span style={{ fontWeight: 600, color: pos ? "#34D399" : "#F87171" }}>
              {pos ? "+" : ""}${v.toLocaleString("en-US")}
            </span>
          );
        },
      },
    ],
    []
  );

  const handleMasterRowClick = useCallback(
    (e: { rowData: DeskMasterRow }) => {
      const detailApi = getGridApi("fg-registry-orders");
      if (!detailApi) return;
      const deskId = e.rowData.id;
      setActiveDesk(`${e.rowData.deskCode} · ${e.rowData.deskName}`);
      detailApi
        .params()
        .setFilterModel([
          {
            field: "deskId",
            filterType: "text",
            operator: "equals",
            value: deskId,
          },
        ])
        .execute();
    },
    [getGridApi]
  );

  const handleClearLinkFilter = useCallback(() => {
    const masterApi = getGridApi("fg-registry-desks");
    const detailApi = getGridApi("fg-registry-orders");
    masterApi?.params().resetState().execute();
    detailApi?.params().resetState().execute();
    setActiveDesk("All Desks");
  }, [getGridApi]);

  return (
    <section className="linked-section" id="linked-grids" aria-labelledby="lg-heading">
      <div className="noir-wrap">
        <div className="linked-panorama-card">
          <div className="linked-panorama-head">
            <div>
              <h2 className="noir-h2" id="lg-heading" style={{ fontSize: "clamp(24px, 2.6vw, 34px)" }}>
                INTER-GRID REGISTRY ORCHESTRATION
              </h2>
              <p className="noir-copy" style={{ marginTop: 8, maxWidth: "58ch" }}>
                Click any desk row in the left <code style={{ color: "#F4F4F6" }}>&lt;FiboGrid /&gt;</code>{" "}
                to filter the right <code style={{ color: "#F4F4F6" }}>&lt;FiboGrid /&gt;</code> directly
                via <code style={{ color: "#F4F4F6" }}>useGridRegistry().getGridApi()</code>.
              </p>
            </div>

            <button
              type="button"
              className="stage-pill-btn"
              onClick={handleClearLinkFilter}
            >
              Active Filter: {activeDesk} (Reset)
            </button>
          </div>

          <div className="linked-pair-grid">
            <div className="linked-subcard">
              <div className="linked-subcard-bar">
                <span>MASTER · fg-registry-desks</span>
                <span>Click a row →</span>
              </div>
              <FiboGrid<DeskMasterRow>
                gridId="fg-registry-desks"
                rowData={DESK_MASTER_DATA}
                columnDefs={masterColumns}
                getRowId={(r) => r.id}
                height={270}
                rowHeight={36}
                headerHeight={38}
                rowSelection="single"
                onRowClicked={(e) => handleMasterRowClick({ rowData: e.rowNode.data })}
                theme="dark"
                className="fibogrid-theme-noir"
                configs={{
                  header: { show: false, filterRow: false },
                  center: { stripes: true, borders: false },
                  footer: {
                    show: true,
                    layout: ["status-info", "spacer"],
                  },
                }}
              />
            </div>

            <div className="linked-subcard">
              <div className="linked-subcard-bar">
                <span>SUBSCRIBER · fg-registry-orders</span>
                <span>Double-click Net PnL to edit</span>
              </div>
              <FiboGrid<DeskOrderRow>
                gridId="fg-registry-orders"
                rowData={DESK_ORDERS_DATA}
                columnDefs={detailColumns}
                getRowId={(r) => r.id}
                height={270}
                rowHeight={36}
                headerHeight={38}
                rowSelection="single"
                theme="dark"
                className="fibogrid-theme-noir"
                configs={{
                  header: { show: false, filterRow: false },
                  center: { stripes: true, borders: false },
                  footer: {
                    show: true,
                    layout: ["status-info", "spacer"],
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function RealFiboGridProvider({ children }: { children: React.ReactNode }) {
  return <GridRegistryProvider>{children}</GridRegistryProvider>;
}
