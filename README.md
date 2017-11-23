# LogCollector

This library can get revisions that specific range of local source file.

# usage

“`
const collector = new LogCollector({username: "id", password: "pw", kind: "git or svn"});

collector.getLogWithRange("local path", {startLine: 51, endLine: 57}, 100, (err: string|null, revs: string[]) => {
    if ( err !== null ) {
        // error
    } else {
        // get list of revesion number(svn) or SHA-1(git)
    }
});
“`
