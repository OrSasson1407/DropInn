import { 
  Scissors, Sparkle, Flame, Heart, Zap, ShieldCheck, Eye, Sun,
  Activity, Dumbbell, Apple, Feather, Home as HomeIcon, Wrench, Droplet,
  Zap as ElectricIcon, Wind, Key, Sparkles as CleanIcon, Dog, Footprints,
  Stethoscope, Car, UtensilsCrossed, Monitor, Shirt, Camera,
  BookOpen, Wine, Bug, Trees, ShieldAlert, Sparkles
} from 'lucide-react';

export const CATEGORY_GROUPS = [
  { id: 'all', label: 'All Services', icon: Sparkles },
  { id: 'grooming', label: 'Grooming & Beauty', icon: Scissors },
  { id: 'wellness', label: 'Wellness & Health', icon: Zap },
  { id: 'home', label: 'Home & Repairs', icon: HomeIcon },
  { id: 'pets', label: 'Pet Care', icon: Dog },
  { id: 'auto', label: 'Auto Care', icon: Car },
  { id: 'lifestyle', label: 'Lifestyle & Tech', icon: UtensilsCrossed }
];

export const SERVICE_CATEGORIES = [
  // 1. Grooming & Beauty
  { id: 'haircut', group: 'grooming', label: "Men's Haircuts & Beard", icon: Scissors, count: 'Active Now', description: 'Skin fades, hot towel razor, beard sculpting & lineups' },
  { id: 'nails', group: 'grooming', label: 'Manicure & Pedicure', icon: Sparkle, count: 'At Home', description: 'Gel manicure, medical pedicure, acrylics & custom nail art' },
  { id: 'women_styling', group: 'grooming', label: "Women's Hair & Blowout", icon: Flame, count: 'Top Stylists', description: 'Dyson blowouts, balayage, keratine treatments & event updos' },
  { id: 'makeup', group: 'grooming', label: 'Professional Makeup', icon: Heart, count: 'Events & Glam', description: 'Bridal glam, evening makeup, airbrush & lashes' },
  { id: 'skincare', group: 'grooming', label: 'Facial & Skincare', icon: ShieldCheck, count: 'Glowing Skin', description: 'Hydrafacials, anti-aging peels, deep pore cleansing' },
  { id: 'lashes_brows', group: 'grooming', label: 'Eyelashes & Eyebrows', icon: Eye, count: 'Precision', description: 'Lash extensions, brow lamination, microblading & tinting' },
  { id: 'hair_removal', group: 'grooming', label: 'Hair Removal & Waxing', icon: ShieldAlert, count: 'Smooth Care', description: 'Full body waxing, laser care & facial threading' },
  { id: 'tanning', group: 'grooming', label: 'Spray Tanning & Glow', icon: Sun, count: 'Custom Glow', description: 'Organic spray tan, contour bronzing at your home' },

  // 2. Wellness & Health
  { id: 'massage', group: 'wellness', label: 'Massage & Bodywork', icon: Zap, count: 'Relaxation', description: 'Deep tissue, Swedish, hot stone & sports recovery massage' },
  { id: 'physio', group: 'wellness', label: 'Physical Therapy & Rehab', icon: Activity, count: 'Licensed Pros', description: 'Injury rehabilitation, posture alignment & dry needling' },
  { id: 'yoga_pilates', group: 'wellness', label: 'Private Yoga & Pilates', icon: Feather, count: '1-on-1 Studio', description: 'Personalized mat yoga, reformer & breathwork sessions' },
  { id: 'fitness', group: 'wellness', label: 'Personal Fitness Trainer', icon: Dumbbell, count: 'Mobile Equipment', description: '1-on-1 HIIT, strength training, mobile gym setup' },
  { id: 'nutrition', group: 'wellness', label: 'Nutrition & Diet Coaching', icon: Apple, count: 'Custom Plans', description: 'Metabolic assessment, custom meal prep & diet strategy' },

  // 3. Home Services & Maintenance
  { id: 'cleaning', group: 'home', label: 'House Cleaning & Maid', icon: CleanIcon, count: 'Deep Clean', description: 'Deep home cleaning, move-in/out, Airbnb reset' },
  { id: 'handyman', group: 'home', label: 'Handyman & Repairs', icon: Wrench, count: 'Same Day', description: 'TV mounting, furniture assembly, shelf hanging, repairs' },
  { id: 'plumbing', group: 'home', label: 'Plumbing & Emergency Leaks', icon: Droplet, count: '24/7 Urgent', description: 'Drain unblocking, leak repair, faucet & toilet fix' },
  { id: 'electrical', group: 'home', label: 'Electrician & Lighting', icon: ElectricIcon, count: 'Certified', description: 'Light fixture installs, short circuit fix, smart switches' },
  { id: 'ac_hvac', group: 'home', label: 'AC & Climate Control', icon: Wind, count: 'Cooling Fix', description: 'AC deep cleaning, gas refill, filter replacement' },
  { id: 'locksmith', group: 'home', label: 'Locksmith & Entry', icon: Key, count: '15-Min Arrival', description: 'Emergency lock picking, door unlock, lock upgrades' },
  { id: 'upholstery', group: 'home', label: 'Carpet & Sofa Steam Clean', icon: CleanIcon, count: 'Stain Removal', description: 'Deep steam cleaning for couches, carpets & mattresses' },
  { id: 'pest_control', group: 'home', label: 'Pest Control & Extermination', icon: Bug, count: 'Eco-Friendly', description: 'Ant, cockroach, rodent eradication & prevention' },
  { id: 'gardening', group: 'home', label: 'Lawn & Garden Care', icon: Trees, count: 'Outdoor Care', description: 'Pruning, grass cutting, balcony plant design' },

  // 4. Pet Care
  { id: 'pet_grooming', group: 'pets', label: 'Mobile Dog Grooming', icon: Dog, count: 'Mobile Van', description: 'Full dog wash, haircut, nail trim in equipped van or home' },
  { id: 'pet_sitting', group: 'pets', label: 'Pet Sitting & Dog Walking', icon: Footprints, count: 'Loving Care', description: 'Daily dog walking, overnight sitting, feeding & play' },
  { id: 'veterinary', group: 'pets', label: 'Vet Home Visits', icon: Stethoscope, count: 'In-Home Exam', description: 'Vaccinations, wellness checkups, microchipping at home' },

  // 5. Auto Care
  { id: 'car_detailing', group: 'auto', label: 'Mobile Car Detailing', icon: Car, count: 'Waterless Polish', description: 'Interior deep wash, leather treatment, ceramic coating' },
  { id: 'auto_mechanic', group: 'auto', label: 'Mobile Auto Repair & Battery', icon: Wrench, count: 'On Location', description: 'Car battery replacement, oil change, tire fix at your spot' },

  // 6. Lifestyle & Tech
  { id: 'private_chef', group: 'lifestyle', label: 'Private Chef & Catering', icon: UtensilsCrossed, count: 'Gourmet', description: 'Multi-course home dinners, sushi bars, meal prep' },
  { id: 'tech_support', group: 'lifestyle', label: 'Home IT & Wi-Fi Setup', icon: Monitor, count: 'Tech Experts', description: 'Mesh Wi-Fi installation, smart TV, PC & printer repair' },
  { id: 'tailoring', group: 'lifestyle', label: 'Tailoring & Alterations', icon: Shirt, count: 'Fitting at Home', description: 'Suit & dress fitting, hemming, zipper replacement' },
  { id: 'photography', group: 'lifestyle', label: 'Professional Photography', icon: Camera, count: 'Studio Lighting', description: 'Family portraits, headshots, event & product photos' },
  { id: 'tutoring', group: 'lifestyle', label: 'Private Tutoring & Music', icon: BookOpen, count: 'Expert Tutors', description: 'Piano/guitar lessons, math, language & exam prep' },
  { id: 'event_bartender', group: 'lifestyle', label: 'Event Bartender & Server', icon: Wine, count: 'Party Ready', description: 'Craft cocktail mixologists, party servers & setup team' }
];

