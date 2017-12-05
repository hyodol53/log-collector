import SourceRange from "./SourceRange";

export default class Translator {
    public static translateSourceRangeFromDiff(range: SourceRange, chunks: Chunk[]) {
        let startIndex: number = 0;
        let endIndex: number = 0;
        let isUnknown: boolean = false;
        let isChanged: boolean = false;
        for ( const chunk of chunks) {
            if ( isUnknown === true ) {
                break;
            }
            const lineInfo: LineInfo[] = chunk.changes;
            for ( const line of lineInfo ) {
                if ( line.type === "del" ) {
                    if ( range.startLine > line.oldLine ) {
                        startIndex--;
                        endIndex--;
                    } else if ( range.endLine > line.oldLine ) {
                        endIndex--;
                        isChanged = true;
                    }
                } else if (line.type === "add" ) {
                    if ( range.startLine + startIndex === 1 &&
                            range.startLine + startIndex === range.endLine + endIndex ) {
                        isUnknown = true;
                        break;
                    }
                    if ( range.startLine + startIndex >= line.newLine ) {
                        startIndex++;
                        endIndex++;
                    } else if ( range.endLine + endIndex >= line.newLine ) {
                        endIndex++;
                        isChanged = true;
                    }
                }
            }
        }
        const translatedRange = new SourceRange(-1, -1);
        if ( !isUnknown ) {
            translatedRange.startLine = range.startLine + startIndex;
            translatedRange.endLine = range.endLine + endIndex;
        }
        return [translatedRange, isChanged];
    }
}
