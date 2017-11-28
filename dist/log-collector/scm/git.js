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
var GIT = /** @class */ (function (_super) {
    __extends(GIT, _super);
    function GIT(_client) {
        return _super.call(this, _client) || this;
    }
    GIT.prototype.getLog = function (localPath, length, callback) {
        var mainPath = this.getRepositoryMainPath(localPath);
        if (mainPath === "") {
            callback("Could not get git base dif", []);
        }
        var git = new SimpleGit(path.resolve(mainPath, ".."));
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
    GIT.prototype.getDiff = function (localPath, revision, callback) {
        var mainPath = this.getRepositoryMainPath(localPath);
        if (mainPath === "") {
            callback("Could not get git base dif", "");
        }
        var git = new SimpleGit(path.resolve(mainPath, ".."));
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
        var mainPath = this.getRepositoryMainPath(localPath);
        if (mainPath === "") {
            callback("Could not get git base dif", "");
        }
        var localOptions = [];
        localOptions.push("-R");
        localOptions.push("HEAD");
        localOptions.push(localPath);
        var git = new SimpleGit(path.resolve(mainPath, ".."));
        git.diff(localOptions, function (err, diff) {
            if (err === null) {
                callback(err, diff);
            }
            else {
                callback(err, "");
            }
        });
    };
    return GIT;
}(SCM_1.default));
exports.default = GIT;
//# sourceMappingURL=git.js.map