import { PiAuthResult } from '../types';

// Singleton promise to prevent multiple init calls
let initPromise: Promise<boolean> | null = null;

export const PiService = {
  /**
   * Waits for window.Pi to be available in the DOM.
   */
  ensurePiReady: async (retries = 50): Promise<boolean> => {
    if (window.Pi) return true;
    if (retries === 0) return false;
    // Wait 100ms and try again
    await new Promise(resolve => setTimeout(resolve, 100));
    return PiService.ensurePiReady(retries - 1);
  },

  /**
   * Initializes the Pi SDK.
   * Uses a singleton pattern to ensure Pi.init is called EXACTLY once.
   */
  init: (): Promise<boolean> => {
    if (initPromise) return initPromise;

    initPromise = (async () => {
      try {
        console.log("Initializing Pi SDK...");
        
        const isReady = await PiService.ensurePiReady();
        if (!isReady) {
          console.error("Pi SDK script missing or failed to load.");
          return false;
        }

        // Initialize SDK
        // IMPORTANT: 'sandbox: true' is required for testing. 
        // Ensure your Pi Developer Portal 'Development URL' matches your current URL exactly.
        await window.Pi.init({ version: '2.0', sandbox: true });
        
        console.log('Pi SDK Initialized successfully');
        return true;
      } catch (err: any) {
        console.error('Pi SDK Init Error:', err);
        // Reset promise so we can try again if it fails
        initPromise = null;
        return false;
      }
    })();

    return initPromise;
  },

  authenticate: async (): Promise<PiAuthResult | null> => {
    try {
      // 1. Ensure Init is complete
      const initialized = await PiService.init();
      if (!initialized) {
        throw new Error("Pi SDK could not be initialized.");
      }

      console.log('Requesting authentication (following official docs)...');
      
      const scopes = ['username', 'payments'];
      
      // 2. Authenticate directly without artificial timeout
      // Reference: https://github.com/pi-apps/pi-platform-docs/blob/master/authentication.md
      const authResult = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
      
      console.log('Authentication successful:', authResult);
      return authResult as PiAuthResult;

    } catch (err: any) {
      console.error('Pi Auth Failed:', err);
      
      // Handle common Pi SDK errors
      if (err?.message) {
         if (err.message.includes("user cancelled")) {
           console.warn("User cancelled the auth dialog.");
         }
      }
      
      // Re-throw or return null depending on how you want to handle it in UI
      throw err; 
    }
  }
};

function onIncompletePaymentFound(payment: any) {
  console.log('Incomplete payment found:', payment);
  // Per docs: "You must handle this callback to complete the payment."
  // Since this is a linking app, we just log it for now.
  // If you add payments later, implement the completion logic here.
}
