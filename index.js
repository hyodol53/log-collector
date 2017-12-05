'use strict';

var LogCollector = require("./dist/LogCollector/LogCollector");

module.exports = function (client) {
    return new LogCollector.default(client);
};