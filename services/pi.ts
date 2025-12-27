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
          throw new Error("Pi SDK script is not loaded. Ensure <script src='https://sdk.minepi.com/pi-sdk.js'> is in index.html");
        }

        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        console.log(`[Pi SDK] Initializing (v2.0). Mode: ${isLocal ? 'Sandbox' : 'Production'}`);

        await window.Pi.init({ version: '2.0', sandbox: isLocal });
        console.log('[Pi SDK] Initialized.');
        return true;
      } catch (err: any) {
        console.error('[Pi SDK] Init Error:', err);
        initPromise = null;
        return false;
      }
    })();

    return initPromise;
  },

  /**
   * Authenticates user with 'payments' scope.
   */
  authenticate: async (): Promise<PiAuthResult | null> => {
    try {
      const initialized = await PiService.init();
      if (!initialized) throw new Error("SDK init failed.");

      const scopes = ['username', 'payments']; 
      const authResult = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
      return authResult as PiAuthResult;
    } catch (err: any) {
      console.error("[Pi Auth] Error:", err);
      throw err; 
    }
  },

  /**
   * Creates a payment of 1 Pi.
   * FIX: Promise now resolves ONLY on completion to prevent "skipping" payment logic.
   */
  createPayment: async (postId: string, title: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      console.log(`[Pi Payment] Creating payment for: ${title}`);
      
      window.Pi.createPayment({
        amount: 1,
        memo: `Submission Fee: ${title.substring(0, 20)}`,
        metadata: { postId: postId, type: 'post_fee' },
      }, {
        onReadyForServerApproval: (paymentId: string) => {
          /**
           * WARNING: The "Preparing..." hang happens because the Pi API expects 
           * your server to approve this paymentId.
           * POST https://api.minepi.com/v2/payments/:payment_id/approve
           */
          console.log('[Pi Payment] Step 1: Server Approval Required. ID:', paymentId);
          
          // In a frontend-only demo, we can't call the REST API.
          // BUT: Do NOT resolve here. Resolving here allows the app to "skip" payment.
        },
        onReadyForServerCompletion: (paymentId: string, txid: string) => {
          /**
           * Step 2: The user has signed the transaction in their wallet.
           * The app server must now call /complete to finalize.
           */
          console.log('[Pi Payment] Step 2: Transaction Completed. TXID:', txid);
          resolve(paymentId); // Resolve ONLY when the user actually pays.
        },
        onCancel: (paymentId: string) => {
          console.warn('[Pi Payment] User cancelled:', paymentId);
          reject(new Error('PAYMENT_CANCELLED'));
        },
        onError: (error: Error, payment?: any) => {
          console.error('[Pi Payment] Error:', error, payment);
          reject(new Error(error.message || 'PAYMENT_FAILED'));
        }
      });
    });
  }
};

function onIncompletePaymentFound(payment: any) {
  console.log('[Pi SDK] Incomplete payment found:', payment);
}