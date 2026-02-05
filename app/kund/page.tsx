'use client';

import { useMemo, useState } from 'react';
import { Playfair_Display, Inter } from 'next/font/google';

const display = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

type Drink = {
  id: string;
  name: string;
  desc: string;
  price: number; // SEK
  category: 'Cocktails' | 'Beer' | 'Wine' | 'Mocktails' | 'Shots';
  tags?: string[];
};

const DRINKS: Drink[] = [
  {
    id: 'd1',
    name: 'Pitcher’s Paloma',
    desc: 'Tequila, grapefrukt, lime, sodavatten.',
    price: 149,
    category: 'Cocktails',
    tags: ['Fräsch', 'Citrus'],
  },
  {
    id: 'd2',
    name: 'Espresso Martini',
    desc: 'Vodka, kaffe, kaffelikör.',
    price: 155,
    category: 'Cocktails',
    tags: ['Kaffe', 'Klassiker'],
  },
  {
    id: 'd3',
    name: 'Gin & Tonic',
    desc: 'Gin, tonic, citrus (välj garnish).',
    price: 139,
    category: 'Cocktails',
    tags: ['Klassiker'],
  },
  {
    id: 'd4',
    name: 'Hazy IPA (40cl)',
    desc: 'Humlig, fruktig, lätt bitter.',
    price: 89,
    category: 'Beer',
    tags: ['IPA'],
  },
  {
    id: 'd5',
    name: 'Lager (40cl)',
    desc: 'Krispig och lätt.',
    price: 79,
    category: 'Beer',
  },
  {
    id: 'd6',
    name: 'Rött vin (glas)',
    desc: 'Mjukt och bärigt.',
    price: 109,
    category: 'Wine',
  },
  {
    id: 'd7',
    name: 'Vitt vin (glas)',
    desc: 'Friskt och aromatiskt.',
    price: 109,
    category: 'Wine',
  },
  {
    id: 'd8',
    name: 'Nojito',
    desc: 'Mynta, lime, socker, sodavatten.',
    price: 95,
    category: 'Mocktails',
    tags: ['Alkoholfri'],
  },
  {
    id: 'd9',
    name: 'Sour Shot',
    desc: 'Syrlig shot (fråga personal om dagens).',
    price: 69,
    category: 'Shots',
  },
];

type CartItem = { drink: Drink; qty: number };

const CATEGORIES: Drink['category'][] = ['Cocktails', 'Beer', 'Wine', 'Mocktails', 'Shots'];

function formatSek(v: number) {
  return new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(v);
}

