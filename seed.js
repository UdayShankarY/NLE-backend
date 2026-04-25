require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Slider = require('./models/Slider');

const MONGO_URI = process.env.MONGO_URI;

const categories = [
  {
    name: 'Birthday',
    slug: 'birthday',
    icon: '',
    active: true,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
    subcategories: [
      { name: 'Kids Birthday', image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&q=80' },
      { name: 'Adult Birthday', image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&q=80' },
      { name: 'Surprise Party', image: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=400&q=80' },
    ]
  },
  {
    name: 'Anniversary',
    slug: 'anniversary',
    icon: '',
    active: true,
    image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80',
    subcategories: [
      { name: 'Romantic Dinner', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80' },
      { name: 'Room Decoration', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80' },
      { name: 'Rooftop Setup', image: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=400&q=80' },
    ]
  },
  {
    name: 'Wedding',
    slug: 'wedding',
    icon: '',
    active: true,
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80',
    subcategories: [
      { name: 'Engagement', image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=400&q=80' },
      { name: 'Reception', image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&q=80' },
      { name: 'Mehendi', image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&q=80' },
    ]
  },
  {
    name: 'Baby Shower',
    slug: 'baby-shower',
    icon: '',
    active: true,
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
    subcategories: [
      { name: 'Gender Reveal', image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&q=80' },
      { name: 'Baby Welcome', image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&q=80' },
    ]
  },
  {
    name: 'Corporate',
    slug: 'corporate',
    icon: '',
    active: true,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',
    subcategories: [
      { name: 'Team Outing', image: 'https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=400&q=80' },
      { name: 'Product Launch', image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&q=80' },
      { name: 'Award Night', image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=80' },
    ]
  },
  {
    name: 'Romantic',
    slug: 'romantic',
    icon: '',
    active: true,
    image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&q=80',
    subcategories: [
      { name: 'Candle Light Dinner', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80' },
      { name: 'Proposal Setup', image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&q=80' },
    ]
  },
];

const getProducts = (catMap) => [
  // ── BIRTHDAY ──
  {
    name: 'Classic Birthday Balloon Decoration',
    categoryId: catMap['Birthday'],
    categoryName: 'Birthday',
    subcategory: 'Adult Birthday',
    price: 1499,
    originalPrice: 2000,
    description: 'Beautiful balloon decoration with foil balloons, streamers and a happy birthday banner.',
    inclusions: ['50 latex balloons', 'Foil birthday banner', '2 foil star balloons', 'Setup by team'],
    addOns: [{ name: 'LED lights', price: 299 }, { name: 'Cake (1kg)', price: 699 }],
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&q=80',
    moreImages: [
      'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&q=80',
      'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=600&q=80',
    ],
    badge: 'Best Seller',
    badgeColor: 'purple',
    rating: 4.8, reviewCount: 234, orderCount: 520, active: true, featured: true,
  },
  {
    name: 'Kids Jungle Theme Birthday',
    categoryId: catMap['Birthday'],
    categoryName: 'Birthday',
    subcategory: 'Kids Birthday',
    price: 2499,
    originalPrice: 3200,
    description: 'Jungle safari theme decoration perfect for kids with animal cutouts and green balloons.',
    inclusions: ['Jungle backdrop', 'Animal cutouts', '60 green & yellow balloons', 'Theme cake table'],
    addOns: [{ name: 'Jungle cake topper', price: 199 }, { name: 'Return gifts (10 pcs)', price: 499 }],
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
    moreImages: [
      'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&q=80',
    ],
    badge: 'Kids Fav',
    badgeColor: 'green',
    rating: 4.9, reviewCount: 187, orderCount: 310, active: true, featured: false,
  },
  {
    name: 'Surprise Birthday Room Setup',
    categoryId: catMap['Birthday'],
    categoryName: 'Birthday',
    subcategory: 'Surprise Party',
    price: 1999,
    originalPrice: 2500,
    description: 'Surprise your loved one with a fully decorated room with balloons, lights and flowers.',
    inclusions: ['100 balloons', 'LED fairy lights', 'Rose petals', 'Happy Birthday banner'],
    addOns: [{ name: 'Polaroid photos wall', price: 399 }, { name: 'Chocolate bouquet', price: 599 }],
    image: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=600&q=80',
    moreImages: [],
    badge: 'Trending',
    badgeColor: 'pink',
    rating: 4.7, reviewCount: 156, orderCount: 280, active: true, featured: true,
  },

  // ── ANNIVERSARY ──
  {
    name: 'Romantic Rose Petal Room Decoration',
    categoryId: catMap['Anniversary'],
    categoryName: 'Anniversary',
    subcategory: 'Room Decoration',
    price: 2999,
    originalPrice: 3800,
    description: 'Fill your room with love — rose petals, candles, fairy lights and heart balloons.',
    inclusions: ['500g rose petals', '20 tealight candles', 'Heart balloon arch', 'LED fairy lights'],
    addOns: [{ name: 'Champagne bottle', price: 799 }, { name: 'Couple photo frame', price: 349 }],
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80',
    moreImages: [
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80',
    ],
    badge: 'Most Loved',
    badgeColor: 'pink',
    rating: 4.9, reviewCount: 312, orderCount: 480, active: true, featured: true,
  },
  {
    name: 'Rooftop Candle Light Dinner',
    categoryId: catMap['Anniversary'],
    categoryName: 'Anniversary',
    subcategory: 'Rooftop Setup',
    price: 4999,
    originalPrice: 6500,
    description: 'Private rooftop dinner setup with candles, flowers, fairy lights and a personal butler.',
    inclusions: ['Private rooftop space', '50 candles', 'Flower centrepiece', 'Butler service (2 hrs)', 'Welcome drink'],
    addOns: [{ name: '3-course meal', price: 1499 }, { name: 'Live music (1 hr)', price: 1999 }],
    image: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=600&q=80',
    moreImages: [
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
    ],
    badge: 'Premium',
    badgeColor: 'gold',
    rating: 4.8, reviewCount: 98, orderCount: 190, active: true, featured: true,
  },
  {
    name: 'Anniversary Balloon Surprise',
    categoryId: catMap['Anniversary'],
    categoryName: 'Anniversary',
    subcategory: 'Room Decoration',
    price: 1799,
    originalPrice: 2200,
    description: 'Sweet anniversary surprise with heart balloons, number foils and a personalised banner.',
    inclusions: ['Heart foil balloons', 'Number foil balloons', 'Personalised banner', 'Rose bouquet'],
    addOns: [{ name: 'Teddy bear', price: 299 }, { name: 'Heart-shaped cake', price: 799 }],
    image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80',
    moreImages: [],
    badge: 'New',
    badgeColor: 'purple',
    rating: 4.6, reviewCount: 74, orderCount: 95, active: true, featured: false,
  },

  // ── WEDDING ──
  {
    name: 'Floral Engagement Decoration',
    categoryId: catMap['Wedding'],
    categoryName: 'Wedding',
    subcategory: 'Engagement',
    price: 8999,
    originalPrice: 12000,
    description: 'Elegant floral setup for your engagement ceremony with stage, backdrop and seating.',
    inclusions: ['Floral stage backdrop', 'Couple seating sofa', 'Flower arch entrance', 'Petal pathway', 'Photographer (2 hrs)'],
    addOns: [{ name: 'Mehendi artist', price: 1499 }, { name: 'Catering (50 pax)', price: 8999 }],
    image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600&q=80',
    moreImages: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80',
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80',
    ],
    badge: 'Premium',
    badgeColor: 'gold',
    rating: 4.9, reviewCount: 67, orderCount: 140, active: true, featured: true,
  },
  {
    name: 'Grand Wedding Reception Setup',
    categoryId: catMap['Wedding'],
    categoryName: 'Wedding',
    subcategory: 'Reception',
    price: 24999,
    originalPrice: 35000,
    description: 'Full reception hall decoration with floral centrepieces, stage, lighting and draping.',
    inclusions: ['Stage with floral backdrop', 'Table centrepieces (20 tables)', 'Ceiling draping', 'LED uplighting', 'Welcome arch'],
    addOns: [{ name: 'Photo booth', price: 2999 }, { name: 'DJ setup', price: 4999 }, { name: 'Catering (100 pax)', price: 14999 }],
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80',
    moreImages: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80',
    ],
    badge: 'Grand',
    badgeColor: 'gold',
    rating: 4.8, reviewCount: 43, orderCount: 88, active: true, featured: true,
  },

  // ── BABY SHOWER ──
  {
    name: 'Pink & Blue Gender Reveal Party',
    categoryId: catMap['Baby Shower'],
    categoryName: 'Baby Shower',
    subcategory: 'Gender Reveal',
    price: 3499,
    originalPrice: 4500,
    description: 'Fun gender reveal setup with confetti cannon, balloon box and themed decorations.',
    inclusions: ['Confetti cannon', 'Giant balloon box', 'Pink & blue balloons', 'Gender reveal banner', 'Cake table setup'],
    addOns: [{ name: 'Gender reveal cake', price: 999 }, { name: 'Photoshoot (1 hr)', price: 1499 }],
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&q=80',
    moreImages: [
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
    ],
    badge: 'Trending',
    badgeColor: 'pink',
    rating: 4.7, reviewCount: 89, orderCount: 175, active: true, featured: false,
  },
  {
    name: 'Baby Welcome Home Decoration',
    categoryId: catMap['Baby Shower'],
    categoryName: 'Baby Shower',
    subcategory: 'Baby Welcome',
    price: 2199,
    originalPrice: 2800,
    description: 'Welcome your newborn with a beautiful home decoration setup.',
    inclusions: ['Welcome baby banner', 'Pastel balloons (80 pcs)', 'Flower garlands', 'Baby footprint props'],
    addOns: [{ name: 'Baby hamper', price: 799 }, { name: 'Milestone cards', price: 199 }],
    image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&q=80',
    moreImages: [],
    badge: 'Sweet',
    badgeColor: 'pink',
    rating: 4.8, reviewCount: 112, orderCount: 210, active: true, featured: false,
  },

  // ── CORPORATE ──
  {
    name: 'Corporate Award Night Setup',
    categoryId: catMap['Corporate'],
    categoryName: 'Corporate',
    subcategory: 'Award Night',
    price: 14999,
    originalPrice: 20000,
    description: 'Professional award night setup with stage, podium, red carpet and branded backdrops.',
    inclusions: ['Stage with LED backdrop', 'Red carpet entrance', 'Podium with mic', 'Branded standees (5)', 'Ambient lighting'],
    addOns: [{ name: 'Emcee (2 hrs)', price: 3999 }, { name: 'Trophy engraving (10 pcs)', price: 2499 }],
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80',
    moreImages: [
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',
    ],
    badge: 'Corporate',
    badgeColor: 'purple',
    rating: 4.7, reviewCount: 38, orderCount: 65, active: true, featured: false,
  },
  {
    name: 'Product Launch Event Setup',
    categoryId: catMap['Corporate'],
    categoryName: 'Corporate',
    subcategory: 'Product Launch',
    price: 19999,
    originalPrice: 28000,
    description: 'High-impact product launch setup with LED walls, branded decor and media backdrop.',
    inclusions: ['LED video wall (10x6 ft)', 'Media backdrop', 'Stage setup', 'Branded table covers', 'Welcome signage'],
    addOns: [{ name: 'Live streaming', price: 4999 }, { name: 'Press kit design', price: 1999 }],
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&q=80',
    moreImages: [],
    badge: 'Premium',
    badgeColor: 'gold',
    rating: 4.6, reviewCount: 22, orderCount: 42, active: true, featured: true,
  },

  // ── ROMANTIC ──
  {
    name: 'Candle Light Dinner at Home',
    categoryId: catMap['Romantic'],
    categoryName: 'Romantic',
    subcategory: 'Candle Light Dinner',
    price: 3999,
    originalPrice: 5000,
    description: 'Intimate candle light dinner setup at your home with flowers, candles and fairy lights.',
    inclusions: ['Dining table decoration', '30 candles', 'Rose petals', 'Fairy lights', 'Welcome drink'],
    addOns: [{ name: '2-course meal', price: 999 }, { name: 'Violinist (1 hr)', price: 2499 }],
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
    moreImages: [
      'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&q=80',
    ],
    badge: 'Romantic',
    badgeColor: 'pink',
    rating: 4.9, reviewCount: 203, orderCount: 390, active: true, featured: true,
  },
  {
    name: 'Surprise Proposal Setup',
    categoryId: catMap['Romantic'],
    categoryName: 'Romantic',
    subcategory: 'Proposal Setup',
    price: 5499,
    originalPrice: 7000,
    description: 'Make your proposal unforgettable with a stunning setup of flowers, candles and a personalised message.',
    inclusions: ['Flower ring setup', '50 candles', 'Personalised message board', 'Rose petals pathway', 'Photographer (1 hr)'],
    addOns: [{ name: 'Ring box with LED', price: 499 }, { name: 'Couple cake', price: 899 }],
    image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&q=80',
    moreImages: [
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
    ],
    badge: 'Most Loved',
    badgeColor: 'pink',
    rating: 5.0, reviewCount: 178, orderCount: 340, active: true, featured: true,
  },
];

const sliders = [
  {
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1400&q=85',
    chip: '🎊 Most Popular',
    headline: 'Birthday Decorations\nfor Every Style',
    subtext: 'Balloon arches, backdrops & more — done in 2 hours',
    gradient: 'linear-gradient(to right, rgba(76,29,149,.75), rgba(76,29,149,.1))',
    ctaText: 'Explore Birthdays',
    order: 0, active: true,
  },
  {
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=85',
    chip: '🕯️ Trending Now',
    headline: 'Romantic Candlelight\nDinners in Bangalore',
    subtext: 'Private setup at your home or venue — from ₹2,499',
    gradient: 'linear-gradient(to right, rgba(131,24,67,.75), rgba(131,24,67,.1))',
    ctaText: 'Book a Dinner',
    order: 1, active: true,
  },
  {
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1400&q=85',
    chip: '💍 Anniversary Special',
    headline: 'Surprise Your Partner\nWith a Dreamy Setup',
    subtext: 'Rose petals, fairy lights, balloons — we handle everything',
    gradient: 'linear-gradient(to right, rgba(17,24,39,.75), rgba(17,24,39,.1))',
    ctaText: 'Plan Anniversary',
    order: 2, active: true,
  },
  {
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=85',
    chip: '🎁 New Arrivals',
    headline: 'Surprise Explosion\nBoxes & Hampers',
    subtext: 'Personalised gifts delivered same day across Bangalore',
    gradient: 'linear-gradient(to right, rgba(6,78,59,.75), rgba(6,78,59,.1))',
    ctaText: 'Shop Gifts',
    order: 3, active: true,
  },
  {
    image: 'https://images.unsplash.com/photo-1602631985686-1bb0e6a8696e?w=1400&q=85',
    chip: '🌸 Festival Season',
    headline: 'Festive Decorations\nfor Every Occasion',
    subtext: 'Diwali, Navratri, Christmas & more — book now',
    gradient: 'linear-gradient(to right, rgba(120,53,15,.75), rgba(120,53,15,.1))',
    ctaText: 'View Festivals',
    order: 4, active: true,
  },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing
  await Category.deleteMany({});
  await Product.deleteMany({});
  await Slider.deleteMany({});
  console.log('Cleared existing data');

  // Insert categories
  const insertedCats = await Category.insertMany(categories);
  console.log(`Inserted ${insertedCats.length} categories`);

  // Build name → _id map
  const catMap = {};
  insertedCats.forEach(c => { catMap[c.name] = c._id; });

  // Insert products
  const products = getProducts(catMap);
  const insertedProds = await Product.insertMany(products);
  console.log(`Inserted ${insertedProds.length} products`);

  // Update productCount on each category
  for (const cat of insertedCats) {
    const count = products.filter(p => p.categoryName === cat.name).length;
    await Category.findByIdAndUpdate(cat._id, { productCount: count });
  }
  console.log('Updated product counts');

  // Insert sliders
  await Slider.insertMany(sliders);
  console.log(`Inserted ${sliders.length} sliders`);

  await mongoose.disconnect();
  console.log('Done! ✓');
}

seed().catch(err => { console.error(err); process.exit(1); });
