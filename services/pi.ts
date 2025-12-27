import { PiAuthResult } from '../types';

/**
 * Vercel 배포 시, 루트의 /api 폴더는 자동으로 서버리스 함수가 됩니다.
 * 따라서 호출 주소는 '/api/파일명' 형식이 됩니다.
 */
const APPROVE_URL = '/api/approve'; 
const COMPLETE_URL = '/api/complete'; 

let initPromise: Promise<boolean> | null = null;

export const PiService = {
  init: (): Promise<boolean> => {
    if (initPromise) return initPromise;
    initPromise = (async () => {
      try {
        if (!window.Pi) return false;
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        console.log(`[Pi SDK] Init. Sandbox: ${isLocal}`);
        await window.Pi.init({ version: '2.0', sandbox: isLocal });
        return true;
      } catch (err) {
        initPromise = null;
        return false;
      }
    })();
    return initPromise;
  },

  authenticate: async (): Promise<PiAuthResult | null> => {
    const initialized = await PiService.init();
    if (!initialized) throw new Error("SDK init failed.");
    return await window.Pi.authenticate(['username', 'payments'], onIncompletePaymentFound);
  },

  createPayment: async (postId: string, title: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      console.log(`[Pi] Creating payment for post: ${postId}`);
      
      window.Pi.createPayment({
        amount: 1,
        memo: `Curation Fee: ${title.substring(0, 20)}`,
        metadata: { postId, type: 'post_fee' },
      }, {
        onReadyForServerApproval: async (paymentId: string) => {
          console.log('[Pi] Step 1: Telling Vercel Server to approve...');
          try {
            const resp = await fetch(APPROVE_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId })
            });
            
            if (!resp.ok) {
              const errData = await resp.json();
              throw new Error(errData.error || "Server approval failed");
            }
            
            console.log('[Pi] Step 1: Server approved. Wallet should open now.');
          } catch (err) {
            console.error('[Pi] Approval Request Failed:', err);
            reject(err);
          }
        },
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          console.log('[Pi] Step 2: Telling Vercel Server to complete...');
          try {
            const resp = await fetch(COMPLETE_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, txid })
            });
            
            if (!resp.ok) {
              const errData = await resp.json();
              throw new Error(errData.error || "Server completion failed");
            }
            
            console.log('[Pi] Step 2: Payment fully confirmed by server.');
            resolve(paymentId);
          } catch (err) {
            console.error('[Pi] Completion Request Failed:', err);
            reject(err);
          }
        },
        onCancel: (paymentId: string) => {
          console.log('[Pi] Payment cancelled by user.');
          reject(new Error('PAYMENT_CANCELLED'));
        },
        onError: (error: Error) => {
          console.error('[Pi] Payment Error:', error);
          reject(new Error(error.message));
        }
      });
    });
  }
};

function onIncompletePaymentFound(payment: any) {
  console.log('Incomplete payment found:', payment);
}
