import { PiAuthResult } from '../types';

export const PiService = {
  isInitialized: false,

  init: async () => {
    // Access window.Pi directly to ensure we get the object if it was injected after module load
    if (typeof window.Pi === 'undefined') {
      // Not in Pi Browser or script not loaded yet
      return;
    }

    if (PiService.isInitialized) return;

    try {
      // Initialize the SDK
      // version: '2.0' is standard
      // sandbox: true is for development. set to false for production.
      await window.Pi.init({ version: '2.0', sandbox: true });
      PiService.isInitialized = true;
      console.log('Pi SDK Initialized');
    } catch (err) {
      console.error('Pi SDK Initialization failed:', err);
    }
  },

  authenticate: async (): Promise<PiAuthResult | null> => {
    // 1. Ensure Init
    if (!PiService.isInitialized) {
      await PiService.init();
    }

    // 2. Check for Pi Object
    if (typeof window.Pi === 'undefined') {
      // This will be handled by the caller (AuthContext) to show desktop mock login
      return null;
    }

    try {
      const scopes = ['username', 'payments'];

      // 3. Authenticate
      const authResult = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
      
      console.log('Pi Auth Success:', authResult);
      return authResult;

    } catch (err) {
      console.error('Pi Authentication failed:', err);
      // Alerting the error specifically helps debugging why "nothing happens"
      // e.g., "User cancelled" or network issues
      alert(`Authentication Failed: ${err instanceof Error ? err.message : JSON.stringify(err)}`);
      return null;
    }
  }
};

// Callback required by SDK for incomplete payments
function onIncompletePaymentFound(payment: any) {
  console.log('Incomplete payment found:', payment);
  // Example:
  // axios.post('/api/payment/incomplete', { paymentId: payment.identifier, ... });
}