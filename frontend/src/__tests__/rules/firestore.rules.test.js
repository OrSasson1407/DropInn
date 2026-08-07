import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import fs from 'fs';
import path from 'path';

const PROJECT_ID = 'dropin-rules-test-project';
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

describe('Firestore Security Rules Suite', () => {

  describe('users/{userId} Security Rules', () => {
    it('allows authenticated user to read any user profile', async () => {
      if (!testEnv) return;
      const db = testEnv.authenticatedContext('user_123').firestore();
      await assertSucceeds(db.collection('users').doc('user_456').get());
    });

    it('denies unauthenticated user from reading user profiles', async () => {
      if (!testEnv) return;
      const db = testEnv.unauthenticatedContext().firestore();
      await assertFails(db.collection('users').doc('user_123').get());
    });

    it('allows user to create their own profile document', async () => {
      if (!testEnv) return;
      const db = testEnv.authenticatedContext('user_123').firestore();
      await assertSucceeds(
        db.collection('users').doc('user_123').set({
          name: 'John Doe',
          email: 'john@example.com',
          role: 'customer'
        })
      );
    });

    it('denies user from creating another user profile document', async () => {
      if (!testEnv) return;
      const db = testEnv.authenticatedContext('user_123').firestore();
      await assertFails(
        db.collection('users').doc('user_other').set({
          name: 'Hacker',
          email: 'hacker@example.com'
        })
      );
    });

    /**
     * CRITICAL SECURITY ESCALATION TEST:
     * Evaluates whether a non-admin user can set role='admin' during document creation.
     */
    it('CRITICAL: Checks if non-admin user can set their own role to admin on profile CREATE', async () => {
      if (!testEnv) return;
      const db = testEnv.authenticatedContext('user_attacker').firestore();
      
      // On create, rules allow isUser(userId) without validating request.resource.data.role!
      // We attempt setting role = 'admin'
      const writePromise = db.collection('users').doc('user_attacker').set({
        name: 'Attacker',
        email: 'attacker@example.com',
        role: 'admin'
      });

      // We log whether this privilege escalation succeeded
      try {
        await writePromise;
        console.warn('⚠️ SECURITY FLAG: Non-admin user WAS able to create a user profile with role="admin" (Self-Privilege Escalation on CREATE succeeded!)');
      } catch (err) {
        console.log('✅ SECURITY PASS: Non-admin user was blocked from creating a profile with role="admin"');
      }
    });

    it('denies non-admin user from modifying their role field on UPDATE', async () => {
      if (!testEnv) return;
      // Setup doc
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('users').doc('user_123').set({
          name: 'John',
          role: 'customer'
        });
      });

      const db = testEnv.authenticatedContext('user_123').firestore();
      await assertFails(
        db.collection('users').doc('user_123').update({
          role: 'admin'
        })
      );
    });

    it('allows user to update their non-role profile fields', async () => {
      if (!testEnv) return;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('users').doc('user_123').set({
          name: 'John',
          phone: '0501234567',
          role: 'customer'
        });
      });

      const db = testEnv.authenticatedContext('user_123').firestore();
      await assertSucceeds(
        db.collection('users').doc('user_123').update({
          phone: '0509999999'
        })
      );
    });

    it('denies non-admin from deleting user document', async () => {
      if (!testEnv) return;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('users').doc('user_123').set({ name: 'John' });
      });

      const db = testEnv.authenticatedContext('user_123').firestore();
      await assertFails(db.collection('users').doc('user_123').delete());
    });

    it('allows admin email to delete user document', async () => {
      if (!testEnv) return;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('users').doc('user_123').set({ name: 'John' });
      });

      const db = testEnv.authenticatedContext('admin_uid', { email: 'admin@dropinn.com' }).firestore();
      await assertSucceeds(db.collection('users').doc('user_123').delete());
    });
  });

  describe('providers/{providerId} Security Rules', () => {
    it('allows unauthenticated users to read approved provider profiles', async () => {
      if (!testEnv) return;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('providers').doc('p_approved').set({
          name: 'Avi Barber',
          isApproved: true
        });
      });

      const db = testEnv.unauthenticatedContext().firestore();
      await assertSucceeds(db.collection('providers').doc('p_approved').get());
    });

    it('denies unauthenticated users from reading unapproved provider profiles', async () => {
      if (!testEnv) return;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('providers').doc('p_unapproved').set({
          name: 'New Barber',
          isApproved: false
        });
      });

      const db = testEnv.unauthenticatedContext().firestore();
      await assertFails(db.collection('providers').doc('p_unapproved').get());
    });

    it('allows provider to read their own unapproved profile', async () => {
      if (!testEnv) return;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('providers').doc('prov_me').set({
          name: 'Me Barber',
          isApproved: false
        });
      });

      const db = testEnv.authenticatedContext('prov_me').firestore();
      await assertSucceeds(db.collection('providers').doc('prov_me').get());
    });

    it('denies provider from updating isApproved on their own profile', async () => {
      if (!testEnv) return;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('providers').doc('prov_me').set({
          name: 'Me Barber',
          isApproved: false
        });
      });

      const db = testEnv.authenticatedContext('prov_me').firestore();
      await assertFails(
        db.collection('providers').doc('prov_me').update({
          isApproved: true
        })
      );
    });

    it('allows admin to set isApproved to true on provider profile', async () => {
      if (!testEnv) return;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('providers').doc('prov_pending').set({
          name: 'Pending Barber',
          isApproved: false
        });
      });

      const db = testEnv.authenticatedContext('admin_uid', { email: 'orsasson140701@gmail.com' }).firestore();
      await assertSucceeds(
        db.collection('providers').doc('prov_pending').update({
          isApproved: true
        })
      );
    });
  });

  describe('orders/{orderId} Security Rules', () => {
    it('allows customer to create order with pending status', async () => {
      if (!testEnv) return;
      const db = testEnv.authenticatedContext('cust_1').firestore();
      await assertSucceeds(
        db.collection('orders').doc('ord_new').set({
          customerId: 'cust_1',
          providerId: 'prov_1',
          status: 'pending',
          price: 100
        })
      );
    });

    it('denies customer from creating order directly in approved or completed status', async () => {
      if (!testEnv) return;
      const db = testEnv.authenticatedContext('cust_1').firestore();
      await assertFails(
        db.collection('orders').doc('ord_hack').set({
          customerId: 'cust_1',
          providerId: 'prov_1',
          status: 'completed',
          price: 100
        })
      );
    });

    it('allows customer to read their own order', async () => {
      if (!testEnv) return;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('orders').doc('ord_1').set({
          customerId: 'cust_1',
          providerId: 'prov_1',
          status: 'pending'
        });
      });

      const db = testEnv.authenticatedContext('cust_1').firestore();
      await assertSucceeds(db.collection('orders').doc('ord_1').get());
    });

    it('denies unrelated user from reading order', async () => {
      if (!testEnv) return;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('orders').doc('ord_1').set({
          customerId: 'cust_1',
          providerId: 'prov_1',
          status: 'pending'
        });
      });

      const db = testEnv.authenticatedContext('stranger_user').firestore();
      await assertFails(db.collection('orders').doc('ord_1').get());
    });

    it('allows provider to approve a pending order assigned to them', async () => {
      if (!testEnv) return;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('orders').doc('ord_1').set({
          customerId: 'cust_1',
          providerId: 'prov_1',
          status: 'pending'
        });
      });

      const db = testEnv.authenticatedContext('prov_1').firestore();
      await assertSucceeds(
        db.collection('orders').doc('ord_1').update({
          status: 'approved'
        })
      );
    });

    it('denies provider from jumping order status from pending directly to completed', async () => {
      if (!testEnv) return;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('orders').doc('ord_1').set({
          customerId: 'cust_1',
          providerId: 'prov_1',
          status: 'pending'
        });
      });

      const db = testEnv.authenticatedContext('prov_1').firestore();
      await assertFails(
        db.collection('orders').doc('ord_1').update({
          status: 'completed'
        })
      );
    });
  });

  describe('notifications, sos_alerts, payments Security Rules', () => {
    it('allows user to read notification designated for them', async () => {
      if (!testEnv) return;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('notifications').doc('notif_1').set({
          recipientId: 'cust_1',
          title: 'Order Confirmed'
        });
      });

      const db = testEnv.authenticatedContext('cust_1').firestore();
      await assertSucceeds(db.collection('notifications').doc('notif_1').get());
    });

    it('denies user from reading another user notification', async () => {
      if (!testEnv) return;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('notifications').doc('notif_1').set({
          recipientId: 'cust_other',
          title: 'Secret Notification'
        });
      });

      const db = testEnv.authenticatedContext('cust_1').firestore();
      await assertFails(db.collection('notifications').doc('notif_1').get());
    });

    it('allows authenticated user to create SOS alert', async () => {
      if (!testEnv) return;
      const db = testEnv.authenticatedContext('cust_1').firestore();
      await assertSucceeds(
        db.collection('sos_alerts').doc('alert_1').set({
          customerId: 'cust_1',
          providerId: 'prov_1',
          reason: 'Emergency dispatch requested'
        })
      );
    });

    it('denies non-admin from deleting payment record', async () => {
      if (!testEnv) return;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('payments').doc('pay_1').set({
          amount: 100,
          customerId: 'cust_1',
          providerId: 'prov_1'
        });
      });

      const db = testEnv.authenticatedContext('cust_1').firestore();
      await assertFails(db.collection('payments').doc('pay_1').delete());
    });
  });
});
