import { PiAuthResult } from '../types';

// Ensure Pi is available on window
const Pi = window.Pi;

export const PiService = {
  isInitialized: false,

  init: async () => {
    if (PiService.isInitialized) return;

    if (typeof Pi === 'undefined') {
      console.warn('Pi SDK not found. Are you in the Pi Browser?');
      return;
    }

    try {
      // Initialize the SDK
      // version: '2.0' is standard
      // sandbox: true is for development. set to false for production.
      await Pi.init({ version: '2.0', sandbox: true });
      PiService.isInitialized = true;
      console.log('Pi SDK Initialized');
    } catch (err) {
      console.error('Pi SDK Initialization failed:', err);
    }
  },

  authenticate: async (): Promise<PiAuthResult | null> => {
    if (!PiService.isInitialized) {
      await PiService.init();
    }

    if (typeof Pi === 'undefined') {
      alert('Pi SDK is not loaded. Please open this app in the Pi Browser.');
      return null;
    }

    try {
      // Define scopes
      const scopes = ['username', 'payments'];

      // Authenticate
      const authResult = await Pi.authenticate(scopes, onIncompletePaymentFound);
      
      console.log('Pi Auth Success:', authResult);
      return authResult;

    } catch (err) {
      console.error('Pi Authentication failed:', err);
      // alert('Authentication failed. Check console for details.');
      return null;
    }
  }
};

// Callback required by SDK for incomplete payments
// In a real app, you would check your server for the transaction status here
function onIncompletePaymentFound(payment: any) {
  console.log('Incomplete payment found:', payment);
  // Example:
  // axios.post('/api/payment/incomplete', { paymentId: payment.identifier, ... });
  
  // For now, if we don't have server-side logic, just acknowledge or ignore
  // Usually you would try to complete it or cancel it.
}
