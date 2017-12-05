"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var async = require("async");
var Translator_1 = require("./Translator");
var SourceRange_1 = require("./SourceRange");
var scm_1 = require("./scm/scm");
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
    LogCollector.getSCMKind = function (localPath) {
        return scm_1.default.getSCMKind(localPath);
    };
    LogCollector.prototype.getLogWithRange = function (localPath, range, length, callback) {
        var _this = this;
        this._currentRevision = "-1";
        this._revInfo = new Map();
        this._localSourceRange = new SourceRange_1.default(range.startLine, range.endLine);
        this._localPath = localPath;
        this.getLocalFileDiff(this._localPath, function (errDiff, diffStr) {
            if (errDiff === null) {
                _this.collectLog(length, diffStr, function (err, revisions) {
                    callback(err, revisions);
                });
            }
            else {
                callback(errDiff, []);
            }
        });
    };
    LogCollector.prototype.getNextLogWithRange = function (length, callback) {
        this.collectLog(length, "", function (err, revisions) {
            callback(err, revisions);
        });
    };
    LogCollector.prototype.getLog = function (localPath, length, callback) {
        this._scm.getLog(localPath, length, function (err, revs) {
            callback(err, revs);
        });
    };
    LogCollector.prototype.getDiff = function (localPath, revision, callback) {
        this._scm.getDiff(localPath, revision, function (err, diffStr) {
            callback(err, diffStr);
        });
    };
    LogCollector.prototype.getRevisionInfo = function (localPath, revision, callback) {
        this._scm.getRevisionInfo(localPath, revision, function (err, revInfo) {
            if (err !== null) {
                callback(err, null);
            }
            else {
                callback(null, revInfo);
            }
        });
    };
    LogCollector.prototype.getLocalFileDiff = function (localPath, callback) {
        this._scm.getLocalFileDiff(localPath, function (err, diffStr) {
            callback(err, diffStr);
        });
    };
    LogCollector.prototype.collectLog = function (length, localDiff, callback) {
        var _this = this;
        var tasks = [
            function (collect_diff_callback) {
                _this.getLog(_this._localPath, length, function (err, revs) {
                    collect_diff_callback(err, revs);
                });
            },
            function (revs, collect_changed_rev_callback) {
                var revLength = revs.length;
                var revArray = [];
                var diffsByRev = new Map();
                var _loop_1 = function (rev) {
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
                        else if (diffStr !== "") {
                            collect_changed_rev_callback(err, "");
                        }
                        else {
                            revs.splice(revs.length - 1, 1);
                            revLength--;
                        }
                    });
                };
                for (var _i = 0, revs_1 = revs; _i < revs_1.length; _i++) {
                    var rev = revs_1[_i];
                    _loop_1(rev);
                }
            },
            function (revs, diffsByRev, return_callback) {
                var prevRevision = _this._currentRevision;
                var changedRevs = [];
                for (var _i = 0, revs_2 = revs; _i < revs_2.length; _i++) {
                    var rev = revs_2[_i];
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
                    if (translatedResult[1]) {
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