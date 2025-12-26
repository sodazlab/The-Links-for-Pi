import { PiAuthResult } from '../types';

export const PiService = {
  isInitialized: false,

  // Helper to wait for window.Pi to be defined
  ensurePiLoaded: async (timeout = 3000): Promise<boolean> => {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (typeof window.Pi !== 'undefined') {
        return true;
      }
      // Wait 100ms before checking again
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return false;
  },

  init: async () => {
    if (PiService.isInitialized) return true;

    // 1. Wait for SDK to load
    const isLoaded = await PiService.ensurePiLoaded();
    
    if (!isLoaded) {
      console.error('Pi SDK script not loaded after timeout.');
      // Optional: alert for debugging if needed, but usually we alert on user interaction
      return false;
    }

    try {
      // 2. Initialize
      // version: '2.0' is required
      // sandbox: true for development. Ensure your app is configured as Sandbox in Developer Portal.
      await window.Pi.init({ version: '2.0', sandbox: true });
      PiService.isInitialized = true;
      console.log('Pi SDK Initialized successfully');
      return true;
    } catch (err: any) {
      console.error('Pi SDK Init Error:', err);
      alert(`SDK Init Failed: ${err.message || JSON.stringify(err)}`);
      return false;
    }
  },

  authenticate: async (): Promise<PiAuthResult | null> => {
    // 1. Try to initialize if not done yet
    if (!PiService.isInitialized) {
      const success = await PiService.init();
      if (!success) {
        alert("Error: Pi Network SDK could not be loaded. Please refresh the page or check your internet connection.");
        return null;
      }
    }

    // 2. Double check window.Pi
    if (typeof window.Pi === 'undefined') {
      alert("Critical Error: window.Pi is undefined even after init.");
      return null;
    }

    try {
      const scopes = ['username', 'payments'];

      console.log('Starting authentication...');
      // 3. Authenticate
      const authResult = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
      
      console.log('Authentication result:', authResult);
      return authResult;

    } catch (err: any) {
      console.error('Pi Auth Error:', err);
      // Explicitly alert the user so they know what happened
      alert(`Authentication Error: ${err.message || JSON.stringify(err)}`);
      return null;
    }
  }
};

// Callback required by SDK for incomplete payments
function onIncompletePaymentFound(payment: any) {
  console.log('Incomplete payment found:', payment);
  // alert("Incomplete payment found: " + JSON.stringify(payment));
}
