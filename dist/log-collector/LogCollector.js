"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var async = require("async");
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
                            console.log(err);
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
                    var translatedResult = _this.translateSourceRangeFromDiff(range, chunks);
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
    LogCollector.prototype.translateSourceRangeFromDiff = function (range, chunks) {
        var startIndex = 0;
        var endIndex = 0;
        var isUnknown = false;
        var isChanged = false;
        for (var _i = 0, chunks_1 = chunks; _i < chunks_1.length; _i++) {
            var chunk = chunks_1[_i];
            if (isUnknown === true) {
                break;
            }
            var lineInfo = chunk.changes;
            for (var _a = 0, lineInfo_1 = lineInfo; _a < lineInfo_1.length; _a++) {
                var line = lineInfo_1[_a];
                if (line.type === "del") {
                    if (range.startLine > line.oldLine) {
                        startIndex--;
                        endIndex--;
                    }
                    else if (range.endLine > line.oldLine) {
                        endIndex--;
                        isChanged = true;
                    }
                }
                else if (line.type === "add") {
                    if (range.startLine + startIndex === 1 &&
                        range.startLine + startIndex === range.endLine + endIndex) {
                        isUnknown = true;
                        break;
                    }
                    if (range.startLine + startIndex >= line.newLine) {
                        startIndex++;
                        endIndex++;
                    }
                    else if (range.endLine + endIndex >= line.newLine) {
                        endIndex++;
                        isChanged = true;
                    }
                }
            }
        }
        var translatedRange = new SourceRange_1.default(-1, -1);
        if (!isUnknown) {
            translatedRange.startLine = range.startLine + startIndex;
            translatedRange.endLine = range.endLine + endIndex;
        }
        return [translatedRange, isChanged];
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