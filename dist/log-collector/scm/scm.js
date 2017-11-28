"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var Util = require("../util/util");
var SCM = /** @class */ (function () {
    function SCM(_client) {
        this._client = _client;
    }
    SCM.prototype.getRepositoryMainPath = function (localPath) {
        var dirName;
        if (this._client.kind === "git") {
            dirName = ".git";
        }
        else if (this._client.kind === "svn") {
            dirName = ".svn";
        }
        else {
            return "";
        }
        var dirPath = path.dirname(localPath);
        if (Util.existDirectory(dirPath) === true) {
            var gitPath = path.join(dirPath, dirName);
            while (Util.existDirectory(gitPath) === false) {
                dirPath = path.resolve(dirPath, ".." + path.sep);
                if (Util.existDirectory(dirPath) === false) {
                    return "";
                }
                gitPath = path.join(dirPath, dirName);
            }
            return gitPath;
        }
        else {
            return "";
        }
    };
    return SCM;
}());
exports.default = SCM;
//# sourceMappingURL=scm.js.map