"use strict";
var fs = require("fs");
var path = require("path");
var diff = require("unidiff");
var Util;
(function (Util) {
    function existDirectory(dirPath) {
        try {
            return fs.statSync(path.resolve(dirPath)).isDirectory();
        }
        catch (e) {
            return false;
        }
    }
    Util.existDirectory = existDirectory;
    function getDiff(path1, path2, callback) {
        var result = "";
        fs.readFile(path1, "utf-8", function (err, data) {
            if (err === null) {
                fs.readFile(path2, "utf-8", function (err2, data2) {
                    if (err2 === null) {
                        var diffs = diff.diffLines(data, data2, []);
                        result = diff.formatLines(diffs, null);
                    }
                    callback(err2, result);
                });
            }
            else {
                callback(err, result);
            }
        });
    }
    Util.getDiff = getDiff;
})(Util || (Util = {}));
module.exports = Util;
//# sourceMappingURL=util.js.map