const LRU = require("lru-cache");

module.exports = class CacheManger {
  #Cache;

  constructor(options = {}) {
    const { max = 100, maxSize = 500 } = options;
    this.#Cache = new LRU({ max, maxSize, ...options });
  }

  add(id, data) {
    if (this.#Cache.has(id)) {
      return this.#Cache.get(id);
    }
    this.#Cache.set(id, data);
    return true;
  }

  get cache() {
    return this.#Cache;
  }
};
