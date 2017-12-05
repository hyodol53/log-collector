"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var SCM_1 = require("./SCM");
var SimpleGit = require("simple-git");
var path = require("path");
var RevisionInfo_1 = require("../RevisionInfo");
var GIT = /** @class */ (function (_super) {
    __extends(GIT, _super);
    function GIT(_client) {
        return _super.call(this, _client) || this;
    }
    GIT.prototype.getLog = function (localPath, length, callback) {
        var baseDir = this.getMainPath(localPath);
        if (baseDir === "") {
            callback("Could not get git base dir", []);
        }
        var git = new SimpleGit(path.resolve(baseDir, ".."));
        git.log(["-" + length.toString(), localPath], function (err, result) {
            if (err === null && result.all.length > 0) {
                var revs = [];
                for (var _i = 0, _a = result.all; _i < _a.length; _i++) {
                    var re = _a[_i];
                    revs.push(re.hash);
                }
                callback(null, revs);
            }
            else {
                if (err !== null) {
                    callback(err, []);
                }
                else {
                    callback("empty log", []);
                }
            }
        });
    };
    GIT.prototype.getRevisionInfo = function (localPath, revName, callback) {
        var _this = this;
        var baseDir = this.getMainPath(localPath);
        if (baseDir === "") {
            callback("Could not get git base dir", null);
        }
        var git = new SimpleGit(path.resolve(baseDir, ".."));
        git.show([revName], function (err, info) {
            var revInfo = _this.parseRevInfo(info, revName);
            _this.getDiff(localPath, revName, function (errMsg, diffStr) {
                if (errMsg !== null) {
                    callback(errMsg, null);
                }
                else {
                    revInfo.diff = diffStr;
                    callback(null, revInfo);
                }
            });
        });
    };
    GIT.prototype.getDiff = function (localPath, revision, callback) {
        var baseDir = this.getMainPath(localPath);
        if (baseDir === "") {
            callback("Could not get git base dir", "");
        }
        var git = new SimpleGit(path.resolve(baseDir, ".."));
        var options = [];
        options.push(revision);
        options.push(revision + "^");
        options.push(localPath);
        git.diff(options, function (err, diff) {
            if (err === null) {
                callback(err, diff);
            }
            else {
                callback(err, "");
            }
        });
    };
    GIT.prototype.getLocalFileDiff = function (localPath, callback) {
        var baseDir = this.getMainPath(localPath);
        if (baseDir === "") {
            callback("Could not get git base dir", "");
        }
        var localOptions = [];
        localOptions.push("-R");
        localOptions.push("HEAD");
        localOptions.push(localPath);
        var git = new SimpleGit(path.resolve(baseDir, ".."));
        git.diff(localOptions, function (err, diff) {
            if (err === null) {
                callback(err, diff);
            }
            else {
                callback(err, "");
            }
        });
    };
    GIT.prototype.parseRevInfo = function (revInfo, revName) {
        var str = revInfo.substr(revInfo.indexOf("Author: ") + "Author: ".length);
        var author = str.substr(0, str.indexOf("\n"));
        str = str.substr(str.indexOf("Date:   ") + "Date:   ".length);
        var date = str.substr(0, str.indexOf("\n"));
        str = str.substr(date.length);
        var message = str.substr(0, str.indexOf("diff --git"));
        message = message.trim();
        return new RevisionInfo_1.default(revName, author, message, date, "");
    };
    return GIT;
}(SCM_1.default));
exports.default = GIT;
//# sourceMappingURL=git.js.map