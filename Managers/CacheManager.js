/* eslint-disable no-useless-catch */
/* eslint-disable no-unused-vars */
const LRU = require("lru-cache");

module.exports = class CacheManger {
  /**
   * @type {LRU}
   */
  #Cache;

  /**
   *
   * @param {LRU.Options} options
   */
  constructor(options = {}) {
    const { max = 100, maxSize = 500, sizeCalculation = (_value, _key) => 1 } = options;
    this.#Cache = new LRU({ max, maxSize, sizeCalculation, ...options });
  }

  /**
   *
   * @returns {LRU}
   */
  get cache() {
    return this.#Cache;
  }

  /**
   *
   * @param {*} id
   * @param {*} data
   * @returns
   */
  add(id, data) {
    try {
      if (this.#Cache.has(id)) {
        return this.#Cache.get(id);
      }
      this.#Cache.set(id, data);
      return true;
    } catch (error) {
      throw error;
    }
  }
};
