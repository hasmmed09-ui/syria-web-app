const dummyHandler = {
  get(target, prop) {
    if (typeof target[prop] === 'function') {
      return async () => ({ data: [], error: null });
    }
    if (typeof target[prop] === 'object' && target[prop] !== null) {
      return new Proxy(target[prop], dummyHandler);
    }
    // Safeguard: If a page accesses a property that isn't defined,
    // return a proxy function so it never throws "is not a function" errors.
    return new Proxy(() => {}, {
      apply: async () => ({ data: [], error: null }),
      get: (t, p) => new Proxy(() => {}, dummyHandler)
    });
  }
};

/* eslint-disable-next-line no-unused-vars */
export const base44 = new Proxy({
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    signOut: async () => {},
  }
}, dummyHandler);