export const DEMO_PROVIDERS = [
  {
    id: 'demo_provider_1',
    name: 'Avi Cohen (Master Barber)',
    category: "Men's Haircuts & Beard",
    categoryGroup: 'grooming',
    rating: 4.9,
    price: 110,
    eta: '12-15 min',
    distance: '1.8 km',
    bio: 'Specializing in precision skin fades, hot towel razor lineup, and beard sculpting. Mobile studio setup with ring light and zero mess guarantee.',
    specialties: ['Skin Fade', 'Beard Trim', 'Hot Towel Razor', 'Kid Cuts'],
    isAvailable: true,
    badges: ['Instant Dispatch', 'Top Rated']
  },
  {
    id: 'demo_provider_2',
    name: 'Maya Lin (Nail Artist & Esthetician)',
    category: 'Manicure & Pedicure',
    categoryGroup: 'grooming',
    rating: 5.0,
    price: 140,
    eta: '18-22 min',
    distance: '2.1 km',
    bio: 'Certified nail technician offering medical pedicures, gel manicures, and custom nail art at your home with sterilized portable equipment.',
    specialties: ['Gel Manicure', 'Pedicure', 'Nail Art', 'Cuticle Care'],
    isAvailable: true,
    badges: ['Top Rated', 'Sterilized Equipment']
  },
  {
    id: 'demo_provider_3',
    name: 'Sarah Stern (Hairstylist & Blowout)',
    category: "Women's Hair & Blowout",
    categoryGroup: 'grooming',
    rating: 4.9,
    price: 180,
    eta: '20-25 min',
    distance: '3.4 km',
    bio: 'Celebrity stylist providing luxury home blowouts, hair treatments, and event styling using Dyson Airwrap & Olaplex products.',
    specialties: ['Blowout', 'Balayage Styling', 'Hair Treatment', 'Updo'],
    isAvailable: true,
    badges: ['Luxury Stylist', 'Instant Booking']
  },
  {
    id: 'demo_provider_4',
    name: 'Noam K. (Licensed Massage Therapist)',
    category: 'Massage & Bodywork',
    categoryGroup: 'wellness',
    rating: 4.95,
    price: 250,
    eta: '25-30 min',
    distance: '2.8 km',
    bio: 'Brings portable memory-foam massage table, soothing essential oils, and heated towels for deep tissue, Swedish, or sports recovery massages.',
    specialties: ['Deep Tissue', 'Swedish Massage', 'Aromatherapy', 'Sports Recovery'],
    isAvailable: true,
    badges: ['Portable Table', 'Licensed Pro']
  },
  {
    id: 'demo_provider_5',
    name: 'Shiraz Bar (Bridal & Event Glam)',
    category: 'Professional Makeup',
    categoryGroup: 'grooming',
    rating: 4.88,
    price: 220,
    eta: '15-20 min',
    distance: '1.9 km',
    bio: 'Professional MUA using Charlotte Tilbury & MAC. Perfect for weddings, photo shoots, and special evening events.',
    specialties: ['Bridal Glam', 'Evening Makeup', 'Natural Glow', 'Lash Application'],
    isAvailable: true,
    badges: ['Glam Specialist']
  },
  {
    id: 'demo_provider_6',
    name: 'David Levi (Master Handyman)',
    category: 'Handyman & Repairs',
    categoryGroup: 'home',
    rating: 4.92,
    price: 160,
    eta: '15-25 min',
    distance: '1.5 km',
    bio: 'Fully equipped mobile toolkit. TV wall mounting, IKEA furniture assembly, door locks, curtain hanging, and quick home repairs.',
    specialties: ['TV Mounting', 'Furniture Assembly', 'Shelf Hanging', 'Drywall Repair'],
    isAvailable: true,
    badges: ['Tool Master', 'Same-Day Dispatch']
  },
  {
    id: 'demo_provider_7',
    name: 'Paws & Groom (Mobile Dog Spa)',
    category: 'Mobile Dog Grooming',
    categoryGroup: 'pets',
    rating: 4.98,
    price: 180,
    eta: '20-30 min',
    distance: '2.2 km',
    bio: 'Fully self-contained heated water mobile grooming van. Stress-free organic dog baths, breed haircuts, nail grinding, and ear cleaning.',
    specialties: ['Full Grooming', 'Organic Bath', 'Nail Grinding', 'Deshedding'],
    isAvailable: true,
    badges: ['Mobile Spa Van', 'Pet Lover']
  },
  {
    id: 'demo_provider_8',
    name: 'Chef Marco (Private Culinary Experience)',
    category: 'Private Chef & Catering',
    categoryGroup: 'lifestyle',
    rating: 5.0,
    price: 350,
    eta: '30-45 min',
    distance: '3.1 km',
    bio: 'Italian & Mediterranean trained private chef. Brings all ingredients, cooks 3-course customized meals in your kitchen, and leaves it spotless.',
    specialties: ['3-Course Dinner', 'Sushi Bar', 'Custom Meal Prep', 'Wine Pairing'],
    isAvailable: true,
    badges: ['Michelin Background', 'Spotless Clean']
  },
  {
    id: 'demo_provider_9',
    name: 'Shlomi (Emergency Plumber & Leak Fix)',
    category: 'Plumbing & Emergency Leaks',
    categoryGroup: 'home',
    rating: 4.89,
    price: 190,
    eta: '10-20 min',
    distance: '1.2 km',
    bio: '24/7 Emergency response plumber. Thermal camera leak detection, drain unblocking, water pressure issues, and faucet replacement.',
    specialties: ['Leak Detection', 'Drain Unblocking', 'Faucet Fix', 'Water Heater'],
    isAvailable: true,
    badges: ['24/7 Urgent', 'Licensed Plumber']
  },
  {
    id: 'demo_provider_10',
    name: 'AutoShine Pro (Mobile Detailing & Polish)',
    category: 'Mobile Car Detailing',
    categoryGroup: 'auto',
    rating: 4.94,
    price: 210,
    eta: '25-35 min',
    distance: '2.5 km',
    bio: 'Eco-friendly waterless interior and exterior car detailing at your parking spot. Steam upholstery wash, leather conditioning, ceramic spray.',
    specialties: ['Interior Steam Wash', 'Leather Treatment', 'Ceramic Spray', 'Engine Bay'],
    isAvailable: true,
    badges: ['At Your Parking', 'Eco Waterless']
  },
  {
    id: 'demo_provider_11',
    name: 'Daniel Tech (Home Mesh Wi-Fi & Smart Home)',
    category: 'Home IT & Wi-Fi Setup',
    categoryGroup: 'lifestyle',
    rating: 4.91,
    price: 150,
    eta: '15-25 min',
    distance: '1.7 km',
    bio: 'Expert IT specialist. Solves dead Wi-Fi spots, configures mesh networks, smart locks, Apple TV/Chromecast setup, and PC troubleshooting.',
    specialties: ['Mesh Wi-Fi', 'Smart Home Locks', 'PC Repair', 'Printer Config'],
    isAvailable: true,
    badges: ['IT Engineer', 'Fast Setup']
  },
  {
    id: 'demo_provider_12',
    name: 'Liron (Certified Electrician)',
    category: 'Electrician & Lighting',
    categoryGroup: 'home',
    rating: 4.96,
    price: 180,
    eta: '15-20 min',
    distance: '1.9 km',
    bio: 'Licensed electrician for indoor/outdoor chandelier installation, smart switch wiring, breaker panel checks, and safety audits.',
    specialties: ['Chandelier Install', 'Smart Switches', 'Short Circuit Fix', 'Breaker Box'],
    isAvailable: true,
    badges: ['Licensed Electrician', 'Safety Certified']
  },
  {
    id: 'demo_provider_13',
    name: 'GlowSkin Facial (Mobile Medical Esthetician)',
    category: 'Facial & Skincare',
    categoryGroup: 'grooming',
    rating: 4.93,
    price: 230,
    eta: '20-30 min',
    distance: '2.0 km',
    bio: 'Brings portable LED therapy light, ultrasonic skin scrubber, and medical grade serums for deep hydration and anti-aging home facials.',
    specialties: ['Hydra Glow', 'LED Light Therapy', 'Chemical Peel', 'Acne Care'],
    isAvailable: true,
    badges: ['Medical Grade', 'Glowing Skin']
  },
  {
    id: 'demo_provider_14',
    name: 'Alex Fitness (1-on-1 Home Trainer)',
    category: 'Personal Fitness Trainer',
    categoryGroup: 'wellness',
    rating: 4.97,
    price: 200,
    eta: '20-30 min',
    distance: '2.3 km',
    bio: 'Brings TRX suspension, dumbbells, resistance bands, and kettlebells to your apartment or roof for personalized workout sessions.',
    specialties: ['TRX & Core', 'HIIT Fat Burn', 'Strength Training', 'Postural Fix'],
    isAvailable: true,
    badges: ['Mobile Gym', 'Certified Coach']
  },
  {
    id: 'demo_provider_15',
    name: 'CleanHome Express (Deep Cleaning Team)',
    category: 'House Cleaning & Maid',
    categoryGroup: 'home',
    rating: 4.88,
    price: 170,
    eta: '25-40 min',
    distance: '1.6 km',
    bio: 'Professional 2-person cleaning crew equipped with HEPA vacuums, eco-friendly detergents, and steam cleaners for spotless living spaces.',
    specialties: ['Deep Clean', 'Window Wash', 'Kitchen Degreasing', 'Bathroom Disinfect'],
    isAvailable: true,
    badges: ['Eco Products', '2-Person Team']
  }
];

