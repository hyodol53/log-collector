'use strict';

var LogCollector = require("./dist/log-collector/LogCollector");

module.exports = function (client) {
    return new LogCollector.default(client);
};