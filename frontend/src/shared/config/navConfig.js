import { 
  Compass, Sparkles, Clock, HeartHandshake, ShoppingBag, 
  Briefcase, ShieldCheck, MapPin, Route, Users, Calendar, 
  CreditCard, Activity, FileText, Gift, Home as HomeIcon, TrendingUp
} from 'lucide-react';

export const SUPPORTED_REGIONS = [
  { id: 'all', name: 'Israel (All Regions)', detail: 'Nationwide At-Home Coverage' },
  { id: 'tel_aviv', name: 'Tel Aviv & Central District', detail: 'Tel Aviv, Ramat Gan, Givatayim, Herzliya' },
  { id: 'jerusalem', name: 'Jerusalem & Surrounding', detail: 'Jerusalem, Mevaseret, Judean Hills' },
  { id: 'north', name: 'Haifa & Northern Region', detail: 'Haifa, Krayot, Acre, Nazareth, Galilee' },
  { id: 'sharon', name: 'Sharon Area', detail: 'Netanya, Ra\'anana, Kfar Saba, Hod Hasharon' },
  { id: 'south', name: 'Beer Sheva & South', detail: 'Beer Sheva, Ashdod, Ashkelon, Kiryat Gat' }
];

export const NAV_ITEMS = {
  guest: [
    { label: 'Explore Pros', path: '/', icon: Compass },
    { label: 'Style Feed', path: '/customer/style-feed', icon: Sparkles },
    { label: 'Rewards', path: '/customer/rewards', icon: HeartHandshake },
    { label: 'Vouchers', path: '/customer/vouchers', icon: Gift }
  ],
  customer: [
    { label: 'Explore Pros', path: '/', icon: Compass },
    { label: 'Style Feed', path: '/customer/style-feed', icon: Sparkles },
    { label: 'Passes', path: '/customer/subscriptions', icon: Clock },
    { label: 'Rewards', path: '/customer/rewards', icon: HeartHandshake },
    { label: 'My Orders', path: '/customer/orders', icon: ShoppingBag }
  ],
  provider: [
    { label: 'Dashboard', path: '/provider', icon: Briefcase },
    { label: 'Coverage Zone', path: '/provider/coverage-zone', icon: MapPin },
    { label: 'Route Optimizer', path: '/provider/route-optimizer', icon: Route },
    { label: 'Client CRM', path: '/provider/client-crm', icon: Users },
    { label: 'Payouts', path: '/provider/payouts', icon: CreditCard },
    { label: 'Calendar', path: '/provider/calendar-sync', icon: Calendar }
  ],
  admin: [
    { label: 'Approvals', path: '/admin', icon: ShieldCheck },
    { label: 'Analytics', path: '/admin/analytics', icon: TrendingUp },
    { label: 'System Health', path: '/status', icon: Activity },
    { label: 'v2 Architecture', path: '/docs/architecture', icon: FileText }
  ]
};

export function getNavItemsForUser({ userRole, activeRoleMode, isAdmin, currentUser }) {
  if (!currentUser) {
    return NAV_ITEMS.guest;
  }

  const effectiveRole = activeRoleMode || userRole || 'customer';

  if (effectiveRole === 'admin' || (isAdmin && effectiveRole === 'admin')) {
    return [
      ...NAV_ITEMS.admin,
      { label: 'Explore (Customer)', path: '/', icon: Compass },
      { label: 'Provider Portal', path: '/provider', icon: Briefcase }
    ];
  }

  if (effectiveRole === 'provider') {
    return [
      ...NAV_ITEMS.provider,
      { label: 'Customer View', path: '/', icon: Compass }
    ];
  }

  // Default customer view
  const baseCustomer = [...NAV_ITEMS.customer];
  if (isAdmin) {
    baseCustomer.push({ label: 'Admin Console', path: '/admin', icon: ShieldCheck });
  }

  return baseCustomer;
}
