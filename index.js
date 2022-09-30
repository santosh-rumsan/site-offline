const https = require("https");
const { exec } = require("child_process");

const pino = require("pino");
const transport = pino.transport({
  targets: [
    {
      level: "info",
      target: "pino-pretty", // must be installed separately
    },
    {
      level: "info",
      target: "pino/file",
      options: {
        translateTime: true,
        destination: `${__dirname}/site_status.log`,
      },
    },
  ],
});
const logger = pino(transport);

function checkWebsite(url, callback) {
  https
    .get(url, function (res) {
      return callback(res.statusCode === 200);
    })
    .on("error", function (e) {
      return callback(false);
    });
}

function runCheck() {
  checkWebsite(
    "https://explorer.rumsan.com/api?module=account&action=eth_get_balance&address=0x4ff77d940fc9dbc207997d7e6ce8a7368af77aa8",
    function (check) {
      if (!check) {
        exec("docker restart blockscout");
        exec("docker restart eth-explorer-offchain");
        logger.info("System Restart");
      }
    }
  );
}

runCheck();
//exec("docker restart blockscout");
