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
          // Critical Failure: SDK script not loaded
          alert("CRITICAL ERROR: 'window.Pi' is undefined. The Pi Network SDK script failed to load. Check internet connection.");
          return false;
        }

        // Initialize SDK
        await window.Pi.init({ version: '2.0', sandbox: true });
        
        console.log('Pi SDK Initialized successfully');
        return true;
      } catch (err: any) {
        console.error('Pi SDK Init Error:', err);
        // Alert the specific init error
        alert(`Init Error: ${err.message || JSON.stringify(err)}`);
        
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
        throw new Error("Pi SDK init failed (returned false).");
      }

      // Paranoid check before calling authenticate
      if (!window.Pi) {
        throw new Error("window.Pi disappeared unexpectedly.");
      }

      console.log('Requesting authentication...');
      
      const scopes = ['username', 'payments'];
      
      // 2. Authenticate
      const authResult = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
      
      console.log('Authentication successful:', authResult);
      return authResult as PiAuthResult;

    } catch (err: any) {
      // Just rethrow, letting AuthContext handle the alert display
      throw err; 
    }
  }
};

function onIncompletePaymentFound(payment: any) {
  console.log('Incomplete payment found:', payment);
}
