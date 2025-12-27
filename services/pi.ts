import { PiAuthResult } from '../types';

// Singleton promise to prevent multiple init calls
let initPromise: Promise<boolean> | null = null;

export const PiService = {
  /**
   * Initializes the Pi SDK.
   */
  init: (): Promise<boolean> => {
    if (initPromise) return initPromise;

    initPromise = (async () => {
      try {
        if (!window.Pi) {
          throw new Error("Pi SDK script is not loaded. Check index.html.");
        }

        // Determine environment
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        console.log(`[Pi SDK] Initializing (v2.0). Environment: ${isLocal ? 'Sandbox' : 'Production'}`);

        await window.Pi.init({ version: '2.0', sandbox: isLocal });
        console.log('[Pi SDK] Initialized successfully.');
        return true;
      } catch (err: any) {
        console.error('[Pi SDK] Initialization Error:', err);
        initPromise = null;
        return false;
      }
    })();

    return initPromise;
  },

  /**
   * Authenticates the user with necessary scopes.
   * 'payments' scope is mandatory for createPayment.
   */
  authenticate: async (): Promise<PiAuthResult | null> => {
    try {
      const initialized = await PiService.init();
      if (!initialized) throw new Error("Pi SDK failed to initialize.");

      const scopes = ['username', 'payments']; 
      const authResult = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
      return authResult as PiAuthResult;
    } catch (err: any) {
      console.error("[Pi Auth] Authentication Error:", err);
      throw err; 
    }
  },

  /**
   * Creates a payment of 1 Pi.
   * Based on: https://github.com/pi-apps/pi-platform-docs/blob/master/payments.md
   */
  createPayment: async (postId: string, title: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      console.log(`[Pi Payment] Starting transaction for post: ${postId}`);
      
      window.Pi.createPayment({
        amount: 1,
        memo: `Curation Fee: ${title.substring(0, 25)}...`,
        metadata: { postId: postId, type: 'link_submission' },
      }, {
        onReadyForServerApproval: (paymentId: string) => {
          /**
           * CRITICAL: In a production app, you MUST send paymentId to YOUR backend.
           * Your backend must then call: POST https://api.minepi.com/v2/payments/:payment_id/approve
           * Without this, the Pi Wallet will not open for the user to confirm.
           */
          console.log('[Pi Payment] Step 1: Ready for Server Approval. ID:', paymentId);
          
          // Simulation: For this demo, we proceed, but real payments need server approval.
          resolve(paymentId);
        },
        onReadyForServerCompletion: (paymentId: string, txid: string) => {
          /**
           * Step 2: User has paid in the wallet.
           * Your backend must call: POST https://api.minepi.com/v2/payments/:payment_id/complete
           */
          console.log('[Pi Payment] Step 2: Transaction complete on blockchain. TXID:', txid);
        },
        onCancel: (paymentId: string) => {
          console.warn('[Pi Payment] Transaction cancelled by user:', paymentId);
          reject(new Error('PAYMENT_CANCELLED'));
        },
        onError: (error: Error, payment?: any) => {
          console.error('[Pi Payment] Transaction failed:', error, payment);
          reject(new Error(error.message || 'PAYMENT_FAILED'));
        }
      });
    });
  }
};

function onIncompletePaymentFound(payment: any) {
  console.log('[Pi SDK] Incomplete payment detected. You may need to call /complete on your server.', payment);
}