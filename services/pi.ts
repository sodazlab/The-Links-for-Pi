import { PiAuthResult } from '../types';

// Singleton promise to prevent multiple init calls
let initPromise: Promise<boolean> | null = null;

export const PiService = {
  /**
   * Initializes the Pi SDK.
   * strictly follows: https://github.com/pi-apps/pi-platform-docs/blob/master/SDK_reference.md
   */
  init: (): Promise<boolean> => {
    if (initPromise) return initPromise;

    initPromise = (async () => {
      try {
        if (!window.Pi) {
          throw new Error("Pi SDK script is not loaded. Ensure <script src='https://sdk.minepi.com/pi-sdk.js'> is in index.html");
        }

        console.log("Initializing Pi SDK (v2.0)...");

        // Initialize SDK
        // sandbox: true is recommended for development. 
        await window.Pi.init({ version: '2.0', sandbox: true });
        
        console.log('Pi SDK Initialized.');
        return true;
      } catch (err: any) {
        console.error('Pi SDK Init Error:', err);
        // Let the caller handle the alert to avoid spamming on load
        initPromise = null;
        return false;
      }
    })();

    return initPromise;
  },

  authenticate: async (): Promise<PiAuthResult | null> => {
    try {
      // 1. Ensure Init
      const initialized = await PiService.init();
      if (!initialized) {
        throw new Error("SDK initialization failed. Check internet connection or ad blockers.");
      }

      if (!window.Pi) {
        throw new Error("window.Pi is undefined despite initialization.");
      }

      // 2. Debugging Helper
      console.log("Current Window URL:", window.location.href);

      // 3. Authenticate
      // FIX: Removed 'payments' scope. 
      // Requesting 'payments' without full portal configuration often causes the auth window to fail silently.
      // We only request 'username' first to ensure connectivity.
      const scopes = ['username']; 
      
      console.log("Calling window.Pi.authenticate with scopes:", scopes);

      // Standard call according to docs
      const authResult = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
      
      console.log('Authentication successful:', authResult);
      return authResult as PiAuthResult;

    } catch (err: any) {
      console.error("Authentication Error Details:", err);
      // The error will be caught and alerted by authContext.tsx
      throw err; 
    }
  }
};

/**
 * Handler for incomplete payments.
 */
function onIncompletePaymentFound(payment: any) {
  console.log('Incomplete payment found:', payment);
}
