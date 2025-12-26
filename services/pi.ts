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
    // Wait 100ms and try again (Total 5s wait)
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

        // Check if already initialized by the SDK itself (rare but possible)
        // Note: The SDK doesn't expose an isInitialized property standardly, 
        // so we rely on our own singleton flow.

        // Initialize SDK
        // sandbox: true implies the app is running in the Pi Sandbox environment.
        // Change to false ONLY if you are deployed to production URL and verified.
        // For debugging "Timeout" issues, ensuring this is called only once is key.
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
      // 1. Ensure Init (Singleton)
      const isInitialized = await PiService.init();
      if (!isInitialized) {
        alert("Pi SDK failed to initialize. Please reload the page.");
        return null;
      }

      console.log('Requesting authentication...');
      
      // 2. Authenticate
      const scopes = ['username', 'payments'];
      
      // We use a longer timeout (60s) because sometimes users are slow to press "Allow"
      // or the Pi Browser is slow to pop up the dialog.
      const authResult = await Promise.race([
        window.Pi.authenticate(scopes, onIncompletePaymentFound),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Auth Timeout: Pi Browser did not respond in 60s")), 60000)
        )
      ]);
      
      console.log('Authentication successful:', authResult);
      return authResult as PiAuthResult;

    } catch (err: any) {
      console.error('Pi Auth Failed:', err);
      
      // Provide user-friendly error messages
      let msg = err.message || "Unknown error";
      if (msg.includes("user cancelled")) {
        msg = "You cancelled the authentication.";
      } else if (msg.includes("Timeout")) {
        msg = "Connection timed out. Please try again.";
      }
      
      alert(`Login Failed: ${msg}`);
      return null;
    }
  }
};

function onIncompletePaymentFound(payment: any) {
  console.log('Incomplete payment found:', payment);
  // NOTE: You must complete the payment here if you have payment logic.
  // For authentication-only flow, logging is sufficient.
}
