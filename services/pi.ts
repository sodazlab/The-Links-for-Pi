import { PiAuthResult } from '../types';

export const PiService = {
  isInitialized: false,

  /**
   * Waits for window.Pi to be available in the DOM.
   * This is more stable than dynamic loading inside the Pi Browser.
   */
  ensurePiReady: async (retries = 20): Promise<boolean> => {
    if (window.Pi) return true;
    if (retries === 0) return false;

    // Wait 200ms and try again
    await new Promise(resolve => setTimeout(resolve, 200));
    return PiService.ensurePiReady(retries - 1);
  },

  init: async () => {
    if (PiService.isInitialized) return true;

    try {
      console.log("Waiting for Pi SDK...");
      console.log("User Agent:", navigator.userAgent); // Log UA for debugging
      const isReady = await PiService.ensurePiReady();

      if (!isReady) {
        throw new Error('Pi SDK script loaded but window.Pi is undefined after timeout.');
      }

      console.log("Pi SDK detected. Initializing...");

      // Initialize SDK
      // Ensure 'sandbox: true' matches your setting in the Developer Portal
      // If you are using the actual Pi Network Mainnet URL, set this to false.
      await window.Pi.init({ version: '2.0', sandbox: true });
      
      PiService.isInitialized = true;
      console.log('Pi SDK Initialized successfully');
      return true;
    } catch (err: any) {
      console.error('Pi SDK Init Error:', err);
      return false;
    }
  },

  authenticate: async (): Promise<PiAuthResult | null> => {
    try {
      // 1. Ensure Init
      if (!PiService.isInitialized) {
        console.log("Not initialized, attempting init...");
        const success = await PiService.init();
        if (!success) {
          alert("Could not load Pi Network SDK. Please refresh the page.");
          return null;
        }
      }

      console.log('Calling Pi.authenticate...');
      
      // 2. Authenticate with race condition protection
      const scopes = ['username', 'payments'];
      
      const authResult = await Promise.race([
        window.Pi.authenticate(scopes, onIncompletePaymentFound),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Pi Browser did not respond (Timeout)")), 20000) // Increased to 20s
        )
      ]);
      
      console.log('Authentication result:', authResult);
      return authResult as PiAuthResult;

    } catch (err: any) {
      console.error('Pi Auth Error:', err);
      alert(`Authentication Error: ${err.message || JSON.stringify(err)}`);
      return null;
    }
  }
};

function onIncompletePaymentFound(payment: any) {
  console.log('Incomplete payment found:', payment);
}
