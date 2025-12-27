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

      const scopes = ['username']; 
      const authResult = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
      return authResult as PiAuthResult;
    } catch (err: any) {
      console.error("Authentication Error:", err);
      throw err; 
    }
  },

  /**
   * Creates a payment of 1 Pi for post submission.
   * Note: Real apps require a backend to approve and complete payments.
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
          // 실제 서비스에서는 여기서 paymentId를 백엔드로 보내 서버측 승인(Approve)을 받아야 합니다.
          // 여기서는 데모를 위해 승인 프로세스가 진행된다고 가정합니다.
          // 예: await fetch('/api/pi/approve', { method: 'POST', body: JSON.stringify({ paymentId }) });
          resolve(paymentId);
        },
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          console.log('[Pi Payment] Transaction Completed. TXID:', txid);
          // 실제 서비스에서는 여기서 txid를 백엔드로 보내 서버측 완료(Complete) 처리를 해야 합니다.
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
  // 결제 완료 처리가 중단된 건이 있다면 여기서 처리 로직을 구현할 수 있습니다.
}