"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var async = require("async");
var Translator_1 = require("./Translator");
var SourceRange_1 = require("./SourceRange");
var svn_1 = require("./scm/svn");
var git_1 = require("./scm/git");
var diffParser = require("diffParser");
var LogCollector = /** @class */ (function () {
    function LogCollector(_client) {
        this._client = _client;
        if (_client.kind === "svn") {
            this._scm = new svn_1.default(_client);
        }
        else if (_client.kind === "git") {
            this._scm = new git_1.default(_client);
        }
    }
    LogCollector.prototype.getLogWithRange = function (localPath, range, length, callback) {
        var _this = this;
        this._currentRevision = "-1";
        this._revInfo = new Map();
        this._localSourceRange = new SourceRange_1.default(range.startLine, range.endLine);
        this._localPath = localPath;
        try {
            this.getLocalFileDiff(this._localPath, function (errDiff, diffStr) {
                if (errDiff === null) {
                    _this.collectLog(length, diffStr, function (err, revisions) {
                        _this.getRevisionInfos(localPath, revisions, function (err_revInfo, infos) {
                            if (err_revInfo === null) {
                                callback(null, infos);
                            }
                            else {
                                callback(err_revInfo, []);
                            }
                        });
                    });
                }
                else {
                    callback(errDiff, []);
                }
            });
        }
        catch (e) {
            callback(e, []);
        }
    };
    LogCollector.prototype.getNextLogWithRange = function (length, callback) {
        var _this = this;
        try {
            this.collectLog(length, "", function (err, revisions) {
                _this.getRevisionInfos(_this._localPath, revisions, function (err_revInfo, infos) {
                    if (err === null) {
                        callback(null, infos);
                    }
                    else {
                        callback(err, []);
                    }
                });
            });
        }
        catch (e) {
            callback(e, []);
        }
    };
    LogCollector.prototype.getLog = function (localPath, length, callback) {
        try {
            this._scm.getLog(localPath, length, function (err, revs) {
                callback(err, revs);
            });
        }
        catch (e) {
            callback(e, []);
        }
    };
    LogCollector.prototype.getDiff = function (localPath, revision, callback) {
        try {
            this._scm.getDiff(localPath, revision, function (err, diffStr) {
                callback(err, diffStr);
            });
        }
        catch (e) {
            callback(e, "");
        }
    };
    LogCollector.prototype.getRevisionInfo = function (localPath, revision, callback) {
        try {
            this._scm.getRevisionInfo(localPath, revision, function (err, revInfo) {
                if (err !== null) {
                    callback(err, null);
                }
                else {
                    callback(null, revInfo);
                }
            });
        }
        catch (e) {
            callback(e, null);
        }
    };
    LogCollector.prototype.getRevisionInfos = function (localPath, revs, callback) {
        var _this = this;
        var orderMap = new Map();
        var index = 0;
        for (var _i = 0, revs_1 = revs; _i < revs_1.length; _i++) {
            var rev = revs_1[_i];
            orderMap.set(rev, index);
            index++;
        }
        var revInfos = [];
        revs.forEach(function (rev, i, array) {
            _this.getRevisionInfo(localPath, rev, function (err, revInfo) {
                if (revInfo !== null) {
                    revInfos.push(revInfo);
                }
                else {
                    callback(err, []);
                }
                if (revInfos.length === revs.length) {
                    revInfos = revInfos.sort(function (a, b) {
                        return orderMap.get(a.name) - orderMap.get(b.name);
                    });
                    callback(null, revInfos);
                }
            });
        });
    };
    LogCollector.prototype.getLocalFileDiff = function (localPath, callback) {
        this._scm.getLocalFileDiff(localPath, function (err, diffStr) {
            callback(err, diffStr);
        });
    };
    LogCollector.prototype.getFirstLog = function (localPath, callback) {
        this._scm.getFirstLog(localPath, function (err, rev) {
            if (err !== null) {
                callback(err, "");
            }
            else {
                callback(null, rev);
            }
        });
    };
    LogCollector.prototype.collectLog = function (length, localDiff, callback) {
        var _this = this;
        var tasks = [
            function (first_log_callback) {
                _this.getFirstLog(_this._localPath, function (err, rev) {
                    first_log_callback(err, rev);
                });
            },
            function (firstLog, collect_diff_callback) {
                _this.getLog(_this._localPath, length, function (err, revs) {
                    collect_diff_callback(err, firstLog, revs);
                });
            },
            function (firstLog, revs, collect_changed_rev_callback) {
                var revLength = revs.length;
                var revArray = [];
                var diffsByRev = new Map();
                var _loop_1 = function (rev) {
                    if (rev === firstLog) {
                        revs.splice(revs.length - 1, 1);
                        revLength--;
                    }
                    else {
                        _this.getDiff(_this._localPath, rev, function (err, diffStr) {
                            if (err === null) {
                                diffsByRev.set(rev, diffStr);
                                if (diffsByRev.size === revLength) {
                                    if (localDiff !== "") {
                                        revs.unshift("-1");
                                        diffsByRev.set("-1", localDiff);
                                    }
                                    collect_changed_rev_callback(null, revs, diffsByRev);
                                }
                            }
                            else {
                                collect_changed_rev_callback(err, "");
                            }
                        });
                    }
                };
                for (var _i = 0, revs_2 = revs; _i < revs_2.length; _i++) {
                    var rev = revs_2[_i];
                    _loop_1(rev);
                }
            },
            function (revs, diffsByRev, return_callback) {
                var prevRevision = _this._currentRevision;
                var changedRevs = [];
                for (var _i = 0, revs_3 = revs; _i < revs_3.length; _i++) {
                    var rev = revs_3[_i];
                    var range = _this.getPreviousSourceRange(prevRevision);
                    if (range.isNull()) {
                        break;
                    }
                    if (diffsByRev.get(rev) === undefined) {
                        prevRevision = rev;
                        _this._revInfo.set(prevRevision, range);
                        continue;
                    }
                    var chunks = diffParser(diffsByRev.get(rev))[0].chunks;
                    var translatedResult = Translator_1.default.translateSourceRangeFromDiff(range, chunks);
                    var translatedRange = translatedResult[0];
                    if (translatedRange.isNull()) {
                        break;
                    }
                    if (rev !== "-1" && translatedResult[1]) {
                        changedRevs.push(rev);
                    }
                    prevRevision = rev;
                    _this._revInfo.set(prevRevision, translatedRange);
                }
                return_callback(null, changedRevs);
            }
        ];
        async.waterfall(tasks, function (err, result) {
            callback(err, result);
        });
    };
    LogCollector.prototype.getPreviousSourceRange = function (prevRevision) {
        var range = new SourceRange_1.default(-1, -1);
        var prevRange = this._revInfo.get(prevRevision);
        if (prevRange !== undefined) {
            range.startLine = prevRange.startLine;
            range.endLine = prevRange.endLine;
        }
        else {
            range.startLine = this._localSourceRange.startLine;
            range.endLine = this._localSourceRange.endLine;
        }
        return range;
    };
    return LogCollector;
}());
exports.default = LogCollector;
//# sourceMappingURL=LogCollector.js.map