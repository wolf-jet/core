const Requests = require("../Network/IO/Requests");

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

    this.#Client.V3.Conn.on("welcome", this.#OnWelcome);
  }

  /**
   * Raise an event when the welcome packet is recieved
   * @param {(data: any) => void} fn
   */
  set Welcome(fn) {
    this.#Client.V3.Conn.on("welcome", fn);
  }

  #OnWelcome = async ({ loggedInUser }) => {
    if (loggedInUser) {
      // eslint-disable-next-line no-useless-catch
      try {
        // Request Cognito Information for MMS through AWS
        const cognito = await Requests.SecurityTokenRefresh(this.#Client.V3);
        this.#Client.On.Security.TokenRefreshed(cognito);

        // Fetch the Current Subsciber and subscribe to updates to self
        const subscriber = await this.#Client.Subscribers.GetSubscriber(loggedInUser.id, true, true);
        this.#Client.CurrentUser = subscriber;

        this.#Client.On.Security.LoginSuccess(subscriber);
      } catch (e) {
        throw e;
      }
    }
  };
};
