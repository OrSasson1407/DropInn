import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      appName: 'DropInn Marketplace',
      tagline: 'At-Home Grooming & Barbering',
      nav: {
        home: 'Home',
        bookNow: 'Book Now',
        myOrders: 'My Bookings',
        styleFeed: 'Style Feed',
        subscriptions: 'Subscriptions',
        vouchers: 'Gift Cards',
        rewards: 'Rewards & VIP',
        providerDashboard: 'Barber Portal',
        fleet: 'Fleet Hub',
        signIn: 'Sign In',
        bookService: 'Book Service',
        signOut: 'Sign Out'
      },
      home: {
        heroTitle: 'On-Demand Mobile Grooming Delivered To Your Door',
        heroSubtitle: 'Top-rated professional barbers and stylists at your location in Tel Aviv & surrounding cities.',
        findBarbers: 'Find Local Barbers',
        activeBarbers: 'Barbers Active Now',
        coverageGuarantee: '100% On-Time Guarantee',
        instantBooking: 'Instant Dispatch Booking'
      },
      common: {
        language: 'Language',
        english: 'English',
        hebrew: 'עברית',
        search: 'Search barbers, services...',
        location: 'Tel Aviv Metro Sector',
        status: 'Status',
        terms: 'Terms of Service',
        privacy: 'Privacy Policy',
        cancellation: 'Cancellation Policy'
      }
    }
  },
  he: {
    translation: {
      appName: 'DropInn - ספרים וטיפוח עד הבית',
      tagline: 'שירותי טיפוח ותספורות מקצועיות עד הבית',
      nav: {
        home: 'ראשי',
        bookNow: 'הזמן תספורת',
        myOrders: 'ההזמנות שלי',
        styleFeed: 'פיד סטייל והשראה',
        subscriptions: 'מנויים פרימיום',
        vouchers: 'שוברי מתנה',
        rewards: 'מועדון VIP והטבות',
        providerDashboard: 'פורטל ספרים',
        fleet: 'ניהול צי רכבים',
        signIn: 'התחברות',
        bookService: 'הזמן שירות',
        signOut: 'התנתקות'
      },
      home: {
        heroTitle: 'שירותי טיפוח ותספורות פרימיום ישירות עד לביתך',
        heroSubtitle: 'ספרים ומעצבי שיער מקצועיים ומדורגים בתל אביב והמרכז שמגיעים אליך בזמן שנוח לך.',
        findBarbers: 'חפש ספרים באזורך',
        activeBarbers: 'ספרים זמינים כעת',
        coverageGuarantee: 'התחייבות להגעה בזמן',
        instantBooking: 'הזמנה מיידית בקליק'
      },
      common: {
        language: 'שפה',
        english: 'English',
        hebrew: 'עברית',
        search: 'חפש ספרים, שירותים...',
        location: 'אזור תל אביב והמרכז',
        status: 'סטטוס',
        terms: 'תנאי שימוש',
        privacy: 'מדיניות פרטיות',
        cancellation: 'מדיניות ביטולים'
      }
    }
  }
};

const savedLang = localStorage.getItem('dropin_language') || (localStorage.getItem('dropin_language_dir') === 'rtl' ? 'he' : 'en');

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

// Apply document direction and lang on language change
const applyDirection = (lng) => {
  const isRtl = lng === 'he';
  const dir = isRtl ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
  localStorage.setItem('dropin_language', lng);
  localStorage.setItem('dropin_language_dir', dir);
};

applyDirection(savedLang);

i18n.on('languageChanged', (lng) => {
  applyDirection(lng);
  window.dispatchEvent(new Event('language_changed'));
});

export default i18n;
