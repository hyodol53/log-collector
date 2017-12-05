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
var fs = require("fs");
var path = require("path");
var SCM_1 = require("./SCM");
var Client = require("svn-spawn");
var SQLite = require("sqlite3");
var Util = require("../util/util");
var RevisionInfo_1 = require("../RevisionInfo");
var SVN = /** @class */ (function (_super) {
    __extends(SVN, _super);
    function SVN(_client) {
        var _this = _super.call(this, _client) || this;
        _this._spawnClient = new Client({
            cwd: "",
            noAuthCache: true,
            password: _this._client.password,
            username: _this._client.username,
        });
        _this._rootURL = "";
        _this._repoPathInfo = new Map();
        return _this;
    }
    SVN.prototype.getLog = function (localPath, length, callback) {
        var _this = this;
        this.getRepositoryPath(localPath, function (repoPath) {
            if (repoPath === "") {
                callback("Could not get Repository Path", []);
            }
            else {
                _this._spawnClient.getLog([repoPath, "-l", String(length)], function (err, data) {
                    if (err === null) {
                        var logDatas = data[0];
                        var logs_1 = [];
                        logDatas.forEach(function (log) {
                            logs_1.push(log.$.revision);
                        });
                        callback(null, logs_1);
                    }
                    else {
                        callback(err.message, []);
                    }
                });
            }
        });
    };
    SVN.prototype.getDiff = function (localPath, revision, callback) {
        var _this = this;
        this.getRepositoryPath(localPath, function (repoPath) {
            if (repoPath === "") {
                callback("Could not get Repository Path", "");
            }
            else {
                var revRange = revision + ":" + String(Number(revision) - 1);
                _this._spawnClient.cmd(["diff", repoPath, "-r", revRange], function (errDiff, dataDiff) {
                    if (errDiff === null) {
                        callback(null, dataDiff);
                    }
                    else {
                        callback(errDiff.message, "");
                    }
                });
            }
        });
    };
    SVN.prototype.getLocalFileDiff = function (localPath, callback) {
        var _this = this;
        this.getRepositoryPath(localPath, function (repoPath) {
            if (repoPath === "") {
                callback("Could not get Repository Path", "");
            }
            else {
                var dirPath = path.dirname(localPath);
                if (Util.existDirectory(dirPath) === true) {
                    var tempPath_1 = path.join(dirPath, "temp" + Math.random().toString());
                    _this._spawnClient.cmd(["export", repoPath, tempPath_1], function (err, data) {
                        if (err === null) {
                            Util.getDiff(localPath, tempPath_1, function (err2, result) {
                                fs.unlinkSync(tempPath_1);
                                callback(err2, result);
                            });
                        }
                        else {
                            if (fs.existsSync(tempPath_1) === true) {
                                fs.unlinkSync(tempPath_1);
                            }
                            callback("svn export failed : " + err.message, "");
                        }
                    });
                }
                else {
                    callback("could not get directory : " + localPath, "");
                }
            }
        });
    };
    SVN.prototype.getRevisionInfo = function (localPath, revName, callback) {
        var _this = this;
        var mainPath = this.getMainPath(localPath);
        this.getRootURL(localPath, function (err, url) {
            if (err !== null) {
                callback("Could not get Repository Path", null);
            }
            else {
                _this._spawnClient.getLog([url, "-r", revName], function (errLog, data) {
                    if (errLog === null) {
                        var logData_1 = data[0];
                        _this.getDiff(localPath, revName, function (errMsg, diffStr) {
                            if (errMsg !== null) {
                                callback(errMsg, null);
                            }
                            else {
                                callback(errMsg, new RevisionInfo_1.default(revName, logData_1.author, logData_1.msg, logData_1.date, diffStr));
                            }
                        });
                    }
                    else {
                        callback(errLog.message, null);
                    }
                });
            }
        });
    };
    SVN.prototype.getRootURL = function (localPath, callback) {
        var _this = this;
        if (this._rootURL === "") {
            var mainPath = this.getMainPath(localPath);
            if (mainPath === "") {
                callback("Could not get Repository Path", "");
            }
            var dbPath = path.join(mainPath, "wc.db");
            var repoPath = (path.resolve(localPath).replace(path.resolve(mainPath, ".."), "")).
                substr(1).split("\\").join("/");
            var query_1 = "select (R.root) as Path \
            from NODES as N, REPOSITORY as R \
            where R.id = N.repos_id AND N.local_relpath = \"" + repoPath + "\"";
            var db_1 = new SQLite.Database(dbPath, function (err) {
                db_1.on("open", function () {
                    db_1.each(query_1, function (queryErr, row) {
                        if (queryErr === null) {
                            _this._repoPathInfo.set(localPath, row.Path);
                            _this._rootURL = row.path;
                            callback(null, row.Path);
                        }
                        else {
                            callback("Could not get Repository Path", "");
                        }
                    });
                });
            });
        }
        else {
            callback(null, this._rootURL);
        }
    };
    SVN.prototype.getRepositoryPath = function (localPath, callback) {
        var _this = this;
        var fullRepoPath = this._repoPathInfo.get(localPath);
        if (fullRepoPath === undefined) {
            var mainPath = this.getMainPath(localPath);
            if (mainPath === "") {
                callback("");
            }
            var repoPath = (path.resolve(localPath).replace(path.resolve(mainPath, ".."), "")).
                substr(1).split("\\").join("/");
            var dbPath = path.join(mainPath, "wc.db");
            var query_2 = "select (R.root || \"/\" || N.repos_path) as Path \
                           from NODES as N, REPOSITORY as R \
                           where R.id = N.repos_id AND N.local_relpath = \"" + repoPath + "\"";
            var db_2 = new SQLite.Database(dbPath, function (err) {
                db_2.on("open", function () {
                    db_2.each(query_2, function (queryErr, row) {
                        if (queryErr === null) {
                            _this._repoPathInfo.set(localPath, row.Path);
                            callback(row.Path);
                        }
                        else {
                            callback("");
                        }
                    });
                });
            });
        }
        else {
            callback(fullRepoPath);
        }
    };
    return SVN;
}(SCM_1.default));
exports.default = SVN;
//# sourceMappingURL=svn.js.map