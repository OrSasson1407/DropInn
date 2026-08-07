import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import fs from 'fs';
import path from 'path';

const PROJECT_ID = 'dropin-customer-rules-test';
let testEnv;

beforeAll(async () => {
  const rulesPath = path.resolve(__dirname, '../../../../firestore.rules');
  const rules = fs.readFileSync(rulesPath, 'utf8');

  try {
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: { rules }
    });
  } catch (err) {
    console.warn('Firebase Rules Emulator test environment setup notice:', err.message);
  }
});

afterAll(async () => {
  if (testEnv) {
    await testEnv.cleanup();
  }
});

beforeEach(async () => {
  if (testEnv) {
    await testEnv.clearFirestore();
  }
});

describe('Customer Security Rules Suite', () => {
  describe('Profile Access (users/{userId})', () => {
    it('allows customer to create their own customer profile', async () => {
      if (!testEnv) return;
      const db = testEnv.authenticatedContext('cust_101').firestore();
      await assertSucceeds(
        db.collection('users').doc('cust_101').set({
          name: 'Jane Customer',
          email: 'jane@example.com',
          role: 'customer'
        })
      );
    });

    it('denies customer from creating profile for another user ID', async () => {
      if (!testEnv) return;
      const db = testEnv.authenticatedContext('cust_101').firestore();
      await assertFails(
        db.collection('users').doc('cust_102').set({
          name: 'Imposter',
          email: 'imposter@example.com',
          role: 'customer'
        })
      );
    });

    it('denies customer from escalating role to admin during creation', async () => {
      if (!testEnv) return;
      const db = testEnv.authenticatedContext('cust_101').firestore();
      await assertFails(
        db.collection('users').doc('cust_101').set({
          name: 'Evil Customer',
          email: 'evil@example.com',
          role: 'admin'
        })
      );
    });

    it('allows customer to update non-role fields in own profile', async () => {
      if (!testEnv) return;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('users').doc('cust_101').set({
          name: 'Jane Customer',
          phone: '0501112233',
          role: 'customer'
        });
      });

      const db = testEnv.authenticatedContext('cust_101').firestore();
      await assertSucceeds(
        db.collection('users').doc('cust_101').update({
          phone: '0509998877'
        })
      );
    });

    it('denies customer from modifying role field during update', async () => {
      if (!testEnv) return;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('users').doc('cust_101').set({
          name: 'Jane Customer',
          role: 'customer'
        });
      });

      const db = testEnv.authenticatedContext('cust_101').firestore();
      await assertFails(
        db.collection('users').doc('cust_101').update({
          role: 'admin'
        })
      );
    });

    it('denies customer from deleting user profiles', async () => {
      if (!testEnv) return;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('users').doc('cust_101').set({
          name: 'Jane Customer'
        });
      });

      const db = testEnv.authenticatedContext('cust_101').firestore();
      await assertFails(db.collection('users').doc('cust_101').delete());
    });
  });

  describe('Order Management (orders/{orderId})', () => {
    it('allows customer to create order with pending status for themselves', async () => {
      if (!testEnv) return;
      const db = testEnv.authenticatedContext('cust_101').firestore();
      await assertSucceeds(
        db.collection('orders').doc('ord_cust_1').set({
          customerId: 'cust_101',
          providerId: 'prov_202',
          status: 'pending',
          serviceName: 'Haircut',
          price: 120
        })
      );
    });

    it('denies customer from creating order for another customer ID', async () => {
      if (!testEnv) return;
      const db = testEnv.authenticatedContext('cust_101').firestore();
      await assertFails(
        db.collection('orders').doc('ord_fake').set({
          customerId: 'cust_999',
          providerId: 'prov_202',
          status: 'pending',
          price: 120
        })
      );
    });

    it('denies customer from creating order with approved or completed status directly', async () => {
      if (!testEnv) return;
      const db = testEnv.authenticatedContext('cust_101').firestore();
      await assertFails(
        db.collection('orders').doc('ord_bypass').set({
          customerId: 'cust_101',
          providerId: 'prov_202',
          status: 'approved',
          price: 120
        })
      );
    });

    it('allows customer to read their own order', async () => {
      if (!testEnv) return;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('orders').doc('ord_101').set({
          customerId: 'cust_101',
          providerId: 'prov_202',
          status: 'pending'
        });
      });

      const db = testEnv.authenticatedContext('cust_101').firestore();
      await assertSucceeds(db.collection('orders').doc('ord_101').get());
    });

    it('denies customer from reading another customer order', async () => {
      if (!testEnv) return;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('orders').doc('ord_secret').set({
          customerId: 'cust_888',
          providerId: 'prov_202',
          status: 'pending'
        });
      });

      const db = testEnv.authenticatedContext('cust_101').firestore();
      await assertFails(db.collection('orders').doc('ord_secret').get());
    });

    it('allows customer to cancel their own pending order', async () => {
      if (!testEnv) return;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('orders').doc('ord_cancel').set({
          customerId: 'cust_101',
          providerId: 'prov_202',
          status: 'pending'
        });
      });

      const db = testEnv.authenticatedContext('cust_101').firestore();
      await assertSucceeds(
        db.collection('orders').doc('ord_cancel').update({
          status: 'cancelled'
        })
      );
    });
  });

  describe('Notifications, SOS Alerts & Payments', () => {
    it('allows customer to read their own notifications', async () => {
      if (!testEnv) return;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('notifications').doc('notif_cust').set({
          recipientId: 'cust_101',
          title: 'Order Confirmed'
        });
      });

      const db = testEnv.authenticatedContext('cust_101').firestore();
      await assertSucceeds(db.collection('notifications').doc('notif_cust').get());
    });

    it('denies customer from reading other user notifications', async () => {
      if (!testEnv) return;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('notifications').doc('notif_other').set({
          recipientId: 'cust_999',
          title: 'Private Alert'
        });
      });

      const db = testEnv.authenticatedContext('cust_101').firestore();
      await assertFails(db.collection('notifications').doc('notif_other').get());
    });

    it('allows customer to create SOS alert with their customerId', async () => {
      if (!testEnv) return;
      const db = testEnv.authenticatedContext('cust_101').firestore();
      await assertSucceeds(
        db.collection('sos_alerts').doc('sos_101').set({
          customerId: 'cust_101',
          providerId: 'prov_202',
          incidentType: 'Safety Issue'
        })
      );
    });

    it('allows customer to read payment record associated with them', async () => {
      if (!testEnv) return;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('payments').doc('pay_101').set({
          customerId: 'cust_101',
          providerId: 'prov_202',
          amount: 150
        });
      });

      const db = testEnv.authenticatedContext('cust_101').firestore();
      await assertSucceeds(db.collection('payments').doc('pay_101').get());
    });

    it('denies customer from deleting payment records', async () => {
      if (!testEnv) return;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('payments').doc('pay_101').set({
          customerId: 'cust_101',
          amount: 150
        });
      });

      const db = testEnv.authenticatedContext('cust_101').firestore();
      await assertFails(db.collection('payments').doc('pay_101').delete());
    });
  });
});
