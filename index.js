'use strict';

var LogCollector = require("./dist/LogCollector/LogCollector");
var RevisionInfo = require("./dist/LogCollector/RevisionInfo");
var SimpleRange = require("./dist/LogCollector/SimpleRange");
var ClientInfo = require("./dist/LogCollector/client");
var scm = require("./dist/LogCollector/scm/scm");
var svn = require("./dist/LogCollector/scm/svn");

exports.LogCollector = LogCollector.default;
exports.RevisionInfo = RevisionInfo.default;
exports.SimpleRange = SimpleRange.default;
exports.ClientInfo = ClientInfo.default;
exports.getSCMKind = scm.default.getSCMKind;
exports.checkSvnAccount = svn.default.checkAccount;
