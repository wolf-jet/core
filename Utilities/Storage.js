/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
/* eslint-disable no-restricted-syntax */
module.exports = class Storage extends Map {
  #MaxSize;

  #Limit;

  constructor(options = {}) {
    super();
    const { maxSize = Infinity, keepLimit = null } = options;
    this.#MaxSize = maxSize;
    this.#Limit = keepLimit;
  }

  first(amount) {
    if (typeof amount === "undefined") return this.values().next().value;
    if (amount < 0) return this.last(amount * -1);
    amount = Math.min(this.size, amount);
    const iter = this.values();
    return Array.from({ length: amount }, () => iter.next().value);
  }

  set(key, value) {
    if (this.#MaxSize === 0) return this;
    if (this.size >= this.maxSize && !this.has(key)) {
      for (const [k, v] of this.entries()) {
        const keep = this.#Limit?.(v, k, this) ?? false;
        if (!keep) {
          this.delete(k);
          break;
        }
      }
    }
    return super.set(key, value);
  }
};
