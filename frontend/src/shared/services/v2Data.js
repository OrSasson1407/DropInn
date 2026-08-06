// DropIn v2.0 Master Data Store & Helpers

export const INITIAL_STYLE_FEED = [
  {
    id: 'style_1',
    title: 'Mid Skin Fade & Textured Crop',
    category: 'Men\'s Haircut',
    author: 'Avi Cohen (Master Barber)',
    rating: 4.9,
    likes: 142,
    imageUrl: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80',
    tags: ['Skin Fade', 'Textured Crop', 'Beard Lineup'],
    price: 110,
    estimatedDuration: '45 min'
  },
  {
    id: 'style_2',
    title: 'Luxury Dyson Airwrap Blowout & Waves',
    category: 'Women\'s Styling',
    author: 'Sarah Stern (Hairstylist)',
    rating: 5.0,
    likes: 215,
    imageUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
    tags: ['Blowout', 'Volume Waves', 'Olaplex'],
    price: 180,
    estimatedDuration: '60 min'
  },
  {
    id: 'style_3',
    title: 'Russian Gel Manicure & Custom Foil Art',
    category: 'Nail Care',
    author: 'Maya Lin (Nail Artist)',
    rating: 4.95,
    likes: 189,
    imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80',
    tags: ['Gel Polish', 'Russian Manicure', 'Nail Art'],
    price: 140,
    estimatedDuration: '50 min'
  },
  {
    id: 'style_4',
    title: 'Classic Taper Fade & Hot Towel Razor Sculpt',
    category: 'Men\'s Haircut',
    author: 'David Levi (Fade Specialist)',
    rating: 4.88,
    likes: 98,
    imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
    tags: ['Taper Fade', 'Razor Lineup', 'Hot Towel'],
    price: 100,
    estimatedDuration: '40 min'
  },
  {
    id: 'style_5',
    title: 'Soft Glam Evening Makeup & Individual Lashes',
    category: 'Makeup & Glam',
    author: 'Shiraz Bar (Bridal MUA)',
    rating: 4.9,
    likes: 167,
    imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
    tags: ['Soft Glam', 'Individual Lashes', 'Contour'],
    price: 220,
    estimatedDuration: '60 min'
  }
];

export const INITIAL_LOYALTY_TIERS = [
  {
    id: 'silver',
    name: 'Silver Member',
    minPoints: 0,
    perks: ['5% Cashback in Points', 'Standard Dispatch Priority'],
    badgeColor: 'from-slate-400 to-slate-200'
  },
  {
    id: 'gold',
    name: 'Gold VIP',
    minPoints: 300,
    perks: ['10% Cashback', 'Free Travel Fee on Weekdays', 'Priority Dispatch'],
    badgeColor: 'from-amber-400 to-amber-200'
  },
  {
    id: 'platinum',
    name: 'Platinum Elite',
    minPoints: 800,
    perks: ['15% Cashback', 'Free Travel Fee Always', 'Dedicated Concierge', 'Complimentary Scalp Detox'],
    badgeColor: 'from-purple-400 to-indigo-300'
  }
];

export const INITIAL_EQUIPMENT_CHECKLIST = [
  { id: 'eq_1', label: 'Sterilized Clippers & Trimmers (Barbicide disinfected)', required: true },
  { id: 'eq_2', label: 'Fresh Disposable Cape & Neck Strip Rolls', required: true },
  { id: 'eq_3', label: 'Disinfectant Spray & Alcohol Wipes (70%+)', required: true },
  { id: 'eq_4', label: 'Floor Protection Mat & Portable Ring Light', required: true },
  { id: 'eq_5', label: 'Cordless Battery Power Bank & Handheld Mirror', required: false },
  { id: 'eq_6', label: 'First Aid Kit & Hand Sanitizer Gel', required: true }
];

export const INITIAL_CRM_CLIENTS = [
  {
    id: 'client_101',
    name: 'Michael Dan',
    phone: '+972 50-123-4567',
    address: 'Rothschild Blvd 45, Tel Aviv (Apt 4B, Code 1234)',
    totalVisits: 8,
    lastVisit: '2026-07-28',
    notes: 'Skin fade on sides (#0.5 guard), keep length on top for pompadour. Sensitive skin on back of neck, use tea tree balm.',
    beveragePreference: 'Cold Sparkling Water',
    colorFormula: 'N/A'
  },
  {
    id: 'client_102',
    name: 'Daniela Roth',
    phone: '+972 54-987-6543',
    address: 'Dizengoff St 112, Tel Aviv (Floor 2)',
    totalVisits: 5,
    lastVisit: '2026-07-15',
    notes: 'Gel manicure with nude blush shade #42. Prefers round nail shape. Extremely gentle cuticle care.',
    beveragePreference: 'Espresso with Oat Milk',
    colorFormula: 'Blush Gel #42 + Top Coat'
  }
];
