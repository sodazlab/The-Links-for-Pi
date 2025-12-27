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
   */
  authenticate: async (): Promise<PiAuthResult | null> => {
    try {
      const initialized = await PiService.init();
      if (!initialized) throw new Error("SDK initialization failed.");

      // Essential: 'payments' scope is required for any transaction.
      const scopes = ['username', 'payments']; 
      const authResult = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
      return authResult as PiAuthResult;
    } catch (err: any) {
      console.error("[Pi Auth] Error:", err);
      throw err; 
    }
  },

  /**
   * Creates a payment of 1 Pi for post submission.
   */
  createPayment: async (postId: string, title: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      console.log(`[Pi Payment] Initiating 1 Pi payment for post: ${postId}`);
      
      window.Pi.createPayment({
        amount: 1,
        memo: `Curation Fee: ${title.substring(0, 30)}`,
        metadata: { postId: postId, type: 'link_submission' },
      }, {
        onReadyForServerApproval: (paymentId: string) => {
          console.log('[Pi Payment] Ready for Server Approval:', paymentId);
          // In this client-side demo, we resolve here to allow the UI to proceed.
          // In production, you MUST call your backend to approve the payment via Pi API.
          resolve(paymentId);
        },
        onReadyForServerCompletion: (paymentId: string, txid: string) => {
          console.log('[Pi Payment] Transaction Completed:', txid);
        },
        onCancel: (paymentId: string) => {
          console.warn('[Pi Payment] Cancelled by user:', paymentId);
          reject(new Error('PAYMENT_CANCELLED'));
        },
        onError: (error: Error, payment?: any) => {
          console.error('[Pi Payment] Critical Error:', error, payment);
          reject(new Error(error.message || 'PAYMENT_FAILED'));
        }
      });
    });
  }
};

function onIncompletePaymentFound(payment: any) {
  console.log('[Pi SDK] Incomplete payment detected:', payment);
  // Optional: Implement logic to resume or cancel incomplete payments.
}