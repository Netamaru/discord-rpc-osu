require("dotenv").config();
const WebSocket = require("ws");
const rpc = require("discord-rpc");
const axios = require("axios");
const { v2, auth } = require("osu-api-extended");

(async () => {
  try {
    const client = new rpc.Client({ transport: "ipc" });
    await auth.login(process.env.clientId, process.env.clientSecret, [
      "public",
    ]);

    const status = {
      details: undefined,
      state: undefined,
      largeImageKey: "logo",
      largeImageText: undefined,
      smallImageKey: undefined,
      smallImageText: undefined,
      instance: false,
      buttons: [
        {
          label: undefined,
          url: undefined,
        },
      ],
    };
    let fetched = false;
    let _status = {};
    let cache = {};

    client
      .login({
        clientId: "818949299094290454",
      })
      .catch((error) => {
        console.log(error);
      });

    client.on("ready", async () => {
      console.log("RPC Client started");
      console.log(
        `Authed for Discord: ${client.user?.global_name} (${client.user?.username})`
      );

      const ws = new WebSocket(process.env.server);

      ws.on("open", () => {
        ws.send(
          JSON.stringify([
            "ppIfMapEndsNow",
            "combo",
            "mapsetid",
            "diffName",
            "dl",
            "banchoStatus",
            "rankedStatus",
            "rawStatus",
            "status",
            "acc",
            "banchoUsername",
            "banchoId",
            "mapArtistTitle",
            "mStars",
            "mods",
          ])
        );
      });

      ws.on("error", (error) => {
        console.error(`WebSocket Error: ${error}`);
      });

      ws.on("close", (code, reason) => {
        console.log(`Connection closed: ${code} - ${reason}`);
      });

      ws.on("message", async (data) => {
        Object.assign(cache, JSON.parse(data));
        await setActivity(status, cache, JSON.parse(data));
      });

      setInterval(async () => {
        try {
          if (!fetched) {
            await async_get(
              `https://assets.ppy.sh/beatmaps/${cache.mapsetid}/covers/list.jpg`
            );
            _status.largeImageKey = `https://assets.ppy.sh/beatmaps/${cache.mapsetid}/covers/list.jpg`;
            fetched = true;
          }
        } catch (error) {
          fetched = true;
          _status.largeImageKey = "logo";
        }
        client.setActivity(_status);
      }, 1000);

      setInterval(async () => {
        const user = await v2.user.details(cache.banchoId, "fruits", "id");
        status.smallImageText = `${user.username} (#${
          user.statistics.global_rank
        } │ ${Number(user.statistics.pp.toFixed(0)).toLocaleString()}pp)`;
        status.smallImageKey = user.avatar_url;
      }, 30000);
    });

    async function setActivity(activity, cache, rawData) {
      status.buttons[0].label = `${cache.banchoUsername ?? ""}'s profile`;
      status.buttons[0].url = `https://osu.ppy.sh/users/${cache.banchoId}`;

      if (typeof rawData.mapsetid !== "undefined") {
        fetched = false;
        status.details = cache.mapArtistTitle;
        status.largeImageText = `(★${convertNumber(cache.mStars)}) (${
          cache.mods
        }) [${cache.diffName}]`;
      }

      if (typeof rawData.diffName !== "undefined") {
        status.largeImageText = `(★${convertNumber(cache.mStars)}) (${
          cache.mods
        }) [${cache.diffName}]`;
      }

      if (
        typeof rawData.banchoStatus !== "undefined" ||
        typeof rawData.rankedStatus !== "undefined" ||
        typeof rawData.rawStatus !== "undefined" ||
        typeof rawData.status !== "undefined" ||
        typeof rawData.combo !== "undefined" ||
        typeof rawData.mStars !== "undefined" ||
        typeof rawData.mods !== "undefined"
      ) {
        if (cache.banchoStatus == 1) {
          if (cache.rawStatus == 0 && cache.status == 1) {
            setStatus(cache, activity, "AFK");
          }
          if (cache.rawStatus == 15 && cache.status == 1) {
            setStatus(cache, activity, "AFK │ osu!direct");
          }
          if (cache.rawStatus == 5 && cache.status == 1) {
            setStatus(
              cache,
              activity,
              "AFK │ Selecting beatmap",
              `(★${convertNumber(cache.mStars)}) (${cache.mods}) [${
                cache.diffName
              }]`
            );
          }
          if (cache.rawStatus == 4 && cache.status == 1) {
            setStatus(
              cache,
              activity,
              "AFK │ Selecting beatmap to edit",
              `(★${convertNumber(cache.mStars)}) (${cache.mods}) [${
                cache.diffName
              }]`
            );
          }
          if (cache.rawStatus == 7 && cache.status == 32) {
            setStatus(
              cache,
              activity,
              "AFK │ Viewing result",
              `(★${convertNumber(cache.mStars)}) (${cache.mods}) [${
                cache.diffName
              }]`
            );
          }
          if (cache.rawStatus == 2 && cache.status == 8) {
            setStatus(
              cache,
              activity,
              `AFK │ Spectating │ ${Number(
                cache.combo
              ).toLocaleString()}x ${Number(
                cache.ppIfMapEndsNow.toFixed(0)
              ).toLocaleString()}pp (${convertNumber(cache.acc)}%)`,
              `(★${convertNumber(cache.mStars)}) (${cache.mods}) [${
                cache.diffName
              }]`
            );
          }
          if (cache.rawStatus == 2 && cache.status == 2) {
            setStatus(
              cache,
              activity,
              `AFK │ Paused │ ${Number(cache.combo).toLocaleString()}x ${Number(
                cache.ppIfMapEndsNow.toFixed(0)
              ).toLocaleString()}pp (${convertNumber(cache.acc)}%)`,
              `(★${convertNumber(cache.mStars)}) (${cache.mods}) [${
                cache.diffName
              }]`
            );
          }
          if (cache.rawStatus == 11 && cache.status == 1) {
            setStatus(cache, activity, "AFK │ Multiplayer lobby");
          }
          if (cache.rawStatus == 12 && cache.status == 1) {
            setStatus(
              cache,
              activity,
              "AFK │ In a multiplayer room",
              `(★${convertNumber(cache.mStars)}) (${cache.mods}) [${
                cache.diffName
              }]`
            );
          }
          if (cache.rawStatus == 13 && cache.status == 1) {
            setStatus(
              cache,
              activity,
              "AFK │ Multiplayer: Selecting beatmap",
              `(★${convertNumber(cache.mStars)}) (${cache.mods}) [${
                cache.diffName
              }]`
            );
          }
          if (cache.rawStatus == 2 && cache.status == 2) {
            setStatus(
              cache,
              activity,
              `AFK │ Multiplaying │ ${Number(
                cache.combo
              ).toLocaleString()}x ${Number(
                cache.ppIfMapEndsNow.toFixed(0)
              ).toLocaleString()}pp (${convertNumber(cache.acc)}%)`,
              `(★${convertNumber(cache.mStars)}) (${cache.mods}) [${
                cache.diffName
              }]`
            );
          }
          if (cache.rawStatus == 14 && cache.status == 32) {
            setStatus(
              cache,
              activity,
              "AFK │ Multiplayer: Viewing result",
              `(★${convertNumber(cache.mStars)}) (${cache.mods}) [${
                cache.diffName
              }]`
            );
          }
        }

        if (cache.banchoStatus == 0) {
          if (cache.rawStatus == 0 && cache.status == 1) {
            setStatus(cache, activity, "Listening to music");
          }
          if (cache.rawStatus == 15 && cache.status == 1) {
            setStatus(cache, activity, "osu!direct");
          }
          if (cache.rawStatus == 5 && cache.status == 1) {
            setStatus(
              cache,
              activity,
              "Selecting beatmap",
              `(★${convertNumber(cache.mStars)}) (${cache.mods}) [${
                cache.diffName
              }]`
            );
          }
          if (cache.rawStatus == 4 && cache.status == 1) {
            setStatus(
              cache,
              activity,
              "Selecting beatmap to edit",
              `(★${convertNumber(cache.mStars)}) (${cache.mods}) [${
                cache.diffName
              }]`
            );
          }
          if (cache.rawStatus == 7 && cache.status == 32) {
            setStatus(
              cache,
              activity,
              "Viewing result",
              `(★${convertNumber(cache.mStars)}) (${cache.mods}) [${
                cache.diffName
              }]`
            );
          }
          if (cache.rawStatus == 2 && cache.status == 8) {
            setStatus(
              cache,
              activity,
              `Spectating │ ${Number(cache.combo).toLocaleString()}x ${Number(
                cache.ppIfMapEndsNow.toFixed(0)
              ).toLocaleString()}pp (${convertNumber(cache.acc)}%)`,
              `(★${convertNumber(cache.mStars)}) (${cache.mods}) [${
                cache.diffName
              }]`
            );
          }
          if (cache.rawStatus == 2 && cache.status == 2) {
            setStatus(
              cache,
              activity,
              `Playing │ ${Number(cache.combo).toLocaleString()}x ${Number(
                cache.ppIfMapEndsNow.toFixed(0)
              ).toLocaleString()}pp (${convertNumber(cache.acc)}%)`,
              `(★${convertNumber(cache.mStars)}) (${cache.mods}) [${
                cache.diffName
              }]`
            );
          }
        }

        if (cache.banchoStatus == 5) {
          if (cache.rawStatus == 12 && cache.status == 1) {
            setStatus(
              cache,
              activity,
              "In a multiplayer room",
              `(★${convertNumber(cache.mStars)}) (${cache.mods}) [${
                cache.diffName
              }]`
            );
          }
          if (cache.rawStatus == 13 && cache.status == 1) {
            setStatus(
              cache,
              activity,
              "Multiplayer: Selecting beatmap",
              `(★${convertNumber(cache.mStars)}) (${cache.mods}) [${
                cache.diffName
              }]`
            );
          }
          if (cache.rawStatus == 2 && cache.status == 2) {
            setStatus(
              cache,
              activity,
              `Multiplaying │ ${Number(cache.combo).toLocaleString()}x ${Number(
                cache.ppIfMapEndsNow.toFixed(0)
              ).toLocaleString()}pp (${convertNumber(cache.acc)}%)`,
              `(★${convertNumber(cache.mStars)}) (${cache.mods}) [${
                cache.diffName
              }]`
            );
          }
          if (cache.rawStatus == 14 && cache.status == 32) {
            setStatus(
              cache,
              activity,
              "Multiplayer: Viewing result",
              `(★${convertNumber(cache.mStars)}) (${cache.mods}) [${
                cache.diffName
              }]`
            );
          }
        }

        if (cache.banchoStatus == 11) {
          if (cache.rawStatus == 12 && cache.status == 1) {
            setStatus(
              cache,
              activity,
              "In a multiplayer room",
              `(★${convertNumber(cache.mStars)}) (${cache.mods}) [${
                cache.diffName
              }]`
            );
          }
          if (cache.rawStatus == 11 && cache.status == 1) {
            setStatus(cache, activity, "Multiplayer lobby");
          }
        }

        if (cache.banchoStatus == 13) {
          if (cache.rawStatus == 15 && cache.status == 1) {
            setStatus(cache, activity, "osu!direct");
          }
        }
        _status = activity;
      }
    }

    function async_get(URL, config = {}) {
      return new Promise((resolve, reject) => {
        axios
          .get(URL, config)
          .then((res) => resolve(res.data))
          .catch((e) => {
            reject(new Error(e));
          });
      });
    }

    function convertNumber(number) {
      return Number.isInteger(number) ? number.toString() : number.toFixed(2);
    }

    function setStatus(cache, activity, status, diff) {
      activity.state = status;
      activity.largeImageText = diff || undefined;
      if (cache.rankedStatus != 1) {
        if (activity.buttons.length > 1) {
          activity.buttons.pop();
        }
        if (activity.buttons.length < 2) {
          activity.buttons.push({
            label: "Beatmap URL",
            url: cache?.dl,
          });
        }
      }
    }
  } catch (error) {
    console.error("Critical error in the main function:", error);
  }
})();
