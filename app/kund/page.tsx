'use client';

import { useEffect, useMemo, useState } from 'react';
import { Playfair_Display, Inter } from 'next/font/google';
import { useRouter } from 'next/navigation';

const display = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

type Category = 'Cocktails' | 'Beer' | 'Wine' | 'Mocktails' | 'Shots';

type Drink = {
  id: string;
  name: string;
  desc: string;
  price: number; // SEK
  category: Category;
  tags?: string[];
};

const DRINKS: Drink[] = [
  // =========================
  // COCKTAILS (Drinkar)
  // =========================
  {
    id: 'c1',
    name: 'Pitcher’s Paloma',
    desc: 'Tequila, grapefrukt, lime, sodavatten.',
    price: 149,
    category: 'Cocktails',
    tags: ['Fräsch', 'Citrus'],
  },
  {
    id: 'c2',
    name: 'Espresso Martini',
    desc: 'Vodka, kaffe, kaffelikör.',
    price: 155,
    category: 'Cocktails',
    tags: ['Kaffe', 'Klassiker'],
  },
  {
    id: 'c3',
    name: 'Gin & Tonic',
    desc: 'Gin, tonic, citrus (välj garnish).',
    price: 139,
    category: 'Cocktails',
    tags: ['Klassiker'],
  },
  {
    id: 'c4',
    name: 'Margarita',
    desc: 'Tequila, triple sec, lime. (Saltkant vid önskemål)',
    price: 149,
    category: 'Cocktails',
    tags: ['Citrus'],
  },
  {
    id: 'c5',
    name: 'Whiskey Sour',
    desc: 'Bourbon, citron, sockerlag. (Äggvita valfritt)',
    price: 149,
    category: 'Cocktails',
    tags: ['Sour'],
  },
  {
    id: 'c6',
    name: 'Mojito',
    desc: 'Rom, mynta, lime, socker, sodavatten.',
    price: 145,
    category: 'Cocktails',
    tags: ['Fräsch'],
  },
  {
    id: 'c7',
    name: 'Aperol Spritz',
    desc: 'Aperol, prosecco, sodavatten.',
    price: 139,
    category: 'Cocktails',
    tags: ['Bubbligt'],
  },
  {
    id: 'c8',
    name: 'Negroni',
    desc: 'Gin, Campari, söt vermouth.',
    price: 149,
    category: 'Cocktails',
    tags: ['Bitter', 'Klassiker'],
  },
  {
    id: 'c9',
    name: 'Old Fashioned',
    desc: 'Bourbon/rye, bitters, socker, apelsinzest.',
    price: 155,
    category: 'Cocktails',
    tags: ['Klassiker'],
  },
  {
    id: 'c10',
    name: 'Pornstar Martini',
    desc: 'Vaniljvodka, passionsfrukt, lime. (Shot prosecco vid sidan)',
    price: 159,
    category: 'Cocktails',
    tags: ['Söt', 'Populär'],
  },
  {
    id: 'c11',
    name: 'Dark ’n’ Stormy',
    desc: 'Mörk rom, ginger beer, lime.',
    price: 149,
    category: 'Cocktails',
    tags: ['Kryddig'],
  },
  {
    id: 'c12',
    name: 'Tom Collins',
    desc: 'Gin, citron, socker, sodavatten.',
    price: 139,
    category: 'Cocktails',
    tags: ['Fräsch'],
  },

  // =========================
  // ÖL
  // =========================
  {
    id: 'b1',
    name: 'Lager (40cl)',
    desc: 'Krispig och lätt.',
    price: 79,
    category: 'Beer',
    tags: ['Lager'],
  },
  {
    id: 'b2',
    name: 'Hazy IPA (40cl)',
    desc: 'Humlig, fruktig, lätt bitter.',
    price: 89,
    category: 'Beer',
    tags: ['IPA'],
  },
  {
    id: 'b3',
    name: 'West Coast IPA (40cl)',
    desc: 'Torr, tydlig beska, citrus & tall.',
    price: 92,
    category: 'Beer',
    tags: ['IPA', 'Bitter'],
  },
  {
    id: 'b4',
    name: 'Pilsner (40cl)',
    desc: 'Klassisk, frisk med lätt beska.',
    price: 82,
    category: 'Beer',
    tags: ['Pils'],
  },
  {
    id: 'b5',
    name: 'Wheat Beer (50cl)',
    desc: 'Mjuk, fruktig och lätt kryddig.',
    price: 99,
    category: 'Beer',
    tags: ['Veteöl'],
  },
  {
    id: 'b6',
    name: 'Stout (33cl)',
    desc: 'Mörk, rostad, toner av kaffe & choklad.',
    price: 95,
    category: 'Beer',
    tags: ['Stout'],
  },
  {
    id: 'b7',
    name: 'Sour Ale (33cl)',
    desc: 'Syrlig och frisk, fruktiga toner.',
    price: 98,
    category: 'Beer',
    tags: ['Sour'],
  },
  {
    id: 'b8',
    name: 'Alkoholfri Lager (33cl)',
    desc: 'Lätt och krispig, 0.0%.',
    price: 59,
    category: 'Beer',
    tags: ['0.0%'],
  },

  // =========================
  // VIN
  // =========================
  {
    id: 'w1',
    name: 'Pinot Noir (glas)',
    desc: 'Lättare rött – bärigt och mjukt.',
    price: 119,
    category: 'Wine',
    tags: ['Rött'],
  },
  {
    id: 'w2',
    name: 'Tempranillo (glas)',
    desc: 'Medelfylligt rött – mörka bär och kryddighet.',
    price: 119,
    category: 'Wine',
    tags: ['Rött'],
  },
  {
    id: 'w3',
    name: 'Cabernet Sauvignon (glas)',
    desc: 'Fylligt rött – tanniner, svarta vinbär.',
    price: 129,
    category: 'Wine',
    tags: ['Rött'],
  },
  {
    id: 'w4',
    name: 'Sauvignon Blanc (glas)',
    desc: 'Friskt vitt – citrus, krusbär, mineral.',
    price: 119,
    category: 'Wine',
    tags: ['Vitt'],
  },
  {
    id: 'w5',
    name: 'Chardonnay (glas)',
    desc: 'Rundare vitt – äpple, stenfrukt, lätt ek.',
    price: 125,
    category: 'Wine',
    tags: ['Vitt'],
  },
  {
    id: 'w6',
    name: 'Riesling (glas)',
    desc: 'Aromatiskt vitt – lime, persika, frisk syra.',
    price: 119,
    category: 'Wine',
    tags: ['Vitt'],
  },
  {
    id: 'w7',
    name: 'Rosé (glas)',
    desc: 'Torr rosé – friskt, bärigt.',
    price: 115,
    category: 'Wine',
    tags: ['Rosé'],
  },
  {
    id: 'w8',
    name: 'Prosecco (glas)',
    desc: 'Bubbligt – friskt och lätt.',
    price: 129,
    category: 'Wine',
    tags: ['Bubbel'],
  },

  // =========================
  // ALKOHOLFRITT (Mocktails)
  // =========================
  {
    id: 'm1',
    name: 'Nojito',
    desc: 'Mynta, lime, socker, sodavatten.',
    price: 95,
    category: 'Mocktails',
    tags: ['Alkoholfri'],
  },
  {
    id: 'm2',
    name: 'Virgin Paloma',
    desc: 'Grapefrukt, lime, sodavatten, salt rim valfritt.',
    price: 95,
    category: 'Mocktails',
    tags: ['Citrus', 'Alkoholfri'],
  },
  {
    id: 'm3',
    name: 'Berry Fizz',
    desc: 'Bärmix, citron, sodavatten.',
    price: 95,
    category: 'Mocktails',
    tags: ['Bär', 'Alkoholfri'],
  },
  {
    id: 'm4',
    name: 'Ginger Mule (0%)',
    desc: 'Ginger beer, lime, mynta.',
    price: 95,
    category: 'Mocktails',
    tags: ['Kryddig', 'Alkoholfri'],
  },

  // =========================
  // SHOTS
  // =========================
  {
    id: 's1',
    name: 'Sour Shot',
    desc: 'Syrlig shot (fråga personal om dagens).',
    price: 69,
    category: 'Shots',
  },
  {
    id: 's2',
    name: 'Tequila (shot)',
    desc: 'Klassisk tequila. (Salt & lime vid önskemål)',
    price: 79,
    category: 'Shots',
    tags: ['Klassiker'],
  },
  {
    id: 's3',
    name: 'Fireball (shot)',
    desc: 'Kanelig och söt – serveras kall.',
    price: 75,
    category: 'Shots',
    tags: ['Söt'],
  },
  {
    id: 's4',
    name: 'Fernet (shot)',
    desc: 'Kryddig, bitter – för den modige.',
    price: 79,
    category: 'Shots',
    tags: ['Bitter'],
  },
];

