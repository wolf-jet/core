const { assign } = require("../Utilities/Assign");
const Requests = require("../Network/IO/Requests");
const Achievement = require("../Models/Achievement");
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
    super(client.Options.cache?.find((name) => name.achievement));
    this.#Client = client;
  }

  /**
   * Get achievements List
   * @param {number} languageId the id of language
   * @returns {achievements[]}
   */
  GetAchievements = async (languageId) => {
    try {
      if (this.cache.has(languageId)) {
        return this.cache.get(languageId);
      }
      const response = await Requests.AchievementList(this.#Client.V3, languageId);
      const achievements = response.body.map((t) =>
        assign(new Achievement(), {
          id: t.id,
          typeId: t.typeId,
          parentId: t.parentId,
          name: t.name,
          description: t.description,
          imageUrl: t.imageUrl,
          notificationPhraseId: t.notificationPhraseId || null,
          weight: t.weight,
          isSecret: t.isSecret,
          client: t.client,
          children: !t.children ? [] : t.children.map((a) => assign(new Achievement(), { a })),
        })
      );
      this.add(achievements);
      return achievements;
    } catch (e) {
      return null;
    }
  };

  /**
   * Get subscribe Achievements List
   * @param {number} subscriberId the id of language
   */
  GetSubscriberAchievements = async (subscriberId) => {
    try {
      if (this.cache.has(`SB-${subscriberId}`)) {
        return this.cache.get(`SB-${subscriberId}`);
      }
      const { body } = await Requests.AchievementSubscriberList(this.#Client.V3, subscriberId);
      // TODO: Marge Subscriber Achievements with general Achievements
      this.add(`SB-${subscriberId}`, body);
      return body;
    } catch (e) {
      return null;
    }
  };
};
