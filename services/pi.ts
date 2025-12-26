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

        // AUTO-DETECT ENVIRONMENT
        // The error "Failed to execute 'postMessage' ... target origin provided ('https://sandbox.minepi.com') does not match..."
        // occurs when running 'sandbox: true' on a public domain (like Vercel) without being inside the Pi Sandbox Shell.
        // Fix: Use sandbox: true ONLY for localhost. For Vercel/Production, use sandbox: false.
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        console.log(`Initializing Pi SDK (v2.0). Environment: ${isLocal ? 'Local (Sandbox)' : 'Production'}`);

        // sandbox: true for localhost, false for production to avoid origin mismatch errors
        await window.Pi.init({ version: '2.0', sandbox: isLocal });
        
        console.log('Pi SDK Initialized.');
        return true;
      } catch (err: any) {
        console.error('Pi SDK Init Error:', err);
        // Do not alert on init error to avoid annoying popups on load, just log it.
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
      // Requesting 'payments' often fails if the app is not fully configured in the portal.
      // We start with 'username' only for highest success rate.
      const scopes = ['username']; 
      
      console.log("Calling window.Pi.authenticate with scopes:", scopes);

      // Standard call according to docs
      const authResult = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
      
      console.log('Authentication successful:', authResult);
      return authResult as PiAuthResult;

    } catch (err: any) {
      console.error("Authentication Error Details:", err);
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