type CartItem = { drink: Drink; qty: number };

// Interna kategorier (behåll för checkout-logik)
const CATEGORIES: Category[] = ['Cocktails', 'Beer', 'Wine', 'Mocktails', 'Shots'];

// UI-etiketter på svenska (visas i flikarna)
const CATEGORY_LABELS: Record<Category, string> = {
  Cocktails: 'Drinkar',
  Beer: 'Öl',
  Wine: 'Vin',
  Mocktails: 'Alkoholfritt',
  Shots: 'Shots',
};

function formatSek(v: number) {
  return new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(v);
}

const CART_KEY = 'qr_cart';

export default function KundDrinkMenyPage() {
  const router = useRouter();

  const [active, setActive] = useState<Category>('Cocktails');
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

  // Spara kundvagn kontinuerligt (så du inte tappar den om sidan laddas om)
  useEffect(() => {
    try {
      const lines = Object.values(cart).map(({ drink, qty }) => ({
        id: drink.id,
        name: drink.name,
        price: drink.price,
        category: drink.category,
        qty,
      }));
      const payload = { lines, orderNote: note };
      localStorage.setItem(CART_KEY, JSON.stringify(payload));
    } catch {
      // ignore
    }
  }, [cart, note]);

  function goToCheckout() {
    if (totals.count === 0) return;

    // En extra “spara nu” innan vi byter sida (failsafe)
    try {
      const lines = Object.values(cart).map(({ drink, qty }) => ({
        id: drink.id,
        name: drink.name,
        price: drink.price,
        category: drink.category,
        qty,
      }));
      localStorage.setItem(CART_KEY, JSON.stringify({ lines, orderNote: note }));
    } catch {
      // ignore
    }

    router.push('/checkout');
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

      <div className={['mx-auto w-full max-w-md px-4 pt-6', 'pb-[calc(8.5rem+env(safe-area-inset-bottom))]'].join(' ')}>
        <div className="relative rounded-3xl border border-amber-200/25 bg-black/10 p-4 shadow-[0_30px_80px_rgba(0,0,0,.35)] backdrop-blur-[2px]">
          <div className="pointer-events-none absolute inset-3 rounded-[22px] border border-amber-200/15" />

          <header className="px-2 pb-4 pt-2 text-center">
            <p className="text-xs uppercase tracking-[0.28em] text-amber-100/70">Betala smidigt med Swish</p>
            <h1 className="mt-2 font-[var(--font-display)] text-5xl leading-none text-amber-50 drop-shadow">
              DRINKMENY
            </h1>
            <p className="mt-3 text-sm text-stone-100/75">Beställ och betala här så serverar vi dig vid bordet.</p>
          </header>

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
                    'h-11 px-4',
                    isActive
                      ? 'bg-amber-100/15 text-amber-50 shadow-[0_10px_20px_rgba(0,0,0,.25)]'
                      : 'bg-black/10 text-stone-100/80 hover:bg-white/5',
                  ].join(' ')}
                >
                  {CATEGORY_LABELS[c]}
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
        </div>
      </div>

      {/* Sticky “kundvagn” */}
      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-md px-4">
        <div
          className={[
            'rounded-2xl border border-amber-200/20 bg-black/35 shadow-[0_25px_80px_rgba(0,0,0,.55)] backdrop-blur',
            'p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]',
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
              onClick={goToCheckout}
              disabled={totals.count === 0}
              className={[
                'h-11 rounded-full px-5 text-sm font-medium transition',
                'border border-amber-200/25',
                totals.count === 0
                  ? 'cursor-not-allowed bg-white/5 text-stone-100/40'
                  : 'bg-amber-100/15 text-amber-50 hover:bg-amber-100/20 active:scale-[0.99]',
              ].join(' ')}
            >
              Checkout
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
