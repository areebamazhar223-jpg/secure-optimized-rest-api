
const cache = new Map();

const CACHE_TTL = 30 * 1000; // 30 seconds
const MAX_CACHE_ITEMS = 100;

const getCache = (key) => {
  const item = cache.get(key);

  if (!item) {
    return null;
  }

  if (Date.now() >= item.expiresAt) {
    cache.delete(key);
    return null;
  }

  return item.value;
};

const setCache = (key, value) => {
  if (!cache.has(key) && cache.size >= MAX_CACHE_ITEMS) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }

  cache.set(key, {
    value,
    expiresAt: Date.now() + CACHE_TTL,
  });
};

const clearCache = () => {
  cache.clear();
};

module.exports = {
  getCache,
  setCache,
  clearCache,
};
