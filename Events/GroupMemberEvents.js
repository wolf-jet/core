const { assign } = require("../Utilities/Assign");
const GroupMember = require("../Models/Group/GroupMember");

module.exports = class Events {
  /**
   * @type {import("../Client")}
   */
  #Client;

  /**
   * @type {import("events").EventEmitter}
   */
  #Emitter;

  /**
   * Create new Events Handler
   * @param {import("../Client")} client
   * @param {import("events").EventEmitter} emitter
   */
  constructor(client, emitter) {
    this.#Client = client;
    this.#Emitter = emitter;

    this.#Client.V3.Conn.on("group member add", this.#OnAdd);
    this.#Client.V3.Conn.on("group member update", this.#OnUpdate);
    this.#Client.V3.Conn.on("group member delete", this.#OnDelete);
  }

  /**
   * Raise an event when a group member is added
   */
  set Added(fn) {
    this.#Emitter.on("group member add", fn);
  }

  /**
   * Raise an event when a group member is updated
   */
  set Updated(fn) {
    this.#Emitter.on("group member update", fn);
  }

  /**
   * Raise an event when a group member is deleted
   */
  set Deleted(fn) {
    this.#Emitter.on("group member delete", fn);
  }

  /**
   * Emit the Group member Added Event
   */
  get Added() {
    return (data) => this.#Emitter.emit("group member add", data);
  }

  /**
   * Emit the Group member Updated Event
   */
  get Updated() {
    return (data) => this.#Emitter.emit("group member update", data);
  }

  /**
   * Emit the Group member Deleted Event
   */
  get Deleted() {
    return (data) => this.#Emitter.emit("group member delete", data);
  }

  #OnAdd = async ({ body }) => {
    if (this.#Client.Groups.cache.has(`GM-${body.groupId}`)) {
      const members = this.#Client.Groups.cache.get(`GM-${body.groupId}`);
      const user = await this.#Client.Subscribers.GetSubscriber(body.subscriberId, false, true);
      const member = {
        Id: user.Id,
        Capabilities: body.capabilities,
        additionalInfo: {
          hash: user.Hash,
          nicknameShort: user.Nickname,
          privileges: user.Privileges,
          onlineState: user.OnlineState,
        },
      };
      members.push(assign(new GroupMember(), member));
    }

    this.Added(body);
  };

  #OnUpdate = async ({ body }) => {
    if (this.#Client.Groups.cache.has(`GM-${body.groupId}`)) {
      const members = this.#Client.Groups.cache.get(`GM-${body.groupId}`);
      const member = members.find((subscribe) => subscribe.Id === body.subscriberId);
      if (member) {
        member.Capabilities = body.capabilities;
      }
    }

    this.Updated(body);
  };

  #OnDelete = async ({ body }) => {
    if (this.#Client.Groups.cache.has(`GM-${body.groupId}`)) {
      const members = this.#Client.Groups.cache.get(`GM-${body.groupId}`);
      const member = members.find((subscribe) => subscribe.Id === body.subscriberId);
      if (member) {
        member.Capabilities = body.capabilities;
        members.splice(
          members.findIndex((user) => user === member),
          1
        );
      }
    }

    this.Deleted(body);
  };
};
