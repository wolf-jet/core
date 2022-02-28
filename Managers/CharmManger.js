const { assign } = require("../Utilities/Assign");
const Requests = require("../Network/IO/Requests");
const Charm = require("../Models/Charm");
const CacheManger = require("./CacheManager");

module.exports = class AchievementManager extends CacheManger {
  /**
   * @type {import("../Client")}
   */
  #Client;

  /**
   * Create a new Message Manager
   * @param {import("../Client")} client
   */
  constructor(client) {
    super();
    this.#Client = client;
  }

  /**
   * Get all charms by language id
   * @param {number} languageId the id of language
   * @returns {Charm[]}
   */
  CharmList = async (languageId) => {
    try {
      if (this.cache.has(languageId)) {
        return this.cache.get(languageId);
      }
      const response = await Requests.CharmList(this.#Client.V3, languageId);
      const charms = response.body.map((charm) => assign(new Charm(), charm));
      this.add(languageId, charms);
      return charms;
    } catch (e) {
      return null;
    }
  };

  /**
   * Get charm info by id
   * @param {number} id the id of charms
   * @param {number} languageId the id of language
   * @returns {Charm}
   */
  GetCharm = async (id, languageId) => {
    try {
      if (this.cache.has(`${id}-${languageId}`)) {
        return this.cache.get(`${id}-${languageId}`);
      }
      const response = await Requests.Charm(this.#Client.V3, id, languageId);
      const charm = assign(new Charm(), response.body[0]);
      this.add(`${id}-${languageId}`, charm);
      return charm;
    } catch (e) {
      return null;
    }
  };

  /**
   * Get all starred list
   * @returns {object}
   */
  StarredList = async () => {
    try {
      const response = await Requests.StarredList(this.#Client.V3);
      return response.body;
    } catch (e) {
      return null;
    }
  };

  /**
   * Get all Active charms
   * @param {number} id the id of subscriber
   * @param {number} limit how many charms should be returned
   * @param {number} offset index where the returned charms should start
   * @returns {object}
   */
  ActiveList = async (id, limit, offset) => {
    try {
      const response = await Requests.ActiveList(this.#Client.V3, id, limit, offset);
      return response.body;
    } catch (e) {
      return null;
    }
  };

  /**
   * get all Expired charms
   * @param {number} id the id of subscriber
   * @param {number} limit how many charms should be returned
   * @param {number} offset index where the returned charms should start
   * @returns {object}
   */
  ExpiredList = async (id, limit, offset) => {
    try {
      const response = await Requests.ExpiredList(this.#Client.V3, id, limit, offset);
      return response.body;
    } catch (e) {
      return null;
    }
  };

  /**
   * Set charm to subscriber profile
   * @param {number} charmID the id of charm
   * @returns {boolean}
   */
  setCharm = async (charmID) => {
    try {
      await Requests.SetSelected(this.#Client.V3, charmID);
      return true;
    } catch (e) {
      return false;
    }
  };

  /**
   * Get the summary list
   * @param {number} id the id of subscriber
   * @param {number} limit how many charms should be returned
   * @param {number} offset index where the returned charms should start
   * @returns {object}
   */
  SummaryList = async (id, limit, offset) => {
    try {
      const response = await Requests.SummaryList(this.#Client.V3, id, limit, offset);
      return response.body;
    } catch (e) {
      return null;
    }
  };

  /**
   * get all Statistics charm for the subscriber
   * @param {number} id the is of subscriber
   * @param {boolean} extended extended info?
   * @returns {object}
   */
  Statistics = async (id, extended) => {
    try {
      const response = await Requests.Statistics(this.#Client.V3, id, extended);
      return response.body;
    } catch (e) {
      return null;
    }
  };
};