export default function KundDrinkMenyPage() {
  const [active, setActive] = useState<Drink['category']>('Cocktails');
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [note, setNote] = useState('');

  const filtered = useMemo(() => DRINKS.filter((d) => d.category === active), [active]);

  const totals = useMemo(() => {
    const items = Object.values(cart);
    const count = items.reduce((s, it) => s + it.qty, 0);
    const sum = items.reduce((s, it) => s + it.qty * it.drink.price, 0);
    return { count, sum };
  }, [cart]);

  function add(drink: Drink) {
    setCart((prev) => {
      const existing = prev[drink.id];
      return {
        ...prev,
        [drink.id]: { drink, qty: (existing?.qty ?? 0) + 1 },
      };
    });
  }

  function remove(drinkId: string) {
    setCart((prev) => {
      const existing = prev[drinkId];
      if (!existing) return prev;
      const nextQty = existing.qty - 1;
      if (nextQty <= 0) {
        const { [drinkId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [drinkId]: { ...existing, qty: nextQty } };
    });
  }

  async function submitOrder() {
    if (totals.count === 0) return;

    alert(
      `Beställning skickad!\nAntal: ${totals.count}\nSumma: ${formatSek(totals.sum)}\nNotis: ${note || '-'}`
    );
    setCart({});
    setNote('');
  }

  return (
    <div className={`${display.variable} ${inter.variable} min-h-dvh text-stone-100`}>
      {/* Bakgrund i "Pitcher’s"-känsla */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#0b3a33]" />
        <div
          className="absolute inset-0 opacity-[0.18] mix-blend-overlay"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 10%, rgba(255,255,255,.12), transparent 35%), radial-gradient(circle at 80% 30%, rgba(255,255,255,.10), transparent 40%), radial-gradient(circle at 40% 90%, rgba(0,0,0,.25), transparent 45%)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/35" />
      </div>

      {/* Mobilopt: extra bottom padding + safe-area så inget hamnar bakom sticky bar */}
      <div
        className={[
          'mx-auto w-full max-w-md px-4 pt-6',
          // mer plats för sticky bar på mobil + safe area för iPhone
          'pb-[calc(8.5rem+env(safe-area-inset-bottom))]',
        ].join(' ')}
      >
        <div className="relative rounded-3xl border border-amber-200/25 bg-black/10 p-4 shadow-[0_30px_80px_rgba(0,0,0,.35)] backdrop-blur-[2px]">
          <div className="pointer-events-none absolute inset-3 rounded-[22px] border border-amber-200/15" />

          <header className="px-2 pb-4 pt-2 text-center">
            <p className="text-xs uppercase tracking-[0.28em] text-amber-100/70">Food, Drinks & Friends</p>
            <h1 className="mt-2 font-[var(--font-display)] text-5xl leading-none text-amber-50 drop-shadow">
              DRINKMENY
            </h1>
            <p className="mt-3 text-sm text-stone-100/75">
              Beställ och betala här så serverar vi dig vid bordet.
            </p>
          </header>

          {/* Mobilopt: lite större touch-yta, och “snap” känsla när man scrollar kategorier */}
          <nav className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-3 [scrollbar-width:none]">
            {CATEGORIES.map((c) => {
              const isActive = c === active;
              return (
                <button
                  key={c}
                  onClick={() => setActive(c)}
                  className={[
                    'shrink-0 rounded-full text-sm transition',
                    'border border-amber-200/20',
                    // mobilopt: större touch target (min 44px höjd)
                    'h-11 px-4',
                    isActive
                      ? 'bg-amber-100/15 text-amber-50 shadow-[0_10px_20px_rgba(0,0,0,.25)]'
                      : 'bg-black/10 text-stone-100/80 hover:bg-white/5',
                  ].join(' ')}
                >
                  {c}
                </button>
              );
            })}
          </nav>

          <section className="space-y-3 px-1 pb-2">
            {filtered.map((d) => (
              <div
                key={d.id}
                className="rounded-2xl border border-amber-200/15 bg-black/15 p-4 backdrop-blur-[1px]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-[var(--font-display)] text-xl leading-tight text-amber-50">{d.name}</h3>
                    <p className="mt-1 text-sm text-stone-100/75">{d.desc}</p>

                    {!!d.tags?.length && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {d.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded-full border border-amber-200/15 bg-white/5 px-2.5 py-1 text-xs text-amber-50/80"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="text-sm font-medium text-amber-50">{formatSek(d.price)}</div>

                    {/* Mobilopt: större knapp (h-11) */}
                    <button
                      onClick={() => add(d)}
                      className="h-11 rounded-full border border-amber-200/25 bg-amber-100/15 px-4 text-sm text-amber-50 hover:bg-amber-100/20 active:scale-[0.98]"
                    >
                      Lägg till
                    </button>
                  </div>
                </div>

                {cart[d.id]?.qty ? (
                  <div className="mt-3 flex items-center justify-between rounded-xl border border-amber-200/10 bg-black/10 px-3 py-2">
                    <span className="text-sm text-stone-100/80">I beställning</span>

                    <div className="flex items-center gap-2">
                      {/* Mobilopt: 44x44 touch target */}
                      <button
                        onClick={() => remove(d.id)}
                        className="h-11 w-11 rounded-full border border-amber-200/20 bg-white/5 text-lg leading-none hover:bg-white/10 active:scale-[0.98]"
                        aria-label="Minska"
                      >
                        −
                      </button>

                      <span className="w-10 text-center text-sm">{cart[d.id].qty}</span>

                      <button
                        onClick={() => add(d)}
                        className="h-11 w-11 rounded-full border border-amber-200/20 bg-white/5 text-lg leading-none hover:bg-white/10 active:scale-[0.98]"
                        aria-label="Öka"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </section>

          <section className="mt-3 px-1 pb-2">
            <label className="block text-xs uppercase tracking-[0.18em] text-amber-100/70">
              Kommentar (t.ex. “utan is”)
            </label>

            {/* Mobilopt: text-base (>=16px) så iOS inte auto-zooma */}
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Skriv här…"
              className="mt-2 w-full resize-none rounded-2xl border border-amber-200/15 bg-black/20 p-3 text-base text-stone-100 placeholder:text-stone-100/40 outline-none focus:border-amber-200/30"
            />
          </section>
        </div>
      </div>

      {/* Sticky “kundvagn” – mobilopt: safe-area, bättre padding, större knapp */}
      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-md px-4">
        <div
          className={[
            'rounded-2xl border border-amber-200/20 bg-black/35 shadow-[0_25px_80px_rgba(0,0,0,.55)] backdrop-blur',
            // mobilopt: extra padding + safe area
            'p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]',
            // liten lyft från botten på mobiler med home-indicator
            'mb-3',
          ].join(' ')}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-[0.18em] text-amber-100/70">Din beställning</div>
              <div className="mt-1 text-sm text-stone-100/80">
                {totals.count === 0 ? 'Inga produkter valda' : `${totals.count} st • ${formatSek(totals.sum)}`}
              </div>
            </div>

            <button
              onClick={submitOrder}
              disabled={totals.count === 0}
              className={[
                'h-11 rounded-full px-5 text-sm font-medium transition',
                'border border-amber-200/25',
                totals.count === 0
                  ? 'cursor-not-allowed bg-white/5 text-stone-100/40'
                  : 'bg-amber-100/15 text-amber-50 hover:bg-amber-100/20 active:scale-[0.99]',
              ].join(' ')}
            >
              Skicka
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
