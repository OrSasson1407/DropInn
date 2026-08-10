import { db } from '../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

// Static UI taxonomy used to group service categories in dropdowns and menus.
// The actual categories are real Firestore documents (collection: 'categories'),
// seeded by seedFirebase.js and fetched at runtime with fetchServiceCategories().
export const CATEGORY_GROUPS = [
  { id: 'all', label: 'All Services' },
  { id: 'grooming', label: 'Grooming & Beauty' },
  { id: 'wellness', label: 'Wellness & Fitness' },
  { id: 'home', label: 'Home Services' },
  { id: 'lifestyle', label: 'Lifestyle & Pets' }
];

// Fetches the real, active service categories from Firestore.
// Returns an array of { id, label, group, description, active }.
export const fetchServiceCategories = async () => {
  const q = query(collection(db, 'categories'), where('active', '==', true));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// Kept as empty fallbacks so nothing crashes if an old import still expects
// these as static arrays. Prefer fetchServiceCategories() for real data.
export const SERVICE_CATEGORIES = [];
export const DEMO_PROVIDERS = [];
export const ADDONS_BY_CATEGORY = {};
