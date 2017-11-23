import LogCollector from "./../LogCollector/LogCollector";
import SourceRange from "./../LogCollector/SourceRange";

const gitCollector = new LogCollector({username: "hjjang", password: "1234", kind: "git"});
const range: SourceRange = new SourceRange(51, 57);
const sourcePath: string = "E:/src/역량강화/electron/electron-quick-start/main.js";
gitCollector.getLogWithRange(sourcePath, range, 100, (err: string|null, revs: string[]) => {
    if ( err !== null ) {
        console.log(err);
    } else {
        console.log(revs);
    }
});

const svnRange: SourceRange = new SourceRange(143, 159);
const svnSourcePath: string = "E:/src/trunk/src/ci/IPA/CiPa.cpp";
const svnCollector = new LogCollector({username: "hjjang", password: "1234", kind: "svn"});
svnCollector.getLogWithRange(svnSourcePath, svnRange, 10, (err: string|null, revs: string[]) => {
    if ( err !== null ) {
        console.log(err);
    } else {
        console.log(revs);
        svnCollector.getNextLogWithRange(50, (err2: string|null, revs2: string[]) => {
            console.log(revs2);
        });
    }
});
