import { db } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';

export const seedInitialDatabase = async () => {
  console.log("Starting database seed...");

  try {
    // 1. Seed Real Categories
    const categories = [
      { id: 'haircut', group: 'grooming', label: "Men's Haircuts & Beard", description: 'Skin fades, hot towel razor, beard sculpting & lineups', active: true },
      { id: 'nails', group: 'grooming', label: 'Manicure & Pedicure', description: 'Gel manicure, medical pedicure, acrylics & custom nail art', active: true },
      { id: 'massage', group: 'wellness', label: 'Massage & Bodywork', description: 'Deep tissue, Swedish, hot stone & sports recovery massage', active: true },
      { id: 'cleaning', group: 'home', label: 'House Cleaning & Maid', description: 'Deep home cleaning, move-in/out, Airbnb reset', active: true },
      { id: 'handyman', group: 'home', label: 'Handyman & Repairs', description: 'TV mounting, furniture assembly, shelf hanging, repairs', active: true },
      { id: 'plumbing', group: 'home', label: 'Plumbing & Emergency Leaks', description: 'Drain unblocking, leak repair, faucet & toilet fix', active: true },
      { id: 'electrical', group: 'home', label: 'Electrician & Lighting', description: 'Light fixture installs, short circuit fix, smart switches', active: true }
    ];

    for (const cat of categories) {
      await setDoc(doc(db, 'categories', cat.id), cat);
      console.log(`Seeded category: ${cat.label}`);
    }

    // 2. Seed Loyalty Tiers
    const loyaltyTiers = [
      { id: 'silver', name: 'Silver Member', minPoints: 0, perks: ['5% Cashback in Points', 'Standard Dispatch Priority'], badgeColor: 'from-slate-400 to-slate-200' },
      { id: 'gold', name: 'Gold VIP', minPoints: 300, perks: ['10% Cashback', 'Free Travel Fee on Weekdays', 'Priority Dispatch'], badgeColor: 'from-amber-400 to-amber-200' },
      { id: 'platinum', name: 'Platinum Elite', minPoints: 800, perks: ['15% Cashback', 'Free Travel Fee Always', 'Dedicated Concierge', 'Complimentary Scalp Detox'], badgeColor: 'from-purple-400 to-indigo-300' }
    ];

    for (const tier of loyaltyTiers) {
      await setDoc(doc(db, 'loyalty_tiers', tier.id), tier);
      console.log(`Seeded loyalty tier: ${tier.name}`);
    }

    // 3. Seed a Test Provider
    const testProvider = {
      id: 'test_provider_1',
      name: 'Or Sasson (Test Provider)',
      email: 'test@dropin.app',
      phone: '+972500000000',
      category: "Men's Haircuts & Beard",
      categoryGroup: 'grooming',
      rating: 5.0,
      price: 100,
      bio: 'This is a real test provider seeded into Firestore.',
      specialties: ['Testing', 'Development'],
      isAvailable: true,
      isApproved: true,
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'providers', testProvider.id), testProvider);
    console.log(`Seeded test provider: ${testProvider.name}`);

    alert("Firebase database successfully seeded with initial real data (Categories, Loyalty Tiers, and Test Provider)!");
  } catch (error) {
    console.error("Error seeding database: ", error);
    alert("Error seeding database. Check console for details.");
  }
};
