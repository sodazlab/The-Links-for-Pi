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
        console.log(`Initializing Pi SDK (v2.0). Environment: ${isLocal ? 'Local (Sandbox)' : 'Production'}`);

        await window.Pi.init({ version: '2.0', sandbox: isLocal });
        console.log('Pi SDK Initialized.');
        return true;
      } catch (err: any) {
        console.error('Pi SDK Init Error:', err);
        initPromise = null;
        return false;
      }
    })();

    return initPromise;
  },

  authenticate: async (): Promise<PiAuthResult | null> => {
    try {
      const initialized = await PiService.init();
      if (!initialized) throw new Error("SDK initialization failed.");

      // CRITICAL: Request 'payments' scope to enable createPayment calls
      const scopes = ['username', 'payments']; 
      const authResult = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
      return authResult as PiAuthResult;
    } catch (err: any) {
      console.error("Authentication Error:", err);
      throw err; 
    }
  },

  /**
   * Creates a payment of 1 Pi for post submission.
   */
  createPayment: async (postId: string, title: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      window.Pi.createPayment({
        amount: 1,
        memo: `Submission Fee: ${title.substring(0, 20)}...`,
        metadata: { postId: postId, type: 'post_submission' },
      }, {
        onReadyForServerApproval: async (paymentId: string) => {
          console.log('[Pi Payment] Ready for Server Approval. Payment ID:', paymentId);
          // Standard flow: resolve once payment is acknowledged
          resolve(paymentId);
        },
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          console.log('[Pi Payment] Transaction Completed. TXID:', txid);
        },
        onCancel: (paymentId: string) => {
          console.warn('[Pi Payment] Payment Cancelled by User:', paymentId);
          reject(new Error('Payment cancelled by user.'));
        },
        onError: (error: Error, payment?: any) => {
          console.error('[Pi Payment] Error:', error, payment);
          reject(error);
        }
      });
    });
  }
};

function onIncompletePaymentFound(payment: any) {
  console.log('Incomplete payment found:', payment);
}