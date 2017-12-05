"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var Util = require("../util/util");
var SCM = /** @class */ (function () {
    function SCM(_client) {
        this._client = _client;
    }
    SCM.getSCMKind = function (localPath) {
        var git = ".git";
        var svn = ".svn";
        var dirPath = path.dirname(localPath);
        if (Util.existDirectory(dirPath) === true) {
            var gitPath = path.join(dirPath, git);
            var svnPath = path.join(dirPath, svn);
            var existGit = Util.existDirectory(gitPath);
            var existSvn = Util.existDirectory(svnPath);
            while (!existGit && !existSvn) {
                dirPath = path.resolve(dirPath, ".." + path.sep);
                if (Util.existDirectory(dirPath) === false) {
                    return "";
                }
                gitPath = path.join(dirPath, git);
                svnPath = path.join(dirPath, svn);
                existGit = Util.existDirectory(gitPath);
                existSvn = Util.existDirectory(svnPath);
            }
            if (existGit) {
                return "git";
            }
            else {
                return "svn";
            }
        }
        else {
            return "";
        }
    };
    SCM.prototype.getMainPath = function (localPath) {
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
            var scmPath = path.join(dirPath, dirName);
            while (Util.existDirectory(scmPath) === false) {
                dirPath = path.resolve(dirPath, ".." + path.sep);
                if (Util.existDirectory(dirPath) === false) {
                    return "";
                }
                scmPath = path.join(dirPath, dirName);
            }
            return scmPath;
        }
        else {
            return "";
        }
    };
    return SCM;
}());
exports.default = SCM;
//# sourceMappingURL=scm.js.map