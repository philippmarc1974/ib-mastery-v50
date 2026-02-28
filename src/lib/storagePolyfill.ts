/**
 * Polyfills window.storage with a localStorage-backed shim
 * that matches the Capacitor Preferences API used in the original app:
 *   window.storage.get(key)  → Promise<{ value: string | null }>
 *   window.storage.set(key, value) → Promise<void>
 *   window.storage.remove(key) → Promise<void>
 *   window.storage.clear() → Promise<void>
 */
export function installStoragePolyfill() {
  if (typeof window === "undefined") return;
  if ((window as any).storage) return; // already installed

  (window as any).storage = {
    // Returns raw string (not { value }) — matches what all consumers expect
    get: (key: string): Promise<string | null> => {
      try {
        return Promise.resolve(localStorage.getItem(key));
      } catch {
        return Promise.resolve(null);
      }
    },
    set: (key: string, value: string): Promise<void> => {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        console.warn("storage.set failed:", e);
      }
      return Promise.resolve();
    },
    remove: (key: string): Promise<void> => {
      try {
        localStorage.removeItem(key);
      } catch {}
      return Promise.resolve();
    },
    clear: (): Promise<void> => {
      try {
        localStorage.clear();
      } catch {}
      return Promise.resolve();
    },
  };
}