export const ADDONS_BY_CATEGORY = {
  'haircut': [
    { id: 'beard', name: 'Beard Trim & Razor Lineup', price: 40 },
    { id: 'shampoo', name: 'Hot Towel & Scalp Massage', price: 30 },
    { id: 'design', name: 'Custom Hair Tattoo / Line Design', price: 35 }
  ],
  'nails': [
    { id: 'removal', name: 'Old Gel Polish Removal', price: 25 },
    { id: 'nailart', name: 'Custom Nail Art (2 Accent Nails)', price: 45 },
    { id: 'paraffin', name: 'Paraffin Hydration Wax Mask', price: 35 }
  ],
  'women_styling': [
    { id: 'olaplex', name: 'Olaplex Deep Conditioning', price: 60 },
    { id: 'curls', name: 'Glam Hollywood Waves Curls', price: 50 }
  ],
  'makeup': [
    { id: 'lashes', name: 'Faux Mink Lashes', price: 40 },
    { id: 'airbrush', name: 'Airbrush Foundation Upgrade', price: 50 }
  ],
  'massage': [
    { id: 'hotstone', name: 'Hot Basalt Stone Upgrade', price: 50 },
    { id: 'cbd', name: 'Organic CBD Recovery Balm', price: 40 }
  ],
  'handyman': [
    { id: 'tv_bracket', name: 'Heavy Duty Swivel TV Bracket', price: 70 },
    { id: 'anchors', name: 'Heavy Concrete Wall Anchors', price: 25 }
  ],
  'cleaning': [
    { id: 'fridge_oven', name: 'Deep Fridge & Oven Scrub', price: 60 },
    { id: 'balcony', name: 'Balcony Pressure Wash', price: 40 }
  ],
  'pet_grooming': [
    { id: 'flea_tick', name: 'Medicated Flea & Tick Treatment', price: 35 },
    { id: 'teeth', name: 'Dog Dental Enzyme Teeth Brushing', price: 25 }
  ],
  'car_detailing': [
    { id: 'headlight', name: 'Headlight Oxidation Restoration', price: 80 },
    { id: 'ceramic', name: 'Hydrophobic Ceramic Shield Spray', price: 60 }
  ]
};
