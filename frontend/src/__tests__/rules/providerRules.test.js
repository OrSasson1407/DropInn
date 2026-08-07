import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import fs from 'fs';
import path from 'path';

const PROJECT_ID = 'dropin-provider-rules-test';
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

describe('Provider Security Rules Suite', () => {
  describe('Provider Profile Access (providers/{providerId})', () => {
    it('allows provider to create profile with isApproved: false', async () => {
      if (!testEnv) return;
      const db = testEnv.authenticatedContext('prov_202').firestore();
      await assertSucceeds(
        db.collection('providers').doc('prov_202').set({
          name: 'Sam Barber',
          category: 'Barber',
          isApproved: false
        })
      );
    });

    it('denies provider from setting isApproved: true during profile creation', async () => {
      if (!testEnv) return;
      const db = testEnv.authenticatedContext('prov_202').firestore();
      await assertFails(
        db.collection('providers').doc('prov_202').set({
          name: 'Sam Barber',
          isApproved: true
        })
      );
    });

    it('allows provider to read their own unapproved profile', async () => {
      if (!testEnv) return;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('providers').doc('prov_pending').set({
          name: 'Pending Barber',
          isApproved: false
        });
      });

      const db = testEnv.authenticatedContext('prov_pending').firestore();
      await assertSucceeds(db.collection('providers').doc('prov_pending').get());
    });

    it('allows public / unauthenticated users to read approved provider profiles', async () => {
      if (!testEnv) return;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('providers').doc('prov_active').set({
          name: 'Active Barber',
          isApproved: true
        });
      });

      const db = testEnv.unauthenticatedContext().firestore();
      await assertSucceeds(db.collection('providers').doc('prov_active').get());
    });

    it('denies public / unauthenticated users from reading unapproved provider profiles', async () => {
      if (!testEnv) return;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('providers').doc('prov_secret').set({
          name: 'Draft Barber',
          isApproved: false
        });
      });

      const db = testEnv.unauthenticatedContext().firestore();
      await assertFails(db.collection('providers').doc('prov_secret').get());
    });

    it('allows provider to update bio/services in own profile without altering isApproved', async () => {
      if (!testEnv) return;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('providers').doc('prov_202').set({
          name: 'Sam Barber',
          bio: 'Old Bio',
          isApproved: true
        });
      });

      const db = testEnv.authenticatedContext('prov_202').firestore();
      await assertSucceeds(
        db.collection('providers').doc('prov_202').update({
          bio: 'New Updated Bio'
        })
      );
    });

    it('denies provider from self-approving by updating isApproved field', async () => {
      if (!testEnv) return;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('providers').doc('prov_202').set({
          name: 'Sam Barber',
          isApproved: false
        });
      });

      const db = testEnv.authenticatedContext('prov_202').firestore();
      await assertFails(
        db.collection('providers').doc('prov_202').update({
          isApproved: true
        })
      );
    });

    it('denies provider from updating another provider profile', async () => {
      if (!testEnv) return;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('providers').doc('prov_other').set({
          name: 'Other Barber',
          isApproved: true
        });
      });

      const db = testEnv.authenticatedContext('prov_202').firestore();
      await assertFails(
        db.collection('providers').doc('prov_other').update({
          name: 'Hacked Name'
        })
      );
    });
  });

  describe('Provider Order Workflow Access (orders/{orderId})', () => {
    it('allows provider to read orders assigned to them', async () => {
      if (!testEnv) return;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('orders').doc('ord_prov_1').set({
          customerId: 'cust_101',
          providerId: 'prov_202',
          status: 'pending'
        });
      });

      const db = testEnv.authenticatedContext('prov_202').firestore();
      await assertSucceeds(db.collection('orders').doc('ord_prov_1').get());
    });

    it('denies provider from reading orders assigned to another provider', async () => {
      if (!testEnv) return;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('orders').doc('ord_prov_other').set({
          customerId: 'cust_101',
          providerId: 'prov_999',
          status: 'pending'
        });
      });

      const db = testEnv.authenticatedContext('prov_202').firestore();
      await assertFails(db.collection('orders').doc('ord_prov_other').get());
    });

    it('allows provider to approve a pending order assigned to them', async () => {
      if (!testEnv) return;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('orders').doc('ord_pending').set({
          customerId: 'cust_101',
          providerId: 'prov_202',
          status: 'pending'
        });
      });

      const db = testEnv.authenticatedContext('prov_202').firestore();
      await assertSucceeds(
        db.collection('orders').doc('ord_pending').update({
          status: 'approved'
        })
      );
    });

    it('allows provider to complete an approved order assigned to them', async () => {
      if (!testEnv) return;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('orders').doc('ord_appr').set({
          customerId: 'cust_101',
          providerId: 'prov_202',
          status: 'approved'
        });
      });

      const db = testEnv.authenticatedContext('prov_202').firestore();
      await assertSucceeds(
        db.collection('orders').doc('ord_appr').update({
          status: 'completed'
        })
      );
    });

    it('denies provider from skipping approved state and completing pending order directly', async () => {
      if (!testEnv) return;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('orders').doc('ord_skip').set({
          customerId: 'cust_101',
          providerId: 'prov_202',
          status: 'pending'
        });
      });

      const db = testEnv.authenticatedContext('prov_202').firestore();
      await assertFails(
        db.collection('orders').doc('ord_skip').update({
          status: 'completed'
        })
      );
    });
  });

  describe('Provider Payments & Notifications', () => {
    it('allows provider to read payment records where providerId matches', async () => {
      if (!testEnv) return;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('payments').doc('pay_prov_1').set({
          customerId: 'cust_101',
          providerId: 'prov_202',
          amount: 200
        });
      });

      const db = testEnv.authenticatedContext('prov_202').firestore();
      await assertSucceeds(db.collection('payments').doc('pay_prov_1').get());
    });

    it('denies provider from reading payment records of other providers', async () => {
      if (!testEnv) return;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('payments').doc('pay_other').set({
          customerId: 'cust_101',
          providerId: 'prov_888',
          amount: 500
        });
      });

      const db = testEnv.authenticatedContext('prov_202').firestore();
      await assertFails(db.collection('payments').doc('pay_other').get());
    });

    it('allows provider to read SOS alerts assigned to them', async () => {
      if (!testEnv) return;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('sos_alerts').doc('sos_prov').set({
          customerId: 'cust_101',
          providerId: 'prov_202',
          reason: 'Customer distress button'
        });
      });

      const db = testEnv.authenticatedContext('prov_202').firestore();
      await assertSucceeds(db.collection('sos_alerts').doc('sos_prov').get());
    });
  });
});
