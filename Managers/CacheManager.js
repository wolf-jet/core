const Storage = require("../Utilities/Storage");

module.exports = class CacheManger {
  #Cache;

  constructor(options = {}) {
    const { maxSize = Infinity, Limit = null } = options;
    this.#Cache = new Storage({ maxSize, Limit });
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
