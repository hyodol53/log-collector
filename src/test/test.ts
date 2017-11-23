import LogCollector from "./../LogCollector/LogCollector";

const gitCollector = new LogCollector({username: "hjjang", password: "1234", kind: "git"});
const sourcePath: string = "E:/src/역량강화/electron/electron-quick-start/main.js";
gitCollector.getLogWithRange(sourcePath, {startLine: 51, endLine: 57}, 100, (err: string|null, revs: string[]) => {
    if ( err !== null ) {
        console.log(err);
    } else {
        console.log(revs);
    }
});

const svnSourcePath: string = "E:/src/trunk/src/ci/IPA/CiPa.cpp";
const svnCollector = new LogCollector({username: "hjjang", password: "1234", kind: "svn"});
svnCollector.getLogWithRange(svnSourcePath,  {startLine: 143, endLine: 159}, 10, (err: string|null, revs: string[]) => {
    if ( err !== null ) {
        console.log(err);
    } else {
        console.log(revs);
        svnCollector.getNextLogWithRange(50, (err2: string|null, revs2: string[]) => {
            console.log(revs2);
        });
    }
});
