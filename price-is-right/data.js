/* ============================================================
   THE PRICE IS RIGHT — ITEM DECK
   ------------------------------------------------------------
   Each item has:
     id      - unique key
     name    - product name (big text on screen)
     desc    - short description (optional, small text)
     price   - actual retail price in dollars (number)
     emoji   - fallback icon shown when no image is present
     image   - relative path to a product photo (optional)
     theme   - 'grocery' | 'classic' | 'nostalgic'
     year    - only for nostalgic items
   ------------------------------------------------------------
   TO ADD A REAL PHOTO:
     1. Drop the image into  ./images/   (jpg/png/webp all fine)
     2. Set  image: 'images/your-filename.jpg'  on the item below
   The emoji will be shown automatically if the image is missing.
   ============================================================ */

const ITEMS = [
  // ===== GROCERY & HOUSEHOLD (modern prices) =====
  { id: 'g01', name: 'Loaf of White Bread',          desc: 'Wonder Bread, 20 oz',           price: 3.49,    emoji: '🍞', image: '', theme: 'grocery' },
  { id: 'g02', name: 'Gallon of Whole Milk',         desc: '1 gallon',                       price: 4.29,    emoji: '🥛', image: '', theme: 'grocery' },
  { id: 'g03', name: 'Dozen Large Eggs',             desc: 'Grade A',                        price: 4.99,    emoji: '🥚', image: '', theme: 'grocery' },
  { id: 'g04', name: 'Maxwell House Coffee',         desc: '30.6 oz can',                    price: 12.99,   emoji: '☕', image: '', theme: 'grocery' },
  { id: 'g05', name: 'Stick of Butter',              desc: 'Land O Lakes, 1 lb',             price: 5.49,    emoji: '🧈', image: '', theme: 'grocery' },
  { id: 'g06', name: 'Block of Cheddar Cheese',      desc: 'Tillamook, 16 oz',               price: 7.99,    emoji: '🧀', image: '', theme: 'grocery' },
  { id: 'g07', name: 'Jar of Peanut Butter',         desc: 'Jif Creamy, 16 oz',              price: 4.49,    emoji: '🥜', image: '', theme: 'grocery' },
  { id: 'g08', name: 'Box of Cheerios',              desc: 'Original, 18 oz',                price: 5.79,    emoji: '🥣', image: '', theme: 'grocery' },
  { id: 'g09', name: 'Pound of Ground Beef',         desc: '80% lean',                       price: 6.49,    emoji: '🥩', image: '', theme: 'grocery' },
  { id: 'g10', name: 'Bottle of Ketchup',            desc: 'Heinz, 20 oz',                   price: 3.99,    emoji: '🍅', image: '', theme: 'grocery' },
  { id: 'g11', name: 'Can of Campbell\'s Soup',      desc: 'Chicken Noodle, 10.75 oz',       price: 1.89,    emoji: '🥫', image: '', theme: 'grocery' },
  { id: 'g12', name: 'Half-Gallon Orange Juice',     desc: 'Tropicana',                      price: 4.99,    emoji: '🧃', image: '', theme: 'grocery' },
  { id: 'g13', name: 'Carton of Vanilla Ice Cream',  desc: 'Breyers, 1.5 qt',                price: 6.49,    emoji: '🍨', image: '', theme: 'grocery' },
  { id: 'g14', name: 'Tide Laundry Detergent',       desc: '92 oz bottle',                   price: 14.99,   emoji: '🧺', image: '', theme: 'grocery' },
  { id: 'g15', name: 'Bounty Paper Towels',          desc: '6 mega rolls',                   price: 16.99,   emoji: '🧻', image: '', theme: 'grocery' },
  { id: 'g16', name: 'Dawn Dish Soap',               desc: '21.6 oz bottle',                 price: 4.49,    emoji: '🧼', image: '', theme: 'grocery' },
  { id: 'g17', name: 'Tube of Crest Toothpaste',     desc: '4.1 oz',                         price: 3.29,    emoji: '🪥', image: '', theme: 'grocery' },
  { id: 'g18', name: 'Bottle of Tylenol',            desc: '100 caplets',                    price: 12.99,   emoji: '💊', image: '', theme: 'grocery' },
  { id: 'g19', name: 'Box of Tea Bags',              desc: 'Lipton, 100 ct',                 price: 5.49,    emoji: '🍵', image: '', theme: 'grocery' },
  { id: 'g20', name: 'Pack of Oreos',                desc: 'Family size',                    price: 4.99,    emoji: '🍪', image: '', theme: 'grocery' },

  // ===== CLASSIC TPIR-STYLE PRIZES =====
  { id: 'c01', name: 'Trip to Hawaii',               desc: '7 nights for 2, Maui',           price: 8450,    emoji: '🌴', image: 'images/c01.jpg', theme: 'classic' },
  { id: 'c02', name: 'New Toyota Camry',             desc: '2026 LE sedan',                  price: 28395,   emoji: '🚗', image: 'images/c02.jpg', theme: 'classic' },
  { id: 'c03', name: 'Whirlpool Washer & Dryer',     desc: 'Front-load matched set',         price: 2199,    emoji: '🧺', image: '', theme: 'classic' },
  { id: 'c04', name: 'Stainless Steel Refrigerator', desc: 'Samsung 28 cu ft',               price: 2499,    emoji: '🧊', image: '', theme: 'classic' },
  { id: 'c05', name: '75" 4K Smart TV',              desc: 'Samsung QLED',                   price: 1799,    emoji: '📺', image: '', theme: 'classic' },
  { id: 'c06', name: 'Leather Sectional Sofa',       desc: '3-piece, La-Z-Boy',              price: 3299,    emoji: '🛋️', image: '', theme: 'classic' },
  { id: 'c07', name: 'Diamond Tennis Bracelet',      desc: '14k white gold, 3 ct',           price: 4250,    emoji: '💎', image: '', theme: 'classic' },
  { id: 'c08', name: 'Harley-Davidson Motorcycle',   desc: 'Softail Standard',               price: 14999,   emoji: '🏍️', image: 'images/c08.jpg', theme: 'classic' },
  { id: 'c09', name: 'Caribbean Cruise',             desc: '7-day, oceanview, for 2',        price: 3499,    emoji: '🚢', image: 'images/c09.jpg', theme: 'classic' },
  { id: 'c10', name: 'Backyard Hot Tub',             desc: 'Jacuzzi 6-person',               price: 7899,    emoji: '♨️', image: 'images/c10.jpg', theme: 'classic' },
  { id: 'c11', name: 'Riding Lawn Mower',            desc: 'John Deere 42"',                 price: 2799,    emoji: '🚜', image: '', theme: 'classic' },
  { id: 'c12', name: 'Diamond Earrings',             desc: '1 ct studs, 14k',                price: 1899,    emoji: '💍', image: '', theme: 'classic' },
  { id: 'c13', name: 'Pool Table',                   desc: 'Brunswick 8 ft',                 price: 3599,    emoji: '🎱', image: '', theme: 'classic' },
  { id: 'c14', name: 'European River Cruise',        desc: '10 days on the Danube',          price: 6995,    emoji: '⛴️', image: '', theme: 'classic' },
  { id: 'c15', name: 'Grand Piano',                  desc: 'Yamaha baby grand',              price: 18999,   emoji: '🎹', image: '', theme: 'classic' },

  // ===== NOSTALGIC PRICES (memory-game style) =====
  { id: 'n01', name: 'Gallon of Gas',                desc: 'in 1955',                year: 1955, price: 0.23,    emoji: '⛽', image: '', theme: 'nostalgic' },
  { id: 'n02', name: 'Movie Ticket',                 desc: 'in 1960',                year: 1960, price: 0.69,    emoji: '🎬', image: '', theme: 'nostalgic' },
  { id: 'n03', name: 'Loaf of Bread',                desc: 'in 1965',                year: 1965, price: 0.21,    emoji: '🍞', image: '', theme: 'nostalgic' },
  { id: 'n04', name: 'Dozen Eggs',                   desc: 'in 1970',                year: 1970, price: 0.62,    emoji: '🥚', image: '', theme: 'nostalgic' },
  { id: 'n05', name: 'First-Class Stamp',            desc: 'in 1975',                year: 1975, price: 0.10,    emoji: '✉️', image: '', theme: 'nostalgic' },
  { id: 'n06', name: 'New Home (median)',            desc: 'in 1965',                year: 1965, price: 21500,   emoji: '🏠', image: '', theme: 'nostalgic' },
  { id: 'n07', name: 'Bottle of Coca-Cola',          desc: 'in 1962',                year: 1962, price: 0.05,    emoji: '🥤', image: '', theme: 'nostalgic' },
  { id: 'n08', name: 'Gallon of Milk',               desc: 'in 1968',                year: 1968, price: 1.07,    emoji: '🥛', image: '', theme: 'nostalgic' },
  { id: 'n09', name: 'A New Ford Mustang',           desc: 'in 1965',                year: 1965, price: 2368,    emoji: '🚗', image: '', theme: 'nostalgic' },
  { id: 'n10', name: 'A Color TV Set',               desc: 'in 1970',                year: 1970, price: 469,     emoji: '📺', image: '', theme: 'nostalgic' },
  { id: 'n11', name: 'Pound of Coffee',              desc: 'in 1972',                year: 1972, price: 0.93,    emoji: '☕', image: '', theme: 'nostalgic' },
  { id: 'n12', name: 'A Year at Harvard',            desc: 'tuition in 1970',        year: 1970, price: 2600,    emoji: '🎓', image: '', theme: 'nostalgic' },
  { id: 'n13', name: 'Average Yearly Wage',          desc: 'in 1960',                year: 1960, price: 5315,    emoji: '💵', image: '', theme: 'nostalgic' },
  { id: 'n14', name: 'A Pack of Cigarettes',         desc: 'in 1965',                year: 1965, price: 0.30,    emoji: '🚬', image: '', theme: 'nostalgic' },
  { id: 'n15', name: 'Refrigerator',                 desc: 'in 1965',                year: 1965, price: 269,     emoji: '🧊', image: '', theme: 'nostalgic' },
];

// User-added custom items live here at runtime (persisted to localStorage)
const CUSTOM_ITEMS_KEY = 'tpir_custom_items_v1';

function loadCustomItems() {
  try {
    const raw = localStorage.getItem(CUSTOM_ITEMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveCustomItems(items) {
  try { localStorage.setItem(CUSTOM_ITEMS_KEY, JSON.stringify(items)); } catch {}
}

function getAllItems() {
  return [...ITEMS, ...loadCustomItems()];
}
