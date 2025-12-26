import { PiAuthResult } from '../types';

const PI_SDK_URL = 'https://sdk.minepi.com/pi-sdk.js';

export const PiService = {
  isInitialized: false,

  /**
   * Dynamically loads the Pi SDK script if it's not present on the window object.
   * This fixes issues where the index.html script tag fails or loads too late.
   */
  loadScript: (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.Pi) {
        resolve();
        return;
      }

      console.log('Pi SDK not found, loading dynamically...');
      const script = document.createElement('script');
      script.src = PI_SDK_URL;
      script.async = true;
      script.onload = () => {
        console.log('Pi SDK Script Loaded Dynamically');
        resolve();
      };
      script.onerror = (err) => {
        console.error('Failed to load Pi SDK Script:', err);
        reject(new Error('Failed to load Pi SDK script from ' + PI_SDK_URL));
      };
      document.head.appendChild(script);
    });
  },

  init: async () => {
    if (PiService.isInitialized) return true;

    try {
      // 1. Ensure the script is loaded
      await PiService.loadScript();

      // 2. Double check presence
      if (typeof window.Pi === 'undefined') {
        throw new Error('window.Pi is still undefined after script load');
      }

      // 3. Initialize SDK
      // Ensure 'sandbox: true' matches your setting in the Developer Portal
      await window.Pi.init({ version: '2.0', sandbox: true });
      
      PiService.isInitialized = true;
      console.log('Pi SDK Initialized successfully');
      return true;
    } catch (err: any) {
      console.error('Pi SDK Init Error:', err);
      // Only alert if we are trying to authenticate, otherwise silent fail is okay for init
      return false;
    }
  },

  authenticate: async (): Promise<PiAuthResult | null> => {
    try {
      // 1. Ensure Init (force retry if needed)
      if (!PiService.isInitialized) {
        const success = await PiService.init();
        if (!success) {
          throw new Error("Failed to initialize Pi SDK. Check network.");
        }
      }

      // 2. Authenticate
      const scopes = ['username', 'payments'];
      console.log('Calling Pi.authenticate...');
      
      const authResult = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
      
      console.log('Authentication result:', authResult);
      return authResult;

    } catch (err: any) {
      console.error('Pi Auth Error:', err);
      // CRITICAL: Alert the user so they see why it failed
      alert(`Pi Login Failed: ${err.message || JSON.stringify(err)}`);
      return null;
    }
  }
};

// Callback required by SDK
function onIncompletePaymentFound(payment: any) {
  console.log('Incomplete payment found:', payment);
}
