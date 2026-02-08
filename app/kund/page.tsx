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

type PourSize = '4a' | '6a';
type PourRule = { sizes: PourSize[]; extraFor6a: number }; // pris-tillägg för 6a

type Drink = {
  id: string;
  name: string;
  desc: string;
  price: number; // baspris (4a om pourRule finns)
  category: Category;
  tags?: string[];
  pourRule?: PourRule; // om drink kan beställas som 4a/6a
};

const POURABLE_CATEGORIES: Category[] = ['Cocktails', 'Shots']; // justera om du vill även ha t.ex. "Mocktails" (troligen inte)

const DRINKS: Drink[] = [
  // =========================
  // COCKTAILS (Drinkar)
  // Baspris = 4a. 6a = +30 (ändra vid behov)
  // =========================
  {
    id: 'c1',
    name: 'Pitcher’s Paloma',
    desc: 'Tequila, grapefrukt, lime, sodavatten.',
    price: 149,
    category: 'Cocktails',
    tags: ['Fräsch', 'Citrus'],
    pourRule: { sizes: ['4a', '6a'], extraFor6a: 30 },
  },
  {
    id: 'c2',
    name: 'Espresso Martini',
    desc: 'Vodka, kaffe, kaffelikör.',
    price: 155,
    category: 'Cocktails',
    tags: ['Kaffe', 'Klassiker'],
    pourRule: { sizes: ['4a', '6a'], extraFor6a: 30 },
  },
  {
    id: 'c3',
    name: 'Gin & Tonic',
    desc: 'Gin, tonic, citrus (välj garnish).',
    price: 139,
    category: 'Cocktails',
    tags: ['Klassiker'],
    pourRule: { sizes: ['4a', '6a'], extraFor6a: 30 },
  },
  {
    id: 'c4',
    name: 'Margarita',
    desc: 'Tequila, triple sec, lime. (Saltkant vid önskemål)',
    price: 149,
    category: 'Cocktails',
    tags: ['Citrus'],
    pourRule: { sizes: ['4a', '6a'], extraFor6a: 30 },
  },
  {
    id: 'c5',
    name: 'Whiskey Sour',
    desc: 'Bourbon, citron, sockerlag. (Äggvita valfritt)',
    price: 149,
    category: 'Cocktails',
    tags: ['Sour'],
    pourRule: { sizes: ['4a', '6a'], extraFor6a: 30 },
  },
  {
    id: 'c6',
    name: 'Mojito',
    desc: 'Rom, mynta, lime, socker, sodavatten.',
    price: 145,
    category: 'Cocktails',
    tags: ['Fräsch'],
    pourRule: { sizes: ['4a', '6a'], extraFor6a: 30 },
  },
  {
    id: 'c7',
    name: 'Aperol Spritz',
    desc: 'Aperol, prosecco, sodavatten.',
    price: 139,
    category: 'Cocktails',
    tags: ['Bubbligt'],
    // ofta fixed recept – men om du vill:
    pourRule: { sizes: ['4a', '6a'], extraFor6a: 30 },
  },
  {
    id: 'c8',
    name: 'Negroni',
    desc: 'Gin, Campari, söt vermouth.',
    price: 149,
    category: 'Cocktails',
    tags: ['Bitter', 'Klassiker'],
    pourRule: { sizes: ['4a', '6a'], extraFor6a: 30 },
  },
  {
    id: 'c9',
    name: 'Old Fashioned',
    desc: 'Bourbon/rye, bitters, socker, apelsinzest.',
    price: 155,
    category: 'Cocktails',
    tags: ['Klassiker'],
    pourRule: { sizes: ['4a', '6a'], extraFor6a: 30 },
  },
  {
    id: 'c10',
    name: 'Pornstar Martini',
    desc: 'Vaniljvodka, passionsfrukt, lime. (Shot prosecco vid sidan)',
    price: 159,
    category: 'Cocktails',
    tags: ['Söt', 'Populär'],
    pourRule: { sizes: ['4a', '6a'], extraFor6a: 30 },
  },
  {
    id: 'c11',
    name: 'Dark ’n’ Stormy',
    desc: 'Mörk rom, ginger beer, lime.',
    price: 149,
    category: 'Cocktails',
    tags: ['Kryddig'],
    pourRule: { sizes: ['4a', '6a'], extraFor6a: 30 },
  },
  {
    id: 'c12',
    name: 'Tom Collins',
    desc: 'Gin, citron, socker, sodavatten.',
    price: 139,
    category: 'Cocktails',
    tags: ['Fräsch'],
    pourRule: { sizes: ['4a', '6a'], extraFor6a: 30 },
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
  // Baspris = 4cl. 6cl = +20 (ändra vid behov)
  // =========================
  {
    id: 's1',
    name: 'Sour Shot',
    desc: 'Syrlig shot (fråga personal om dagens).',
    price: 69,
    category: 'Shots',
    pourRule: { sizes: ['4a', '6a'], extraFor6a: 20 },
  },
  {
    id: 's2',
    name: 'Tequila (shot)',
    desc: 'Klassisk tequila. (Salt & lime vid önskemål)',
    price: 79,
    category: 'Shots',
    tags: ['Klassiker'],
    pourRule: { sizes: ['4a', '6a'], extraFor6a: 20 },
  },
  {
    id: 's3',
    name: 'Fireball (shot)',
    desc: 'Kanelig och söt – serveras kall.',
    price: 75,
    category: 'Shots',
    tags: ['Söt'],
    pourRule: { sizes: ['4a', '6a'], extraFor6a: 20 },
  },
  {
    id: 's4',
    name: 'Fernet (shot)',
    desc: 'Kryddig, bitter – för den modige.',
    price: 79,
    category: 'Shots',
    tags: ['Bitter'],
    pourRule: { sizes: ['4a', '6a'], extraFor6a: 20 },
  },
];

type CartLineKey = string; // `${drinkId}__${size}`
type CartItem = { drink: Drink; qty: number; size?: PourSize };

const CATEGORIES: Category[] = ['Cocktails', 'Beer', 'Wine', 'Mocktails', 'Shots'];

const CATEGORY_LABELS: Record<Category, string> = {
  Cocktails: 'Drinkar',
  Beer: 'Öl',
  Wine: 'Vin',
  Mocktails: 'Alkoholfritt',
  Shots: 'Shots',
};

const CATEGORY_SUB: Record<Category, string> = {
  Cocktails: 'Klassiska & signaturdrinkar',
  Beer: 'Fat & flaska',
  Wine: 'Rött, vitt & bubbel',
  Mocktails: '0% men full smak',
  Shots: 'Snabba favoriter',
};

function formatSek(v: number) {
  return new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(v);
}

function priceFor(drink: Drink, size?: PourSize) {
  if (!drink.pourRule) return drink.price;
  if (size === '6a') return drink.price + drink.pourRule.extraFor6a;
  return drink.price; // 4a = baspris
}

function lineKey(drinkId: string, size?: PourSize): CartLineKey {
  return `${drinkId}__${size ?? 'std'}`;
}

function sizeLabel(size: PourSize) {
  return size === '4a' ? '4 cl (4a)' : '6 cl (6a)';
}

const CART_KEY = 'qr_cart';

function Ornament({ className = '' }: { className?: string }) {
  return (
    <div className={['flex items-center gap-3', className].join(' ')}>
      <span className="h-px flex-1 bg-emerald-900/20" />
      <span className="h-2 w-2 rounded-full bg-emerald-900/40" />
      <span className="h-px flex-1 bg-emerald-900/20" />
    </div>
  );
}

export default function KundDrinkMenyPage() {
  const router = useRouter();

  const [active, setActive] = useState<Category>('Cocktails');
  const [cart, setCart] = useState<Record<CartLineKey, CartItem>>({});
  const [note, setNote] = useState('');
  const [pourPref, setPourPref] = useState<Record<string, PourSize>>({}); // per drinkId

  const filtered = useMemo(() => DRINKS.filter((d) => d.category === active), [active]);

  const totals = useMemo(() => {
    const items = Object.values(cart);
    const count = items.reduce((s, it) => s + it.qty, 0);
    const sum = items.reduce((s, it) => s + it.qty * priceFor(it.drink, it.size), 0);
    return { count, sum };
  }, [cart]);

  function add(drink: Drink) {
    const chosenSize: PourSize | undefined = drink.pourRule ? (pourPref[drink.id] ?? '4a') : undefined;
    const key = lineKey(drink.id, chosenSize);

    setCart((prev) => {
      const existing = prev[key];
      return {
        ...prev,
        [key]: { drink, qty: (existing?.qty ?? 0) + 1, size: chosenSize },
      };
    });
  }

  function remove(drink: Drink) {
    const chosenSize: PourSize | undefined = drink.pourRule ? (pourPref[drink.id] ?? '4a') : undefined;
    const key = lineKey(drink.id, chosenSize);

    setCart((prev) => {
      const existing = prev[key];
      if (!existing) return prev;

      const nextQty = existing.qty - 1;
      if (nextQty <= 0) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: { ...existing, qty: nextQty } };
    });
  }

  function totalQtyForDrink(drink: Drink) {
    // summera över alla storlekar för samma drink (så “I beställning” känns rimligt)
    const keys = Object.keys(cart);
    let sum = 0;
    for (const k of keys) {
      if (k.startsWith(`${drink.id}__`)) sum += cart[k]?.qty ?? 0;
    }
    return sum;
  }

  function qtyForActiveSelection(drink: Drink) {
    const chosenSize: PourSize | undefined = drink.pourRule ? (pourPref[drink.id] ?? '4a') : undefined;
    const key = lineKey(drink.id, chosenSize);
    return cart[key]?.qty ?? 0;
  }

  useEffect(() => {
    try {
      const lines = Object.values(cart).map(({ drink, qty, size }) => ({
        id: drink.id,
        name: drink.name + (size ? ` (${sizeLabel(size)})` : ''),
        price: priceFor(drink, size),
        category: drink.category,
        qty,
        meta: size ? { pour: size } : undefined,
      }));
      localStorage.setItem(CART_KEY, JSON.stringify({ lines, orderNote: note }));
    } catch {
      // ignore
    }
  }, [cart, note]);

  function goToCheckout() {
    if (totals.count === 0) return;

    try {
      const lines = Object.values(cart).map(({ drink, qty, size }) => ({
        id: drink.id,
        name: drink.name + (size ? ` (${sizeLabel(size)})` : ''),
        price: priceFor(drink, size),
        category: drink.category,
        qty,
        meta: size ? { pour: size } : undefined,
      }));
      localStorage.setItem(CART_KEY, JSON.stringify({ lines, orderNote: note }));
    } catch {
      // ignore
    }

    router.push('/checkout');
  }

  return (
    <div className={`${display.variable} ${inter.variable} min-h-dvh text-stone-900`}>
      {/* Bakgrund */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#0b3a33]" />
        <div
          className="absolute inset-0 opacity-[0.22] mix-blend-overlay"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 10%, rgba(255,255,255,.16), transparent 38%), radial-gradient(circle at 80% 35%, rgba(255,255,255,.12), transparent 42%), radial-gradient(circle at 50% 95%, rgba(0,0,0,.28), transparent 45%)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/40" />
      </div>

      <div className={['mx-auto w-full max-w-md px-4 pt-5', 'pb-[calc(9.5rem+env(safe-area-inset-bottom))]'].join(' ')}>
        <div className="relative overflow-hidden rounded-[26px] border border-black/10 bg-[#f6f0e6] shadow-[0_30px_90px_rgba(0,0,0,.45)]">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.22]"
            style={{
              backgroundImage:
                'radial-gradient(rgba(0,0,0,.045) 1px, transparent 1px), radial-gradient(rgba(0,0,0,.028) 1px, transparent 1px)',
              backgroundPosition: '0 0, 12px 10px',
              backgroundSize: '22px 22px',
            }}
          />
          <div className="pointer-events-none absolute inset-3 rounded-[20px] border border-emerald-900/15" />

          <div className="relative px-5 pb-4 pt-5">
            <div className="absolute inset-x-0 top-0 h-24 bg-[#c61f3f]" />
            <div className="absolute inset-x-0 top-[5.25rem] h-[10px] bg-[#f6f0e6]" />
            <div className="absolute inset-x-0 top-[5.25rem] h-[10px] opacity-60">
              <div className="h-full bg-gradient-to-b from-black/10 to-transparent" />
            </div>

            <div className="relative text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-black/15 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-[#fff3d6]">
                Betala smidigt med Swish
              </div>

              <h1 className="mt-3 font-[var(--font-display)] text-[44px] leading-none text-[#fff1d9] drop-shadow-[0_2px_0_rgba(0,0,0,.35)]">
                Pitcher’s
              </h1>
              <p className="mt-1 text-[13px] tracking-wide text-[#fff1d9]/90">
                Drinkmeny • Beställ direkt vid bordet
              </p>

              <div className="mt-4">
                <Ornament className="mx-auto max-w-[260px]" />
              </div>
            </div>
          </div>

          <div className="px-5 pb-3">
            <div className="rounded-2xl border border-emerald-900/10 bg-white/45 p-2">
              <nav className="no-scrollbar flex gap-2 overflow-x-auto [scrollbar-width:none]">
                {CATEGORIES.map((c) => {
                  const isActive = c === active;
                  return (
                    <button
                      key={c}
                      onClick={() => setActive(c)}
                      className={[
                        'shrink-0 rounded-full px-4 py-2 text-sm transition',
                        'border',
                        isActive
                          ? 'border-[#c61f3f]/40 bg-[#c61f3f]/12 text-[#6b0e20]'
                          : 'border-emerald-900/12 bg-white/55 text-emerald-950/80 hover:bg-white/70',
                      ].join(' ')}
                    >
                      <span className="font-semibold">{CATEGORY_LABELS[c]}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="px-5 pb-2">
            <div className="text-center">
              <div className="font-[var(--font-display)] text-[34px] leading-tight text-[#c61f3f]">
                {CATEGORY_LABELS[active]}
              </div>
              <div className="mt-1 text-[13px] italic text-emerald-950/80">{CATEGORY_SUB[active]}</div>
              <div className="mt-3">
                <Ornament />
              </div>
            </div>
          </div>

          <section className="px-5 pb-5">
            <div className="space-y-3">
              {filtered.map((d) => {
                const isPourable =
                  !!d.pourRule && (POURABLE_CATEGORIES.includes(d.category) || true /* safe */);

                const selectedSize: PourSize | undefined = isPourable ? (pourPref[d.id] ?? '4a') : undefined;

                const displayPrice = formatSek(priceFor(d, selectedSize));
                const totalForDrink = totalQtyForDrink(d);
                const qtySelected = qtyForActiveSelection(d);

                return (
                  <div key={d.id} className="rounded-2xl border border-emerald-900/10 bg-white/30 p-4">
                    <div className="flex items-baseline gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate font-[var(--font-display)] text-[19px] text-emerald-950">
                          {d.name}
                        </h3>
                      </div>
                      <div className="flex-1 border-b border-dotted border-emerald-900/25" />
                      <div className="shrink-0 font-[var(--font-display)] text-[16px] text-emerald-950">
                        {displayPrice}
                      </div>
                    </div>

                    <p className="mt-2 text-[13px] leading-relaxed text-emerald-950/80">{d.desc}</p>

                    {!!d.tags?.length && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {d.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded-full border border-emerald-900/12 bg-white/60 px-2.5 py-1 text-[11px] text-emerald-950/80"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* 4a / 6a toggle (smidig) */}
                    {isPourable ? (
                      <div className="mt-4 rounded-2xl border border-emerald-900/10 bg-white/55 p-2">
                        <div className="flex items-center justify-between gap-3 px-2">
                          <div className="text-[12px] font-semibold text-emerald-950/80">Storlek</div>
                          <div className="text-[11px] text-emerald-950/70">
                            6a: +{formatSek(d.pourRule!.extraFor6a)}
                          </div>
                        </div>

                        <div className="mt-2 grid grid-cols-2 gap-2">
                          {d.pourRule!.sizes.map((s) => {
                            const activeSize = selectedSize === s;
                            return (
                              <button
                                key={s}
                                onClick={() => setPourPref((p) => ({ ...p, [d.id]: s }))}
                                className={[
                                  'h-11 rounded-xl border px-3 text-sm transition',
                                  activeSize
                                    ? 'border-[#c61f3f]/40 bg-[#c61f3f]/12 text-[#6b0e20] shadow-[0_10px_20px_rgba(0,0,0,.08)]'
                                    : 'border-emerald-900/12 bg-white/65 text-emerald-950/80 hover:bg-white/80',
                                ].join(' ')}
                              >
                                <span className="font-semibold">{s === '4a' ? '4a' : '6a'}</span>
                                <span className="ml-2 text-[12px] text-emerald-950/70">
                                  {s === '4a' ? '4 cl' : '6 cl'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}

                    {/* Kontroller */}
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <button
                        onClick={() => add(d)}
                        className="h-11 flex-1 rounded-full border border-[#c61f3f]/30 bg-[#c61f3f]/12 px-4 text-sm font-semibold text-[#6b0e20] hover:bg-[#c61f3f]/16 active:scale-[0.99]"
                      >
                        Lägg till
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => remove(d)}
                          disabled={qtySelected === 0}
                          className={[
                            'h-11 w-11 rounded-full border text-lg leading-none transition active:scale-[0.99]',
                            qtySelected === 0
                              ? 'cursor-not-allowed border-emerald-900/10 bg-white/40 text-emerald-950/35'
                              : 'border-emerald-900/15 bg-white/70 text-emerald-950 hover:bg-white/85',
                          ].join(' ')}
                          aria-label="Minska"
                        >
                          −
                        </button>

                        <div className="w-10 text-center font-[var(--font-display)] text-[16px] text-emerald-950">
                          {qtySelected}
                        </div>

                        <button
                          onClick={() => add(d)}
                          className="h-11 w-11 rounded-full border border-emerald-900/15 bg-white/70 text-lg leading-none text-emerald-950 hover:bg-white/85 active:scale-[0.99]"
                          aria-label="Öka"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Status */}
                    {totalForDrink > 0 ? (
                      <div className="mt-3 rounded-xl border border-emerald-900/10 bg-white/50 px-3 py-2 text-[12px] text-emerald-950/80">
                        I beställning: <span className="font-semibold">{totalForDrink} st</span>
                        {d.pourRule ? (
                          <span className="ml-2 text-emerald-950/70">
                            (valt: {selectedSize === '4a' ? '4a' : '6a'})
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <div className="mt-5 rounded-2xl border border-emerald-900/10 bg-white/35 p-4">
              <div className="font-[var(--font-display)] text-[18px] text-emerald-950">Notering</div>
              <p className="mt-1 text-[12px] text-emerald-950/75">Allergier, extra is, ingen lime osv.</p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Skriv en notering (valfritt)…"
                className="mt-3 h-24 w-full resize-none rounded-xl border border-emerald-900/10 bg-white/75 px-3 py-2 text-sm text-emerald-950 placeholder:text-emerald-950/40 focus:outline-none focus:ring-2 focus:ring-[#c61f3f]/20"
              />
            </div>
          </section>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-md px-4">
        <div
          className={[
            'mb-3 overflow-hidden rounded-2xl border border-black/10 bg-[#f6f0e6]/95 shadow-[0_25px_85px_rgba(0,0,0,.6)] backdrop-blur',
            'p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]',
          ].join(' ')}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-[0.22em] text-emerald-950/70">Din beställning</div>
              <div className="mt-1 text-sm text-emerald-950/85">
                {totals.count === 0 ? 'Inga produkter valda' : `${totals.count} st • ${formatSek(totals.sum)}`}
              </div>
            </div>

            <button
              onClick={goToCheckout}
              disabled={totals.count === 0}
              className={[
                'h-11 rounded-full px-5 text-sm font-semibold transition',
                'border',
                totals.count === 0
                  ? 'cursor-not-allowed border-emerald-900/12 bg-white/55 text-emerald-950/40'
                  : 'border-[#c61f3f]/28 bg-[#c61f3f]/14 text-[#6b0e20] hover:bg-[#c61f3f]/18 active:scale-[0.99]',
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
