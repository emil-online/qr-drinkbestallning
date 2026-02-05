"use client";

import { useEffect, useMemo, useState } from "react";

type Category = "Cocktails" | "Beer" | "Wine" | "Mocktails" | "Shots";
type OrderStatus = "NY" | "PABORJAD" | "KLAR" | "UTLAMNAD" | "ARKIV";

type OrderLine = {
  id: string;
  name: string;
  qty: number;
  price: number;
  category: Category;
  comment?: string;
};

type Order = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  lines: OrderLine[];
  orderNote?: string;
  table?: string;
};

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function sumOrder(o: Order) {
  return o.lines.reduce((s, l) => s + l.qty * l.price, 0);
}

function formatSek(v: number) {
  return new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK" }).format(v);
}

function isActiveStatus(s: OrderStatus) {
  return s !== "ARKIV";
}

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<"AKTIV" | "ARKIV">("AKTIV");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [err, setErr] = useState<string>("");

  async function load() {
    try {
      setErr("");
      const res = await fetch("/api/orders", { cache: "no-store" });
      const data = await res.json();

      if (!res.ok) {
        setErr(data?.error ?? "Kunde inte läsa ordrar");
        return;
      }

      setOrders(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setErr(e?.message ?? "Nätverksfel");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 2000);
    return () => clearInterval(t);
  }, []);

  async function setStatus(id: string, status: OrderStatus) {
    setBusy((p) => ({ ...p, [id]: true }));
    setErr("");

    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data?.error ?? "Kunde inte uppdatera order");
        return;
      }

      // Optimistisk uppdatering i UI direkt (snabbare känsla under stress)
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    } catch (e: any) {
      setErr(e?.message ?? "Nätverksfel");
    } finally {
      setBusy((p) => ({ ...p, [id]: false }));
    }
  }

  const { activeOrders, archivedOrders, counts } = useMemo(() => {
    const active = orders.filter((o) => isActiveStatus(o.status));
    const archived = orders.filter((o) => o.status === "ARKIV");

    const weight: Record<OrderStatus, number> = {
      NY: 0,
      PABORJAD: 1,
      KLAR: 2,
      UTLAMNAD: 2,
      ARKIV: 99,
    };

    const sortedActive = [...active].sort((a, b) => {
      const wa = weight[a.status] ?? 10;
      const wb = weight[b.status] ?? 10;

      if (wa !== wb) return wa - wb;

      if (a.status === "KLAR" && b.status === "KLAR") {
        return a.createdAt < b.createdAt ? -1 : 1;
      }

      return a.createdAt < b.createdAt ? 1 : -1;
    });

    const sortedArchived = [...archived].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

    const c = {
      ny: active.filter((o) => o.status === "NY").length,
      pab: active.filter((o) => o.status === "PABORJAD").length,
      klar: active.filter((o) => o.status === "KLAR").length,
      arkiv: archived.length,
    };

    return { activeOrders: sortedActive, archivedOrders: sortedArchived, counts: c };
  }, [orders]);

  return (
    <div className="min-h-dvh bg-slate-100 text-slate-900">
      {/* Topbar */}
      <div className="sticky top-0 z-30 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="text-lg font-semibold">Admin</div>

            <div className="hidden sm:flex items-center gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">Nya: {counts.ny}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">
                Påbörjade: {counts.pab}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">Klara: {counts.klar}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("AKTIV")}
              className={[
                "h-10 rounded-full px-4 text-sm font-medium",
                activeTab === "AKTIV" ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-900",
              ].join(" ")}
            >
              Aktiv
            </button>

            <button
              onClick={() => setActiveTab("ARKIV")}
              className={[
                "h-10 rounded-full px-4 text-sm font-medium",
                activeTab === "ARKIV" ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-900",
              ].join(" ")}
            >
              Arkiv ({counts.arkiv})
            </button>

            <button
              onClick={load}
              className="h-10 rounded-full bg-slate-200 px-4 text-sm font-medium hover:bg-slate-300"
            >
              Uppdatera
            </button>
          </div>
        </div>

        {err ? (
          <div className="mx-auto max-w-6xl px-4 pb-3">
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>
          </div>
        ) : null}
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-4">
        {loading ? <div className="text-sm text-slate-600">Laddar…</div> : null}

        {activeTab === "AKTIV" ? (
          <>
            <div className="mb-3 flex flex-wrap gap-2 sm:hidden">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium border">Nya: {counts.ny}</span>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium border">
                Påbörjade: {counts.pab}
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium border">Klara: {counts.klar}</span>
            </div>

            {activeOrders.length === 0 ? (
              <div className="rounded-2xl border bg-white p-6 text-center text-slate-600">Inga aktiva ordrar.</div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {activeOrders.map((o) => (
                  <OrderCard
                    key={o.id}
                    o={o}
                    busy={!!busy[o.id]}
                    onStart={() => setStatus(o.id, "PABORJAD")}
                    onDone={() => setStatus(o.id, "KLAR")}
                    onArchive={() => setStatus(o.id, "ARKIV")}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {archivedOrders.length === 0 ? (
              <div className="rounded-2xl border bg-white p-6 text-center text-slate-600">Arkivet är tomt.</div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {archivedOrders.map((o) => (
                  <ArchivedCard key={o.id} o={o} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function OrderCard({
  o,
  busy,
  onStart,
  onDone,
  onArchive,
}: {
  o: Order;
  busy: boolean;
  onStart: () => void;
  onDone: () => void;
  onArchive: () => void;
}) {
  // Tydligare färger + stark vänsterkant + lätt “glow” så status syns direkt.
  const style =
    o.status === "PABORJAD"
      ? "bg-yellow-200 border-yellow-500 ring-2 ring-yellow-400/60 shadow-[0_8px_22px_rgba(234,179,8,0.28)]"
      : o.status === "KLAR"
      ? "bg-green-200 border-green-600 ring-2 ring-green-500/60 shadow-[0_8px_22px_rgba(34,197,94,0.28)]"
      : "bg-white border-slate-300 shadow-sm";

  const leftBar =
    o.status === "PABORJAD"
      ? "bg-yellow-500"
      : o.status === "KLAR"
      ? "bg-green-600"
      : "bg-slate-300";

  return (
    <article className={`relative overflow-hidden rounded-2xl border p-4 ${style}`}>
      {/* stark status-markering */}
      <div className={`absolute left-0 top-0 h-full w-2 ${leftBar}`} />

      <div className="flex items-start justify-between gap-3 pl-1">
        <div className="min-w-0">
          <div className="text-sm font-semibold">{o.table ? `Bord ${o.table}` : "Order"}</div>
          <div className="mt-1 text-xs text-slate-700">{formatTime(o.createdAt)}</div>
        </div>

        <div
          className={[
            "rounded-full px-2.5 py-1 text-xs font-bold",
            o.status === "NY"
              ? "bg-slate-900 text-white"
              : o.status === "PABORJAD"
              ? "bg-yellow-600 text-white"
              : "bg-green-700 text-white",
          ].join(" ")}
        >
          {o.status === "NY" ? "NY" : o.status === "PABORJAD" ? "PÅBÖRJAD" : "KLAR"}
        </div>
      </div>

      <div className="mt-3 space-y-2 pl-1">
        {o.lines.map((l) => (
          <div key={l.id} className="rounded-xl border border-slate-300 bg-white/80 px-3 py-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-sm font-medium">
                  {l.qty}× {l.name}
                </div>
                {l.comment?.trim() ? (
                  <div className="mt-1 text-xs text-slate-800">
                    <span className="font-semibold">Kommentar:</span> {l.comment}
                  </div>
                ) : null}
              </div>
              <div className="text-xs text-slate-800">{formatSek(l.qty * l.price)}</div>
            </div>
          </div>
        ))}
      </div>

      {o.orderNote?.trim() ? (
        <div className="mt-3 rounded-xl border border-slate-300 bg-white/80 px-3 py-2 text-xs text-slate-800 pl-1">
          {o.orderNote}
        </div>
      ) : null}

      <div className="mt-3 flex items-center justify-between pl-1">
        <div className="text-sm font-semibold">{formatSek(sumOrder(o))}</div>

        <div className="flex gap-2">
          <button
            onClick={onStart}
            disabled={busy || o.status !== "NY"}
            className={[
              "h-10 rounded-xl px-3 text-sm font-semibold",
              o.status !== "NY"
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-yellow-500 text-white hover:bg-yellow-600 shadow-sm",
            ].join(" ")}
          >
            Påbörja
          </button>

          <button
            onClick={onDone}
            disabled={busy || (o.status !== "NY" && o.status !== "PABORJAD")}
            className={[
              "h-10 rounded-xl px-3 text-sm font-semibold",
              o.status === "KLAR"
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700 shadow-sm",
            ].join(" ")}
          >
            Klar
          </button>

          <button
            onClick={onArchive}
            disabled={busy || o.status !== "KLAR"}
            className={[
              "h-10 rounded-xl px-3 text-sm font-semibold",
              o.status !== "KLAR"
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-slate-900 text-white hover:bg-slate-800 shadow-sm",
            ].join(" ")}
          >
            Arkivera
          </button>
        </div>
      </div>
    </article>
  );
}

function ArchivedCard({ o }: { o: Order }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm opacity-90">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-semibold">{o.table ? `Bord ${o.table}` : "Order"}</div>
          <div className="mt-1 text-xs text-slate-600">{formatTime(o.createdAt)}</div>
        </div>
        <div className="text-xs font-semibold text-slate-600">ARKIV</div>
      </div>

      <div className="mt-3 space-y-2">
        {o.lines.map((l) => (
          <div key={l.id} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <div className="flex items-start justify-between gap-2">
              <div className="text-sm">
                {l.qty}× {l.name}
              </div>
              <div className="text-xs text-slate-700">{formatSek(l.qty * l.price)}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 text-sm font-semibold">{formatSek(sumOrder(o))}</div>
    </article>
  );
}
