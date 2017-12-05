"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SourceRange_1 = require("./SourceRange");
var Translator = /** @class */ (function () {
    function Translator() {
    }
    Translator.translateSourceRangeFromDiff = function (range, chunks) {
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
    return Translator;
}());
exports.default = Translator;
//# sourceMappingURL=Translator.js.map