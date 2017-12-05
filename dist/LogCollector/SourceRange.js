"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SourceRange = /** @class */ (function () {
    function SourceRange(startLine, endLine) {
        this.startLine = startLine;
        this.endLine = endLine;
    }
    SourceRange.prototype.isNull = function () {
        if (this.startLine === -1 && this.endLine === -1) {
            return true;
        }
        else {
            return false;
        }
    };
    SourceRange.prototype.getLentgh = function () {
        return this.endLine - this.startLine;
    };
    return SourceRange;
}());
exports.default = SourceRange;
//# sourceMappingURL=SourceRange.js.map