# log-collector

This library can get revisions that specific range of local source file from git or svn.

# installation
```
npm install log-collector
```

# usage

javascript
```javascript
var logCollector = require("log-collector");
var gitorsvn = new logCollector({ username:"name", password:"pw", kind: "git or svn"});

gitorsvn.getLogWithRange("localpath", { startLine: 51, endLine: 57 }, 100, function (err, revs) {
    if (err !== null) {
        console.log(err);
    }
    else {
        console.log(revs);
    }
});

getorsvn.getRevisionInfo("local path", "revision number", (err , revInfo) => {
    // get author, date, message, diff from revInfo
});

```

typescript

* you have to move "node_modules/log-collector/log-collector.d.ts" to your own '@types' directory
```typescript
import * as LogCollector from "log-collector";

const gitorsvn = new logCollector({username: "id", password: "pw", kind: "git or svn"});

gitorsvn.getLogWithRange("local path", {startLine: 51, endLine: 57}, 100, (err: string|null, revs: string[]) => {
    if ( err !== null ) {
        // error
    } else {
        // get list of revesion number(svn) or SHA-1(git)
    }
});

getorsvn.getRevisionInfo("local path", "revision number", (err: string|null, revInfo: RevisionInfo) => {
    // get author, date, message, diff from revInfo
});

```

