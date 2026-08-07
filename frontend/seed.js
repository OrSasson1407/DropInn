import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  serverTimestamp 
} from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

// Load config from firebase-applet-config.json
const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

console.log('Targeting Firestore Project:', firebaseConfig.projectId);
console.log('Targeting Database ID:', firebaseConfig.firestoreDatabaseId);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function seed() {
  console.log('Checking existing providers...');
  const providersSnap = await getDocs(collection(db, 'providers'));
  console.log(`Existing providers count: ${providersSnap.size}`);

  console.log('Checking existing orders...');
  const ordersSnap = await getDocs(collection(db, 'orders'));
  console.log(`Existing orders count: ${ordersSnap.size}`);

  // 1. Providers Data (8 documents)
  const providersData = [
    {
      name: "Avi Cohen (Master Barber)",
      category: "Men's Haircuts & Beard",
      rating: 4.9,
      price: 120,
      eta: "10-15 min",
      distance: "1.2 km",
      bio: "Specializing in precision fade haircuts and hot-towel beard sculpting right at your home or office. Over 10 years of master barber experience with top mobile equipment.",
      specialties: ["Fade Cut", "Hot Towel Shave", "Beard Sculpting", "Hair Styling"],
      isAvailable: true,
      isApproved: true,
      badges: ["Top Rated", "Master Barber", "Instant Dispatch"],
      reviews: [
        { id: "rev_1", author: "Dan K.", rating: 5, comment: "Crisp fade and super punctual! Loved the hot towel finish.", date: "2026-08-02" },
        { id: "rev_2", author: "Gai M.", rating: 4.8, comment: "Very professional setup in my living room.", date: "2026-07-28" }
      ],
      portfolio: [
        "https://placehold.co/600x400/1b1714/f59e0b?text=Executive+Fade",
        "https://placehold.co/600x400/1b1714/f59e0b?text=Beard+Sculpt"
      ]
    },
    {
      name: "Maya Levi (Nail & Spa Specialist)",
      category: "Manicure & Pedicure",
      rating: 4.8,
      price: 140,
      eta: "20-25 min",
      distance: "2.5 km",
      bio: "Certified nail technician offering luxury spa manicures, gel polishes, and medical pedicures in the comfort of your living room. Uses premium eco-friendly products and sanitized tools.",
      specialties: ["Gel Manicure", "Spa Pedicure", "Nail Art", "Cuticle Care"],
      isAvailable: true,
      isApproved: true,
      badges: ["Eco Friendly", "Sanitized Tools"],
      reviews: [
        { id: "rev_3", author: "Noa S.", rating: 5, comment: "Maya was amazing! Gel lasted over 3 weeks.", date: "2026-08-04" },
        { id: "rev_4", author: "Tamar A.", rating: 4.6, comment: "Punctual and very meticulous worker.", date: "2026-07-25" }
      ],
      portfolio: [
        "https://placehold.co/600x400/1b1714/f59e0b?text=Gel+Nail+Art",
        "https://placehold.co/600x400/1b1714/f59e0b?text=Luxury+Pedicure"
      ]
    },
    {
      name: "Yael Mizrahi (Couture Hair Stylist)",
      category: "Women's Hair & Blowout",
      rating: 4.95,
      price: 190,
      eta: "15-20 min",
      distance: "1.8 km",
      bio: "Red-carpet hairstylist bringing salon-grade blowout, styling, and keratin treatments to your doorstep. Perfect for events, photoshoot prep, or weekly glam.",
      specialties: ["Volume Blowout", "Beach Waves", "Bridal Hair", "Keratin Treatment"],
      isAvailable: true,
      isApproved: true,
      badges: ["Event Glam", "Top Rated"],
      reviews: [
        { id: "rev_5", author: "Shira B.", rating: 5, comment: "Saved my event! Incredible volume blowout.", date: "2026-08-01" },
        { id: "rev_6", author: "Michal R.", rating: 4.9, comment: "Brought all professional Dyson tools, super impressive.", date: "2026-07-30" }
      ],
      portfolio: [
        "https://placehold.co/600x400/1b1714/f59e0b?text=Glam+Blowout",
        "https://placehold.co/600x400/1b1714/f59e0b?text=Beach+Waves"
      ]
    },
    {
      name: "Omer Shapira (Celebrity Makeup Artist)",
      category: "Professional Makeup",
      rating: 4.85,
      price: 220,
      eta: "25-30 min",
      distance: "3.1 km",
      bio: "Professional makeup artist specializing in natural glowing skin, evening glam, and bridal looks. Equipped with ring lights and high-end makeup collections.",
      specialties: ["Evening Glam", "Natural Glow", "Bridal Makeup", "Contouring"],
      isAvailable: true,
      isApproved: true,
      badges: ["High-End Products", "Ring Light Setup"],
      reviews: [
        { id: "rev_7", author: "Elinor T.", rating: 5, comment: "Omer made me feel like a star before my gal night out!", date: "2026-08-03" },
        { id: "rev_8", author: "Roni P.", rating: 4.7, comment: "Flawless makeup that stayed intact all night long.", date: "2026-07-29" }
      ],
      portfolio: [
        "https://placehold.co/600x400/1b1714/f59e0b?text=Evening+Glam",
        "https://placehold.co/600x400/1b1714/f59e0b?text=Bridal+Makeup"
      ]
    },
    {
      name: "Eitan Katz (Licensed Massage Therapist)",
      category: "Massage & Bodywork",
      rating: 4.92,
      price: 260,
      eta: "30-35 min",
      distance: "4.0 km",
      bio: "Licensed deep tissue and Swedish massage therapist providing full mobile massage tables, fresh linens, and relaxing aromatherapy oils for home wellness.",
      specialties: ["Deep Tissue", "Swedish Massage", "Sports Therapy", "Aromatherapy"],
      isAvailable: true,
      isApproved: true,
      badges: ["Licensed Therapist", "Table Included", "Top Rated"],
      reviews: [
        { id: "rev_9", author: "Yossi H.", rating: 5, comment: "Relieved all my lower back tension. Best mobile massage ever.", date: "2026-08-05" },
        { id: "rev_10", author: "Ariel N.", rating: 4.8, comment: "Very respectful, professional setup, clean towels.", date: "2026-07-27" }
      ],
      portfolio: [
        "https://placehold.co/600x400/1b1714/f59e0b?text=Mobile+Massage+Setup",
        "https://placehold.co/600x400/1b1714/f59e0b?text=Aromatherapy+Oils"
      ]
    },
    {
      name: "Dr. Sarah Ben-David (Clinical Esthetician)",
      category: "Facial & Skincare",
      rating: 4.88,
      price: 180,
      eta: "20-30 min",
      distance: "2.1 km",
      bio: "Clinical esthetician offering personalized deep cleansing facials, anti-aging collagen therapy, and gentle peeling treatments in home settings.",
      specialties: ["Deep Cleansing Facial", "Anti-Aging Collagen", "Hydra Glow", "Gentle Peel"],
      isAvailable: true,
      isApproved: false,
      badges: ["Dermatology Certified", "New Provider"],
      reviews: [
        { id: "rev_11", author: "Dana K.", rating: 4.9, comment: "My skin felt brand new and glowing instantly!", date: "2026-08-02" }
      ],
      portfolio: [
        "https://placehold.co/600x400/1b1714/f59e0b?text=Hydra+Glow+Treatment"
      ]
    },
    {
      name: "Elior Dahan (Urban Barber)",
      category: "Men's Haircuts & Beard",
      rating: 4.65,
      price: 95,
      eta: "40-50 min",
      distance: "5.5 km",
      bio: "Modern street barber bringing trendy cuts, taper fades, and sharp beard trims right to your apartment door.",
      specialties: ["Taper Fade", "Line Up", "Beard Trim"],
      isAvailable: false,
      isApproved: true,
      badges: ["Budget Friendly", "Trending Cuts"],
      reviews: [
        { id: "rev_12", author: "Ron L.", rating: 4.6, comment: "Great guy, sharp line-up and clean finish.", date: "2026-07-20" }
      ],
      portfolio: [
        "https://placehold.co/600x400/1b1714/f59e0b?text=Taper+Fade+Cut"
      ]
    },
    {
      name: "Lia Gold (Glamour & Lash Stylist)",
      category: "Women's Hair & Blowout",
      rating: 4.55,
      price: 160,
      eta: "35-45 min",
      distance: "4.8 km",
      bio: "Hair styling and lash extensions specialist pending admin verification. Passionate about creating effortless beauty at home.",
      specialties: ["Blowout Styling", "Lash Lift", "Hair Curls"],
      isAvailable: false,
      isApproved: false,
      badges: ["New Applicant"],
      reviews: [],
      portfolio: []
    }
  ];

  const seededProviderIds = [];
  console.log('Creating 8 provider documents...');
  for (const p of providersData) {
    const docRef = await addDoc(collection(db, 'providers'), {
      ...p,
      createdAt: serverTimestamp()
    });
    seededProviderIds.push({ id: docRef.id, name: p.name, category: p.category });
    console.log(`Seeded Provider: [${docRef.id}] ${p.name}`);
  }

  // 2. Orders Data (10 documents)
  // Distribution: 3 pending, 3 approved, 3 completed (2 rated, 1 unrated), 1 declined
  const ordersData = [
    // 3 Pending
    {
      customerId: "demo_customer_1",
      providerIndex: 0, // Avi Cohen
      address: "Rothschild Blvd 12, Tel Aviv, Apt 4",
      scheduledSlot: "Today, 16:30–17:00",
      status: "pending"
    },
    {
      customerId: "demo_customer_2",
      providerIndex: 1, // Maya Levi
      address: "Dizengoff St 108, Tel Aviv, Apt 12",
      scheduledSlot: null,
      status: "pending"
    },
    {
      customerId: "demo_customer_1",
      providerIndex: 2, // Yael Mizrahi
      address: "King George St 45, Tel Aviv, Floor 2",
      scheduledSlot: "Tomorrow, 10:00–11:00",
      status: "pending"
    },

    // 3 Approved
    {
      customerId: "demo_customer_3",
      providerIndex: 3, // Omer Shapira
      address: "Ben Yehuda St 82, Tel Aviv, Apt 8",
      scheduledSlot: "Today, 18:00–19:00",
      status: "approved"
    },
    {
      customerId: "demo_customer_1",
      providerIndex: 4, // Eitan Katz
      address: "Ibn Gabirol St 60, Tel Aviv, Apt 15",
      scheduledSlot: null,
      status: "approved"
    },
    {
      customerId: "demo_customer_2",
      providerIndex: 0, // Avi Cohen
      address: "Florentin St 22, Tel Aviv, Apt 3",
      scheduledSlot: "Tomorrow, 14:00–14:30",
      status: "approved"
    },

    // 3 Completed
    // Completed #1 (with rating & comment)
    {
      customerId: "demo_customer_1",
      providerIndex: 0, // Avi Cohen
      address: "Rothschild Blvd 12, Tel Aviv, Apt 4",
      scheduledSlot: "Yesterday, 15:00–15:30",
      status: "completed",
      rating: 5,
      reviewComment: "Incredible haircut! Avi arrived right on time with full portable barber station. Very clean!"
    },
    // Completed #2 (with rating & comment)
    {
      customerId: "demo_customer_2",
      providerIndex: 4, // Eitan Katz
      address: "Dizengoff St 108, Tel Aviv, Apt 12",
      scheduledSlot: "2 days ago, 19:00–20:00",
      status: "completed",
      rating: 5,
      reviewComment: "Eitan set up his massage table in 5 mins. Outstanding deep tissue treatment!"
    },
    // Completed #3 (WITHOUT rating & comment -> for testing "leave a review" flow)
    {
      customerId: "demo_customer_1",
      providerIndex: 1, // Maya Levi
      address: "Rothschild Blvd 12, Tel Aviv, Apt 4",
      scheduledSlot: null,
      status: "completed"
    },

    // 1 Declined
    {
      customerId: "demo_customer_3",
      providerIndex: 6, // Elior Dahan
      address: "Allenby St 94, Tel Aviv, Apt 5",
      scheduledSlot: null,
      status: "declined"
    }
  ];

  const seededOrderIds = [];
  console.log('Creating 10 order documents...');
  for (const o of ordersData) {
    const prov = seededProviderIds[o.providerIndex];
    const pInfo = providersData[o.providerIndex];
    const price = pInfo.price;
    const commission = Math.round(price * 0.15);

    const orderDoc = {
      customerId: o.customerId,
      providerId: prov.id,
      serviceCategory: pInfo.category,
      price: price,
      commission: commission,
      address: o.address,
      scheduledSlot: o.scheduledSlot,
      status: o.status,
      createdAt: serverTimestamp()
    };

    if (o.rating !== undefined) {
      orderDoc.rating = o.rating;
    }
    if (o.reviewComment !== undefined) {
      orderDoc.reviewComment = o.reviewComment;
    }

    const docRef = await addDoc(collection(db, 'orders'), orderDoc);
    seededOrderIds.push({
      id: docRef.id,
      status: o.status,
      providerName: prov.name,
      category: pInfo.category,
      price: price
    });
    console.log(`Seeded Order: [${docRef.id}] Status: ${o.status} | Provider: ${prov.name} | Price: ${price} ILS`);
  }

  console.log('\n================ SEEDING COMPLETE SUMMARY ================');
  console.log(`Total new provider documents created: ${seededProviderIds.length}`);
  console.log('Seeded Provider IDs & Names:');
  seededProviderIds.forEach((p, idx) => {
    console.log(`  ${idx + 1}. ID: ${p.id} | Name: ${p.name} | Category: ${p.category}`);
  });

  console.log(`\nTotal new order documents created: ${seededOrderIds.length}`);
  console.log('Seeded Order IDs & Details:');
  seededOrderIds.forEach((o, idx) => {
    console.log(`  ${idx + 1}. ID: ${o.id} | Status: ${o.status} | Provider: ${o.providerName} | Price: ${o.price} ILS`);
  });
  console.log('==========================================================\n');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding Error:', err);
  process.exit(1);
});
