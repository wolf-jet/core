/* eslint-disable no-shadow */
/* eslint-disable consistent-return */
/* eslint-disable no-async-promise-executor */
/* eslint-disable no-param-reassign */
const asyncPool = require("tiny-async-pool");
const io = require("socket.io-client");
/**
 * Socket.IO Handler
 */
module.exports = class IO {
  /**
   * @type {import("../../Client")}
   */
  Client;

  /**
   * @type {SocketIOClient.Socket}
   */
  Conn;

  /**
   * Generate a new Socket.IO Handler
   * @param {import("../../Client")} client
   * @param {string} baseUrl
   * @param {'web' | 'android' | 'ios'} device
   */
  constructor(client, baseUrl = "wss://v3.palringo.com", device = "web") {
    this.Client = client;
    this.Conn = io(baseUrl, {
      transports: ["websocket"],
      query: {
        token: this.Client.Token,
        device,
      },
    });
  }

  /**
   * Send a Request to WOLF
   * @param {string} command the command to send
   * @param {any} data the corresponding data
   * @param {number} batchSize only used if idList is found in data (batch requests)
   */
  Emit = (command, data, batchSize = 50) =>
    new Promise(async (resolve, reject) => {
      // Wrap in Body if just raw data is passed along
      if (!data?.headers && !data?.body) data = { headers: {}, body: data ?? {} };

      // If no id list, this is just a simple request
      if (!data?.body?.idList)
        return this.Conn.emit(command, data, (resp) => (resp?.code >= 200 && resp?.code <= 299 ? resolve(resp) : reject(resp)));

      // Unique IDs only (remove all duplicates)
      const idList = new Array(...new Set(data?.body?.idList)) ?? [];

      // Chunk the ID list according to batch size
      const chunks = [];

      for (let i = 0; i < idList.length; i += batchSize) chunks.push(idList.slice(i, i + batchSize));

      // method for arrayPool to call
      const req = (idList) =>
        new Promise((resolve, reject) =>
          this.Conn.emit(command, { headers: data.headers, body: { ...data?.body, idList } }, (resp) =>
            resp?.code >= 200 && resp?.code <= 299 ? resolve(resp) : reject(resp)
          )
        );

      let responses = await asyncPool(3, chunks, req);

      responses = responses
        .reduce((resps, resp) => {
          resps.push(...Object.values(resp.body));
          return resps;
        }, [])
        .reduce((subs, sub) => {
          if (sub.code === 200) subs.push(sub.body);
          return subs;
        }, []);

      resolve(responses);
    });
};
