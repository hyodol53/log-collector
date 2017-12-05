import { expect } from "chai";
import * as diffParser from "diffParser";
import LogCollector from "./../LogCollector/LogCollector";
import SCM from "./../LogCollector/scm/scm";
import Translator from "./../LogCollector/Translator";
import SourceRange from "../LogCollector/SourceRange";

const localRepoPath = "E:/src/역량강화/log-collector-test/";

describe("integration", () => {
    it ( "get logs with range", () => {
        const oracle: string[] = [
        "b513532ae46a3838d917d83b3df6e6e1fd71e183",
        "a3fc096a9abc68fb270b1d293907ce30e8af4fa9",
        "afe6f4c6ba6ee65630ee956b41d980aea794f14d",
        "2ca209bf34ccde07d3f117ce67c1c899216ab1cd",
        "59dd2c5975e481f10fc7053cd217043afa142146",
        "b31fdbf421610f648ff3f3929dad61019c12d149",
        "a9f60bf6af8a8c2f568348bdf286af2ac88b47b3",
        "58432febe06ae138536391a627521711f4f01a4f",
        ];

        const gitCollector = new LogCollector({username: "hjjang", password: "1234", kind: "git"});
        const sourcePath: string = localRepoPath + "test.js";
        gitCollector.getLogWithRange(sourcePath, {startLine: 12, endLine: 17}, 100,
                                     (err: string|null, revs: string[]) => {
        expect(err).to.equal(null);

        expect(revs.length).to.equal(oracle.length);
        for ( let i = 0; i < oracle.length; i++) {
        expect(revs[i]).to.equal(oracle[i]);
        }
        });
    });
});

const diff: string =
`diff --git a/test.js b/test.js
index 012a942..e8e803f 100644
--- a/test.js
+++ b/test.js
@@ -6,6 +6,8 @@ function testFunc3(){
 function testFunc2(){
     console.log('1');
     console.log('1');
+    console.log('1');
+    console.log('1');
 }
`;

describe("translator", () => {
    it ( "translate1", () => {
        const range: any = { startLine: 15, endLine: 18 };
        const chunks: Chunk[] = diffParser(diff)[0].chunks;
        const result: any = Translator.translateSourceRangeFromDiff(range, chunks);
        const translatedRange = result[0] as SourceRange;
        const isChange: boolean = result[1] as boolean;
        expect(isChange).to.equal(false);
        expect(translatedRange.startLine).to.equal(range.startLine + 2);
        expect(translatedRange.endLine).to.equal(range.endLine + 2);
    });
    it ( "translate2", () => {
        const range: any = { startLine: 6, endLine: 10 };
        const chunks: Chunk[] = diffParser(diff)[0].chunks;
        const result: any = Translator.translateSourceRangeFromDiff(range, chunks);
        const translatedRange = result[0] as SourceRange;
        const isChange: boolean = result[1] as boolean;
        expect(isChange).to.equal(true);
        expect(translatedRange.startLine).to.equal(range.startLine);
        expect(translatedRange.endLine).to.equal(range.endLine + 2);
    });
});

describe("scm kind", () => {
    it ( "get git kind", () => {
        const localPath: string = localRepoPath + "testGIT/testGIT.js";
        expect(SCM.getSCMKind(localPath)).to.equal("git");
    });
    it ( "get svn kind", () => {
        const localPath: string = localRepoPath + "testSVN/src/testSVN.js";
        expect(SCM.getSCMKind(localPath)).to.equal("svn");
    });
});
