# Photo Priority List

Recommended order — most impactful first. Each item lists:
- The `id` to use as the filename (e.g. `c02.jpg`)
- The item name as residents will see it
- A search-friendly description for finding a stock photo

Tick the boxes as you go.

---

## 🏆 TIER 1 — Classic prizes (highest impact)

These are the big "showy" prizes. A real photo lands much harder than 🚗 or 💎.

- [ ] **c01** — Trip to Hawaii → `tropical beach with palm trees, Maui sunset`
- [ ] **c02** — New Toyota Camry → `silver Toyota Camry 2026 front 3/4 view`
- [ ] **c03** — Whirlpool Washer & Dryer → `matching front-load washer dryer pair`
- [ ] **c04** — Stainless Steel Refrigerator → `large stainless French-door fridge`
- [ ] **c05** — 75" 4K Smart TV → `large flat-screen TV on stand`
- [ ] **c06** — Leather Sectional Sofa → `brown leather sectional in living room`
- [ ] **c07** — Diamond Tennis Bracelet → `diamond tennis bracelet on velvet`
- [ ] **c08** — Harley-Davidson Motorcycle → `black Harley motorcycle, side view`
- [ ] **c09** — Caribbean Cruise → `cruise ship at sea, Caribbean blue water`
- [ ] **c10** — Backyard Hot Tub → `outdoor hot tub on deck`
- [ ] **c11** — Riding Lawn Mower → `green John Deere riding mower`
- [ ] **c12** — Diamond Earrings → `diamond stud earrings, close-up`
- [ ] **c13** — Pool Table → `green felt pool table, full view`
- [ ] **c14** — European River Cruise → `riverboat on Danube, castle background`
- [ ] **c15** — Grand Piano → `black grand piano, glossy`

---

## 🕰️ TIER 2 — Nostalgic items (great memory triggers)

Period-accurate photos can stir wonderful memories for residents. Vintage ads
work especially well.

- [ ] **n01** — Gallon of Gas (1955) → `vintage 1950s Sinclair gas station`
- [ ] **n02** — Movie Ticket (1960) → `1960s movie theater ticket stub`
- [ ] **n03** — Loaf of Bread (1965) → `vintage Wonder Bread bag 1960s`
- [ ] **n04** — Dozen Eggs (1970) → `1970s egg carton supermarket`
- [ ] **n05** — First-Class Stamp (1975) → `1975 USPS stamp, vintage`
- [ ] **n06** — New Home median (1965) → `1965 American suburban ranch home`
- [ ] **n07** — Bottle of Coca-Cola (1962) → `vintage glass Coca-Cola bottle`
- [ ] **n08** — Gallon of Milk (1968) → `vintage glass milk bottle on porch`
- [ ] **n09** — Ford Mustang (1965) → `1965 Ford Mustang convertible red`
- [ ] **n10** — Color TV Set (1970) → `1970s wood-cabinet console TV`
- [ ] **n11** — Pound of Coffee (1972) → `1970s Maxwell House coffee can`
- [ ] **n12** — Year at Harvard (1970) → `vintage Harvard campus 1970`
- [ ] **n13** — Avg Yearly Wage (1960) → `1960s paycheck or office worker`
- [ ] **n14** — Pack of Cigarettes (1965) → `1960s cigarette pack vintage ad`
- [ ] **n15** — Refrigerator (1965) → `1960s pastel kitchen refrigerator`

---

## 🛒 TIER 3 — Grocery (lowest priority — emoji work fine)

Only add these if you have time/energy. The emoji are clear enough.

- [ ] g01 Loaf of White Bread · [ ] g02 Gallon of Milk · [ ] g03 Dozen Eggs
- [ ] g04 Maxwell House Coffee · [ ] g05 Butter · [ ] g06 Cheddar Cheese
- [ ] g07 Peanut Butter · [ ] g08 Cheerios · [ ] g09 Ground Beef
- [ ] g10 Ketchup · [ ] g11 Campbell's Soup · [ ] g12 Orange Juice
- [ ] g13 Vanilla Ice Cream · [ ] g14 Tide Detergent · [ ] g15 Paper Towels
- [ ] g16 Dawn Dish Soap · [ ] g17 Crest Toothpaste · [ ] g18 Tylenol
- [ ] g19 Lipton Tea Bags · [ ] g20 Oreos

---

## Workflow recap

1. Find an image (Unsplash / Pexels / Wikimedia / etc.)
2. Resize to square-ish, ~400-800px, under 200 KB
3. Save as `<id>.jpg` (or `.png`) in this folder
4. **Send the folder to Claude** — I'll do the data.js wiring for you in bulk

Or DIY: open `data.js`, find the item by `id`, change `image: ''` to
`image: 'images/c02.jpg'`. Save and reload — done.
