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
    get: (key: string): Promise<{ value: string | null }> => {
      try {
        const value = localStorage.getItem(key);
        return Promise.resolve({ value });
      } catch {
        return Promise.resolve({ value: null });
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
