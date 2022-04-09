const { assign } = require("../Utilities/Assign");
const Group = require("../Models/Group/Group");
const GroupMember = require("../Models/Group/GroupMember");
const Requests = require("../Network/IO/Requests");
const StatsDetails = require("../Models/GroupStats/StatsDetails");
const StatsSubscriber = require("../Models/GroupStats/StatsSubscriber");
const StatsSubscriberTop = require("../Models/GroupStats/StatsSubscriberTop");
const StatsSubscriberTopWord = require("../Models/GroupStats/StatsSubscriberTopWord");
const { StatsTrendsDate, StatsTrendsDay, StatsTrendsHour } = require("../Models/GroupStats/StatsTrends");
const GroupStats = require("../Models/GroupStats/GroupStats");
const CacheManger = require("./CacheManager");

module.exports = class GroupManager extends CacheManger {
  /**
   * @type {import("../Client")}
   */
  #Client;

  /**
   * Crate a new GroupManager
   * @param {import("../Client")} client
   */
  constructor(client) {
    super(client.Options.cache?.find((name) => name.group));
    this.#Client = client;
  }

  /**
   * Get a Group by Name or ID
   * @param {string | number} nameOrId
   * @param {{'base' | 'extended' | 'audioConfig' | 'audioCounts'}[]} entities
   * @param {boolean} subscribe
   * @returns {Group}
   */
  GetGroup = async (nameOrId, entities = ["base", "extended", "audioConfig", "audioCounts"], subscribe = true) => {
    try {
      if (this.cache.has(nameOrId)) {
        return this.cache.get(nameOrId);
      }
      const response = await Requests.GroupProfile(this.#Client.V3, nameOrId, entities, subscribe);

      const { base, extended, audioConfig, audioCounts } = response.body;

      const group = assign(new Group(), {
        ...base,
        extended,
        audioConfig,
        audioCounts,
      });

      this.#Client.On.Groups.Fetched(group);
      this.add(nameOrId, group);
      return group;
    } catch (e) {
      return null;
    }
  };

  /**
   * Get Groups by their IDs
   * @param {number[]} idList the list of groups ids
   * @param {*} entities the entities to fetch
   * @param {*} subscribe subscribe to changes to the group profiles
   */
  GetGroups = async (idList, entities = ["base", "extended", "audioConfig", "audioCounts"], subscribe = true) => {
    try {
      const response = await Requests.GroupProfiles(this.#Client.V3, idList, entities, subscribe);

      const groups = response.map((t) =>
        assign(new Group(), {
          ...t.base,
          extended: t.extended,
          audioConfig: t.audioConfig,
          audioCounts: t.audioCounts,
        })
      );
      groups.forEach((group) => this.#Client.On.Groups.Fetched(group));

      return groups;
    } catch (e) {
      return [];
    }
  };

  /**
   * Get the stats for a group
   * @param {number} id the id of the group
   * @returns {GroupStats}
   */
  GetStats = async (id) => {
    try {
      const response = await Requests.GroupStats(this.#Client.V3, id);

      let {
        details,
        trendsHour,
        trendsDay,
        trends,
        top25,
        next30,
        topWord,
        topQuestion,
        topEmoticon,
        topHappy,
        topSad,
        topSwear,
        topImage,
        topAction,
      } = response.body;

      details = assign(new StatsDetails(), details);
      trendsHour = trendsHour.map((th) => assign(new StatsTrendsHour(), th));
      trendsDay = trendsDay.map((td) => assign(new StatsTrendsDay(), td));
      trends = trends.map((t) => assign(new StatsTrendsDate(), t));
      top25 = top25.map((t25) => assign(new StatsSubscriber(), t25));
      next30 = next30.map((n30) => assign(new StatsSubscriber(), n30));
      topWord = topWord.map((tw) => assign(new StatsSubscriberTopWord(), tw));
      topQuestion = topQuestion.map((tq) => assign(new StatsSubscriberTop(), tq));
      topEmoticon = topEmoticon.map((te) => assign(new StatsSubscriberTop(), te));
      topHappy = topHappy.map((th) => assign(new StatsSubscriberTop(), th));
      topSad = topHappy.map((ts) => assign(new StatsSubscriberTop(), ts));
      topSwear = topSwear.map((ts) => assign(new StatsSubscriberTop(), ts));
      topImage = topImage.map((ti) => assign(new StatsSubscriberTop(), ti));
      topAction = topAction.map((ta) => assign(new StatsSubscriberTop(), ta));

      const stats = assign(new GroupStats(), {
        details,
        trendsHour,
        trendsDay,
        trends,
        top25,
        next30,
        topWord,
        topQuestion,
        topEmoticon,
        topHappy,
        topSad,
        topSwear,
        topImage,
        topAction,
      });

      return stats;
    } catch (e) {
      return null;
    }
  };

  /**
   * Update a Group's Profile
   * @param {number} id the id of the group to update
   * @param {any} data the data to update the group with
   */
  UpdateGroup = async (id, data) => {
    try {
      await Requests.GroupUpdate(this.#Client.V3, id, data);
      return true;
    } catch (e) {
      return false;
    }
  };

  /**
   * Create a Group
   * @param {any} data the data to create the group with
   */
  CreateGroup = async (data) => {
    try {
      await Requests.GroupCreate(this.#Client.V3, data);
      return true;
    } catch (e) {
      return false;
    }
  };

  /**
   * Get group members
   * @param {number} id
   * @param {Boolean} subscribe
   * @returns
   */
  GetGroupMembers = async (id, subscribe = false) => {
    try {
      if (this.cache.has(`GM-${id}`)) {
        return this.cache.get(`GM-${id}`);
      }
      const respouns = await Requests.GroupMemberList(this.#Client.V3, id, subscribe);
      const members = respouns.body.map((t) => assign(new GroupMember(), t));
      this.add(`GM-${id}`, members);
      return members;
    } catch (e) {
      return null;
    }
  };

  /**
   * Update Group Members
   * @param {Number} groupId
   * @param {Number} subscriberId
   * @param {Number} capabilities
   */
  UpdateGroupMembers = async (groupId, subscriberId, capabilities) => {
    try {
      await Requests.GroupMemberUpdate(this.#Client.V3, groupId, subscriberId, capabilities);
      return true;
    } catch (error) {
      return error;
    }
  };

  /**
   * Join A Group
   * @param {String|Number} nameOrId
   * @param {String} password
   * @param {Number} referredBy
   */
  Join = async (nameOrId, password = null, referredBy = null) => {
    try {
      await Requests.GroupMemberAdd(this.#Client.V3, nameOrId, password, referredBy);
      return true;
    } catch (error) {
      return error;
    }
  };

  /**
   * Leave A Group
   * @param {Number} groupId
   */
  Leave = async (groupId) => {
    try {
      await Requests.GroupMemberDelete(this.#Client.V3, groupId);
      return true;
    } catch (error) {
      return error;
    }
  };
};
