# DropIn v3 — Native Mobile Strategy & Competitive Scan (Pillar 6)

## 1. Executive Summary
This document provides a competitive analysis of native-first grooming, beauty, and on-demand gig marketplace mobile applications (e.g. Squire, StyleSeat, Glamsquad, Urban, Uber) to inform DropIn's v4 React Native / Expo mobile app architecture.

---

## 2. Competitive Landscape Matrix

| Platform | Target Segment | Key Mobile Strengths | Critical Features | Replicable Best Practice for DropIn v4 |
| :--- | :--- | :--- | :--- | :--- |
| **Squire** | Barbers & Mens Grooming | High barber retention, instant POS & payouts | Offline-first schedule, bluetooth card reader pairing, client SMS reminders | Quick tap rebooking & instant provider payout ledger |
| **Glamsquad** | At-Home Beauty & Makeup | High-end customer trust, live dispatch tracking | Dynamic arrival buffers, upfront safety ID checks, tip-at-checkout | Real-time map location updates & verified badge overlay |
| **StyleSeat** | Independent Stylists | Repeat booking automation, deposit protection | Cancellation fee enforcement, dynamic pricing during peak hours | No-show fee authorization & peak hour surge capping |
| **Urban** | At-Home Wellness & Massage | Live GPS dispatch, provider safety SOS button | In-app emergency SOS alert, arrival check-in timestamping | Background GPS tracking & active order scoped chat |

---

## 3. Recommended Tech Stack for DropIn v4
- **Framework:** React Native + Expo (SDK 51+)
- **State & Logic:** Reusable cross-platform JavaScript modules (decoupled from DOM)
- **Backend Sync:** Firebase JS SDK (Auth, Firestore, Cloud Storage, FCM Push)
- **Maps & Geolocation:** React Native Maps + Google Maps SDK
- **Payment Processing:** `@stripe/stripe-react-native` (PaymentIntents + Apple/Google Pay)

---

## 4. Key Takeaways & Roadmap Priorities
1. **Push Notifications (FCM):** Implement FCM web push in v3 as direct precursor to native APNs/FCM.
2. **Order State Machine Decoupling:** Keep all order status transitions in `shared/services/orderStateMachine.js` so React Native can import the exact same business logic.
3. **Safety & SOS On-Device Integration:** Leverage native device capabilities (one-touch dialing, emergency SMS broadcast) for provider & customer safety.
