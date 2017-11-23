export default class SourceRange {
    constructor(public startLine: number, public endLine: number) { }

    public isNull() {
        if (this.startLine === -1 && this.endLine === -1 ) {
            return true;
        } else {
            return false;
        }
    }

    public getLentgh() {
        return this.endLine - this.startLine;
    }
}
