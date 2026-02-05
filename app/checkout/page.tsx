"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Category = "Cocktails" | "Beer" | "Wine" | "Mocktails" | "Shots";

type CartLine = {
  id: string;
  name: string;
  price: number;
  category: Category;
  qty: number;
};

type CartPayload = {
  lines: CartLine[];
  orderNote?: string;
};

const CART_KEY = "qr_cart";

function formatSek(v: number) {
  return new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK" }).format(v);
}

// Kommentar tillåts bara för “drinkar” (inte öl/vin)
function canComment(category: Category) {
  return category === "Cocktails" || category === "Mocktails" || category === "Shots";
}

export default function CheckoutPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartPayload>({ lines: [], orderNote: "" });

  // per-rad kommentar (bara drinkar)
  const [lineComments, setLineComments] = useState<Record<string, string>>({});

  // bordsnummer (valfritt – du kan koppla från QR senare)
  const [table, setTable] = useState("");

  const totals = useMemo(() => {
    const count = cart.lines.reduce((s, l) => s + l.qty, 0);
    const sum = cart.lines.reduce((s, l) => s + l.qty * l.price, 0);
    return { count, sum };
  }, [cart.lines]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartPayload;
        setCart({
          lines: Array.isArray(parsed.lines) ? parsed.lines : [],
          orderNote: typeof parsed.orderNote === "string" ? parsed.orderNote : "",
        });
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  // Om kundvagn är tom -> tillbaka
  useEffect(() => {
    if (!loading && cart.lines.length === 0) {
      // ingen order => tillbaka till kundsidan
      router.replace("/kund");
    }
  }, [loading, cart.lines.length, router]);

  function updateQty(id: string, delta: number) {
    setCart((prev) => {
      const next = prev.lines
        .map((l) => (l.id === id ? { ...l, qty: l.qty + delta } : l))
        .filter((l) => l.qty > 0);
      return { ...prev, lines: next };
    });
  }

  async function submit() {
    if (cart.lines.length === 0) return;

    // bygg payload som API:t förväntar sig
    const payload = {
      table: table.trim() || undefined,
      orderNote: cart.orderNote || "",
      lines: cart.lines.map((l) => ({
        id: l.id,
        name: l.name,
        qty: l.qty,
        price: l.price,
        category: l.category,
        comment: canComment(l.category) ? (lineComments[l.id] ?? "") : "",
      })),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("POST /api/orders failed:", data);
        alert(`Kunde inte skicka order.\n${data?.error ?? "Okänt fel"}`);
        return;
      }

      // rensa
      localStorage.removeItem(CART_KEY);

      alert("Beställning skickad! ✅");
      router.push("/kund");
    } catch (e: any) {
      console.error(e);
      alert("Något gick fel när vi skulle skicka ordern. Kolla internet/console.");
    }
  }

  if (loading) {
    return <div className="min-h-dvh bg-[#0b3a33] text-stone-100 p-6">Laddar…</div>;
  }

  return (
    <div className="min-h-dvh bg-[#0b3a33] text-stone-100">
      <div className="mx-auto w-full max-w-md px-4 pt-6 pb-28">
        <div className="rounded-3xl border border-amber-200/25 bg-black/10 p-4 shadow-[0_30px_80px_rgba(0,0,0,.35)] backdrop-blur-[2px]">
          <header className="px-2 pb-4 pt-2 text-center">
            <p className="text-xs uppercase tracking-[0.28em] text-amber-100/70">Checkout</p>
            <h1 className="mt-2 text-4xl leading-none text-amber-50 drop-shadow">DIN ORDER</h1>
            <p className="mt-3 text-sm text-stone-100/75">Kontrollera och skicka till baren.</p>
          </header>

          {/* Bord (valfritt) */}
          <section className="px-1 pb-3">
            <label className="block text-xs uppercase tracking-[0.18em] text-amber-100/70">
              Bord (valfritt)
            </label>
            <input
              value={table}
              onChange={(e) => setTable(e.target.value)}
              placeholder="t.ex. 12"
              className="mt-2 h-11 w-full rounded-2xl border border-amber-200/15 bg-black/20 px-3 text-base text-stone-100 placeholder:text-stone-100/40 outline-none focus:border-amber-200/30"
            />
          </section>

          {/* Items */}
          <section className="space-y-3 px-1 pb-2">
            {cart.lines.map((l) => (
              <div key={l.id} className="rounded-2xl border border-amber-200/15 bg-black/15 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-lg text-amber-50">{l.name}</div>
                    <div className="mt-1 text-xs text-stone-100/60">{l.category}</div>
                    <div className="mt-2 text-sm text-stone-100/75">
                      {l.qty} × {formatSek(l.price)} ={" "}
                      <span className="text-amber-50">{formatSek(l.qty * l.price)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(l.id, -1)}
                      className="h-11 w-11 rounded-full border border-amber-200/20 bg-white/5 text-lg hover:bg-white/10"
                    >
                      −
                    </button>
                    <div className="w-8 text-center">{l.qty}</div>
                    <button
                      onClick={() => updateQty(l.id, +1)}
                      className="h-11 w-11 rounded-full border border-amber-200/20 bg-white/5 text-lg hover:bg-white/10"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Kommentar per DRINK-rad */}
                {canComment(l.category) ? (
                  <div className="mt-3">
                    <label className="block text-xs uppercase tracking-[0.18em] text-amber-100/70">
                      Kommentar (endast drinkar)
                    </label>
                    <input
                      value={lineComments[l.id] ?? ""}
                      onChange={(e) =>
                        setLineComments((prev) => ({ ...prev, [l.id]: e.target.value }))
                      }
                      placeholder='t.ex. "utan is"'
                      className="mt-2 h-11 w-full rounded-2xl border border-amber-200/15 bg-black/20 px-3 text-base text-stone-100 placeholder:text-stone-100/40 outline-none focus:border-amber-200/30"
                    />
                  </div>
                ) : null}
              </div>
            ))}
          </section>

          {/* Ordernotis */}
          <section className="mt-3 px-1 pb-2">
            <label className="block text-xs uppercase tracking-[0.18em] text-amber-100/70">
              Ordernotis (valfritt)
            </label>
            <textarea
              value={cart.orderNote ?? ""}
              onChange={(e) => setCart((p) => ({ ...p, orderNote: e.target.value }))}
              rows={3}
              placeholder="Skriv här…"
              className="mt-2 w-full resize-none rounded-2xl border border-amber-200/15 bg-black/20 p-3 text-base text-stone-100 placeholder:text-stone-100/40 outline-none focus:border-amber-200/30"
            />
          </section>
        </div>
      </div>

      {/* Sticky footer */}
      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-md px-4">
        <div className="mb-3 rounded-2xl border border-amber-200/20 bg-black/35 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_25px_80px_rgba(0,0,0,.55)] backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-amber-100/70">Summa</div>
              <div className="mt-1 text-sm text-stone-100/80">
                {totals.count} st • <span className="text-amber-50">{formatSek(totals.sum)}</span>
              </div>
            </div>

            <button
              onClick={submit}
              disabled={cart.lines.length === 0}
              className={[
                "h-11 rounded-full px-5 text-sm font-medium transition border border-amber-200/25",
                cart.lines.length === 0
                  ? "cursor-not-allowed bg-white/5 text-stone-100/40"
                  : "bg-amber-100/15 text-amber-50 hover:bg-amber-100/20 active:scale-[0.99]",
              ].join(" ")}
            >
              Skicka beställning
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
